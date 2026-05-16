import asyncio
import logging
import certifi
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import CollectionInvalid
from config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Flexible Schemas for validation - Let Pydantic handle rich validation
SCHEMAS = {
    "users": {
        "$jsonSchema": {
            "bsonType": "object",
            "required": ["emp_id", "email", "role"],
            "properties": {
                "emp_id": {"bsonType": "string"},
                "email": {"bsonType": "string", "pattern": "^.+@.+$"},
                "role": {"enum": ["admin", "compliance_officer", "department_head", "auditor"]},
                "status": {"enum": ["active", "inactive", "suspended", "pending", "failed"]}
            }
        }
    },
    "circulars": {
        "$jsonSchema": {
            "bsonType": "object",
            "required": ["circular_id", "title", "issuer", "ingestion_status"],
            "properties": {
                "circular_id": {"bsonType": "string"},
                "title": {"bsonType": "string"},
                "issuer": {"enum": ["RBI", "SEBI", "CERT-In", "Internal", "UNKNOWN"]},
                "ingestion_status": {"enum": ["pending", "fully_parsed", "partially_parsed", "failed", "pending_review", "processed"]},
                "date_issued": {"bsonType": "date"}
            }
        }
    },
    "policies": {
        "$jsonSchema": {
            "bsonType": "object",
            "required": ["policy_id", "title", "department_owner_id", "status", "content"],
            "properties": {
                "status": {"enum": ["draft", "active", "archived"]}
            }
        }
    },
    "maps": {
        "$jsonSchema": {
            "bsonType": "object",
            "required": ["map_id", "circular_id", "policy_id", "status", "owner_department_id"],
            "properties": {
                "status": {"enum": ["draft", "in_review", "approved", "rejected", "published"]}
            }
        }
    },
    "audit_logs": {
        "$jsonSchema": {
            "bsonType": "object",
            "required": ["timestamp", "user_id", "action_type"],
            "properties": {
                "timestamp": {"bsonType": "date"},
                "action_type": {"bsonType": "string"}
            }
        }
    },
    "gap_queue": {
        "$jsonSchema": {
            "bsonType": "object",
            "required": ["circular_id", "triage_status", "classification", "gap_description"],
            "properties": {
                "triage_status": {"enum": ["new", "assigned", "resolved"]},
                "classification": {"enum": ["critical", "high", "medium", "low"]}
            }
        }
    }
}

COLLECTIONS = ["users", "departments", "circulars", "policies", "maps", "evidence", "audit_logs", "sessions", "gap_queue"]

async def create_collections_with_validators(db):
    for coll_name in COLLECTIONS:
        try:
            validator = SCHEMAS.get(coll_name, {})
            if validator:
                await db.create_collection(coll_name, validator=validator, validationLevel="moderate")
                logger.info(f"Created collection '{coll_name}' with flexible schema validator (moderate level).")
            else:
                await db.create_collection(coll_name)
                logger.info(f"Created collection '{coll_name}' without schema validator.")
        except CollectionInvalid:
            logger.warning(f"Collection '{coll_name}' already exists.")

async def create_standard_indexes(db):
    # users
    await db.users.create_index("emp_id", unique=True)
    await db.users.create_index("email", unique=True)
    await db.users.create_index("department_id")
    # circulars
    await db.circulars.create_index("circular_id", unique=True)
    await db.circulars.create_index("issuer")
    await db.circulars.create_index("ingestion_status")
    await db.circulars.create_index("date_issued")
    # maps
    await db.maps.create_index("map_id", unique=True)
    await db.maps.create_index("status")
    await db.maps.create_index("owner_department_id")
    await db.maps.create_index("assigned_to")
    await db.maps.create_index("deadline")
    # policies
    await db.policies.create_index("policy_id", unique=True)
    await db.policies.create_index("department_owner_id")
    await db.policies.create_index("status")
    # audit_logs
    await db.audit_logs.create_index([("timestamp", -1)])
    await db.audit_logs.create_index("user_id")
    await db.audit_logs.create_index("action_type")
    await db.audit_logs.create_index("map_id")
    # gap_queue
    await db.gap_queue.create_index("triage_status")
    await db.gap_queue.create_index("classification")
    await db.gap_queue.create_index("circular_id")
    logger.info("All standard indexes created successfully.")

async def create_atlas_search_indexes(db):
    logger.info("Creating Atlas Search & Vector Search Indexes...")
    
    # Circulars Search Index
    circulars_search_def = {
        "name": "text_search_circulars",
        "type": "search",
        "definition": {
            "mappings": {
                "dynamic": True
            }
        }
    }
    
    # Circulars Vector Index
    circulars_vector_def = {
        "name": "vector_index_regulations",
        "type": "vectorSearch",
        "definition": {
            "fields": [{
                "type": "vector",
                "path": "clauses.embedding",
                "numDimensions": 384,
                "similarity": "cosine"
            }]
        }
    }

    # Policies Vector Index
    policies_vector_def = {
        "name": "vector_index_policies",
        "type": "vectorSearch",
        "definition": {
            "fields": [{
                "type": "vector",
                "path": "embedding",
                "numDimensions": 384,
                "similarity": "cosine"
            }]
        }
    }

    try:
        await db.command("createSearchIndexes", "circulars", indexes=[circulars_search_def, circulars_vector_def])
        logger.info("Atlas Search and Vector Search indexes for 'circulars' requested.")
    except Exception as e:
        logger.error(f"Failed to create circulars search indexes: {e}")

    try:
        await db.command("createSearchIndexes", "policies", indexes=[policies_vector_def])
        logger.info("Atlas Vector Search index for 'policies' requested.")
    except Exception as e:
        logger.error(f"Failed to create policies search indexes: {e}")

async def main():
    logger.info("Connecting to MongoDB Atlas...")
    client = AsyncIOMotorClient(settings.mongodb_uri, serverSelectionTimeoutMS=5000, tlsCAFile=certifi.where())
    db = client.suraksha_maps

    await create_collections_with_validators(db)
    await create_standard_indexes(db)
    await create_atlas_search_indexes(db)
    
    logger.info("MongoDB Atlas Setup Complete!")
    client.close()

if __name__ == "__main__":
    asyncio.run(main())
