import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class AnalyticsEvent(Base):
    __tablename__ = "analytics_events"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    event_type: Mapped[str] = mapped_column(String(30), nullable=False, index=True)
    path: Mapped[str] = mapped_column(String(500), nullable=False)
    product_slug: Mapped[str | None] = mapped_column(String(120), index=True)
    client_ip: Mapped[str | None] = mapped_column(String(45))
    country_code: Mapped[str | None] = mapped_column(String(2), index=True)
    user_agent: Mapped[str | None] = mapped_column(Text)
    is_counted: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, index=True)
