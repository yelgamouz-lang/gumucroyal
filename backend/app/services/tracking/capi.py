import logging
from datetime import datetime, timezone

import httpx

from app.config import settings
from app.models.order import Order
from app.services.tracking.hashing import hash_phone_e164, split_name_hashes

logger = logging.getLogger(__name__)


async def send_meta_purchase(order: Order, content_ids: list[str]) -> bool:
    if not settings.META_PIXEL_ID or not settings.META_CAPI_ACCESS_TOKEN:
        return False

    fn_hash, ln_hash = split_name_hashes(order.customer_name)
    user_data: dict = {
        "ph": [hash_phone_e164(order.customer_phone)],
        "fn": [fn_hash],
        "country": [hashlib_country("ma")],
    }
    if ln_hash:
        user_data["ln"] = [ln_hash]
    if order.fbp:
        user_data["fbp"] = order.fbp
    if order.fbc:
        user_data["fbc"] = order.fbc
    if order.client_ip:
        user_data["client_ip_address"] = order.client_ip
    if order.user_agent:
        user_data["client_user_agent"] = order.user_agent

    payload = {
        "data": [
            {
                "event_name": "Purchase",
                "event_time": int(datetime.now(timezone.utc).timestamp()),
                "event_id": order.event_id,
                "action_source": "website",
                "event_source_url": order.source_url or "https://gumucroyal.store",
                "user_data": user_data,
                "custom_data": {
                    "currency": "MAD",
                    "value": float(order.total_mad),
                    "content_ids": content_ids,
                    "content_type": "product",
                    "order_id": order.order_number,
                },
            }
        ]
    }

    url = f"https://graph.facebook.com/v21.0/{settings.META_PIXEL_ID}/events"
    params = {"access_token": settings.META_CAPI_ACCESS_TOKEN}

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(url, params=params, json=payload)
            if resp.status_code >= 400:
                logger.error("Meta CAPI error: %s", resp.text)
                return False
            return True
    except Exception as exc:
        logger.error("Meta CAPI exception: %s", exc)
        return False


def hashlib_country(code: str) -> str:
    import hashlib

    return hashlib.sha256(code.strip().lower().encode("utf-8")).hexdigest()


async def send_tiktok_purchase(order: Order, content_ids: list[str]) -> bool:
    if not settings.TIKTOK_PIXEL_ID or not settings.TIKTOK_ACCESS_TOKEN:
        return False

    event = {
        "event": "CompletePayment",
        "event_time": int(datetime.now(timezone.utc).timestamp()),
        "event_id": order.event_id,
        "user": {
            "phone": hash_phone_e164(order.customer_phone),
        },
        "page": {
            "url": order.source_url or "https://gumucroyal.store",
        },
        "properties": {
            "currency": "MAD",
            "value": float(order.total_mad),
            "contents": [{"content_id": cid, "content_type": "product"} for cid in content_ids],
        },
    }
    if order.ttclid:
        event["user"]["ttclid"] = order.ttclid
    if order.client_ip:
        event["user"]["ip"] = order.client_ip
    if order.user_agent:
        event["user"]["user_agent"] = order.user_agent

    payload = {
        "event_source": "web",
        "event_source_id": settings.TIKTOK_PIXEL_ID,
        "data": [event],
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                "https://business-api.tiktok.com/open_api/v1.3/event/track/",
                json=payload,
                headers={"Access-Token": settings.TIKTOK_ACCESS_TOKEN, "Content-Type": "application/json"},
            )
            if resp.status_code >= 400:
                logger.error("TikTok CAPI error: %s", resp.text)
                return False
            return True
    except Exception as exc:
        logger.error("TikTok CAPI exception: %s", exc)
        return False


async def send_snap_purchase(order: Order, content_ids: list[str]) -> bool:
    if not settings.SNAP_PIXEL_ID or not settings.SNAP_CAPI_ACCESS_TOKEN:
        return False

    payload = {
        "pixel_id": settings.SNAP_PIXEL_ID,
        "timestamp": str(int(datetime.now(timezone.utc).timestamp() * 1000)),
        "event_type": "PURCHASE",
        "event_conversion_type": "WEB",
        "event_id": order.event_id,
        "page_url": order.source_url or "https://gumucroyal.store",
        "user_agent": order.user_agent or "",
        "hashed_phone_number": hash_phone_e164(order.customer_phone),
        "client_dedup_id": order.event_id,
        "transaction_id": order.order_number,
        "price": str(float(order.total_mad)),
        "currency": "MAD",
        "item_ids": content_ids,
        "number_items": str(len(order.items)),
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                "https://tr.snapchat.com/v2/conversion",
                json=payload,
                headers={"Authorization": f"Bearer {settings.SNAP_CAPI_ACCESS_TOKEN}", "Content-Type": "application/json"},
            )
            if resp.status_code >= 400:
                logger.error("Snap CAPI error: %s", resp.text)
                return False
            return True
    except Exception as exc:
        logger.error("Snap CAPI exception: %s", exc)
        return False


async def fire_all_capi(order: Order, content_ids: list[str]) -> bool:
    import asyncio

    results = await asyncio.gather(
        send_meta_purchase(order, content_ids),
        send_tiktok_purchase(order, content_ids),
        send_snap_purchase(order, content_ids),
        return_exceptions=True,
    )
    return any(r is True for r in results if isinstance(r, bool))
