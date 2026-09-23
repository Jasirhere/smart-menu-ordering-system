import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.feedback import Feedback
from app.models.feedback_item_rating import FeedbackItemRating
from app.models.menu_item import MenuItem
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.restaurant import Restaurant
from app.models.restaurant_table import RestaurantTable
from app.schemas.feedback import PublicReviewResponse
from app.schemas.restaurant_table import (
    PublicMenuItemResponse,
    PublicRestaurantTableResponse,
)


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
    table_result = await db.execute(
        select(
            Restaurant.id.label("restaurant_id"),
            Restaurant.name.label("restaurant_name"),
            Restaurant.slug.label("restaurant_slug"),
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

    table_data = table_result.one_or_none()

    if table_data is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Table QR code is invalid or inactive",
        )

    rating_stats = (
        select(
            OrderItem.menu_item_id.label("menu_item_id"),
            func.avg(
                FeedbackItemRating.rating
            ).label("average_rating"),
            func.count(
                FeedbackItemRating.id
            ).label("ratings_count"),
        )
        .join(
            FeedbackItemRating,
            FeedbackItemRating.order_item_id
            == OrderItem.id,
        )
        .group_by(
            OrderItem.menu_item_id
        )
        .subquery()
    )

    menu_result = await db.execute(
        select(
            MenuItem,
            rating_stats.c.average_rating,
            rating_stats.c.ratings_count,
        )
        .outerjoin(
            rating_stats,
            MenuItem.id == rating_stats.c.menu_item_id,
        )
        .where(
            MenuItem.restaurant_id == table_data.restaurant_id,
            MenuItem.is_available.is_(True),
        )
        .order_by(
            MenuItem.sort_order.asc(),
            MenuItem.name.asc(),
        )
    )

    menu_items = [
        PublicMenuItemResponse(
            id=menu_item.id,
            name=menu_item.name,
            description=menu_item.description,
            category=menu_item.category,
            price=menu_item.price,
            image_url=menu_item.image_url,
            dietary_label=menu_item.dietary_label,
            sort_order=menu_item.sort_order,
            average_rating=average_rating,
            ratings_count=ratings_count or 0,
        )
        for menu_item, average_rating, ratings_count
        in menu_result.all()
    ]

    return PublicRestaurantTableResponse(
        restaurant_name=table_data.restaurant_name,
        restaurant_slug=table_data.restaurant_slug,
        table_number=table_data.table_number,
        menu_items=menu_items,
    )


@router.get(
    "/{public_token}/reviews",
    response_model=list[PublicReviewResponse],
)
async def get_public_reviews(
    public_token: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    table_result = await db.execute(
        select(
            RestaurantTable.restaurant_id
        ).where(
            RestaurantTable.public_token == public_token,
            RestaurantTable.is_active.is_(True),
        )
    )

    restaurant_id = table_result.scalar_one_or_none()

    if restaurant_id is None:
        raise HTTPException(
            status_code=404,
            detail="Table QR code is invalid or inactive",
        )

    reviews_result = await db.execute(
        select(Feedback)
        .join(
            Order,
            Feedback.order_id == Order.id,
        )
        .where(
            Order.restaurant_id == restaurant_id,
            Feedback.is_public.is_(True),
            Feedback.comment.is_not(None),
        )
        .order_by(
            Feedback.created_at.desc()
        )
        .limit(20)
    )

    reviews = reviews_result.scalars().all()

    return [
        PublicReviewResponse(
            overall_rating=review.overall_rating,
            comment=review.comment,
            created_at=review.created_at,
        )
        for review in reviews
    ]