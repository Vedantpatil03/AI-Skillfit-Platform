"""
Admin dashboard endpoints for candidate management and analytics.
"""

from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException

from app.database.database import get_db
from app.services.candidate_service import (
    get_candidates_by_classification,
    get_candidates_by_district,
    get_candidates_by_language,
    get_candidates_by_workforce_segment,
    get_dashboard_stats,
    list_candidates,
)
from app.config import CLASSIFICATION_CATEGORIES, WORKFORCE_SEGMENTS, INDIAN_DISTRICTS

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


class DashboardFilterRequest(BaseModel):
    classification: str | None = None
    district: str | None = None
    language: str | None = None
    workforce_segment: str | None = None
    limit: int = Field(default=20, ge=1, le=100)
    min_score: int | None = Field(default=None, ge=0, le=100)
    max_score: int | None = Field(default=None, ge=0, le=100)


@router.get("/stats")
def get_stats() -> dict:
    """Get overall dashboard statistics."""
    db = get_db()
    stats = get_dashboard_stats(db)
    return {
        "timestamp": __import__("datetime").datetime.now(
            __import__("datetime").timezone.utc
        ).isoformat(),
        "data": stats,
    }


@router.get("/classifications")
def list_classifications() -> dict:
    """Get all available classification categories."""
    return {
        "classifications": [
            {
                "id": cat_id,
                "name": config["name"],
                "description": config["description"],
                "color": config["color"],
            }
            for cat_id, config in CLASSIFICATION_CATEGORIES.items()
        ]
    }


@router.get("/workforce-segments")
def list_workforce_segments() -> dict:
    """Get all workforce segment categories."""
    return {
        "segments": [
            {
                "id": seg_id,
                "name": config["name"],
                "description": config["description"],
            }
            for seg_id, config in WORKFORCE_SEGMENTS.items()
        ]
    }


@router.get("/districts")
def list_districts() -> dict:
    """Get list of supported districts."""
    return {"districts": INDIAN_DISTRICTS}


@router.post("/search")
def search_candidates(filters: DashboardFilterRequest) -> dict:
    """Search candidates with advanced filtering."""
    db = get_db()
    results = []

    if filters.classification:
        results = get_candidates_by_classification(
            db, classification=filters.classification, limit=filters.limit
        )
    elif filters.district:
        results = get_candidates_by_district(
            db, district=filters.district, limit=filters.limit
        )
    elif filters.language:
        results = get_candidates_by_language(
            db, language=filters.language, limit=filters.limit
        )
    elif filters.workforce_segment:
        results = get_candidates_by_workforce_segment(
            db, segment=filters.workforce_segment, limit=filters.limit
        )
    else:
        results = list_candidates(db, limit=filters.limit)

    # Apply score filter if provided
    if filters.min_score is not None or filters.max_score is not None:
        filtered_results = []
        for candidate in results:
            score = candidate.get("score", 0)
            if filters.min_score and score < filters.min_score:
                continue
            if filters.max_score and score > filters.max_score:
                continue
            filtered_results.append(candidate)
        results = filtered_results

    return {
        "count": len(results),
        "filters": {
            "classification": filters.classification,
            "district": filters.district,
            "language": filters.language,
            "workforce_segment": filters.workforce_segment,
            "score_range": {
                "min": filters.min_score,
                "max": filters.max_score,
            },
        },
        "candidates": results,
    }


@router.get("/candidate/{candidate_id}")
def get_candidate_details(candidate_id: str) -> dict:
    """Get detailed information about a specific candidate."""
    # This would require MongoDB ObjectId handling in the service
    # For now, return placeholder
    return {
        "message": "Candidate details endpoint - implementation pending",
    }


@router.get("/candidates-by-classification/{classification}")
def get_by_classification(classification: str, limit: int = 20) -> dict:
    """Get all candidates in a classification category."""
    db = get_db()

    if classification not in CLASSIFICATION_CATEGORIES:
        raise HTTPException(status_code=400, detail=f"Invalid classification: {classification}")

    candidates = get_candidates_by_classification(db, classification=classification, limit=limit)

    return {
        "classification": classification,
        "count": len(candidates),
        "candidates": candidates,
    }


@router.get("/fraud-alerts")
def get_fraud_alerts(limit: int = 20) -> dict:
    """Get candidates flagged as potential fraud."""
    db = get_db()
    collection = db["candidates"]

    fraud_candidates = list(
        collection.find(
            {"fraud_indicators.fraud_risk_score": {"$gt": 0.5}},
            projection={"_id": 0},
        )
        .sort("fraud_indicators.fraud_risk_score", -1)
        .limit(limit)
    )

    return {
        "fraud_alerts": fraud_candidates,
        "total_alerts": len(fraud_candidates),
    }


@router.get("/escalation-queue")
def get_escalation_queue(limit: int = 20) -> dict:
    """Get candidates requiring manual review/escalation."""
    db = get_db()
    collection = db["candidates"]

    # Find candidates that need manual review
    escalated = list(
        collection.find(
            {
                "$or": [
                    {"classification": "manual_verification"},
                    {"classification": "fraud_suspected"},
                    {"fraud_indicators.fraud_risk_score": {"$gt": 0.5}},
                ]
            },
            projection={"_id": 0},
        )
        .sort("created_at", -1)
        .limit(limit)
    )

    return {
        "escalation_queue": escalated,
        "total_in_queue": len(escalated),
    }


@router.get("/analytics/by-classification")
def analytics_by_classification() -> dict:
    """Get analytics breakdown by classification."""
    db = get_db()
    stats = get_dashboard_stats(db)

    breakdown = []
    for classification, config in CLASSIFICATION_CATEGORIES.items():
        count = stats.get("classifications", {}).get(classification, 0)
        percentage = (
            (count / stats["total_candidates"] * 100)
            if stats["total_candidates"] > 0
            else 0
        )
        breakdown.append(
            {
                "classification": classification,
                "name": config["name"],
                "count": count,
                "percentage": round(percentage, 2),
            }
        )

    return {
        "total": stats["total_candidates"],
        "breakdown": breakdown,
    }


@router.get("/analytics/by-language")
def analytics_by_language() -> dict:
    """Get analytics breakdown by language."""
    db = get_db()
    stats = get_dashboard_stats(db)

    total = stats["total_candidates"]
    breakdown = [
        {
            "language": lang,
            "count": count,
            "percentage": round(count / total * 100, 2) if total > 0 else 0,
        }
        for lang, count in stats.get("languages", {}).items()
    ]

    return {
        "total": total,
        "breakdown": sorted(breakdown, key=lambda x: x["count"], reverse=True),
    }


@router.get("/analytics/by-workforce-segment")
def analytics_by_workforce_segment() -> dict:
    """Get analytics breakdown by workforce segment."""
    db = get_db()
    stats = get_dashboard_stats(db)

    total = stats["total_candidates"]
    breakdown = []
    for segment, count in stats.get("workforce_segments", {}).items():
        if segment in WORKFORCE_SEGMENTS:
            breakdown.append(
                {
                    "segment": segment,
                    "name": WORKFORCE_SEGMENTS[segment]["name"],
                    "count": count,
                    "percentage": round(count / total * 100, 2) if total > 0 else 0,
                }
            )

    return {
        "total": total,
        "breakdown": sorted(breakdown, key=lambda x: x["count"], reverse=True),
    }
