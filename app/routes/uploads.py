from fastapi import APIRouter, UploadFile

from app.services.upload_service import save_upload_video

router = APIRouter()


@router.post("/upload-video", tags=["uploads"])
async def upload_video(file: UploadFile) -> dict:
    path = save_upload_video(file)
    return {"path": path}

