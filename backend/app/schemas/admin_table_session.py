import uuid
from typing import Literal

from pydantic import BaseModel


class AdminTableSessionStatusResponse(BaseModel):
    table_id: uuid.UUID
    table_number: int
    status: Literal["free", "occupied"]
    active_session_id: uuid.UUID | None