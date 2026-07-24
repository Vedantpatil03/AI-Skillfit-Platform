from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from pymongo.collection import Collection
from pymongo.database import Database


def _collection(db: Database) -> Collection:
    return db["candidates"]


def _serialize(doc: dict[str, Any]) -> dict[str, Any]:
    out = dict(doc)
    out.pop("_id", None)
    created_at = out.get("created_at")
    if isinstance(created_at, datetime):
        out["created_at"] = created_at.isoformat()
    return out


def save_candidate(
    db: Database,
    *,
    name: str,
    transcript: str,
    score: int,
    category: str,
    language: str = "en",
    district: str | None = None,
    workforce_segment: str | None = None,
    relevance_score: int = 0,
    completeness_score: int = 0,
    clarity_score: int = 0,
    confidence_score: int = 0,
    authenticity_score: int = 0,
    fraud_indicators: dict[str, Any] | None = None,
    classification: str | None = None,
) -> dict[str, Any]:
    """Save candidate record with comprehensive evaluation data."""
    doc: dict[str, Any] = {
        "name": name,
        "transcript": transcript,
        "score": int(score),
        "category": category,
        "language": language,
        "district": district,
        "workforce_segment": workforce_segment,
        "evaluation": {
            "relevance_score": int(relevance_score),
            "completeness_score": int(completeness_score),
            "clarity_score": int(clarity_score),
            "confidence_score": int(confidence_score),
            "authenticity_score": int(authenticity_score),
        },
        "fraud_indicators": fraud_indicators or {},
        "classification": classification,
        "created_at": datetime.now(timezone.utc),
    }
    _collection(db).insert_one(doc)
    return _serialize(doc)


def list_candidates(
    db: Database,
    *,
    limit: int = 20,
    filters: dict[str, Any] | None = None,
) -> list[dict[str, Any]]:
    """List candidates with optional filtering."""
    query = filters or {}
    cur = (
        _collection(db)
        .find(query, projection={"_id": 0})
        .sort("created_at", -1)
        .limit(int(limit))
    )
    return [_serialize(d) for d in cur]


def get_candidate_latest_by_name(db: Database, *, name: str) -> dict[str, Any] | None:
    """Get the most recent candidate record by name."""
    doc = _collection(db).find_one(
        {"name": name}, projection={"_id": 0}, sort=[("created_at", -1)]
    )
    return _serialize(doc) if doc else None


def get_candidates_by_name(db: Database, *, name: str, limit: int = 10) -> list[dict[str, Any]]:
    """Get all candidate records for a given name (for duplicate detection)."""
    cur = (
        _collection(db)
        .find({"name": name}, projection={"_id": 0})
        .sort("created_at", -1)
        .limit(limit)
    )
    return [_serialize(d) for d in cur]


def get_candidates_by_classification(
    db: Database, *, classification: str, limit: int = 20
) -> list[dict[str, Any]]:
    """Get candidates by classification category."""
    return list_candidates(db, limit=limit, filters={"classification": classification})


def get_candidates_by_district(
    db: Database, *, district: str, limit: int = 20
) -> list[dict[str, Any]]:
    """Get candidates by district."""
    return list_candidates(db, limit=limit, filters={"district": district})


def get_candidates_by_workforce_segment(
    db: Database, *, segment: str, limit: int = 20
) -> list[dict[str, Any]]:
    """Get candidates by workforce segment."""
    return list_candidates(db, limit=limit, filters={"workforce_segment": segment})


def get_candidates_by_language(
    db: Database, *, language: str, limit: int = 20
) -> list[dict[str, Any]]:
    """Get candidates by interview language."""
    return list_candidates(db, limit=limit, filters={"language": language})


def get_dashboard_stats(db: Database) -> dict[str, Any]:
    """Get comprehensive dashboard statistics."""
    collection = _collection(db)

    total_candidates = collection.count_documents({})

    # Average score
    pipeline = [{"$group": {"_id": None, "avg_score": {"$avg": "$score"}}}]
    result = list(collection.aggregate(pipeline))
    avg_score = result[0]["avg_score"] if result else 0

    # Classification breakdown
    classifications = {}
    for doc in collection.find({"classification": {"$exists": True}}):
        classification = doc.get("classification", "unknown")
        classifications[classification] = classifications.get(classification, 0) + 1

    # Workforce segment breakdown
    segments = {}
    for doc in collection.find({"workforce_segment": {"$exists": True}}):
        segment = doc.get("workforce_segment", "unknown")
        segments[segment] = segments.get(segment, 0) + 1

    # Language breakdown
    languages = {}
    for doc in collection.find({}):
        lang = doc.get("language", "unknown")
        languages[lang] = languages.get(lang, 0) + 1

    # Fraud detected count
    fraud_count = collection.count_documents({"fraud_indicators.fraud_risk_score": {"$gt": 0.7}})

    return {
        "total_candidates": total_candidates,
        "average_score": round(avg_score, 2),
        "classifications": classifications,
        "workforce_segments": segments,
        "languages": languages,
        "potential_fraud_cases": fraud_count,
    }

