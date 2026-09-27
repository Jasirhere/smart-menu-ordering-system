import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import and_, delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.restaurant import Restaurant
from app.models.restaurant_table import RestaurantTable
from app.models.shared_cart_item import SharedCartItem
from app.models.table_session import TableSession
from app.schemas.admin_table_session import (
    AdminTableSessionStatusResponse,
)
from app.models.order import Order


router = APIRouter(
    prefix="/admin/tables",
    tags=["Admin Table Sessions"],
)

DEV_RESTAURANT_SLUG = "the-bistro-downtown"


@router.get(
    "/session-status",
    response_model=list[AdminTableSessionStatusResponse],
)
async def get_table_session_statuses(
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(
            RestaurantTable.id,
            RestaurantTable.table_number,
            TableSession.id.label("active_session_id"),
        )
        .join(
            Restaurant,
            RestaurantTable.restaurant_id == Restaurant.id,
        )
        .outerjoin(
            TableSession,
            and_(
                TableSession.table_id == RestaurantTable.id,
                TableSession.status == "active",
            ),
        )
        .where(
            Restaurant.slug == DEV_RESTAURANT_SLUG,
            RestaurantTable.is_active.is_(True),
        )
        .order_by(RestaurantTable.table_number)
    )
    rows = result.all()

    return [
        AdminTableSessionStatusResponse(
            table_id=row.id,
            table_number=row.table_number,
            status=(
                "occupied"
                if row.active_session_id is not None
                else "free"
            ),
            active_session_id=row.active_session_id,
        )
        for row in rows
    ]


@router.post("/{table_id}/clear-session")
async def clear_table_session(
    table_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    table_result = await db.execute(
        select(RestaurantTable)
        .join(
            Restaurant,
            RestaurantTable.restaurant_id == Restaurant.id,
        )
        .where(
            RestaurantTable.id == table_id,
            Restaurant.slug == DEV_RESTAURANT_SLUG,
        )
    )

    table = table_result.scalar_one_or_none()

    if table is None:
        raise HTTPException(
            status_code=404,
            detail="Table not found.",
        )

    active_orders_result = await db.execute(
        select(Order).where(
            Order.table_id == table.id,
            Order.status.in_(
                ["pending", "preparing", "ready"]
            ),
        )
    )
    active_orders = list(active_orders_result.scalars().all())

    if active_orders:
        raise HTTPException(
            status_code=409,
            detail=(
                f"Table has {len(active_orders)} active order(s). "
                "Complete them before clearing the table."
            ),
        )

    session_result = await db.execute(
        select(TableSession)
        .where(
            TableSession.table_id == table.id,
            TableSession.status == "active",
        )
        .with_for_update()
    )

    table_session = session_result.scalar_one_or_none()

    if table_session is None:
        return {
            "table_id": table.id,
            "table_number": table.table_number,
            "status": "free",
            "message": "Table already has no active session.",
        }

    await db.execute(
        delete(SharedCartItem).where(
            SharedCartItem.session_id == table_session.id
        )
    )

    table_session.status = "closed"
    table_session.closed_at = datetime.now(timezone.utc)

    await db.commit()

    return {
        "table_id": table.id,
        "table_number": table.table_number,
        "status": "free",
        "message": "Table session closed.",
    }