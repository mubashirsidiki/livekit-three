import os
from datetime import datetime, timezone

from pymongo import MongoClient

from core.logging.logger import LOG

MONGODB_URI = os.getenv("MONGODB_URI", "")

LOG.info(f"MONGODB_URI set: {bool(MONGODB_URI)} (length={len(MONGODB_URI)})")

_client = MongoClient(MONGODB_URI) if MONGODB_URI else None
_db = _client.get_database("lawyer_bot") if _client else None


def get_db():
    return _db


def fetch_agent_config() -> dict:
    """Fetch instructions from MongoDB. Sync — called once at session start."""
    if _db is None:
        return {}
    try:
        settings = _db.get_collection("business_settings")
        rows = settings.find({})
        return {row["key"]: row["value"] for row in rows}
    except Exception as e:
        LOG.warning(f"Could not fetch agent config from MongoDB: {e}")
    return {}


def save_call_record(payload: dict):
    """Save call classification to MongoDB. Sync — called in shutdown callback."""
    if _db is None:
        LOG.warning("Cannot save call record: MongoDB not connected (_db is None)")
        return
    try:
        payload["called_at"] = datetime.now(timezone.utc)
        payload["created_at"] = datetime.now(timezone.utc)
        _db.get_collection("call_records").insert_one(payload)
        LOG.info("Call record saved to MongoDB")
    except Exception as e:
        LOG.error(f"Failed to save call record to MongoDB: {e}")
