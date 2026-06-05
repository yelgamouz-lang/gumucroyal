import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, Numeric, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    order_number: Mapped[str] = mapped_column(String(20), unique=True, nullable=False, index=True)
    customer_name: Mapped[str] = mapped_column(String(255), nullable=False)
    customer_phone: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    phone_display: Mapped[str] = mapped_column(String(20), nullable=False)
    subtotal_mad: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    upsell_amount_mad: Mapped[float] = mapped_column(Numeric(10, 2), default=0)
    total_mad: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="pending", index=True)
    upsell_accepted: Mapped[bool] = mapped_column(Boolean, default=False)
    upsell_product_id: Mapped[uuid.UUID | None] = mapped_column(Uuid, ForeignKey("products.id"))
    payment_method: Mapped[str] = mapped_column(String(20), default="COD")
    event_id: Mapped[str | None] = mapped_column(String(100))
    fbp: Mapped[str | None] = mapped_column(String(255))
    fbc: Mapped[str | None] = mapped_column(String(255))
    ttclid: Mapped[str | None] = mapped_column(String(255))
    sc_click_id: Mapped[str | None] = mapped_column(String(255))
    client_ip: Mapped[str | None] = mapped_column(String(45))
    user_agent: Mapped[str | None] = mapped_column(Text)
    source_url: Mapped[str | None] = mapped_column(Text)
    sheet_synced: Mapped[bool] = mapped_column(Boolean, default=False)
    sheet_synced_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    capi_synced: Mapped[bool] = mapped_column(Boolean, default=False)
    capi_synced_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, index=True)
    confirmed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    items: Mapped[list["OrderItem"]] = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    order_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("orders.id", ondelete="CASCADE"), index=True)
    product_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("products.id"))
    offer_id: Mapped[uuid.UUID | None] = mapped_column(Uuid, ForeignKey("offers.id"))
    product_name_ar: Mapped[str] = mapped_column(String(255), nullable=False)
    offer_label_ar: Mapped[str | None] = mapped_column(String(255))
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    unit_price_mad: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    total_price_mad: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    is_upsell: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    order: Mapped["Order"] = relationship("Order", back_populates="items")
