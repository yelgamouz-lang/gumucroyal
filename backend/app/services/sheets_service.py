import logging

import httpx

from app.config import settings

logger = logging.getLogger(__name__)


async def sync_order_to_sheet(order_data: dict) -> bool:
    if not settings.GOOGLE_SHEETS_WEBHOOK_URL:
        logger.warning("Google Sheets webhook URL not configured")
        return False

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(settings.GOOGLE_SHEETS_WEBHOOK_URL, json=order_data)
            if response.status_code >= 400:
                logger.error("Sheet sync failed: %s", response.text)
                return False
            return True
    except Exception as exc:
        logger.error("Sheet sync exception: %s", exc)
        return False
