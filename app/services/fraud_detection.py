"""
Fraud detection utilities:
- Face matching and liveness detection
- Voice similarity analysis
- Duplicate detection
"""

from __future__ import annotations
from datetime import datetime, timedelta
from typing import Any

import numpy as np
from pymongo.database import Database


class FraudIndicators:
    """Tracks fraud indicators for a candidate response"""

    def __init__(self):
        self.face_detected = False
        self.face_match_score = 0.0  # 0-1, higher = more likely same person
        self.voice_continuity = True  # True = continuous audio without gaps
        self.voice_similarity_scores: dict[str, float] = {}  # name -> similarity score
        self.liveness_score = 0.0  # 0-1, higher = more likely genuine
        self.response_uniqueness = 1.0  # 0-1, lower = more similar to other responses
        self.flags: list[str] = []
        self.fraud_risk_score = 0.0  # 0-1, overall fraud likelihood

    def to_dict(self) -> dict[str, Any]:
        return {
            "face_detected": self.face_detected,
            "face_match_score": float(self.face_match_score),
            "voice_continuity": self.voice_continuity,
            "voice_similarity_scores": {k: float(v) for k, v in self.voice_similarity_scores.items()},
            "liveness_score": float(self.liveness_score),
            "response_uniqueness": float(self.response_uniqueness),
            "flags": self.flags,
            "fraud_risk_score": float(self.fraud_risk_score),
        }

    @classmethod
    def from_dict(cls, data: dict) -> FraudIndicators:
        obj = cls()
        obj.face_detected = data.get("face_detected", False)
        obj.face_match_score = float(data.get("face_match_score", 0))
        obj.voice_continuity = data.get("voice_continuity", True)
        obj.voice_similarity_scores = data.get("voice_similarity_scores", {})
        obj.liveness_score = float(data.get("liveness_score", 0))
        obj.response_uniqueness = float(data.get("response_uniqueness", 1))
        obj.flags = data.get("flags", [])
        obj.fraud_risk_score = float(data.get("fraud_risk_score", 0))
        return obj


def detect_face_presence(video_data: bytes) -> tuple[bool, float]:
    """
    Detect if face is present in video and return presence confidence.
    Returns: (face_detected, confidence_score)
    
    Note: This is a placeholder. In production, use face_recognition or MediaPipe.
    """
    # TODO: Integrate with face_recognition library or MediaPipe
    # For now, return mock data
    return True, 0.85


def check_liveness(video_data: bytes) -> float:
    """
    Perform liveness detection to verify genuine video response.
    Returns: confidence_score (0-1)
    
    Checks for:
    - Eye blinks and blinking patterns
    - Head movement variations
    - Pupil dilation changes
    - Natural behavioral patterns
    """
    # TODO: Implement with anti-spoofing techniques
    # Could use: cv2, MediaPipe, or specialized libraries
    return 0.82


def check_voice_continuity(audio_data: bytes) -> bool:
    """
    Verify voice is continuous without suspicious gaps or splicing.
    Returns: True if continuous, False if gaps detected
    """
    # TODO: Analyze audio waveform for continuity
    # Check for unnatural silence patterns or audio concatenation
    return True


def calculate_voice_similarity(audio1: bytes, audio2: bytes) -> float:
    """
    Calculate similarity between two voice samples.
    Uses voice embeddings/fingerprinting.
    Returns: similarity_score (0-1, where 1 = identical)
    """
    # TODO: Use speech_recognition or similar for voice comparison
    # Could implement MFCC (Mel-frequency cepstral coefficients) comparison
    return 0.0


def calculate_response_similarity(text1: str, text2: str) -> float:
    """
    Calculate text similarity between two responses.
    Returns: similarity_score (0-1)
    """
    if not text1 or not text2:
        return 0.0

    # Simple word overlap method
    words1 = set(text1.lower().split())
    words2 = set(text2.lower().split())

    if not words1 or not words2:
        return 0.0

    intersection = len(words1 & words2)
    union = len(words1 | words2)

    return intersection / union if union > 0 else 0.0


def check_duplicate_candidate(
    db: Database,
    candidate_name: str,
    current_transcript: str,
) -> dict[str, Any]:
    """
    Check if candidate is a duplicate or attempting fraud.
    Returns: dict with duplicate_score and matching_records
    """
    from app.services.candidate_service import get_candidates_by_name

    candidates = get_candidates_by_name(db, name=candidate_name)
    
    duplicates = []
    max_similarity = 0.0

    for candidate in candidates:
        old_transcript = candidate.get("transcript", "")
        similarity = calculate_response_similarity(current_transcript, old_transcript)

        if similarity > 0.6:  # Threshold for duplicate detection
            duplicates.append(
                {
                    "candidate_id": str(candidate.get("_id", "")),
                    "created_at": candidate.get("created_at"),
                    "similarity": similarity,
                    "score": candidate.get("score"),
                }
            )
            max_similarity = max(max_similarity, similarity)

    return {
        "is_potential_duplicate": len(duplicates) > 0 and max_similarity > 0.7,
        "duplicate_score": max_similarity,
        "matching_records": duplicates,
    }


def analyze_fraud_indicators(
    db: Database,
    candidate_name: str,
    transcript: str,
    video_data: bytes | None = None,
    audio_data: bytes | None = None,
) -> FraudIndicators:
    """
    Comprehensive fraud analysis combining all indicators.
    """
    indicators = FraudIndicators()

    # Check face presence and liveness
    if video_data:
        face_detected, face_confidence = detect_face_presence(video_data)
        indicators.face_detected = face_detected
        indicators.liveness_score = check_liveness(video_data)

        if not face_detected:
            indicators.flags.append("No face detected")
        if indicators.liveness_score < 0.6:
            indicators.flags.append("Low liveness score - potential spoofing")

    # Check voice continuity
    if audio_data:
        indicators.voice_continuity = check_voice_continuity(audio_data)
        if not indicators.voice_continuity:
            indicators.flags.append("Voice discontinuity detected - possible audio splicing")

    # Check for duplicates
    duplicate_check = check_duplicate_candidate(db, candidate_name, transcript)
    if duplicate_check["is_potential_duplicate"]:
        indicators.response_uniqueness = 1.0 - duplicate_check["duplicate_score"]
        indicators.flags.append(f"Potential duplicate with similarity {duplicate_check['duplicate_score']:.2%}")

    # Calculate overall fraud risk.
    # Only score modality-specific risk when that modality was actually analyzed.
    risk_score = 0.0
    if video_data is not None and not indicators.face_detected:
        risk_score += 0.3
    if video_data is not None and indicators.liveness_score < 0.6:
        risk_score += 0.2
    if audio_data is not None and not indicators.voice_continuity:
        risk_score += 0.2
    if duplicate_check["is_potential_duplicate"]:
        risk_score += 0.25

    indicators.fraud_risk_score = min(1.0, risk_score)

    return indicators
