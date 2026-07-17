import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class RestaurantTableCreate(BaseModel):
    table_number: int = Field(
        ge=1,
        le=999,
    )


class RestaurantTableResponse(BaseModel):
    id: uuid.UUID
    table_number: int
    public_token: uuid.UUID
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PublicRestaurantTableResponse(BaseModel):
    restaurant_name: str
    restaurant_slug: str
    table_number: int    