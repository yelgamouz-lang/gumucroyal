from datetime import datetime, timezone

from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.models.analytics import AnalyticsEvent
from app.models.offer import Offer
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.services.geo_service import is_countable_morocco_visit

ORDER_BUMP_LABEL = "زيادة الطلب"

COMPLETED_STATUSES = frozenset({"completed"})


async def record_event(
    db: Session,
    *,
    event_type: str,
    path: str,
    product_slug: str | None,
    client_ip: str | None,
    country_code: str | None,
    user_agent: str | None,
) -> None:
    counted = is_countable_morocco_visit(client_ip, country_code)
    db.add(
        AnalyticsEvent(
            event_type=event_type,
            path=path,
            product_slug=product_slug,
            client_ip=client_ip,
            country_code=country_code,
            user_agent=user_agent,
            is_counted=counted,
        )
    )
    db.commit()


def _date_bounds(start: datetime | None, end: datetime | None) -> tuple[datetime, datetime]:
    now = datetime.now(timezone.utc)
    end_dt = end or now
    if end_dt.tzinfo is None:
        end_dt = end_dt.replace(tzinfo=timezone.utc)
    start_dt = start or end_dt.replace(hour=0, minute=0, second=0, microsecond=0)
    if start_dt.tzinfo is None:
        start_dt = start_dt.replace(tzinfo=timezone.utc)
    return start_dt, end_dt


def _product_display_name(product: Product | None, item: OrderItem) -> str:
    if product and product.name_fr:
        return product.name_fr.split(" By ")[0].strip()
    return item.product_name_ar


def _item_role_label(item: OrderItem) -> str:
    if item.is_upsell:
        return "2e_piece"
    if item.offer_label_ar == ORDER_BUMP_LABEL:
        return "2e_piece"
    if item.offer_id:
        return "bundle_main"
    return "extra"


def get_dashboard_metrics(db: Session, start: datetime | None, end: datetime | None) -> dict:
    start_dt, end_dt = _date_bounds(start, end)

    visits = (
        db.query(func.count(AnalyticsEvent.id))
        .filter(
            AnalyticsEvent.is_counted.is_(True),
            AnalyticsEvent.event_type == "page_view",
            AnalyticsEvent.created_at >= start_dt,
            AnalyticsEvent.created_at <= end_dt,
        )
        .scalar()
        or 0
    )
    clicks = (
        db.query(func.count(AnalyticsEvent.id))
        .filter(
            AnalyticsEvent.is_counted.is_(True),
            AnalyticsEvent.event_type == "click",
            AnalyticsEvent.created_at >= start_dt,
            AnalyticsEvent.created_at <= end_dt,
        )
        .scalar()
        or 0
    )

    orders = (
        db.query(Order)
        .options(joinedload(Order.items))
        .filter(Order.created_at >= start_dt, Order.created_at <= end_dt)
        .all()
    )

    completed_orders = [o for o in orders if o.status in COMPLETED_STATUSES]
    order_count = len(completed_orders)
    total_revenue = sum(float(o.total_mad) for o in completed_orders)
    aov = total_revenue / order_count if order_count else 0.0
    conversion = (order_count / visits * 100) if visits else 0.0

    by_status: dict[str, int] = {}
    units_by_product: dict[str, int] = {}
    revenue_by_product: dict[str, float] = {}
    by_offer_tier: dict[str, int] = {}

    product_ids = {item.product_id for o in orders for item in o.items if item.product_id}
    products_by_id = {
        p.id: p
        for p in db.query(Product).filter(Product.id.in_(product_ids)).all()
    } if product_ids else {}

    offer_ids = {item.offer_id for o in orders for item in o.items if item.offer_id}
    offers_by_id = {
        o.id: o
        for o in db.query(Offer).filter(Offer.id.in_(offer_ids)).all()
    } if offer_ids else {}

    for order in orders:
        by_status[order.status] = by_status.get(order.status, 0) + 1

        for item in order.items:
            product = products_by_id.get(item.product_id)
            name = _product_display_name(product, item)
            qty = int(item.quantity)
            line_total = float(item.total_price_mad)

            units_by_product[name] = units_by_product.get(name, 0) + qty
            revenue_by_product[name] = revenue_by_product.get(name, 0.0) + line_total

            role = _item_role_label(item)
            if role == "2e_piece":
                by_offer_tier["2e_piece_69"] = by_offer_tier.get("2e_piece_69", 0) + 1
            elif item.offer_id:
                offer = offers_by_id.get(item.offer_id)
                if offer:
                    tier_key = f"{offer.quantity}_piece"
                    by_offer_tier[tier_key] = by_offer_tier.get(tier_key, 0) + 1

    return {
        "period": {"start": start_dt.isoformat(), "end": end_dt.isoformat()},
        "visits": visits,
        "clicks": clicks,
        "orders": order_count,
        "orders_created": len(orders),
        "conversion_rate_pct": round(conversion, 2),
        "average_order_value_mad": round(aov, 2),
        "total_revenue_mad": round(total_revenue, 2),
        "orders_by_status": by_status,
        "units_by_product": units_by_product,
        "revenue_by_product": revenue_by_product,
        "orders_by_offer_quantity": by_offer_tier,
    }


