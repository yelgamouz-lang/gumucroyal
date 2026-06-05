from datetime import datetime, timezone
from uuid import UUID

from fastapi import HTTPException, Request
from sqlalchemy.orm import Session, joinedload

from app.config import settings
from app.models.offer import Offer
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.services.phone_service import format_display_phone, normalize_morocco_phone
from app.services.sheets_service import sync_order_to_sheet
from app.services.tracking.capi import fire_all_capi
from app.utils.order_id import generate_order_number


UPSELL_MAP = {
    "bague-lien-eternel": "collier-trefle-lumiere",
    "collier-trefle-lumiere": "bague-lien-eternel",
    "bague-double-signature": "collier-trefle-lumiere",
}

ORDER_BUMP_LABEL = "زيادة الطلب"


def _resolve_bump_product(db: Session, cart_product_slugs: list[str]) -> Product | None:
    main_slug = cart_product_slugs[0] if cart_product_slugs else None
    bump_slug = UPSELL_MAP.get(main_slug or "", "collier-trefle-lumiere")
    if bump_slug in cart_product_slugs:
        for p in db.query(Product).filter(Product.is_active.is_(True)).all():
            if p.slug not in cart_product_slugs:
                return p
        return None
    return db.query(Product).filter(Product.slug == bump_slug, Product.is_active.is_(True)).first()


def _get_client_ip(request: Request) -> str | None:
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    if request.client:
        return request.client.host
    return None


def _build_products_summary(items: list[OrderItem]) -> str:
    parts = []
    for item in items:
        if item.is_upsell:
            parts.append(f"{item.product_name_ar} (upsell)")
        elif item.offer_label_ar == ORDER_BUMP_LABEL:
            parts.append(f"{item.product_name_ar} (order bump)")
        else:
            label = f" ({item.offer_label_ar})" if item.offer_label_ar else ""
            parts.append(f"{item.product_name_ar} x{item.quantity}{label}")
    return " | ".join(parts)


def _resolve_upsell_product(db: Session, cart_product_slugs: list[str]) -> Product | None:
    main_slug = cart_product_slugs[0] if cart_product_slugs else None
    upsell_slug = UPSELL_MAP.get(main_slug or "", "collier-trefle-lumiere")
    if upsell_slug in cart_product_slugs:
        for slug, target in UPSELL_MAP.items():
            if target not in cart_product_slugs:
                upsell_slug = target
                break
        else:
            for p in db.query(Product).filter(Product.is_active.is_(True)).all():
                if p.slug not in cart_product_slugs:
                    return p
            return None
    return db.query(Product).filter(Product.slug == upsell_slug, Product.is_active.is_(True)).first()


def calculate_subtotal(db: Session, items: list[dict]) -> tuple[float, list[dict]]:
    resolved = []
    subtotal = 0.0
    for item in items:
        product = db.query(Product).filter(Product.id == item["product_id"]).first()
        offer = db.query(Offer).filter(Offer.id == item["offer_id"]).first()
        if not product or not offer:
            raise HTTPException(status_code=422, detail="منتج أو عرض غير صالح")
        line_total = float(offer.price_mad)
        subtotal += line_total
        resolved.append(
            {
                "product": product,
                "offer": offer,
                "quantity": offer.quantity,
                "line_total": line_total,
            }
        )
    return subtotal, resolved


async def create_order(db: Session, request: Request, data: dict) -> Order:
    normalized = normalize_morocco_phone(data["customer_phone"])
    if not normalized:
        raise HTTPException(status_code=422, detail="رقم الهاتف غير صالح. استعملي 06 أو 07.")

    name = data["customer_name"].strip()
    if len(name) < 2:
        raise HTTPException(status_code=422, detail="الاسم مطلوب")

    subtotal, resolved = calculate_subtotal(db, data["items"])
    tracking = data.get("tracking") or {}

    order = Order(
        order_number=generate_order_number(db),
        customer_name=name,
        customer_phone=normalized,
        phone_display=format_display_phone(normalized),
        subtotal_mad=subtotal,
        upsell_amount_mad=0,
        total_mad=subtotal,
        status="upsell_offered",
        event_id=tracking.get("event_id"),
        fbp=tracking.get("fbp"),
        fbc=tracking.get("fbc"),
        ttclid=tracking.get("ttclid"),
        sc_click_id=tracking.get("sc_click_id"),
        client_ip=_get_client_ip(request),
        user_agent=tracking.get("user_agent") or request.headers.get("User-Agent"),
        source_url=tracking.get("source_url"),
    )
    db.add(order)
    db.flush()

    cart_slugs = []
    for row in resolved:
        product = row["product"]
        offer = row["offer"]
        cart_slugs.append(product.slug)
        db.add(
            OrderItem(
                order_id=order.id,
                product_id=product.id,
                offer_id=offer.id,
                product_name_ar=product.name_ar,
                offer_label_ar=offer.label_ar,
                quantity=offer.quantity,
                unit_price_mad=float(offer.price_mad) / offer.quantity,
                total_price_mad=float(offer.price_mad),
                is_upsell=False,
            )
        )

    if data.get("order_bump_accepted"):
        bump_product = _resolve_bump_product(db, cart_slugs)
        if bump_product:
            bump_price = float(settings.UPSELL_PRICE_MAD)
            subtotal += bump_price
            order.subtotal_mad = subtotal
            order.total_mad = subtotal
            cart_slugs.append(bump_product.slug)
            db.add(
                OrderItem(
                    order_id=order.id,
                    product_id=bump_product.id,
                    product_name_ar=bump_product.name_ar,
                    offer_label_ar=ORDER_BUMP_LABEL,
                    quantity=1,
                    unit_price_mad=bump_price,
                    total_price_mad=bump_price,
                    is_upsell=False,
                )
            )

    upsell_product = _resolve_upsell_product(db, cart_slugs)
    if upsell_product:
        order.upsell_product_id = upsell_product.id

    db.commit()
    db.refresh(order)
    return order


