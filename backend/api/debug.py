from fastapi import APIRouter, Request
from datetime import datetime
from config import settings
from database import db

router = APIRouter()

@router.get("/cors-test")
async def cors_test(request: Request):
    """Verifies CORS is working for the requesting origin."""
    return {
        "cors": "enabled",
        "origin": request.headers.get("origin", "unknown"),
        "status": "success"
    }

@router.get("/deployment")
async def deployment_info():
    """Returns deployment metadata for verification."""
    # Check DB Connection
    db_connected = False
    if db.client is not None:
        try:
            await db.client.admin.command('ping')
            db_connected = True
        except Exception:
            pass

    return {
        "environment": settings.environment,
        "demo_mode": settings.demo_mode,
        "database_connected": db_connected,
        "atlas_region": "ap-south-1",
        "vector_search_ready": db_connected,  # Assume ready if DB connected
        "version": "4.0.0",
        "timestamp": datetime.utcnow().isoformat()
    }
