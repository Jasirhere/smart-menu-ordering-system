import uuid
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class MenuItemCreate(BaseModel):
    name: str
    description: str
    category: str
    price: Decimal = Field(ge=0)
    image_url: str | None = None
    dietary_label: str | None = None
    is_available: bool = True
    sort_order: int = Field(default=0, ge=0)


class MenuItemUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    category: str | None = None
    price: Decimal | None = Field(default=None, ge=0)
    image_url: str | None = None
    dietary_label: str | None = None
    is_available: bool | None = None
    sort_order: int | None = Field(default=None, ge=0)


class MenuItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    description: str
    category: str
    price: Decimal
    image_url: str | None
    dietary_label: str | None
    is_available: bool
    sort_order: int