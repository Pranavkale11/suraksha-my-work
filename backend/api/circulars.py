from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.responses import Response
from database import db
from datetime import datetime
import uuid

from models.circular import CircularResponse, ReparseOptions
from services.watcher import process_circular
from services.gridfs_service import upload_file_to_gridfs, download_file_from_gridfs

router = APIRouter()

def get_db():
    return db.client.suraksha_maps

@router.post("/upload", response_model=dict)
async def upload_circular(file: UploadFile = File(...)):
    database = get_db()
    
    file_bytes = await file.read()
    
    # GridFS Upload
    gridfs_id = await upload_file_to_gridfs(file.filename, file.content_type, file_bytes)
    
    # Process text, regex, embed
    status, clauses, time_ms = await process_circular(file_bytes, file.filename)
    
    # Generate ID
    issuer = "UNKNOWN"
    lower_name = file.filename.lower()
    if "rbi" in lower_name: issuer = "RBI"
    elif "sebi" in lower_name: issuer = "SEBI"
    elif "cert-in" in lower_name: issuer = "CERT-In"
    
    circ_id = f"{issuer}/{datetime.utcnow().year}-{str(uuid.uuid4())[:3].upper()}"
    
    # Save Circular
    doc = {
        "circular_id": circ_id,
        "title": file.filename,
        "issuer": issuer,
        "date_issued": datetime.utcnow(),
        "ingestion_status": status,
        "clauses_extracted": len(clauses),
        "parser_version": "v1.0",
        "pages_processed": 1,
        "processing_time_ms": time_ms,
        "clauses": [c.model_dump() for c in clauses],
        "gridfs_id": gridfs_id
    }
    
    await database.circulars.insert_one(doc)
    
    return {
        "circular_id": circ_id,
        "ingestion_status": status,
        "clauses_extracted": len(clauses),
        "processing_time_ms": time_ms
    }

@router.get("", response_model=dict)
async def list_circulars(status: str = None, issuer: str = None):
    database = get_db()
    query = {}
    if status: query["ingestion_status"] = status
    if issuer: query["issuer"] = issuer
    
    cursor = database.circulars.find(query).sort("date_issued", -1)
    circulars = []
    async for c in cursor:
        c["_id"] = str(c["_id"])
        circulars.append(c)
        
    return {
        "circulars": circulars,
        "stats": {
            "total": len(circulars),
            "fully_parsed": sum(1 for c in circulars if c["ingestion_status"] == "fully_parsed")
        }
    }

@router.get("/{circular_id}", response_model=CircularResponse)
async def get_circular(circular_id: str):
    database = get_db()
    doc = await database.circulars.find_one({"circular_id": circular_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Circular not found")
        
    return CircularResponse(**doc)

@router.post("/{circular_id}/reparse", response_model=dict)
async def reparse_circular(circular_id: str, options: ReparseOptions):
    database = get_db()
    doc = await database.circulars.find_one({"circular_id": circular_id})
    if not doc or not doc.get("gridfs_id"):
        raise HTTPException(status_code=404, detail="Original file not found")
        
    file_bytes, filename, _ = await download_file_from_gridfs(doc["gridfs_id"])
    status, clauses, time_ms = await process_circular(file_bytes, filename)
    
    await database.circulars.update_one(
        {"circular_id": circular_id},
        {"$set": {
            "ingestion_status": status,
            "clauses": [c.model_dump() for c in clauses],
            "clauses_extracted": len(clauses),
            "processing_time_ms": time_ms
        }}
    )
    
    return {"status": "reparsed", "ingestion_status": status}

@router.get("/{circular_id}/download")
async def download_circular(circular_id: str):
    database = get_db()
    doc = await database.circulars.find_one({"circular_id": circular_id})
    if not doc or not doc.get("gridfs_id"):
        raise HTTPException(status_code=404, detail="File not found")
        
    content, filename, content_type = await download_file_from_gridfs(doc["gridfs_id"])
    
    return Response(
        content=content,
        media_type=content_type,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )
