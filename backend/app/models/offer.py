import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, Numeric, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Offer(Base):
    __tablename__ = "offers"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    product_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("products.id", ondelete="CASCADE"), index=True)
    slug: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    label_ar: Mapped[str] = mapped_column(String(255), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    price_mad: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    compare_at_price_mad: Mapped[float | None] = mapped_column(Numeric(10, 2))
    savings_mad: Mapped[float | None] = mapped_column(Numeric(10, 2))
    is_default: Mapped[bool] = mapped_column(Boolean, default=False)
    badge_ar: Mapped[str | None] = mapped_column(String(100))
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    product: Mapped["Product"] = relationship("Product", back_populates="offers")
