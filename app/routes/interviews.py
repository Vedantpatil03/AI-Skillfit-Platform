from pydantic import BaseModel, Field

from fastapi import APIRouter

from app.database.database import get_db
from app.services.interview_service import create_interview, list_interviews

router = APIRouter(tags=["interviews"])


class InterviewCreateRequest(BaseModel):
    candidate_name: str = Field(min_length=1)
    role: str | None = None
    metadata: dict | None = None


@router.post("")
def create_interview_record(req: InterviewCreateRequest) -> dict:
    db = get_db()
    return create_interview(
        db,
        candidate_name=req.candidate_name.strip(),
        role=req.role.strip() if isinstance(req.role, str) and req.role.strip() else None,
        metadata=req.metadata,
    )


@router.get("")
def fetch_interviews(limit: int = 20) -> list[dict]:
    db = get_db()
    return list_interviews(db, limit=limit)