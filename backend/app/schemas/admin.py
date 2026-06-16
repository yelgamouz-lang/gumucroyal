from datetime import datetime

from pydantic import BaseModel, Field


class AdminLoginIn(BaseModel):
    username: str
    password: str


class AdminLoginOut(BaseModel):
    token: str


class AnalyticsEventIn(BaseModel):
    event_type: str = Field(pattern="^(page_view|click)$")
    path: str = Field(min_length=1, max_length=500)
    product_slug: str | None = Field(default=None, max_length=128)
