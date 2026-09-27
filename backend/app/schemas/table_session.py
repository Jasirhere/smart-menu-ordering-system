import uuid

from pydantic import BaseModel, Field


class JoinTableSessionRequest(BaseModel):
    display_name: str = Field(
        min_length=1,
        max_length=50,
    )


class JoinTableSessionResponse(BaseModel):
    session_public_token: uuid.UUID
    participant_public_token: uuid.UUID
    display_name: str
    table_number: int