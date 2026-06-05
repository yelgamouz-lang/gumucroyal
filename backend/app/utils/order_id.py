import random
from datetime import datetime

from sqlalchemy.orm import Session

from app.models.order import Order


def generate_order_number(db: Session) -> str:
    date_part = datetime.utcnow().strftime("%Y%m%d")
    for _ in range(10):
        seq = random.randint(1000, 9999)
        order_number = f"GR-{date_part}-{seq:04d}"
        exists = db.query(Order.id).filter(Order.order_number == order_number).first()
        if not exists:
            return order_number
    return f"GR-{date_part}-{random.randint(10000, 99999)}"
