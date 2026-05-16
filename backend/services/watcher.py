import re
import asyncio
from PyPDF2 import PdfReader
from docx import Document
import time
import random
from models.circular import Clause
import io
import logging

logger = logging.getLogger(__name__)

_embedder = None
_use_mock = False

def get_embedder():
    global _embedder, _use_mock
    if _embedder is None and not _use_mock:
        try:
            from sentence_transformers import SentenceTransformer
            _embedder = SentenceTransformer('all-MiniLM-L6-v2')
        except Exception as e:
            logger.warning(f"Failed to load sentence_transformers: {e}. Falling back to mock embeddings.")
            _use_mock = True
    return _embedder

async def generate_embeddings(texts: list[str]) -> list[list[float]]:
    if not texts:
        return []
    embedder = get_embedder()
    if embedder is None:
        return [[random.uniform(-1, 1) for _ in range(384)] for _ in texts]
        
    loop = asyncio.get_event_loop()
    embeddings = await loop.run_in_executor(None, embedder.encode, texts)
    return embeddings.tolist()

def extract_text(file_bytes: bytes, filename: str) -> str:
    ext = filename.split('.')[-1].lower()
    text = ""
    
    if ext == 'pdf':
        reader = PdfReader(io.BytesIO(file_bytes))
        for page in reader.pages:
            t = page.extract_text()
            if t:
                text += t + "\n"
    elif ext == 'docx':
        doc = Document(io.BytesIO(file_bytes))
        for para in doc.paragraphs:
            text += para.text + "\n"
    else:
        # Assumes TXT
        text = file_bytes.decode('utf-8', errors='ignore')
        
    return text

def parse_clauses(text: str) -> list[Clause]:
    clauses = []
    
    # Split text into paragraphs
    paragraphs = [p.strip() for p in text.split('\n') if p.strip()]
    
    clause_pattern = re.compile(r'^(\d+\.\d+|\d+\.\d+\.\d+)')
    
    for para in paragraphs:
        # Determine clause number
        match = clause_pattern.search(para)
        clause_num = match.group(1) if match else None
        
        # Determine obligation
        lower_para = para.lower()
        obligation = None
        severity = None
        
        if "shall" in lower_para:
            obligation = "shall"
            severity = "critical"
        elif "must" in lower_para:
            obligation = "must"
            severity = "critical"
        elif "should" in lower_para:
            obligation = "should"
            severity = "high"
        elif "may" in lower_para:
            obligation = "may"
            severity = "medium"
        elif "recommended" in lower_para:
            obligation = "recommended"
            severity = "low"
            
        penalty_ref = None
        if "penalty" in lower_para or "section" in lower_para or "fine" in lower_para:
            # Simple mock penalty extraction
            penalty_ref = "Detected potential penalty/reference"
            
        # Only add to parsed clauses if it has an obligation or a clear clause number
        if clause_num or obligation:
            clauses.append(Clause(
                clause_number=clause_num,
                text=para,
                obligation_type=obligation,
                severity=severity,
                penalty_reference=penalty_ref,
                gap_status="pending"
            ))
            
    return clauses

async def process_circular(file_bytes: bytes, filename: str) -> tuple[str, list[Clause], int]:
    start = time.time()
    
    text = extract_text(file_bytes, filename)
    clauses = parse_clauses(text)
    
    # Check parsing status
    if not clauses:
        status = "failed"
    else:
        # Check how many lack numbers or obligations
        missing_numbers = sum(1 for c in clauses if not c.clause_number)
        missing_obs = sum(1 for c in clauses if not c.obligation_type)
        
        if missing_numbers == 0 and missing_obs == 0:
            status = "fully_parsed"
        elif missing_numbers > len(clauses) * 0.5:
            status = "failed"
        else:
            status = "partially_parsed"
            
    # Embeddings
    if clauses:
        texts = [c.text for c in clauses]
        embs = await generate_embeddings(texts)
        for c, emb in zip(clauses, embs):
            c.embedding = emb
            
    duration_ms = int((time.time() - start) * 1000)
    
    return status, clauses, duration_ms
