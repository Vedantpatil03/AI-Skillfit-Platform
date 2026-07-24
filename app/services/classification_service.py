"""
Candidate classification service.
Classifies candidates into job-ready, training-needed, manual-verification, low-confidence, or fraud.
"""

from __future__ import annotations

from typing import Any

from app.config import CLASSIFICATION_CATEGORIES, WORKFORCE_SEGMENTS


def classify_candidate(
    score: int,
    fraud_risk_score: float,
    evaluation_details: dict[str, Any] | None = None,
) -> str:
    """
    Classify candidate based on evaluation score and fraud indicators.
    
    Returns one of:
    - job_ready: 80-100 score, low fraud risk
    - training_needed: 60-79 score, low fraud risk
    - manual_verification: 40-59 score, any fraud risk
    - low_confidence: 0-39 score, any fraud risk
    - fraud_suspected: high fraud risk (>0.7) regardless of score
    """
    # Fraud takes priority
    if fraud_risk_score > 0.7:
        return "fraud_suspected"

    # Classification based on score
    if score >= 80:
        return "job_ready"
    elif score >= 60:
        return "training_needed"
    elif score >= 40:
        return "manual_verification"
    else:
        return "low_confidence"


def map_to_workforce_segment(
    transcript: str,
    role: str | None = None,
) -> str | None:
    """
    Map candidate to appropriate workforce segment based on keywords in transcript.
    
    Returns one of:
    - blue_collar: Manual trades
    - polytechnic: Technical/diploma holders
    - semi_skilled: Basic operational roles
    - None: Could not determine
    """
    combined_text = f"{transcript} {role or ''}".lower()

    segment_scores = {
        "blue_collar": 0,
        "polytechnic": 0,
        "semi_skilled": 0,
    }

    # Blue collar keywords
    for kw in WORKFORCE_SEGMENTS["blue_collar"]["keywords"]:
        if kw.lower() in combined_text:
            segment_scores["blue_collar"] += 1

    # Polytechnic keywords
    for kw in WORKFORCE_SEGMENTS["polytechnic"]["keywords"]:
        if kw.lower() in combined_text:
            segment_scores["polytechnic"] += 1

    # Semi-skilled keywords
    for kw in WORKFORCE_SEGMENTS["semi_skilled"]["keywords"]:
        if kw.lower() in combined_text:
            segment_scores["semi_skilled"] += 1

    # Return segment with highest score
    if max(segment_scores.values()) > 0:
        return max(segment_scores, key=segment_scores.get)

    return None


def get_classification_details(classification: str) -> dict[str, Any]:
    """Get details about a classification category."""
    return CLASSIFICATION_CATEGORIES.get(
        classification,
        {
            "id": "unknown",
            "name": "Unknown",
            "description": "Unknown classification",
            "color": "gray",
        }
    )


def should_escalate_for_review(
    classification: str,
    fraud_risk_score: float,
    evaluation_details: dict[str, Any] | None = None,
) -> bool:
    """
    Determine if candidate record should be escalated for manual review.
    
    Escalation triggers:
    - Fraud suspected
    - Manual verification classification
    - Edge cases near decision boundaries
    - Quality concerns
    """
    if classification == "fraud_suspected":
        return True

    if classification == "manual_verification":
        return True

    if fraud_risk_score > 0.5:
        return True

    if evaluation_details:
        # Escalate if authenticity is questionable
        if evaluation_details.get("authenticity_score", 0) < 8:
            return True

        # Escalate if multiple low scores
        low_scores = sum(
            1
            for key in ["relevance_score", "completeness_score", "clarity_score"]
            if evaluation_details.get(key, 0) < 10
        )
        if low_scores >= 2:
            return True

    return False


def generate_classification_feedback(
    score: int,
    classification: str,
    evaluation_details: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """
    Generate human-readable feedback for the candidate's classification.
    """
    feedback = {
        "classification": classification,
        "score": score,
        "classification_details": get_classification_details(classification),
        "feedback_text": "",
        "recommendations": [],
        "next_steps": [],
    }

    # Generate feedback based on classification
    if classification == "job_ready":
        feedback["feedback_text"] = (
            "Excellent performance! You demonstrate strong qualifications and readiness "
            "for the position. Proceed to next stage."
        )
        feedback["next_steps"] = ["Interview with hiring manager", "Background check", "Offer stage"]

    elif classification == "training_needed":
        feedback["feedback_text"] = (
            "Good foundation! You have potential but would benefit from additional training "
            "or skill development in some areas."
        )
        feedback["recommendations"] = [
            "Technical skill development courses",
            "On-the-job training programs",
            "Mentorship opportunities",
        ]
        feedback["next_steps"] = ["Enroll in training program", "Retest after 3-6 months"]

    elif classification == "manual_verification":
        feedback["feedback_text"] = (
            "Your profile requires manual review by our team for a fair assessment. "
            "We'll follow up with additional evaluation."
        )
        feedback["next_steps"] = ["Manual review queued", "Follow-up interview may be scheduled"]

    elif classification == "low_confidence":
        feedback["feedback_text"] = (
            "The interview quality was insufficient for a reliable assessment. "
            "We recommend retaking the interview with better audio/video conditions."
        )
        feedback["recommendations"] = [
            "Ensure good lighting and clear audio",
            "Speak clearly and take your time",
            "Find a quiet location for the interview",
        ]
        feedback["next_steps"] = ["Retake interview", "Contact support if issues persist"]

    elif classification == "fraud_suspected":
        feedback["feedback_text"] = (
            "This profile has been flagged for potential fraud indicators. "
            "Further investigation is required."
        )
        feedback["next_steps"] = ["Manual verification", "ID verification", "Investigation"]

    # Add score-based insights
    if evaluation_details:
        if evaluation_details.get("relevance_score", 0) < 10:
            feedback["recommendations"].append(
                "Try to provide more relevant responses to the questions asked"
            )
        if evaluation_details.get("clarity_score", 0) < 10:
            feedback["recommendations"].append("Focus on speaking clearly and concisely")

    return feedback
