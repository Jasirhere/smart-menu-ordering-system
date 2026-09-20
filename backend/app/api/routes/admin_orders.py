from collections import defaultdict

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
import uuid
from app.db.session import get_db
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.restaurant import Restaurant
from app.models.restaurant_table import RestaurantTable
from app.schemas.order import (
    AdminOrderItemResponse,
    AdminOrderResponse,
    OrderStatusUpdate,
)

router = APIRouter(
    prefix="/admin/orders",
    tags=["Admin Orders"],
)


@router.get(
    "",
    response_model=list[AdminOrderResponse],
)
async def list_orders(
    db: AsyncSession = Depends(get_db),
) -> list[AdminOrderResponse]:

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

    order_result = await db.execute(
        select(
            Order,
            RestaurantTable.table_number,
        )
        .join(
            RestaurantTable,
            Order.table_id == RestaurantTable.id,
        )
        .where(
            Order.restaurant_id == restaurant.id
        )
        .order_by(Order.created_at.desc())
    )

    order_rows = order_result.all()

    if not order_rows:
        return []

    order_ids = [
        order.id
        for order, _ in order_rows
    ]

    item_result = await db.execute(
        select(OrderItem).where(
            OrderItem.order_id.in_(order_ids)
        )
    )

    items_by_order = defaultdict(list)

    for item in item_result.scalars().all():
        items_by_order[item.order_id].append(
            AdminOrderItemResponse(
                item_name=item.item_name,
                unit_price=item.unit_price,
                quantity=item.quantity,
            )
        )

    return [
        AdminOrderResponse(
            id=order.id,
            table_number=table_number,
            status=order.status,
            subtotal=order.subtotal,
            created_at=order.created_at,
            items=items_by_order[order.id],
        )
        for order, table_number in order_rows
    ]


@router.patch("/{order_id}/status")
async def update_order_status(
    order_id: uuid.UUID,
    payload: OrderStatusUpdate,
    db: AsyncSession = Depends(get_db),
):
    order = await db.get(Order, order_id)

    if order is None:
        raise HTTPException(
            status_code=404,
            detail="Order not found",
        )

    allowed_transitions = {
        "pending": "preparing",
        "preparing": "ready",
        "ready": "served",
    }

    expected_status = allowed_transitions.get(order.status)

    if payload.status != expected_status:
        raise HTTPException(
            status_code=400,
            detail="Invalid order status transition",
        )

    order.status = payload.status

    await db.commit()
    await db.refresh(order)

    return {
        "id": order.id,
        "status": order.status,
    }