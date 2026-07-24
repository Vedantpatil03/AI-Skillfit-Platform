import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.candidates import router as candidates_router
from app.routes.health import router as health_router
from app.routes.interviews import router as interviews_router
from app.routes.process_interview import router as process_interview_router
from app.routes.transcribe import router as transcribe_router
from app.routes.uploads import router as uploads_router
from app.routes.languages import router as languages_router
from app.routes.dashboard import router as dashboard_router

load_dotenv()


def _cors_origins() -> list[str]:
    raw = os.getenv("CORS_ORIGINS", "*").strip()
    if not raw or raw == "*":
        return ["*"]
    return [o.strip() for o in raw.split(",") if o.strip()]


app = FastAPI(title="AI Video Interview API", version="0.2.0")

origins = _cors_origins()
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=(origins != ["*"]),
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(interviews_router, prefix="/interviews", tags=["interviews"])
app.include_router(uploads_router)
app.include_router(transcribe_router)
app.include_router(candidates_router)
app.include_router(process_interview_router)
app.include_router(languages_router)
app.include_router(dashboard_router)


@app.get("/")
def root() -> dict:
    return {"status": "ok", "message": "AI Video Interview API is running", "version": "0.2.0"}


@app.on_event("startup")
def validate_transcriber_config() -> None:
    """Ensure required env vars for chosen transcriber provider are present at startup.

    This fails fast with a clear error so the server doesn't run into 400s later.
    """
    provider = os.getenv("TRANSCRIBER_PROVIDER", "groq").lower()
    if provider == "groq":
        key = os.getenv("GROQ_API_KEY")
        url = os.getenv("GROQ_API_URL")
        if not key or not key.strip() or not url or not url.strip():
            raise RuntimeError("GROQ_API_KEY and GROQ_API_URL must be set to use Groq")

