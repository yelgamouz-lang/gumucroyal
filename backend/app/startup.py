"""Application startup — DB migrations and catalog sync with explicit logging."""

from __future__ import annotations

import logging
import os
import subprocess
import sys
import traceback
from pathlib import Path

from app.bootstrap import init_sqlite_db, sync_product_prices_from_catalog
from app.config import settings
from app.database import SessionLocal
from app.product_catalog import CATALOG_PATH

logger = logging.getLogger(__name__)
BACKEND_ROOT = Path(__file__).resolve().parent.parent


def _checkpoint(message: str) -> None:
    """Unmissable stdout marker — survives Alembic fileConfig hijacking logging."""
    line = f"[gumuc-startup] {message}"
    print(line, flush=True)
    logger.info(message)


def _log_fatal(message: str, exc: BaseException | None = None) -> None:
    _checkpoint(f"FATAL: {message}")
    logger.critical(message)
    if exc is not None:
        traceback.print_exception(type(exc), exc, exc.__traceback__)


def run_alembic_upgrade() -> None:
    """
    Run Alembic in a subprocess so env.py fileConfig cannot break uvicorn logging
    or exit the parent process silently.
    """
    _checkpoint("Alembic upgrade head — starting (subprocess)")
    env = os.environ.copy()
    env.setdefault("DATABASE_URL", settings.DATABASE_URL)

    proc = subprocess.run(
        [sys.executable, "-m", "alembic", "upgrade", "head"],
        cwd=str(BACKEND_ROOT),
        env=env,
        capture_output=True,
        text=True,
    )

    if proc.stdout.strip():
        print(f"[gumuc-startup] alembic stdout:\n{proc.stdout}", flush=True)
    if proc.stderr.strip():
        print(f"[gumuc-startup] alembic stderr:\n{proc.stderr}", flush=True)

    if proc.returncode != 0:
        msg = f"Alembic exited with code {proc.returncode}"
        _log_fatal(msg)
        raise RuntimeError(msg)

    _checkpoint("Alembic upgrade head — completed")


def run_catalog_sync() -> None:
    """Sync prices from CSV — never aborts startup (warn only)."""
    if not CATALOG_PATH.is_file():
        _checkpoint(f"Catalog CSV missing at {CATALOG_PATH} — skipping sync")
        return

    _checkpoint(f"Catalog sync — starting ({CATALOG_PATH})")
    db = SessionLocal()
    try:
        sync_product_prices_from_catalog(db)
    except Exception as exc:
        _log_fatal(f"Catalog sync failed (non-fatal): {type(exc).__name__}: {exc}", exc)
        return
    finally:
        db.close()

    _checkpoint("Catalog sync — completed")


def run_migrations() -> None:
    """Blocking startup work — called from lifespan via asyncio.to_thread."""
    _checkpoint(f"run_migrations — begin (sqlite={settings.is_sqlite})")

    if settings.is_sqlite:
        init_sqlite_db()
        _checkpoint("run_migrations — SQLite init done")
        return

    run_alembic_upgrade()
    run_catalog_sync()
    _checkpoint("run_migrations — all steps done")
