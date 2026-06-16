from fastapi import Request


def get_client_ip(request: Request) -> str:
    """
    Prefer X-Real-IP set by the reverse proxy (EasyPanel/nginx).
    Never trust the leftmost X-Forwarded-For entry — clients can spoof it.
    """
    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        return real_ip.strip()

    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        parts = [p.strip() for p in forwarded.split(",") if p.strip()]
        if parts:
            return parts[-1]

    if request.client:
        return request.client.host
    return "unknown"
