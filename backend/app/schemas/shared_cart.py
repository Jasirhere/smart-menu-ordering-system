import uuid
from decimal import Decimal

from pydantic import BaseModel, Field


class SharedCartItemUpdate(BaseModel):
    participant_public_token: uuid.UUID
    quantity: int = Field(ge=0, le=99)


class SharedCartItemResponse(BaseModel):
    menu_item_id: uuid.UUID
    name: str
    price: Decimal
    quantity: int
    participant_public_token: uuid.UUID
    participant_name: str


class SharedCartResponse(BaseModel):
    session_public_token: uuid.UUID
    items: list[SharedCartItemResponse]

class SharedCartCheckoutRequest(BaseModel):
    participant_public_token: uuid.UUID        