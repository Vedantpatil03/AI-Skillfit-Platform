from datetime import datetime, timezone
from typing import Any, Optional

from bson import ObjectId
from pymongo.collection import Collection
from pymongo.database import Database


def _collection(db: Database) -> Collection:
    return db["interviews"]


def create_interview(
    db: Database,
    *,
    candidate_name: str,
    role: Optional[str] = None,
    metadata: Optional[dict[str, Any]] = None,
) -> dict[str, Any]:
    doc: dict[str, Any] = {
        "candidate_name": candidate_name,
        "role": role,
        "metadata": metadata or {},
        "created_at": datetime.now(timezone.utc),
    }
    res = _collection(db).insert_one(doc)
    doc["_id"] = str(res.inserted_id)
    return doc


def list_interviews(db: Database, *, limit: int = 20) -> list[dict[str, Any]]:
    cur = _collection(db).find({}).sort("created_at", -1).limit(limit)
    out: list[dict[str, Any]] = []
    for d in cur:
        d["_id"] = str(d["_id"])
        out.append(d)
    return out

