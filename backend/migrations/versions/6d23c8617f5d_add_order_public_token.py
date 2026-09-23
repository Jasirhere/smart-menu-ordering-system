"""add order public token

Revision ID: 6d23c8617f5d
Revises: 23841dc13a65
Create Date: 2026-09-21 13:23:34.608500
"""

import uuid
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "6d23c8617f5d"
down_revision: Union[str, Sequence[str], None] = "23841dc13a65"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Add column as nullable first
    op.add_column(
        "orders",
        sa.Column(
            "public_token",
            postgresql.UUID(as_uuid=True),
            nullable=True,
        ),
    )

    # 2. Give every existing order its own token
    connection = op.get_bind()

    orders = sa.table(
        "orders",
        sa.column(
            "id",
            postgresql.UUID(as_uuid=True),
        ),
        sa.column(
            "public_token",
            postgresql.UUID(as_uuid=True),
        ),
    )

    existing_orders = connection.execute(
        sa.select(orders.c.id)
    ).fetchall()

    for order in existing_orders:
        connection.execute(
            orders.update()
            .where(orders.c.id == order.id)
            .values(public_token=uuid.uuid4())
        )

    # 3. Now make token mandatory
    op.alter_column(
        "orders",
        "public_token",
        existing_type=postgresql.UUID(as_uuid=True),
        nullable=False,
    )

    # 4. Token must be unique
    op.create_index(
        "ix_orders_public_token",
        "orders",
        ["public_token"],
        unique=True,
    )


def downgrade() -> None:
    op.drop_index(
        "ix_orders_public_token",
        table_name="orders",
    )

    op.drop_column(
        "orders",
        "public_token",
    )