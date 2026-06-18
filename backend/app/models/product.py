import uuid
from datetime import datetime

from sqlalchemy import JSON, Boolean, DateTime, Integer, Numeric, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Product(Base):
    __tablename__ = "products"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    slug: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    sku: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    name_fr: Mapped[str] = mapped_column(String(255), nullable=False)
    name_ar: Mapped[str] = mapped_column(String(255), nullable=False)
    description_short: Mapped[str] = mapped_column(Text, nullable=False)
    description_long: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    base_price_mad: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    compare_at_price_mad: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    material: Mapped[str | None] = mapped_column(Text)
    badge: Mapped[str | None] = mapped_column(String(50))
    images: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    benefits: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    cross_sell_slug: Mapped[str | None] = mapped_column(String(100))
    upsell_slug: Mapped[str | None] = mapped_column(String(100))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    offers: Mapped[list["Offer"]] = relationship("Offer", back_populates="product", cascade="all, delete-orphan")
