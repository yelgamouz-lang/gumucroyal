import json
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env", ".env.local"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    APP_ENV: str = "development"
    API_SECRET_KEY: str = "dev-secret-key"

    DATABASE_URL: str = "sqlite:///./gumucroyal.db"

    CORS_ORIGINS: str = '["https://gumucroyal.store"]'  # JSON array or comma-separated; production only

    ADMIN_USERNAME: str = ""
    ADMIN_PASSWORD: str = ""

    GOOGLE_SHEETS_WEBHOOK_URL: str = ""
    GOOGLE_SHEETS_WEBHOOK_SECRET: str = ""

    META_PIXEL_ID: str = ""
    META_CAPI_ACCESS_TOKEN: str = ""

    TIKTOK_PIXEL_ID: str = ""
    TIKTOK_ACCESS_TOKEN: str = ""

    SNAP_PIXEL_ID: str = ""
    SNAP_CAPI_ACCESS_TOKEN: str = ""

    UPSELL_PRICE_MAD: float = 69.0
    ADD_PIECE_PRICE_MAD: float = 69.0

    @property
    def cors_origins_list(self) -> list[str]:
        try:
            return json.loads(self.CORS_ORIGINS)
        except json.JSONDecodeError:
            return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    @property
    def is_sqlite(self) -> bool:
        return self.DATABASE_URL.startswith("sqlite")


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
