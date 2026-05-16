import asyncio
import certifi
import random
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
from config import settings

try:
    from sentence_transformers import SentenceTransformer
    model = SentenceTransformer('all-MiniLM-L6-v2')
    def get_embedding(text):
        return model.encode(text).tolist()
except Exception:
    def get_embedding(text):
        return [random.uniform(-1, 1) for _ in range(384)]

POLICIES_WITH_INTENTIONAL_GAPS = [
    {
        "policy_id": "POL-CRYPTO-001",
        "title": "Cryptography Standard v2.1",
        "version": "2.1",
        "department_owner_id": "DEPT-INFOSEC",
        "status": "active",
        "valid_from": datetime(2025, 1, 1),
        "valid_until": None,
        "content": "1. All data at rest must be encrypted using industry-standard algorithms.\n2. Key management shall follow ISO 27001 guidelines.\n3. TLS 1.2 is required for all external connections.",
        "covers_clauses": ["RBI/2025-089/1.1", "RBI/2025-089/1.2"]
    },
    {
        "policy_id": "POL-AUTH-001", 
        "title": "Authentication Policy v1.2",
        "version": "1.2",
        "department_owner_id": "DEPT-IT",
        "status": "active",
        "content": "1. Passwords must be minimum 12 characters with complexity requirements.\n2. Single sign-on (SSO) is implemented for all applications.\n3. Privileged access requires additional approval workflow.",
        "covers_clauses": ["RBI/2026-045/2.1"]
    }
]

async def seed_gaps():
    client = AsyncIOMotorClient(settings.mongodb_uri, serverSelectionTimeoutMS=5000, tlsCAFile=certifi.where())
    db = client.suraksha_maps
    
    # Pre-embed
    for p in POLICIES_WITH_INTENTIONAL_GAPS:
        p["embedding"] = get_embedding(p["content"])
        
    await db.policies.delete_many({"policy_id": {"$in": ["POL-CRYPTO-001", "POL-AUTH-001"]}})
    await db.policies.insert_many(POLICIES_WITH_INTENTIONAL_GAPS)
    
    print("Seeded intentional gap policies!")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_gaps())
