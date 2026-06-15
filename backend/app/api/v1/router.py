from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.database import get_db
from app.rate_limit import limiter
from app.schemas.order import (
    ConfirmOrderIn,
    CreateOrderIn,
    OrderCreatedOut,
    OrderOut,
    OrderItemOut,
    UpsellCandidateOut,
    UpsellUpdateIn,
)
from app.schemas.product import ProductOut, ProductsListOut
from app.services.order_service import (
    confirm_order,
    create_order,
    get_order_by_number,
    update_upsell,
)
from app.services.product_service import get_all_products, get_product_by_slug, serialize_product
from app.utils.upsell import get_upsell_candidates, upsell_price_mad

router = APIRouter()


@router.get("/products", response_model=ProductsListOut)
def list_products(db: Session = Depends(get_db)):
    products = get_all_products(db)
    return ProductsListOut(products=[serialize_product(p) for p in products])


@router.get("/products/{slug}", response_model=ProductOut)
def get_product(slug: str, db: Session = Depends(get_db)):
    product = get_product_by_slug(db, slug)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return serialize_product(product)


def _order_to_out(order) -> OrderOut:
    return OrderOut(
        id=order.id,
        order_number=order.order_number,
        status=order.status,
        customer_name=order.customer_name,
        customer_phone_display=order.phone_display,
        customer_city=order.customer_city or "",
        items=[
            OrderItemOut(
                product_name_ar=i.product_name_ar,
                offer_label_ar=i.offer_label_ar,
                quantity=i.quantity,
                total_price_mad=float(i.total_price_mad),
                is_upsell=i.is_upsell,
            )
            for i in order.items
        ],
        upsell_accepted=order.upsell_accepted,
        subtotal_mad=float(order.subtotal_mad),
        upsell_amount_mad=float(order.upsell_amount_mad),
        total_mad=float(order.total_mad),
        payment_method=order.payment_method,
        event_id=order.event_id,
        confirmed_at=order.confirmed_at.isoformat() if order.confirmed_at else None,
    )


@router.post("/orders", response_model=OrderCreatedOut, status_code=201)
@limiter.limit("5/minute")
@limiter.limit("30/hour")
async def post_order(request: Request, payload: CreateOrderIn, db: Session = Depends(get_db)):
    order = await create_order(db, request, payload.model_dump())
    candidates = get_upsell_candidates(db, order)
    return OrderCreatedOut(
        id=order.id,
        order_number=order.order_number,
        status=order.status,
        subtotal_mad=float(order.subtotal_mad),
        total_mad=float(order.total_mad),
        upsell_price_mad=upsell_price_mad(),
        upsell_candidates=[UpsellCandidateOut(**c) for c in candidates],
        event_id=order.event_id,
    )


@router.patch("/orders/{order_id}", response_model=OrderOut)
async def patch_order(order_id: UUID, payload: UpsellUpdateIn, db: Session = Depends(get_db)):
    order = await update_upsell(db, order_id, payload.upsell_accepted)
    return _order_to_out(order)


@router.post("/orders/{order_id}/confirm", response_model=OrderOut)
async def post_confirm(order_id: UUID, payload: ConfirmOrderIn, db: Session = Depends(get_db)):
    order = await confirm_order(
        db,
        order_id,
        payload.upsell_accepted,
        payload.upsell_product_id,
    )
    return _order_to_out(order)


@router.get("/orders/{order_number}", response_model=OrderOut)
@limiter.limit("30/minute")
def get_order(request: Request, order_number: str, db: Session = Depends(get_db)):
    order = get_order_by_number(db, order_number)
    return _order_to_out(order)
