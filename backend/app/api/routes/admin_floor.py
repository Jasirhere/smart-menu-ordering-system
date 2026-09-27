from fastapi import APIRouter, Depends
from sqlalchemy import and_, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.order import Order
from app.models.restaurant import Restaurant
from app.models.restaurant_table import RestaurantTable
from app.models.staff_request import StaffRequest
from app.models.table_session import TableSession
from app.schemas.admin_floor import FloorTableResponse


router = APIRouter(
    prefix="/admin/floor",
    tags=["Admin Floor"],
)

DEV_RESTAURANT_SLUG = "the-bistro-downtown"


@router.get(
    "",
    response_model=list[FloorTableResponse],
)
async def get_floor(
    db: AsyncSession = Depends(get_db),
):
    tables_result = await db.execute(
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

    rows = tables_result.all()

    response: list[FloorTableResponse] = []

    for row in rows:
        active_orders_result = await db.execute(
            select(func.count(Order.id)).where(
                Order.table_id == row.id,
                Order.status.in_(
                    ["pending", "preparing", "ready"]
                ),
            )
        )

        active_orders = active_orders_result.scalar_one()

        staff_request_result = await db.execute(
            select(func.count(StaffRequest.id)).where(
                StaffRequest.table_id == row.id,
                StaffRequest.status == "new",
            )
        )

        new_staff_requests = staff_request_result.scalar_one()

        response.append(
            FloorTableResponse(
                table_id=row.id,
                table_number=row.table_number,
                status=(
                    "occupied"
                    if row.active_session_id is not None
                    else "free"
                ),
                active_session_id=row.active_session_id,
                active_orders=active_orders,
                has_new_staff_request=new_staff_requests > 0,
            )
        )

    return response