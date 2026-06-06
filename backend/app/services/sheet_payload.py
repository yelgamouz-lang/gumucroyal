from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models.order import Order, OrderItem
from app.models.product import Product


def _format_sheet_date(dt: datetime | None) -> str:
    if not dt:
        dt = datetime.now(timezone.utc)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc).strftime("%d/%m/%Y")


def _line_items_for_sheet(db: Session, items: list[OrderItem]) -> tuple[list[str], list[str], list[str]]:
    """Return parallel lists: product names (FR), SKUs, quantities."""
    names: list[str] = []
    skus: list[str] = []
    quantities: list[str] = []

    for item in items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        name_fr = product.name_fr if product else item.product_name_ar
        sku = product.sku if product else "UNKNOWN"
        names.append(name_fr.split(" By ")[0].strip())
        skus.append(sku)
        quantities.append(str(item.quantity))

    return names, skus, quantities


def build_sheet_row(db: Session, order: Order) -> dict:
    names, skus, quantities = _line_items_for_sheet(db, order.items)
    phone = order.customer_phone
    if phone.startswith("+"):
        phone = phone[1:]

    return {
        "date": _format_sheet_date(order.confirmed_at or order.created_at),
        "order_id": order.order_number,
        "country": "Maroc",
        "name": order.customer_name,
        "phone": phone,
        "product": "/".join(names) if names else "",
        "sku": "/".join(skus) if skus else "",
        "quantity": "/".join(quantities) if quantities else "",
        "total_price": float(order.total_mad),
        "currency": "MAD",
        "status": "",
    }