def get_upsell_info(db: Session, order: Order) -> dict | None:
    if not order.upsell_product_id:
        return None
    product = db.query(Product).filter(Product.id == order.upsell_product_id).first()
    if not product:
        return None
    image_url = product.images[0]["url"] if product.images else ""
    return {
        "id": str(product.id),
        "slug": product.slug,
        "name_ar": product.name_ar,
        "image_url": image_url,
        "original_price_mad": float(product.base_price_mad),
        "upsell_price_mad": float(settings.UPSELL_PRICE_MAD),
    }


async def update_upsell(db: Session, order_id: UUID, accepted: bool) -> Order:
    order = db.query(Order).options(joinedload(Order.items)).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.status == "completed":
        raise HTTPException(status_code=409, detail="Order already confirmed")

    order.upsell_accepted = accepted
    if accepted and order.upsell_product_id:
        product = db.query(Product).filter(Product.id == order.upsell_product_id).first()
        if product:
            upsell_price = float(settings.UPSELL_PRICE_MAD)
            order.upsell_amount_mad = upsell_price
            order.total_mad = float(order.subtotal_mad) + upsell_price
            db.add(
                OrderItem(
                    order_id=order.id,
                    product_id=product.id,
                    product_name_ar=product.name_ar,
                    offer_label_ar="عرض خاص",
                    quantity=1,
                    unit_price_mad=upsell_price,
                    total_price_mad=upsell_price,
                    is_upsell=True,
                )
            )
    else:
        order.upsell_amount_mad = 0
        order.total_mad = float(order.subtotal_mad)

    db.commit()
    db.refresh(order)
    return order


async def confirm_order(db: Session, order_id: UUID, upsell_accepted: bool | None = None) -> Order:
    order = db.query(Order).options(joinedload(Order.items)).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.status == "completed":
        return order

    if upsell_accepted is not None:
        await update_upsell(db, order_id, upsell_accepted)
        order = db.query(Order).options(joinedload(Order.items)).filter(Order.id == order_id).first()

    order.status = "completed"
    order.confirmed_at = datetime.now(timezone.utc)

    product_ids = []
    for item in order.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if product:
            product_ids.append(product.sku)

    sheet_data = {
        "order_number": order.order_number,
        "created_at": order.created_at.isoformat() if order.created_at else datetime.now(timezone.utc).isoformat(),
        "customer_name": order.customer_name,
        "customer_phone": order.phone_display,
        "customer_phone_normalized": order.customer_phone,
        "products": _build_products_summary(order.items),
        "items_count": sum(i.quantity for i in order.items if not i.is_upsell),
        "subtotal_mad": float(order.subtotal_mad),
        "upsell_accepted": order.upsell_accepted,
        "upsell_product": next((i.product_name_ar for i in order.items if i.is_upsell), ""),
        "upsell_amount_mad": float(order.upsell_amount_mad),
        "total_mad": float(order.total_mad),
        "payment_method": order.payment_method,
        "status": order.status,
        "source_url": order.source_url or "",
        "event_id": order.event_id or "",
    }

    if await sync_order_to_sheet(sheet_data):
        order.sheet_synced = True
        order.sheet_synced_at = datetime.now(timezone.utc)

    if await fire_all_capi(order, product_ids or ["GUMUCROYAL"]):
        order.capi_synced = True
        order.capi_synced_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(order)
    return order


def get_order_by_number(db: Session, order_number: str) -> Order:
    order = db.query(Order).options(joinedload(Order.items)).filter(Order.order_number == order_number).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order
