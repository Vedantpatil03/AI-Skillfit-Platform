from pydantic import BaseModel

from fastapi import APIRouter, HTTPException

from app.services.ai import TranscriptionError, transcribe_video_path

router = APIRouter()


class TranscribeRequest(BaseModel):
    path: str


@router.post("/transcribe", tags=["transcription"])
def transcribe(req: TranscribeRequest) -> dict:
    try:
        text = transcribe_video_path(req.path)
    except TranscriptionError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=500, detail="Transcription failed") from e
    return {"text": text}

