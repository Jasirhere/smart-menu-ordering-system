from collections import defaultdict
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.restaurant import Restaurant
from app.models.restaurant_table import RestaurantTable
from app.schemas.order import (
    AdminOrderItemResponse,
    AdminOrderResponse,
    DashboardSummaryResponse,
)


router = APIRouter(
    prefix="/admin/dashboard",
    tags=["Admin Dashboard"],
)


@router.get(
    "/summary",
    response_model=DashboardSummaryResponse,
)
async def get_dashboard_summary(
    db: AsyncSession = Depends(get_db),
) -> DashboardSummaryResponse:

    restaurant_result = await db.execute(
        select(Restaurant).where(
            Restaurant.slug == "the-bistro-downtown"
        )
    )

    restaurant = restaurant_result.scalar_one_or_none()

    if restaurant is None:
        raise HTTPException(
            status_code=404,
            detail="Restaurant not found",
        )

    summary_result = await db.execute(
        select(
            func.count(Order.id),
            func.coalesce(func.sum(Order.subtotal), 0),
        ).where(
            Order.restaurant_id == restaurant.id,
            func.date(Order.created_at) == func.current_date(),
        )
    )

    todays_orders, todays_revenue = summary_result.one()

    active_result = await db.execute(
        select(func.count(Order.id)).where(
            Order.restaurant_id == restaurant.id,
            Order.status.in_(["pending", "preparing", "ready"]),
        )
    )

    active_orders = active_result.scalar_one()

    recent_result = await db.execute(
        select(
            Order,
            RestaurantTable.table_number,
        )
        .join(
            RestaurantTable,
            Order.table_id == RestaurantTable.id,
        )
        .where(Order.restaurant_id == restaurant.id)
        .order_by(Order.created_at.desc())
        .limit(5)
    )

    recent_rows = recent_result.all()

    order_ids = [order.id for order, _ in recent_rows]

    items_by_order = defaultdict(list)

    if order_ids:
        item_result = await db.execute(
            select(OrderItem).where(
                OrderItem.order_id.in_(order_ids)
            )
        )

        for item in item_result.scalars().all():
            items_by_order[item.order_id].append(
                AdminOrderItemResponse(
                    item_name=item.item_name,
                    unit_price=item.unit_price,
                    quantity=item.quantity,
                )
            )

    recent_orders = [
        AdminOrderResponse(
            id=order.id,
            table_number=table_number,
            status=order.status,
            subtotal=order.subtotal,
            created_at=order.created_at,
            items=items_by_order[order.id],
        )
        for order, table_number in recent_rows
    ]

    return DashboardSummaryResponse(
        todays_orders=todays_orders,
        todays_revenue=todays_revenue or Decimal("0.00"),
        active_orders=active_orders,
        recent_orders=recent_orders,
    )