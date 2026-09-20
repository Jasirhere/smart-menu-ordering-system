from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.menu_item import MenuItem
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.restaurant_table import RestaurantTable
from app.schemas.order import OrderCreate, OrderResponse


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

    if not payload.items:
        raise HTTPException(
            status_code=400,
            detail="Order must contain at least one item",
        )

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

    menu_item_ids = [item.menu_item_id for item in payload.items]

    menu_result = await db.execute(
        select(MenuItem).where(
            MenuItem.id.in_(menu_item_ids),
            MenuItem.restaurant_id == table.restaurant_id,
            MenuItem.is_available.is_(True),
        )
    )

    menu_items = {
        item.id: item
        for item in menu_result.scalars().all()
    }

    if len(menu_items) != len(set(menu_item_ids)):
        raise HTTPException(
            status_code=400,
            detail="One or more menu items are invalid or unavailable",
        )

    subtotal = Decimal("0.00")

    for requested_item in payload.items:
        menu_item = menu_items[requested_item.menu_item_id]
        subtotal += menu_item.price * requested_item.quantity

    order = Order(
        restaurant_id=table.restaurant_id,
        table_id=table.id,
        status="pending",
        subtotal=subtotal,
    )

    db.add(order)

    # Creates the order ID before inserting its items.
    await db.flush()

    order_items = []

    for requested_item in payload.items:
        menu_item = menu_items[requested_item.menu_item_id]

        order_items.append(
            OrderItem(
                order_id=order.id,
                menu_item_id=menu_item.id,
                item_name=menu_item.name,
                unit_price=menu_item.price,
                quantity=requested_item.quantity,
            )
        )

    db.add_all(order_items)

    await db.commit()
    await db.refresh(order)

    return OrderResponse(
        id=order.id,
        status=order.status,
        subtotal=order.subtotal,
        table_number=table.table_number,
        created_at=order.created_at,
    )