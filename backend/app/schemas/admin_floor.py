import uuid

from pydantic import BaseModel


class FloorTableResponse(BaseModel):
    table_id: uuid.UUID
    table_number: int
    status: str  # free | occupied
    active_session_id: uuid.UUID | None
    active_orders: int
    has_new_staff_request: bool