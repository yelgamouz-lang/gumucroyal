import random
import secrets
from datetime import datetime

from sqlalchemy.orm import Session

from app.models.order import Order


def generate_order_number(db: Session) -> str:
    """Public order id — prefix gumuc + date + random suffix."""
    date_part = datetime.utcnow().strftime("%d%m%Y")
    for _ in range(12):
        suffix = secrets.token_hex(8)
        order_number = f"gumuc{date_part}-{suffix}"
        exists = db.query(Order.id).filter(Order.order_number == order_number).first()
        if not exists:
            return order_number
    return f"gumuc{date_part}-{random.randint(100000, 999999)}"
