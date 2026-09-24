import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel


class AdminStaffRequestResponse(BaseModel):
    id: uuid.UUID
    public_token: uuid.UUID
    table_id: uuid.UUID
    table_number: str
    reason: str | None
    message: str | None
    status: str
    created_at: datetime
    accepted_at: datetime | None
    completed_at: datetime | None


class AdminStaffRequestUpdate(BaseModel):
    status: Literal["accepted", "completed"]