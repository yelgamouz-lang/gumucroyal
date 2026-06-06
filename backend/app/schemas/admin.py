from datetime import datetime

from pydantic import BaseModel, Field


class AdminLoginIn(BaseModel):
    username: str
    password: str


class AdminLoginOut(BaseModel):
    token: str


class AnalyticsEventIn(BaseModel):
    event_type: str = Field(pattern="^(page_view|click)$")
    path: str
    product_slug: str | None = None
