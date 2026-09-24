import uuid

from fastapi import APIRouter, Depends, HTTPException
from openai import OpenAI
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.db.session import get_db
from app.models.menu_item import MenuItem
from app.models.restaurant import Restaurant
from app.models.restaurant_table import RestaurantTable
from app.schemas.ai_menu import (
    AiMenuStructuredOutput,
    MenuAssistantRequest,
    MenuAssistantResponse,
    RecommendedMenuItem,
)


router = APIRouter(
    prefix="/public/ai",
    tags=["AI Menu Assistant"],
)

client = OpenAI(
    api_key=settings.openai_api_key,
)


@router.post(
    "/menu-assistant/{table_public_token}",
    response_model=MenuAssistantResponse,
)
async def menu_assistant(
    table_public_token: uuid.UUID,
    payload: MenuAssistantRequest,
    db: AsyncSession = Depends(get_db),
):
    table_result = await db.execute(
        select(
            Restaurant.id.label("restaurant_id"),
            Restaurant.name.label("restaurant_name"),
        )
        .join(
            RestaurantTable,
            RestaurantTable.restaurant_id == Restaurant.id,
        )
        .where(
            RestaurantTable.public_token == table_public_token,
            RestaurantTable.is_active.is_(True),
        )
    )

    table_data = table_result.one_or_none()

    if table_data is None:
        raise HTTPException(
            status_code=404,
            detail="Table not found",
        )

    menu_result = await db.execute(
        select(MenuItem)
        .where(
            MenuItem.restaurant_id == table_data.restaurant_id,
            MenuItem.is_available.is_(True),
        )
        .order_by(
            MenuItem.sort_order.asc(),
            MenuItem.name.asc(),
        )
    )

    menu_items = menu_result.scalars().all()

    menu_context = "\n".join(
        [
            (
                f"- ID: {item.id} | "
                f"Name: {item.name} | "
                f"Category: {item.category} | "
                f"Price: £{item.price} | "
                f"Description: {item.description} | "
                f"Dietary: {item.dietary_label or 'Not specified'}"
            )
            for item in menu_items
        ]
    )

    response = client.responses.parse(
        model="gpt-5-mini",
        instructions=(
            "You are TableMind's digital restaurant waiter. "
            "Speak naturally like a knowledgeable waiter at the customer's table. "
            "Do not sound like a generic chatbot. "

            "Use ONLY the menu provided. "
            "Never invent dishes, IDs, prices, ingredients, allergens, "
            "dietary claims, spice levels, or availability. "

            "If information is not provided in the menu, say that you cannot "
            "confirm it. Do not offer to draft messages for the customer. "

            "When recommending food, recommend at most 3 dishes. "
            "For every recommendation, use the EXACT menu item ID, name and price. "
            "Explain briefly why it fits the customer's request. "
            "Each recommendation reason must be one short natural sentence. "
            "Do NOT include the menu item ID, item name, or price inside the reason. "
            "Only explain why the dish matches the customer's request. "

            "If you are not recommending a specific dish, return an empty "
            "recommendations list. "

            "Reply in the same language/style as the customer when practical."
        ),
        input=(
            f"Restaurant: {table_data.restaurant_name}\n\n"
            f"CURRENT MENU:\n{menu_context}\n\n"
            f"CUSTOMER REQUEST:\n{payload.message}"
        ),
        text_format=AiMenuStructuredOutput,
    )

    parsed = response.output_parsed

    if parsed is None:
        raise HTTPException(
            status_code=502,
            detail="AI assistant could not generate a response",
        )

    menu_by_id = {
        item.id: item
        for item in menu_items
    }

    validated_recommendations = []

    for recommendation in parsed.recommendations:
        try:
            menu_item_id = uuid.UUID(
                recommendation.menu_item_id
            )
        except ValueError:
            continue

        menu_item = menu_by_id.get(menu_item_id)

        if menu_item is None:
            continue

        validated_recommendations.append(
            RecommendedMenuItem(
                id=menu_item.id,
                name=menu_item.name,
                price=menu_item.price,
                reason=recommendation.reason,
            )
        )

    return MenuAssistantResponse(
        reply=parsed.reply,
        recommendations=validated_recommendations,
    )