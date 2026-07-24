"""
Language configuration and selection endpoints.
"""

from fastapi import APIRouter

from app.config import LANGUAGES

router = APIRouter(prefix="/languages", tags=["languages"])


@router.get("")
def get_supported_languages() -> list[dict]:
    """Get list of supported languages."""
    return [
        {
            "code": code,
            "name": config["name"],
            "greetings": config["greetings"],
        }
        for code, config in LANGUAGES.items()
    ]


@router.get("/{lang_code}")
def get_language_config(lang_code: str) -> dict:
    """Get configuration for a specific language."""
    if lang_code not in LANGUAGES:
        return {"error": f"Language {lang_code} not supported"}

    config = LANGUAGES[lang_code]
    return {
        "code": config["code"],
        "name": config["name"],
        "greetings": config["greetings"],
        "instructions": config["instructions"],
        "sample_questions": config["sample_questions"],
    }
