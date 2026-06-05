from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
def health():
    return {"status": "ok", "service": "gumucroyal-api", "version": "1.0.0"}
