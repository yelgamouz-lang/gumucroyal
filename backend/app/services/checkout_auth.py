import base64
import hashlib
import hmac
import json
import time
from uuid import UUID

from fastapi import HTTPException, Request, status

from app.config import settings

CHECKOUT_TOKEN_HEADER = "X-Checkout-Token"
CHECKOUT_TOKEN_TTL_SECONDS = 60 * 60 * 24  # 24 h — covers checkout + thank-you revisit


def _sign(payload: bytes) -> str:
    return hmac.new(settings.API_SECRET_KEY.encode(), payload, hashlib.sha256).hexdigest()


def create_checkout_token(order_id: UUID) -> str:
    body = {"oid": str(order_id), "exp": int(time.time()) + CHECKOUT_TOKEN_TTL_SECONDS}
    encoded = base64.urlsafe_b64encode(json.dumps(body, separators=(",", ":")).encode()).decode()
    return f"{encoded}.{_sign(encoded.encode())}"


def decode_checkout_token(token: str) -> UUID:
    try:
        encoded, signature = token.rsplit(".", 1)
        if not hmac.compare_digest(_sign(encoded.encode()), signature):
            raise ValueError("bad signature")
        body = json.loads(base64.urlsafe_b64decode(encoded.encode()))
        if body.get("exp", 0) < time.time():
            raise ValueError("expired")
        return UUID(body["oid"])
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired checkout token",
        ) from exc


def extract_checkout_token(request: Request) -> str:
    header = request.headers.get(CHECKOUT_TOKEN_HEADER)
    if header:
        return header.strip()
    auth = request.headers.get("Authorization", "")
    if auth.lower().startswith("bearer "):
        return auth[7:].strip()
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Checkout token required",
    )


def require_checkout_token(request: Request, order_id: UUID) -> UUID:
    token = extract_checkout_token(request)
    verified_id = decode_checkout_token(token)
    if verified_id != order_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Token does not match order")
    return order_id
