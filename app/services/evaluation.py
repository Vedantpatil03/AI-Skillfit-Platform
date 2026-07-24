from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Any
from pymongo.database import Database


@dataclass(frozen=True)
class EvaluationResult:
    score: int
    category: str
    relevance_score: int = 0
    completeness_score: int = 0
    clarity_score: int = 0
    confidence_score: int = 0
    authenticity_score: int = 0
    details: dict[str, Any] | None = None


_DEFAULT_KEYWORDS = ("experience", "skill", "work", "knowledge", "ability", "capability")


def _word_count(text: str) -> int:
    """Count word-like tokens; keeps it simple and robust to punctuation."""
    return len(re.findall(r"\b[\w']+\b", text.lower()))


def _keyword_hits(text: str, keywords: tuple[str, ...]) -> int:
    """Count keyword occurrences in text."""
    lower = text.lower()
    hits = 0
    for kw in keywords:
        kw = kw.strip().lower()
        if not kw:
            continue
        # count whole-word matches
        hits += len(re.findall(rf"\b{re.escape(kw)}\b", lower))
    return hits


def _analyze_relevance(transcript: str, keywords: tuple[str, ...]) -> int:
    """
    Analyze how relevant the transcript is to the keywords.
    Score: 0-25 points
    """
    if not transcript.strip():
        return 0

    kh = _keyword_hits(transcript, keywords)
    wc = _word_count(transcript)

    if wc == 0:
        return 0

    keyword_ratio = kh / max(wc, 1)

    if keyword_ratio > 0.3:
        return 25
    elif keyword_ratio > 0.2:
        return 20
    elif keyword_ratio > 0.1:
        return 15
    elif keyword_ratio > 0.05:
        return 10
    else:
        return 5


def _analyze_completeness(transcript: str) -> int:
    """
    Analyze response completeness based on length and structure.
    Score: 0-20 points
    """
    wc = _word_count(transcript)
    sentence_count = len(re.split(r'[.!?]+', transcript.strip()))

    if wc < 30:
        return 3
    elif wc < 80:
        return 8
    elif wc < 150:
        return 12
    elif wc < 250:
        return 16
    else:
        return 20


def _analyze_clarity(transcript: str) -> int:
    """
    Analyze communication clarity based on punctuation, structure, and common words.
    Score: 0-20 points
    """
    if not transcript.strip():
        return 0

    # Check for clear sentence structure
    sentences = re.split(r'[.!?]+', transcript.strip())
    clear_sentences = sum(1 for s in sentences if len(s.strip().split()) >= 3)
    clarity_ratio = clear_sentences / max(len(sentences), 1)

    # Check for proper punctuation
    punctuation_count = len(re.findall(r'[.!?,;:]', transcript))
    text_length = _word_count(transcript)
    punctuation_ratio = punctuation_count / max(text_length / 10, 1)  # Expected ~1 punctuation per 10 words

    score = 0
    if clarity_ratio > 0.7:
        score += 12
    elif clarity_ratio > 0.5:
        score += 8
    else:
        score += 3

    if punctuation_ratio > 0.5:
        score += 8
    elif punctuation_ratio > 0.2:
        score += 4

    return min(20, score)


def _analyze_confidence(transcript: str) -> int:
    """
    Analyze response confidence indicators.
    Score: 0-15 points
    Looks for: strong language, specific details, lack of hesitation markers
    """
    if not transcript.strip():
        return 0

    hesitation_markers = ("um", "uh", "ah", "like", "you know", "i think", "maybe", "i guess", "sort of", "kind of")
    hesitation_count = _keyword_hits(transcript, hesitation_markers)

    strong_markers = ("definitely", "certainly", "absolutely", "clearly", "obviously", "definitely", "successful", "achieved", "accomplished")
    strong_count = _keyword_hits(transcript, strong_markers)

    total_words = _word_count(transcript)

    if total_words == 0:
        return 0

    hesitation_ratio = hesitation_count / total_words
    strong_ratio = strong_count / total_words

    score = 0
    if hesitation_ratio < 0.02:
        score += 10
    elif hesitation_ratio < 0.05:
        score += 7
    else:
        score += 3

    if strong_ratio > 0.05:
        score += 5
    elif strong_ratio > 0.02:
        score += 3

    return min(15, score)


def evaluate_transcript(
    transcript: str,
    *,
    keywords: tuple[str, ...] = _DEFAULT_KEYWORDS,
    db: Database | None = None,
    candidate_name: str | None = None,
) -> EvaluationResult:
    """
    Advanced rule-based evaluation with multiple dimensions:
    - Relevance (0-25): How relevant to keywords
    - Completeness (0-20): Response length and structure
    - Clarity (0-20): Communication clarity
    - Confidence (0-15): Confidence indicators
    - Authenticity (0-20): Coming soon with video/audio analysis

    Returns score (0-100) and detailed breakdown.
    """
    if not transcript or not transcript.strip():
        return EvaluationResult(
            score=0,
            category="poor",
            relevance_score=0,
            completeness_score=0,
            clarity_score=0,
            confidence_score=0,
            authenticity_score=0,
        )

    # Calculate individual scores
    relevance = _analyze_relevance(transcript, keywords)
    completeness = _analyze_completeness(transcript)
    clarity = _analyze_clarity(transcript)
    confidence = _analyze_confidence(transcript)
    authenticity = 12  # TODO: will come from video/audio analysis

    # Total score (0-100)
    total_score = relevance + completeness + clarity + confidence + authenticity
    score = max(0, min(100, total_score))

    # Determine category based on score
    if score < 35:
        category = "low-confidence"
    elif score < 60:
        category = "training-needed"
    elif score < 80:
        category = "job-ready"
    else:
        category = "excellent"

    details = {
        "total_words": _word_count(transcript),
        "keyword_hits": _keyword_hits(transcript, keywords),
        "sentence_count": len(re.split(r'[.!?]+', transcript.strip())),
        "analysis_timestamp": __import__("datetime").datetime.now(
            __import__("datetime").timezone.utc
        ).isoformat(),
    }

    return EvaluationResult(
        score=score,
        category=category,
        relevance_score=relevance,
        completeness_score=completeness,
        clarity_score=clarity,
        confidence_score=confidence,
        authenticity_score=authenticity,
        details=details,
    )

