from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
from contextlib import asynccontextmanager

from config import settings
from database import connect_to_mongo, close_mongo_connection, db
from api import auth
from api import circulars
from api import gaps
from api import debug

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        await connect_to_mongo()
    except Exception as e:
        logger.error(f"Failed to connect to database: {e}")
    yield
    await close_mongo_connection()

app = FastAPI(
    title="SuRaksha MAPS v4.0 API",
    description="Backend API for Multi-Agent Persistent Security Framework",
    version="4.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(circulars.router, prefix="/api/circulars", tags=["Watcher Circulars"])
app.include_router(gaps.router, prefix="/api/gaps", tags=["Gap Detector"])
app.include_router(debug.router, prefix="/api/debug", tags=["Debug"])

@app.get("/health")
async def health_check():
    db_status = "disconnected"
    if db.client is not None:
        try:
            await db.client.admin.command('ping')
            db_status = "connected"
        except Exception:
            db_status = "error"
            
    return {
        "status": "ok",
        "version": "4.0",
        "database": db_status
    }
