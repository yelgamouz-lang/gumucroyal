from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.database import get_db
from app.rate_limit import limiter
from app.schemas.admin import AnalyticsEventIn
from app.services.analytics_service import record_event
from app.services.geo_service import resolve_country_code

router = APIRouter(prefix="/analytics")


def _client_ip(request: Request) -> str | None:
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    if request.client:
        return request.client.host
    return None


@router.post("/events", status_code=204)
@limiter.limit("120/minute")
async def post_analytics_event(payload: AnalyticsEventIn, request: Request, db: Session = Depends(get_db)):
    ip = _client_ip(request)
    country = await resolve_country_code(ip)
    await record_event(
        db,
        event_type=payload.event_type,
        path=payload.path,
        product_slug=payload.product_slug,
        client_ip=ip,
        country_code=country,
        user_agent=request.headers.get("User-Agent"),
    )
