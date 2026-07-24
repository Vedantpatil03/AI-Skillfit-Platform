from __future__ import annotations

import os
import shutil
import uuid
from pathlib import Path

from fastapi import HTTPException, UploadFile


def save_upload_video(file: UploadFile) -> str:
    if file is None:
        raise HTTPException(status_code=400, detail="No file provided")

    content_type = (file.content_type or "").lower()
    if not content_type.startswith("video/"):
        raise HTTPException(status_code=400, detail="Only video uploads are allowed")

    upload_dir = Path(os.getenv("UPLOAD_DIR", "uploads")).resolve()
    upload_dir.mkdir(parents=True, exist_ok=True)

    original_name = file.filename or "video"
    suffix = Path(original_name).suffix
    filename = f"{uuid.uuid4().hex}{suffix}"
    dest_path = upload_dir / filename

    try:
        with dest_path.open("wb") as out:
            shutil.copyfileobj(file.file, out)
    except Exception:
        try:
            if dest_path.exists():
                dest_path.unlink()
        finally:
            raise HTTPException(status_code=500, detail="Failed to save uploaded file")

    # Return a relative path by default (portable for clients + DB storage)
    return str(Path(os.getenv("UPLOAD_DIR", "uploads")) / filename)

