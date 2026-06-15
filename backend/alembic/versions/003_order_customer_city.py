"""add customer_city to orders

Revision ID: 003
Revises: 002
Create Date: 2026-06-09
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "003"
down_revision: Union[str, None] = "002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "orders",
        sa.Column("customer_city", sa.String(100), nullable=False, server_default=""),
    )


def downgrade() -> None:
    op.drop_column("orders", "customer_city")
