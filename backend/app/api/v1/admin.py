from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models.order import Order
from app.rate_limit import limiter
from app.schemas.admin import AdminLoginIn, AdminLoginOut
from app.services.admin_auth import create_admin_token, require_admin, verify_admin_credentials
from app.services.analytics_service import get_dashboard_metrics, list_orders, serialize_order

router = APIRouter(prefix="/admin")


@router.post("/login", response_model=AdminLoginOut)
@limiter.limit("5/minute")
def admin_login(request: Request, payload: AdminLoginIn):
    if not verify_admin_credentials(payload.username, payload.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return AdminLoginOut(token=create_admin_token(payload.username))


@router.get("/metrics")
def admin_metrics(
    start: datetime | None = Query(None),
    end: datetime | None = Query(None),
    _admin: str = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return get_dashboard_metrics(db, start, end)


@router.get("/orders")
def admin_orders(
    start: datetime | None = Query(None),
    end: datetime | None = Query(None),
    limit: int = Query(500, le=500),
    _admin: str = Depends(require_admin),
    db: Session = Depends(get_db),
):
    orders = list_orders(db, start, end, limit=limit)
    return {"orders": [serialize_order(o, db) for o in orders]}


@router.get("/orders/{order_number}")
def admin_order_detail(
    order_number: str,
    _admin: str = Depends(require_admin),
    db: Session = Depends(get_db),
):
    order = (
        db.query(Order)
        .options(joinedload(Order.items))
        .filter(Order.order_number == order_number)
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return serialize_order(order, db)
