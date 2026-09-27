import uuid
from dataclasses import dataclass
from decimal import Decimal

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.menu_item import MenuItem
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.restaurant_table import RestaurantTable


@dataclass
class OrderItemInput:
    menu_item_id: uuid.UUID
    quantity: int


async def create_order_for_table(
    db: AsyncSession,
    table: RestaurantTable,
    requested_items: list[OrderItemInput],
) -> Order:
    if not requested_items:
        raise HTTPException(
            status_code=400,
            detail="Order must contain at least one item",
        )

    menu_item_ids = [
        item.menu_item_id
        for item in requested_items
    ]

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

    for requested_item in requested_items:
        menu_item = menu_items[requested_item.menu_item_id]

        subtotal += (
            menu_item.price
            * requested_item.quantity
        )

    order = Order(
        restaurant_id=table.restaurant_id,
        table_id=table.id,
        status="pending",
        subtotal=subtotal,
    )

    db.add(order)
    await db.flush()

    db.add_all(
        [
            OrderItem(
                order_id=order.id,
                menu_item_id=menu_items[item.menu_item_id].id,
                item_name=menu_items[item.menu_item_id].name,
                unit_price=menu_items[item.menu_item_id].price,
                quantity=item.quantity,
            )
            for item in requested_items
        ]
    )

    return order