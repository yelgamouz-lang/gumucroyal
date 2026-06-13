import asyncio
import logging
import sys
import traceback
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.api.router import api_router
from app.config import settings
from app.middleware.security import HTTPSRedirectMiddleware, SecurityHeadersMiddleware
from app.models import AnalyticsEvent  # noqa: F401 — register table for create_all
from app.rate_limit import limiter
from app.startup import run_migrations

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)-5s [%(name)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    force=True,
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Startup runs migrations in a worker thread (sync DB/Alembic code).
    No sys.exit, no swallowed exceptions — failures print full traceback to stderr.
    """
    print("[lifespan] Waiting for application startup — begin", flush=True)
    logger.info("Application startup: running database migrations")

    try:
        await asyncio.to_thread(run_migrations)
    except BaseException as exc:
        print(f"[lifespan] STARTUP FAILED: {type(exc).__name__}: {exc}", flush=True)
        traceback.print_exc(file=sys.stderr)
        logger.critical("Application startup aborted", exc_info=True)
        raise

    print("[lifespan] Application startup complete", flush=True)
    logger.info("Application startup complete")

    yield

    logger.info("Application shutdown")
    print("[lifespan] Application shutdown", flush=True)


app = FastAPI(title="GUMÜÇROYAL API", version="1.0.0", lifespan=lifespan)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(HTTPSRedirectMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "Accept"],
)

app.include_router(api_router, prefix="/api/v1")
