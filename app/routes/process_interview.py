from __future__ import annotations

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.database.database import get_db
from app.services.classification_service import (
    classify_candidate,
    generate_classification_feedback,
    map_to_workforce_segment,
    should_escalate_for_review,
)
from app.services.ai import TranscriptionError, transcribe_video_path
from app.services.candidate_service import save_candidate
from app.services.evaluation import evaluate_transcript
from app.services.fraud_detection import analyze_fraud_indicators
from app.services.upload_service import save_upload_video

router = APIRouter(tags=["pipeline"])


@router.post("/process-interview")
async def process_interview(
    name: str = Form(...),
    language: str = Form("en"),
    role: str | None = Form(None),
    file: UploadFile = File(...),
) -> dict:
    if not name or not name.strip():
        raise HTTPException(status_code=400, detail="name is required")

    # 1) Upload
    try:
        video_path = save_upload_video(file)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Upload failed") from e

    # 2) Transcribe
    try:
        transcript = transcribe_video_path(video_path, language_hint=language)
    except TranscriptionError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=500, detail="Transcription failed") from e

    if not isinstance(transcript, str) or not transcript.strip():
        raise HTTPException(
            status_code=400,
            detail="No speech detected in the interview. Please retake the recording with clear audio.",
        )

    # 3) Evaluate
    evaluation = evaluate_transcript(transcript)

    db = get_db()
    fraud_indicators = analyze_fraud_indicators(db, name.strip(), transcript)

    classification = classify_candidate(
        evaluation.score,
        fraud_risk_score=fraud_indicators.fraud_risk_score,
        evaluation_details={
            "relevance_score": evaluation.relevance_score,
            "completeness_score": evaluation.completeness_score,
            "clarity_score": evaluation.clarity_score,
            "confidence_score": evaluation.confidence_score,
            "authenticity_score": evaluation.authenticity_score,
        },
    )

    workforce_segment = map_to_workforce_segment(transcript, role=role)

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

    # 4) Save in MongoDB (candidates collection)
    try:
        saved = save_candidate(
            db,
            name=name.strip(),
            transcript=transcript,
            score=evaluation.score,
            category=evaluation.category,
            language=language,
            workforce_segment=workforce_segment,
            relevance_score=evaluation.relevance_score,
            completeness_score=evaluation.completeness_score,
            clarity_score=evaluation.clarity_score,
            confidence_score=evaluation.confidence_score,
            authenticity_score=evaluation.authenticity_score,
            fraud_indicators=fraud_indicators.to_dict(),
            classification=classification,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail="Database save failed") from e

    return {
        "name": saved["name"],
        "video_path": video_path,
        "transcript": saved["transcript"],
        "score": saved["score"],
        "category": saved["category"],
        "language": saved.get("language", language),
        "role": role,
        "workforce_segment": saved.get("workforce_segment"),
        "evaluation": saved.get("evaluation", {}),
        "classification": classification,
        "fraud_analysis": fraud_indicators.to_dict(),
        "feedback": feedback,
        "requires_escalation": should_escalate_for_review(
            classification,
            fraud_indicators.fraud_risk_score,
            evaluation_details={
                "relevance_score": evaluation.relevance_score,
                "completeness_score": evaluation.completeness_score,
                "clarity_score": evaluation.clarity_score,
                "confidence_score": evaluation.confidence_score,
                "authenticity_score": evaluation.authenticity_score,
            },
        ),
        "created_at": saved.get("created_at"),
    }

