import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.feedback import Feedback
from app.models.feedback_item_rating import FeedbackItemRating
from app.models.order import Order
from app.models.order_item import OrderItem
from app.schemas.feedback import (
    FeedbackCreate,
    FeedbackResponse,
)


router = APIRouter(
    prefix="/orders/track",
    tags=["Customer Feedback"],
)


@router.post(
    "/{public_token}/feedback",
    response_model=FeedbackResponse,
    status_code=status.HTTP_201_CREATED,
)
async def submit_feedback(
    public_token: uuid.UUID,
    payload: FeedbackCreate,
    db: AsyncSession = Depends(get_db),
):
    order_result = await db.execute(
        select(Order).where(
            Order.public_token == public_token
        )
    )

    order = order_result.scalar_one_or_none()

    if order is None:
        raise HTTPException(
            status_code=404,
            detail="Order not found",
        )

    if order.status != "served" or order.served_at is None:
        raise HTTPException(
            status_code=400,
            detail="Feedback is available after the order is served",
        )

    feedback_deadline = (
        order.served_at + timedelta(hours=24)
    )

    if datetime.now(timezone.utc) > feedback_deadline:
        raise HTTPException(
            status_code=400,
            detail="Feedback period has expired",
        )

    existing_result = await db.execute(
        select(Feedback).where(
            Feedback.order_id == order.id
        )
    )

    if existing_result.scalar_one_or_none():
        raise HTTPException(
            status_code=409,
            detail="Feedback has already been submitted",
        )

    item_ids = [
        item.order_item_id
        for item in payload.item_ratings
    ]

    if len(item_ids) != len(set(item_ids)):
        raise HTTPException(
            status_code=400,
            detail="Duplicate item ratings are not allowed",
        )

    if item_ids:
        valid_items_result = await db.execute(
            select(OrderItem.id).where(
                OrderItem.order_id == order.id,
                OrderItem.id.in_(item_ids),
            )
        )

        valid_item_ids = set(
            valid_items_result.scalars().all()
        )

        if valid_item_ids != set(item_ids):
            raise HTTPException(
                status_code=400,
                detail="One or more rated items do not belong to this order",
            )

    feedback = Feedback(
        order_id=order.id,
        overall_rating=payload.overall_rating,
        comment=payload.comment,
    )

    db.add(feedback)

    await db.flush()

    for item_rating in payload.item_ratings:
        db.add(
            FeedbackItemRating(
                feedback_id=feedback.id,
                order_item_id=item_rating.order_item_id,
                rating=item_rating.rating,
            )
        )

    await db.commit()
    await db.refresh(feedback)

    return FeedbackResponse(
        id=feedback.id,
        overall_rating=feedback.overall_rating,
        comment=feedback.comment,
        created_at=feedback.created_at,
    )