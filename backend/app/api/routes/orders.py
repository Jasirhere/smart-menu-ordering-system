import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.restaurant_table import RestaurantTable
from app.services.order_service import (
    OrderItemInput,
    create_order_for_table,
)
from app.schemas.order import (
    OrderCreate,
    OrderResponse,
    OrderTrackingItemResponse,
    OrderTrackingResponse,
)
from datetime import datetime, timedelta, timezone
from app.models.feedback import Feedback


router = APIRouter(
    prefix="/orders",
    tags=["Orders"],
)


@router.post(
    "",
    response_model=OrderResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_order(
    payload: OrderCreate,
    db: AsyncSession = Depends(get_db),
) -> OrderResponse:
    table_result = await db.execute(
        select(RestaurantTable).where(
            RestaurantTable.public_token == payload.public_token,
            RestaurantTable.is_active.is_(True),
        )
    )

    table = table_result.scalar_one_or_none()

    if table is None:
        raise HTTPException(
            status_code=404,
            detail="Table QR code is invalid or inactive",
        )

    requested_items = [
        OrderItemInput(
            menu_item_id=item.menu_item_id,
            quantity=item.quantity,
        )
        for item in payload.items
    ]
    order = await create_order_for_table(
        db=db,
        table=table,
        requested_items=requested_items,
    )

    await db.commit()
    await db.refresh(order)

    return OrderResponse(
        id=order.id,
        public_token=order.public_token,
        status=order.status,
        subtotal=order.subtotal,
        table_number=table.table_number,
        created_at=order.created_at,
    )


@router.get(
    "/track/{public_token}",
    response_model=OrderTrackingResponse,
)
async def track_order(
    public_token: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(
            Order,
            RestaurantTable.table_number,
        )
        .join(
            RestaurantTable,
            Order.table_id == RestaurantTable.id,
        )
        .where(
            Order.public_token == public_token
        )
    )

    row = result.first()

    if row is None:
        raise HTTPException(
            status_code=404,
            detail="Order not found",
        )

    order, table_number = row

    items_result = await db.execute(
        select(OrderItem).where(
            OrderItem.order_id == order.id
        )
    )

    items = items_result.scalars().all()

    feedback_result = await db.execute(
        select(Feedback.id).where(
            Feedback.order_id == order.id
        )
    )

    feedback_submitted = (
        feedback_result.scalar_one_or_none() is not None
    )

    feedback_deadline = None
    feedback_available = False

    if order.served_at is not None:
        feedback_deadline = (
            order.served_at + timedelta(hours=24)
        )

        feedback_available = (
            order.status == "served"
            and not feedback_submitted
            and datetime.now(timezone.utc) <= feedback_deadline
        )

    return OrderTrackingResponse(
        public_token=order.public_token,
        status=order.status,
        subtotal=order.subtotal,
        table_number=table_number,
        created_at=order.created_at,
        feedback_submitted=feedback_submitted,
        feedback_available=feedback_available,
        feedback_deadline=feedback_deadline,
        items=[
            OrderTrackingItemResponse(
                id=item.id,
                item_name=item.item_name,
                unit_price=item.unit_price,
                quantity=item.quantity,
            )
            for item in items
        ],
    )