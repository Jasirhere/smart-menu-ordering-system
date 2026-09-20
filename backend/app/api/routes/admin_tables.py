from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.restaurant import Restaurant
from app.models.restaurant_table import RestaurantTable
from app.schemas.restaurant_table import (
    RestaurantTableCreate,
    RestaurantTableResponse,
)


router = APIRouter(
    prefix="/admin/tables",
    tags=["Admin Tables"],
)


async def get_dev_restaurant(db: AsyncSession) -> Restaurant:
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
    response_model=list[RestaurantTableResponse],
)
async def list_restaurant_tables(
    db: AsyncSession = Depends(get_db),
) -> list[RestaurantTable]:

    restaurant = await get_dev_restaurant(db)

    result = await db.execute(
        select(RestaurantTable)
        .where(RestaurantTable.restaurant_id == restaurant.id)
        .order_by(RestaurantTable.table_number)
    )

    return list(result.scalars().all())


@router.post(
    "",
    response_model=RestaurantTableResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_restaurant_table(
    table_data: RestaurantTableCreate,
    db: AsyncSession = Depends(get_db),
) -> RestaurantTable:

    restaurant = await get_dev_restaurant(db)

    restaurant_table = RestaurantTable(
        restaurant_id=restaurant.id,
        table_number=table_data.table_number,
    )

    db.add(restaurant_table)

    try:
        await db.commit()

    except IntegrityError as error:
        await db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This table number already exists",
        ) from error

    await db.refresh(restaurant_table)

    return restaurant_table