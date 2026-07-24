from __future__ import annotations

import os
import subprocess
import tempfile
import shutil
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# 🔧 Ensure FFmpeg path (important for Windows)
os.environ["PATH"] += os.pathsep + "C:\\ffmpeg\\bin"

# 🎤 Load Whisper model
import whisper
whisper_model = whisper.load_model("base")


class TranscriptionError(RuntimeError):
    pass


_WHISPER_LANGUAGE_MAP = {
    "en": "english",
    "hi": "hindi",
    "kn": "kannada",
    "mr": "marathi",
}


# -------------------------------
# FILE HANDLING
# -------------------------------
def _resolve_video_path(video_path: str) -> Path:
    p = Path(video_path)
    if not p.exists():
        raise TranscriptionError(f"Video file not found: {p}")
    return p


def extract_audio_with_ffmpeg(video_path: str) -> Path:
    src = _resolve_video_path(video_path)

    tmp_dir = Path(tempfile.mkdtemp(prefix="transcribe-"))
    out_path = tmp_dir / "audio.wav"

    cmd = [
        "ffmpeg",
        "-y",
        "-i",
        str(src),
        "-vn",
        "-ac",
        "1",
        "-ar",
        "16000",
        str(out_path),
    ]

    try:
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode != 0:
            raise TranscriptionError(result.stderr)
    except FileNotFoundError:
        raise TranscriptionError("FFmpeg not found. Install it and add to PATH.")

    return out_path


# -------------------------------
# WHISPER TRANSCRIPTION (MAIN)
# -------------------------------
def transcribe_audio_whisper(audio_path: str | Path, language_hint: str | None = None) -> str:
    try:
        options: dict[str, object] = {
            "fp16": False,
            "temperature": 0,
            "condition_on_previous_text": False,
        }

        lang = _WHISPER_LANGUAGE_MAP.get((language_hint or "").lower())
        if lang:
            options["language"] = lang

        result = whisper_model.transcribe(str(audio_path), **options)
        text = str(result.get("text", "") or "")

        # Retry once without language forcing when first pass is empty.
        if not text.strip() and "language" in options:
            options.pop("language", None)
            result = whisper_model.transcribe(str(audio_path), **options)
            text = str(result.get("text", "") or "")

        return text
    except Exception as e:
        raise TranscriptionError(f"Whisper failed: {e}")


# -------------------------------
# GROQ EVALUATION (OPTIONAL)
# -------------------------------
def evaluate_with_groq(transcript: str):
    import requests

    api_key = os.getenv("GROQ_API_KEY")

    if not api_key:
        return {
            "score": 50,
            "category": "Training",
            "reason": "Groq API key missing"
        }

    url = "https://api.groq.com/openai/v1/chat/completions"

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    prompt = f"""
    Evaluate this interview response:

    "{transcript}"

    Return JSON:
    {{
      "score": number (0-100),
      "category": "Job-ready" or "Training" or "Low-confidence",
      "reason": "short explanation"
    }}
    """

    data = {
        "model": "llama3-8b-8192",
        "messages": [
            {"role": "user", "content": prompt}
        ]
    }

    try:
        response = requests.post(url, headers=headers, json=data)
        result = response.json()
        text = result["choices"][0]["message"]["content"]

        return text  # You can parse JSON later if needed

    except Exception as e:
        return {
            "score": 50,
            "category": "Training",
            "reason": f"Groq failed: {e}"
        }


# -------------------------------
# MAIN PIPELINE
# -------------------------------
def transcribe_video_path(video_path: str, language_hint: str | None = None) -> str:
    audio_file = None
    try:
        audio_file = extract_audio_with_ffmpeg(video_path)

        provider = os.getenv("TRANSCRIBER_PROVIDER", "whisper").lower()

        if provider == "whisper":
            text = transcribe_audio_whisper(audio_file, language_hint=language_hint)

            # Some browser recordings can decode better when Whisper reads container directly.
            if not (text or "").strip():
                text = transcribe_audio_whisper(video_path, language_hint=language_hint)

            return text
        else:
            raise TranscriptionError("Only Whisper is supported for transcription")

    finally:
        if audio_file:
            shutil.rmtree(audio_file.parent, ignore_errors=True)