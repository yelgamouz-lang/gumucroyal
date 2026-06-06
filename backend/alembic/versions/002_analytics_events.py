"""analytics_events table — required for admin dashboard traffic metrics.

Revision ID: 002
Revises: 001
Create Date: 2026-06-02
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "002"
down_revision: Union[str, None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "analytics_events",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("event_type", sa.String(30), nullable=False),
        sa.Column("path", sa.String(500), nullable=False),
        sa.Column("product_slug", sa.String(120)),
        sa.Column("client_ip", sa.String(45)),
        sa.Column("country_code", sa.String(2)),
        sa.Column("user_agent", sa.Text()),
        sa.Column("is_counted", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )
    op.create_index("ix_analytics_events_event_type", "analytics_events", ["event_type"])
    op.create_index("ix_analytics_events_product_slug", "analytics_events", ["product_slug"])
    op.create_index("ix_analytics_events_country_code", "analytics_events", ["country_code"])
    op.create_index("ix_analytics_events_is_counted", "analytics_events", ["is_counted"])
    op.create_index("ix_analytics_events_created_at", "analytics_events", ["created_at"])


def downgrade() -> None:
    op.drop_index("ix_analytics_events_created_at", table_name="analytics_events")
    op.drop_index("ix_analytics_events_is_counted", table_name="analytics_events")
    op.drop_index("ix_analytics_events_country_code", table_name="analytics_events")
    op.drop_index("ix_analytics_events_product_slug", table_name="analytics_events")
    op.drop_index("ix_analytics_events_event_type", table_name="analytics_events")
    op.drop_table("analytics_events")
