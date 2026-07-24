import os
from typing import Optional

from pymongo import MongoClient
from pymongo.database import Database

_client: Optional[MongoClient] = None


def get_client() -> MongoClient:
    global _client
    if _client is not None:
        return _client

    uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    _client = MongoClient(uri)
    return _client


def get_db() -> Database:
    db_name = os.getenv("MONGODB_DB", "ai_interviews")
    return get_client()[db_name]

