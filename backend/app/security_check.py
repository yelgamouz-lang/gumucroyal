"""Fail fast when production is misconfigured."""

from app.config import settings

_WEAK_API_KEYS = frozenset(
    {
        "",
        "dev-secret-key",
        "change-me-to-random-64-char-string",
        "change-me",
    }
)


def validate_production_settings() -> None:
    if settings.APP_ENV.lower() != "production":
        return

    errors: list[str] = []

    if settings.API_SECRET_KEY in _WEAK_API_KEYS or len(settings.API_SECRET_KEY) < 32:
        errors.append("API_SECRET_KEY must be a random string of at least 32 characters")

    if not settings.ADMIN_USERNAME or not settings.ADMIN_PASSWORD:
        errors.append("ADMIN_USERNAME and ADMIN_PASSWORD are required")
    elif len(settings.ADMIN_PASSWORD) < 12:
        errors.append("ADMIN_PASSWORD must be at least 12 characters")

    if settings.is_sqlite:
        errors.append("DATABASE_URL must use PostgreSQL in production (SQLite is dev-only)")

    if settings.GOOGLE_SHEETS_WEBHOOK_URL and not settings.GOOGLE_SHEETS_WEBHOOK_SECRET:
        errors.append("GOOGLE_SHEETS_WEBHOOK_SECRET is required when GOOGLE_SHEETS_WEBHOOK_URL is set")

    if errors:
        raise RuntimeError("Production security validation failed: " + "; ".join(errors))
