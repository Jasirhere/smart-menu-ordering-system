import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, model_validator


StaffRequestReason = Literal[
    "water",
    "cutlery",
    "bill",
    "assistance",
    "order_issue",
    "custom",
]


class StaffRequestCreate(BaseModel):
    reason: StaffRequestReason | None = None
    message: str | None = None

    @model_validator(mode="after")
    def validate_custom_message(self):
        if self.reason == "custom" and not self.message:
            raise ValueError("Message is required when reason is custom.")

        return self


class StaffRequestResponse(BaseModel):
    public_token: uuid.UUID
    reason: str | None
    message: str | None
    status: str
    created_at: datetime
    accepted_at: datetime | None
    completed_at: datetime | None