from datetime import datetime, timezone
from uuid import UUID

from fastapi import HTTPException, Request
from sqlalchemy.orm import Session, joinedload

from app.models.offer import Offer
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.services.phone_service import format_display_phone, normalize_morocco_phone
from app.services.sheet_payload import build_sheet_row
from app.services.sheets_service import sync_order_to_sheet
from app.services.tracking.capi import fire_all_capi
from app.utils.order_id import generate_order_number
from app.product_catalog import get_base_price
from app.utils.offer_tiers import add_piece_price_mad, tier_total_price
from app.utils.upsell import is_upsell_eligible, resolve_upsell_product, upsell_price_mad

ORDER_BUMP_LABEL = "زيادة الطلب"
UPSELL_LABEL = "2ème pièce — offre commande"


def _resolve_order_bump_product(db: Session, product_id: UUID) -> Product:
    product = db.query(Product).filter(Product.id == product_id, Product.is_active.is_(True)).first()
    if not product:
        raise HTTPException(status_code=422, detail="Produit invalide pour l'offre 2ᵉ pièce")
    if not is_upsell_eligible(product):
        raise HTTPException(status_code=422, detail="Produit non éligible à l'offre 2ᵉ pièce")
    return product


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


def calculate_subtotal(db: Session, items: list[dict]) -> tuple[float, list[dict]]:
    add_price = add_piece_price_mad()
    resolved = []
    subtotal = 0.0
    for item in items:
        product = db.query(Product).filter(Product.id == item["product_id"]).first()
        offer = db.query(Offer).filter(Offer.id == item["offer_id"]).first()
        if not product or not offer:
            raise HTTPException(status_code=422, detail="منتج أو عرض غير صالح")

        extra_ids = item.get("extra_product_ids") or []
        expected_extras = max(0, offer.quantity - 1)
        if len(extra_ids) != expected_extras:
            raise HTTPException(status_code=422, detail="اختاري القطع الإضافية لهذا العرض")

        main_base = get_base_price(product.slug)
        line_total = tier_total_price(main_base, offer.quantity)
        subtotal += line_total

        bundle_lines = [{"product": product, "line_total": main_base, "quantity": 1}]
        for eid in extra_ids:
            extra = db.query(Product).filter(Product.id == eid, Product.is_active.is_(True)).first()
            if not extra:
                raise HTTPException(status_code=422, detail="منتج إضافي غير صالح")
            bundle_lines.append({"product": extra, "line_total": add_price, "quantity": 1})

        resolved.append(
            {
                "product": product,
                "offer": offer,
                "quantity": offer.quantity,
                "line_total": line_total,
                "bundle_lines": bundle_lines,
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

    for row in resolved:
        product = row["product"]
        offer = row["offer"]
        bundle_lines = row["bundle_lines"]
        for bl in bundle_lines:
            bp = bl["product"]
            db.add(
                OrderItem(
                    order_id=order.id,
                    product_id=bp.id,
                    offer_id=offer.id if bp.id == product.id else None,
                    product_name_ar=bp.name_ar,
                    offer_label_ar=offer.label_ar if bp.id == product.id else None,
                    quantity=1,
                    unit_price_mad=float(bl["line_total"]),
                    total_price_mad=float(bl["line_total"]),
                    is_upsell=False,
                )
            )

    if data.get("order_bump_accepted") or data.get("order_bump_product_ids"):
        bump_ids = list(data.get("order_bump_product_ids") or [])
        if not bump_ids and data.get("order_bump_product_id"):
            bump_ids = [data["order_bump_product_id"]]
        if not bump_ids:
            raise HTTPException(status_code=422, detail="Choisissez une pièce pour l'offre 2ᵉ pièce")
        if len(bump_ids) > 2:
            raise HTTPException(status_code=422, detail="Maximum 2 pièces supplémentaires")

        bump_price = add_piece_price_mad()
        for bump_id in bump_ids:
            bump_product = _resolve_order_bump_product(db, bump_id)
            subtotal += bump_price
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
        order.subtotal_mad = subtotal
        order.total_mad = subtotal

    db.commit()
    db.refresh(order)
    return order


async def update_upsell(db: Session, order_id: UUID, accepted: bool, upsell_product_id: UUID | None = None) -> Order:
    order = db.query(Order).options(joinedload(Order.items)).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.status == "completed":
        raise HTTPException(status_code=409, detail="Order already confirmed")

    if accepted and any(i.is_upsell for i in order.items):
        raise HTTPException(status_code=409, detail="Upsell déjà appliqué")

    order.upsell_accepted = accepted
    if accepted:
        if not upsell_product_id:
            raise HTTPException(status_code=422, detail="Choisissez un produit pour l'offre upsell")
        product = resolve_upsell_product(db, upsell_product_id, order)
        price = upsell_price_mad()
        order.upsell_product_id = product.id
        order.upsell_amount_mad = price
        order.total_mad = float(order.subtotal_mad) + price
        db.add(
            OrderItem(
                order_id=order.id,
                product_id=product.id,
                product_name_ar=product.name_ar,
                offer_label_ar=UPSELL_LABEL,
                quantity=1,
                unit_price_mad=price,
                total_price_mad=price,
                is_upsell=True,
            )
        )
    else:
        order.upsell_amount_mad = 0
        order.total_mad = float(order.subtotal_mad)

    db.commit()
    db.refresh(order)
    return order


async def confirm_order(
    db: Session,
    order_id: UUID,
    upsell_accepted: bool | None = None,
    upsell_product_id: UUID | None = None,
) -> Order:
    order = db.query(Order).options(joinedload(Order.items)).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.status == "completed":
        return order

    if upsell_accepted is not None:
        await update_upsell(db, order_id, upsell_accepted, upsell_product_id)
        order = db.query(Order).options(joinedload(Order.items)).filter(Order.id == order_id).first()

    order.status = "completed"
    order.confirmed_at = datetime.now(timezone.utc)

    sheet_data = build_sheet_row(db, order)

    if await sync_order_to_sheet(sheet_data):
        order.sheet_synced = True
        order.sheet_synced_at = datetime.now(timezone.utc)

    product_ids = []
    for item in order.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if product:
            product_ids.append(product.sku)

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
