import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class RestaurantTableCreate(BaseModel):
    table_number: int = Field(ge=1, le=999)


class RestaurantTableResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    table_number: int
    public_token: uuid.UUID
    is_active: bool
    created_at: datetime


class PublicMenuItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    description: str
    category: str
    price: Decimal
    image_url: str | None
    dietary_label: str | None
    sort_order: int


class PublicRestaurantTableResponse(BaseModel):
    restaurant_name: str
    restaurant_slug: str
    table_number: int
    menu_items: list[PublicMenuItemResponse]