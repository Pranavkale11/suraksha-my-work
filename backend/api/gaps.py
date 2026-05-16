from fastapi import APIRouter, HTTPException
from database import db
from datetime import datetime
import uuid

from models.gap import GapQueueEntry, GapDetectionResult
from services.gap_detector import analyze_clause

router = APIRouter()

def get_db():
    return db.client.suraksha_maps

@router.post("/detect/{circular_id}")
async def run_gap_detection(circular_id: str):
    database = get_db()
    
    circular = await database.circulars.find_one({"circular_id": circular_id})
    if not circular:
        raise HTTPException(status_code=404, detail="Circular not found")
        
    if circular.get("ingestion_status") not in ["fully_parsed", "processed"]:
        raise HTTPException(status_code=400, detail="Circular must be fully parsed before gap detection")
        
    clauses = circular.get("clauses", [])
    detection_results = []
    
    for idx, clause in enumerate(clauses):
        obligation = clause.get("obligation_type")
        if not obligation:
            continue # Skip non-obligatory clauses
            
        result: GapDetectionResult = await analyze_clause(circular_id, clause, database)
        detection_results.append(result)
        
        # Update clause gap_status in circular
        clauses[idx]["gap_status"] = result.gap_status
        
        # Create gap queue entry if needed
        if result.gap_status in ["suspected", "confirmed"]:
            action = "Auto-route to MAP creation" if result.historical_matches_count >= 3 else "Review and create MAP"
            triage_status = "assigned" if result.historical_matches_count >= 3 else "new"
            
            dept = "UNKNOWN"
            if result.top_matches:
                dept = result.top_matches[0].department
                
            entry = GapQueueEntry(
                gap_id=f"GAP-{str(uuid.uuid4())[:8].upper()}",
                circular_id=circular_id,
                clause_number=result.clause_number,
                clause_text=result.clause_text,
                triage_status=triage_status,
                classification=result.severity,
                gap_description=f"Detected missing requirements in current policies for clause {result.clause_number or 'unnumbered'}.",
                department=dept,
                ai_confidence_score=0.92 if result.gap_status == "confirmed" else 0.75,
                suggested_action=action,
                detection_results=result
            )
            
            await database.gap_queue.insert_one(entry.model_dump())
            
    # Update circular with new clause statuses and overall status
    await database.circulars.update_one(
        {"circular_id": circular_id},
        {"$set": {
            "clauses": clauses,
            "ingestion_status": "processed"
        }}
    )
    
    return {
        "status": "success",
        "circular_id": circular_id,
        "gaps_detected": [r.model_dump() for r in detection_results]
    }

@router.get("/queue")
async def get_gap_queue(triage_status: str = None, classification: str = None, department: str = None):
    database = get_db()
    query = {}
    if triage_status: query["triage_status"] = triage_status
    if classification: query["classification"] = classification
    if department: query["department"] = department
    
    cursor = database.gap_queue.find(query).sort("created_at", -1)
    results = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        results.append(doc)
        
    return {"queue": results}

@router.post("/{gap_id}/approve")
async def approve_gap(gap_id: str):
    database = get_db()
    await database.gap_queue.update_one(
        {"gap_id": gap_id},
        {"$set": {"triage_status": "resolved"}}
    )
    # MAP Generation stub
    return {"status": "approved", "map_created": True}

@router.post("/{gap_id}/dismiss")
async def dismiss_gap(gap_id: str):
    database = get_db()
    await database.gap_queue.update_one(
        {"gap_id": gap_id},
        {"$set": {"triage_status": "resolved"}}
    )
    return {"status": "dismissed"}

@router.post("/{gap_id}/escalate")
async def escalate_gap(gap_id: str):
    database = get_db()
    await database.gap_queue.update_one(
        {"gap_id": gap_id},
        {"$set": {"triage_status": "escalated"}}
    )
    return {"status": "escalated"}
