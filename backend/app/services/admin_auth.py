import base64
import hashlib
import hmac
import json
import secrets
import time

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.config import settings

_bearer = HTTPBearer(auto_error=False)
TOKEN_TTL_SECONDS = 60 * 60 * 24  # 24 h


def verify_admin_credentials(username: str, password: str) -> bool:
    if not settings.ADMIN_USERNAME or not settings.ADMIN_PASSWORD:
        return False
    return secrets.compare_digest(username, settings.ADMIN_USERNAME) and secrets.compare_digest(
        password, settings.ADMIN_PASSWORD
    )


def _sign(payload: bytes) -> str:
    return hmac.new(settings.API_SECRET_KEY.encode(), payload, hashlib.sha256).hexdigest()


def create_admin_token(username: str) -> str:
    body = {"sub": username, "exp": int(time.time()) + TOKEN_TTL_SECONDS}
    encoded = base64.urlsafe_b64encode(json.dumps(body).encode()).decode()
    return f"{encoded}.{_sign(encoded.encode())}"


def decode_admin_token(token: str) -> str:
    try:
        encoded, signature = token.rsplit(".", 1)
        if not hmac.compare_digest(_sign(encoded.encode()), signature):
            raise ValueError("bad signature")
        body = json.loads(base64.urlsafe_b64decode(encoded.encode()))
        if body.get("exp", 0) < time.time():
            raise ValueError("expired")
        return body["sub"]
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token") from exc


def require_admin(credentials: HTTPAuthorizationCredentials | None = Depends(_bearer)) -> str:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
    return decode_admin_token(credentials.credentials)
