from slowapi import Limiter

from app.utils.client_ip import get_client_ip

limiter = Limiter(key_func=get_client_ip, storage_uri="memory://")
