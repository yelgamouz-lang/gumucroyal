import hashlib
import hmac
import time

SHEET_SIGN_FIELDS = (
    "date",
    "order_id",
    "country",
    "name",
    "phone",
    "city",
    "product",
    "sku",
    "quantity",
    "total_price",
    "currency",
)


def sign_sheet_payload(payload: dict, secret: str) -> tuple[int, str]:
    ts = int(time.time())
    parts = [str(ts)] + [str(payload.get(field, "")) for field in SHEET_SIGN_FIELDS]
    message = "|".join(parts)
    signature = hmac.new(secret.encode(), message.encode(), hashlib.sha256).hexdigest()
    return ts, signature
