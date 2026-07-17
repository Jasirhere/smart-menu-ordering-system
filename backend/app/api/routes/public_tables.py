import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.restaurant import Restaurant
from app.models.restaurant_table import RestaurantTable
from app.schemas.restaurant_table import PublicRestaurantTableResponse


router = APIRouter(
    prefix="/public/tables",
    tags=["Public Tables"],
)


@router.get(
    "/{public_token}",
    response_model=PublicRestaurantTableResponse,
)
async def get_public_table(
    public_token: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> PublicRestaurantTableResponse:
    result = await db.execute(
        select(
            Restaurant.name,
            Restaurant.slug,
            RestaurantTable.table_number,
        )
        .join(
            RestaurantTable,
            RestaurantTable.restaurant_id == Restaurant.id,
        )
        .where(
            RestaurantTable.public_token == public_token,
            RestaurantTable.is_active.is_(True),
        )
    )

    table_data = result.one_or_none()

    if table_data is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Table QR code is invalid or inactive",
        )

    return PublicRestaurantTableResponse(
        restaurant_name=table_data.name,
        restaurant_slug=table_data.slug,
        table_number=table_data.table_number,
    )