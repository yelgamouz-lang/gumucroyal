import logging
from typing import Protocol

import httpx

logger = logging.getLogger(__name__)

MOROCCO_CODE = "MA"


class VpnDetector(Protocol):
    """Extension point — implement and call set_vpn_detector() to exclude VPN/proxy IPs."""

    def is_vpn_or_proxy(self, ip: str) -> bool: ...


class NoOpVpnDetector:
    """Default: no VPN filtering until a detector is plugged in."""

    def is_vpn_or_proxy(self, ip: str) -> bool:
        return False


_vpn_detector: VpnDetector = NoOpVpnDetector()


def set_vpn_detector(detector: VpnDetector) -> None:
    global _vpn_detector
    _vpn_detector = detector


async def resolve_country_code(ip: str | None) -> str | None:
    if not ip or ip in ("127.0.0.1", "::1"):
        return None
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            response = await client.get(f"http://ip-api.com/json/{ip}?fields=status,countryCode")
            if response.status_code != 200:
                return None
            data = response.json()
            if data.get("status") == "success":
                return data.get("countryCode")
    except Exception as exc:
        logger.warning("Geo lookup failed for %s: %s", ip, exc)
    return None


def is_countable_morocco_visit(ip: str | None, country_code: str | None) -> bool:
    if country_code != MOROCCO_CODE:
        return False
    if ip and _vpn_detector.is_vpn_or_proxy(ip):
        return False
    return True
