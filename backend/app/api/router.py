from fastapi import APIRouter

from app.api.v1 import health, router as v1_router

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(v1_router.router, tags=["v1"])
