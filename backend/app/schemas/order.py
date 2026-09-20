import uuid
from datetime import datetime
from decimal import Decimal
from enum import Enum

from pydantic import BaseModel, Field


class OrderStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PREPARING = "preparing"
    READY = "ready"
    SERVED = "served"
    CANCELLED = "cancelled"

    @classmethod
    def normalize(cls, value: str) -> "OrderStatus":
        normalized = str(value).strip().lower()
        for status in cls:
            if status.value == normalized:
                return status
        raise ValueError(f"Unsupported order status: {value!r}")

    @property
    def is_terminal(self) -> bool:
        return self in {OrderStatus.SERVED, OrderStatus.CANCELLED}

    def __str__(self) -> str:
        return self.value


class OrderItemCreate(BaseModel):
    menu_item_id: uuid.UUID
    quantity: int = Field(ge=1, le=99)


class OrderCreate(BaseModel):
    public_token: uuid.UUID
    items: list[OrderItemCreate]


class OrderResponse(BaseModel):
    id: uuid.UUID
    status: OrderStatus
    subtotal: Decimal
    table_number: int
    created_at: datetime

class AdminOrderItemResponse(BaseModel):
    item_name: str
    unit_price: Decimal
    quantity: int


class AdminOrderResponse(BaseModel):
    id: uuid.UUID
    table_number: int
    status: OrderStatus
    subtotal: Decimal
    created_at: datetime
    items: list[AdminOrderItemResponse]


class OrderStatusUpdate(BaseModel):
    status: OrderStatus    

class DashboardSummaryResponse(BaseModel):
    todays_orders: int
    todays_revenue: Decimal
    active_orders: int
    recent_orders: list[AdminOrderResponse]