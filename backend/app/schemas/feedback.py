import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class FeedbackItemRatingCreate(BaseModel):
    order_item_id: uuid.UUID
    rating: int = Field(ge=1, le=5)


class FeedbackCreate(BaseModel):
    overall_rating: int = Field(ge=1, le=5)
    comment: str | None = Field(
        default=None,
        max_length=2000,
    )
    item_ratings: list[FeedbackItemRatingCreate] = Field(
    default_factory=list
)


class FeedbackResponse(BaseModel):
    id: uuid.UUID
    overall_rating: int
    comment: str | None
    created_at: datetime

class AdminFeedbackItemRatingResponse(BaseModel):
    item_name: str
    rating: int


class AdminFeedbackResponse(BaseModel):
    id: uuid.UUID
    order_id: uuid.UUID
    table_number: int
    overall_rating: int
    comment: str | None
    is_public: bool
    created_at: datetime
    item_ratings: list[AdminFeedbackItemRatingResponse]


class AdminFeedbackVisibilityUpdate(BaseModel):
    is_public: bool


class PublicReviewResponse(BaseModel):
    overall_rating: int
    comment: str
    created_at: datetime
