from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.auth import get_current_restaurant_member
from app.db.session import get_db
from app.models.restaurant_member import RestaurantMember
from app.models.restaurant_table import RestaurantTable
from app.schemas.restaurant_table import (
    RestaurantTableCreate,
    RestaurantTableResponse,
)


router = APIRouter(
    prefix="/admin/tables",
    tags=["Admin Tables"],
)

@router.get(
    "",
    response_model=list[RestaurantTableResponse],
)
async def list_restaurant_tables(
    member: RestaurantMember = Depends(
        get_current_restaurant_member
    ),
    db: AsyncSession = Depends(get_db),
) -> list[RestaurantTable]:
    if member.role not in {"owner", "admin"}:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )

    result = await db.execute(
        select(RestaurantTable)
        .where(
            RestaurantTable.restaurant_id == member.restaurant_id
        )
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
    member: RestaurantMember = Depends(
        get_current_restaurant_member
    ),
    db: AsyncSession = Depends(get_db),
) -> RestaurantTable:
    if member.role not in {"owner", "admin"}:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )

    restaurant_table = RestaurantTable(
        restaurant_id=member.restaurant_id,
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