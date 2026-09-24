import uuid
from decimal import Decimal

from pydantic import BaseModel


class MenuAssistantRequest(BaseModel):
    message: str


class AiRecommendationChoice(BaseModel):
    menu_item_id: str
    reason: str


class AiMenuStructuredOutput(BaseModel):
    reply: str
    recommendations: list[AiRecommendationChoice]


class RecommendedMenuItem(BaseModel):
    id: uuid.UUID
    name: str
    price: Decimal
    reason: str


class MenuAssistantResponse(BaseModel):
    reply: str
    recommendations: list[RecommendedMenuItem]