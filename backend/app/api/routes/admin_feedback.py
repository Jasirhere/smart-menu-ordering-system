import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.feedback import Feedback
from app.models.feedback_item_rating import FeedbackItemRating
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.restaurant import Restaurant
from app.models.restaurant_table import RestaurantTable
from app.schemas.feedback import (
    AdminFeedbackItemRatingResponse,
    AdminFeedbackResponse,
    AdminFeedbackVisibilityUpdate,
)


router = APIRouter(
    prefix="/admin/feedback",
    tags=["Admin Feedback"],
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
    response_model=list[AdminFeedbackResponse],
)
async def list_feedback(
    db: AsyncSession = Depends(get_db),
):
    restaurant = await get_dev_restaurant(db)

    result = await db.execute(
        select(
            Feedback,
            RestaurantTable.table_number,
        )
        .join(
            Order,
            Feedback.order_id == Order.id,
        )
        .join(
            RestaurantTable,
            Order.table_id == RestaurantTable.id,
        )
        .where(
            Order.restaurant_id == restaurant.id,
        )
        .order_by(
            Feedback.created_at.desc()
        )
    )

    feedback_rows = result.all()

    feedback_ids = [
        feedback.id
        for feedback, _ in feedback_rows
    ]

    ratings_by_feedback = {
        feedback_id: []
        for feedback_id in feedback_ids
    }

    if feedback_ids:
        ratings_result = await db.execute(
            select(
                FeedbackItemRating.feedback_id,
                OrderItem.item_name,
                FeedbackItemRating.rating,
            )
            .join(
                OrderItem,
                FeedbackItemRating.order_item_id
                == OrderItem.id,
            )
            .where(
                FeedbackItemRating.feedback_id.in_(
                    feedback_ids
                )
            )
        )

        for row in ratings_result.all():
            ratings_by_feedback[
                row.feedback_id
            ].append(
                AdminFeedbackItemRatingResponse(
                    item_name=row.item_name,
                    rating=row.rating,
                )
            )

    return [
        AdminFeedbackResponse(
            id=feedback.id,
            order_id=feedback.order_id,
            table_number=table_number,
            overall_rating=feedback.overall_rating,
            comment=feedback.comment,
            is_public=feedback.is_public,
            created_at=feedback.created_at,
            item_ratings=ratings_by_feedback[
                feedback.id
            ],
        )
        for feedback, table_number in feedback_rows
    ]


@router.patch("/{feedback_id}")
async def update_feedback_visibility(
    feedback_id: uuid.UUID,
    payload: AdminFeedbackVisibilityUpdate,
    db: AsyncSession = Depends(get_db),
):
    restaurant = await get_dev_restaurant(db)

    result = await db.execute(
        select(Feedback)
        .join(
            Order,
            Feedback.order_id == Order.id,
        )
        .where(
            Feedback.id == feedback_id,
            Order.restaurant_id == restaurant.id,
        )
    )

    feedback = result.scalar_one_or_none()

    if feedback is None:
        raise HTTPException(
            status_code=404,
            detail="Feedback not found",
        )

    feedback.is_public = payload.is_public

    await db.commit()
    await db.refresh(feedback)

    return {
        "id": feedback.id,
        "is_public": feedback.is_public,
    }