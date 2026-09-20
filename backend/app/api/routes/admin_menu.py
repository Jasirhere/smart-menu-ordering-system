import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.menu_item import MenuItem
from app.models.restaurant import Restaurant
from app.schemas.menu_item import (
    MenuItemCreate,
    MenuItemResponse,
    MenuItemUpdate,
)


router = APIRouter(
    prefix="/admin/menu",
    tags=["Admin Menu"],
)


async def get_dev_restaurant(
    db: AsyncSession,
) -> Restaurant:
    result = await db.execute(
        select(Restaurant).where(
            Restaurant.slug == "the-bistro-downtown"
        )
    )

    restaurant = result.scalar_one_or_none()

    if restaurant is None:
        raise HTTPException(
            status_code=404,
            detail="Restaurant not found",
        )

    return restaurant


@router.get(
    "",
    response_model=list[MenuItemResponse],
)
async def list_menu_items(
    db: AsyncSession = Depends(get_db),
) -> list[MenuItem]:

    restaurant = await get_dev_restaurant(db)

    result = await db.execute(
        select(MenuItem)
        .where(MenuItem.restaurant_id == restaurant.id)
        .order_by(
            MenuItem.sort_order.asc(),
            MenuItem.name.asc(),
        )
    )

    return list(result.scalars().all())


@router.post(
    "",
    response_model=MenuItemResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_menu_item(
    payload: MenuItemCreate,
    db: AsyncSession = Depends(get_db),
) -> MenuItem:

    restaurant = await get_dev_restaurant(db)

    menu_item = MenuItem(
        restaurant_id=restaurant.id,
        **payload.model_dump(),
    )

    db.add(menu_item)

    await db.commit()
    await db.refresh(menu_item)

    return menu_item


@router.patch(
    "/{menu_item_id}",
    response_model=MenuItemResponse,
)
async def update_menu_item(
    menu_item_id: uuid.UUID,
    payload: MenuItemUpdate,
    db: AsyncSession = Depends(get_db),
) -> MenuItem:

    restaurant = await get_dev_restaurant(db)

    result = await db.execute(
        select(MenuItem).where(
            MenuItem.id == menu_item_id,
            MenuItem.restaurant_id == restaurant.id,
        )
    )

    menu_item = result.scalar_one_or_none()

    if menu_item is None:
        raise HTTPException(
            status_code=404,
            detail="Menu item not found",
        )

    for field, value in payload.model_dump(
        exclude_unset=True
    ).items():
        setattr(menu_item, field, value)

    await db.commit()
    await db.refresh(menu_item)

    return menu_item