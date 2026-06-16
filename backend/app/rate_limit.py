from slowapi import Limiter

from app.config import settings
from app.utils.client_ip import get_client_ip

_storage = settings.REDIS_URL or "memory://"
limiter = Limiter(key_func=get_client_ip, storage_uri=_storage)