def list_orders(db: Session, start: datetime | None, end: datetime | None, limit: int = 500) -> list[Order]:
    start_dt, end_dt = _date_bounds(start, end)
    return (
        db.query(Order)
        .options(joinedload(Order.items))
        .filter(Order.created_at >= start_dt, Order.created_at <= end_dt)
        .order_by(Order.created_at.desc())
        .limit(limit)
        .all()
    )


def serialize_order(order: Order, db: Session | None = None) -> dict:
    product_ids = [i.product_id for i in order.items if i.product_id]
    products_by_id: dict = {}
    offers_by_id: dict = {}

    if db and product_ids:
        products_by_id = {p.id: p for p in db.query(Product).filter(Product.id.in_(product_ids)).all()}
        offer_ids = [i.offer_id for i in order.items if i.offer_id]
        if offer_ids:
            offers_by_id = {o.id: o for o in db.query(Offer).filter(Offer.id.in_(offer_ids)).all()}

    items_out = []
    for item in order.items:
        product = products_by_id.get(item.product_id)
        offer = offers_by_id.get(item.offer_id) if item.offer_id else None
        role = _item_role_label(item)
        if role == "2e_piece":
            offer_tier = "2e_piece_69"
        elif offer:
            offer_tier = f"{offer.quantity}_piece"
        else:
            offer_tier = None

        items_out.append(
            {
                "product_name": _product_display_name(product, item),
                "product_name_ar": item.product_name_ar,
                "sku": product.sku if product else None,
                "offer_label": item.offer_label_ar,
                "offer_tier": offer_tier,
                "quantity": item.quantity,
                "unit_price_mad": float(item.unit_price_mad),
                "total_price_mad": float(item.total_price_mad),
                "is_upsell": item.is_upsell,
                "line_type": role,
            }
        )

    products_summary = " / ".join(i["product_name"] for i in items_out)

    return {
        "id": str(order.id),
        "order_number": order.order_number,
        "status": order.status,
        "customer_name": order.customer_name,
        "customer_phone": order.phone_display,
        "customer_city": order.customer_city or "",
        "products_summary": products_summary,
        "subtotal_mad": float(order.subtotal_mad),
        "upsell_amount_mad": float(order.upsell_amount_mad),
        "total_mad": float(order.total_mad),
        "payment_method": order.payment_method,
        "upsell_accepted": order.upsell_accepted,
        "created_at": order.created_at.isoformat() if order.created_at else None,
        "confirmed_at": order.confirmed_at.isoformat() if order.confirmed_at else None,
        "sheet_synced": order.sheet_synced,
        "capi_synced": order.capi_synced,
        "items": items_out,
    }
