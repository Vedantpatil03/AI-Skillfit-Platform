from pydantic import BaseModel, Field

from fastapi import APIRouter, HTTPException

from app.database.database import get_db
from app.services.candidate_service import (
    get_candidate_latest_by_name,
    list_candidates,
    save_candidate,
)
from app.services.evaluation import evaluate_transcript
from app.services.classification_service import (
    classify_candidate,
    map_to_workforce_segment,
    generate_classification_feedback,
    should_escalate_for_review,
)
from app.services.fraud_detection import analyze_fraud_indicators

router = APIRouter(prefix="/candidates", tags=["candidates"])


class CandidateCreateRequest(BaseModel):
    name: str = Field(min_length=1)
    transcript: str = Field(min_length=1)
    language: str = Field(default="en")
    district: str | None = None
    role: str | None = None


class CandidateAdvancedCreateRequest(BaseModel):
    name: str = Field(min_length=1)
    transcript: str = Field(min_length=1)
    language: str = Field(default="en")
    district: str | None = None
    role: str | None = None
    video_path: str | None = None  # For face/liveness detection
    keywords: list[str] | None = None  # Custom evaluation keywords


@router.post("")
def create_candidate(req: CandidateCreateRequest) -> dict:
    """Basic candidate creation with evaluation."""
    db = get_db()

    # Evaluate transcript
    evaluation = evaluate_transcript(req.transcript.strip())

    # Classify candidate
    classification = classify_candidate(
        evaluation.score,
        fraud_risk_score=0.0,  # Will be enhanced with fraud detection
        evaluation_details={
            "relevance_score": evaluation.relevance_score,
            "completeness_score": evaluation.completeness_score,
            "clarity_score": evaluation.clarity_score,
            "confidence_score": evaluation.confidence_score,
            "authenticity_score": evaluation.authenticity_score,
        },
    )

    # Map to workforce segment
    workforce_segment = map_to_workforce_segment(
        req.transcript, role=req.role
    )

    # Save to database
    doc = save_candidate(
        db,
        name=req.name.strip(),
        transcript=req.transcript.strip(),
        score=evaluation.score,
        category=evaluation.category,
        language=req.language,
        district=req.district,
        workforce_segment=workforce_segment,
        relevance_score=evaluation.relevance_score,
        completeness_score=evaluation.completeness_score,
        clarity_score=evaluation.clarity_score,
        confidence_score=evaluation.confidence_score,
        authenticity_score=evaluation.authenticity_score,
        classification=classification,
    )

    # Generate feedback
    feedback = generate_classification_feedback(
        evaluation.score,
        classification,
        evaluation_details={
            "relevance_score": evaluation.relevance_score,
            "completeness_score": evaluation.completeness_score,
            "clarity_score": evaluation.clarity_score,
            "confidence_score": evaluation.confidence_score,
            "authenticity_score": evaluation.authenticity_score,
        },
    )

    return {
        **doc,
        "evaluation": {
            "total_score": evaluation.score,
            "category": evaluation.category,
            "relevance_score": evaluation.relevance_score,
            "completeness_score": evaluation.completeness_score,
            "clarity_score": evaluation.clarity_score,
            "confidence_score": evaluation.confidence_score,
            "authenticity_score": evaluation.authenticity_score,
        },
        "classification": classification,
        "feedback": feedback,
        "requires_escalation": should_escalate_for_review(classification, 0.0),
    }


@router.post("/advanced")
def create_candidate_advanced(req: CandidateAdvancedCreateRequest) -> dict:
    """Advanced candidate creation with fraud detection and comprehensive analysis."""
    db = get_db()

    # Custom keywords if provided
    keywords = tuple(req.keywords) if req.keywords else None

    # Evaluate transcript
    evaluation = evaluate_transcript(
        req.transcript.strip(),
        keywords=keywords,
        db=db,
        candidate_name=req.name,
    )

    # Fraud detection analysis
    fraud_indicators = analyze_fraud_indicators(
        db, req.name.strip(), req.transcript.strip()
    )

    # Classify candidate
    classification = classify_candidate(
        evaluation.score,
        fraud_indicators.fraud_risk_score,
        evaluation_details={
            "relevance_score": evaluation.relevance_score,
            "completeness_score": evaluation.completeness_score,
            "clarity_score": evaluation.clarity_score,
            "confidence_score": evaluation.confidence_score,
            "authenticity_score": evaluation.authenticity_score,
        },
    )

    # Map to workforce segment
    workforce_segment = map_to_workforce_segment(
        req.transcript, role=req.role
    )

    # Save to database
    doc = save_candidate(
        db,
        name=req.name.strip(),
        transcript=req.transcript.strip(),
        score=evaluation.score,
        category=evaluation.category,
        language=req.language,
        district=req.district,
        workforce_segment=workforce_segment,
        relevance_score=evaluation.relevance_score,
        completeness_score=evaluation.completeness_score,
        clarity_score=evaluation.clarity_score,
        confidence_score=evaluation.confidence_score,
        authenticity_score=evaluation.authenticity_score,
        fraud_indicators=fraud_indicators.to_dict(),
        classification=classification,
    )

    # Generate feedback
    feedback = generate_classification_feedback(
        evaluation.score,
        classification,
        evaluation_details={
            "relevance_score": evaluation.relevance_score,
            "completeness_score": evaluation.completeness_score,
            "clarity_score": evaluation.clarity_score,
            "confidence_score": evaluation.confidence_score,
            "authenticity_score": evaluation.authenticity_score,
        },
    )

    requires_escalation = should_escalate_for_review(
        classification,
        fraud_indicators.fraud_risk_score,
        evaluation_details={
            "relevance_score": evaluation.relevance_score,
            "completeness_score": evaluation.completeness_score,
            "clarity_score": evaluation.clarity_score,
            "confidence_score": evaluation.confidence_score,
            "authenticity_score": evaluation.authenticity_score,
        },
    )

    return {
        **doc,
        "evaluation": {
            "total_score": evaluation.score,
            "category": evaluation.category,
            "relevance_score": evaluation.relevance_score,
            "completeness_score": evaluation.completeness_score,
            "clarity_score": evaluation.clarity_score,
            "confidence_score": evaluation.confidence_score,
            "authenticity_score": evaluation.authenticity_score,
        },
        "classification": classification,
        "fraud_analysis": fraud_indicators.to_dict(),
        "feedback": feedback,
        "requires_escalation": requires_escalation,
    }


@router.get("")
def fetch_candidates(limit: int = 20) -> list[dict]:
    """Get list of candidates."""
    db = get_db()
    return list_candidates(db, limit=limit)


@router.get("/by-name/{name}")
def fetch_candidate_latest(name: str) -> dict:
    """Get latest candidate record by name."""
    db = get_db()
    doc = get_candidate_latest_by_name(db, name=name)
    if not doc:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return doc

