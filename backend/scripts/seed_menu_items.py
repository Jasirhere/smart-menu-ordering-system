import asyncio
import sys
from decimal import Decimal

from sqlalchemy import select

from app.db.session import AsyncSessionLocal, engine
from app.models.menu_item import MenuItem
from app.models.restaurant import Restaurant


if sys.platform == "win32":
    asyncio.set_event_loop_policy(
        asyncio.WindowsSelectorEventLoopPolicy()
    )


MENU_ITEMS = [
    {
        "name": "Chicken Biryani",
        "description": "Aromatic basmati rice served with tender spiced chicken.",
        "category": "Main Course",
        "price": Decimal("12.00"),
        "dietary_label": "Halal",
        "sort_order": 1,
    },
    {
        "name": "Classic Beef Burger",
        "description": "Juicy beef patty with cheese, lettuce and house sauce.",
        "category": "Burgers",
        "price": Decimal("10.50"),
        "dietary_label": "Halal",
        "sort_order": 2,
    },
    {
        "name": "Grilled Salmon",
        "description": "Grilled salmon served with seasonal vegetables.",
        "category": "Main Course",
        "price": Decimal("18.00"),
        "dietary_label": "Gluten-free",
        "sort_order": 3,
    },
    {
        "name": "Truffle Fries",
        "description": "Crispy fries finished with truffle oil and parmesan.",
        "category": "Sides",
        "price": Decimal("6.50"),
        "dietary_label": "Vegetarian",
        "sort_order": 4,
    },
    {
        "name": "Mango Lassi",
        "description": "A chilled blend of mango and creamy yoghurt.",
        "category": "Drinks",
        "price": Decimal("4.00"),
        "dietary_label": "Vegetarian",
        "sort_order": 5,
    },
    {
        "name": "Chocolate Lava Cake",
        "description": "Warm chocolate cake with a soft molten centre.",
        "category": "Desserts",
        "price": Decimal("7.50"),
        "dietary_label": "Vegetarian",
        "sort_order": 6,
    },
]


async def seed_menu_items() -> None:
    async with AsyncSessionLocal() as session:
        restaurant_result = await session.execute(
            select(Restaurant).where(
                Restaurant.slug == "the-bistro-downtown"
            )
        )

        restaurant = restaurant_result.scalar_one_or_none()

        if restaurant is None:
            raise RuntimeError(
                "Restaurant not found. Run the restaurant seed first."
            )

        existing_result = await session.execute(
            select(MenuItem.name).where(
                MenuItem.restaurant_id == restaurant.id
            )
        )

        existing_names = set(existing_result.scalars().all())
        created_count = 0

        for item_data in MENU_ITEMS:
            if item_data["name"] in existing_names:
                continue

            session.add(
                MenuItem(
                    restaurant_id=restaurant.id,
                    image_url=None,
                    is_available=True,
                    **item_data,
                )
            )

            created_count += 1

        await session.commit()

        print(
            f"Created {created_count} menu item(s) "
            f"for {restaurant.name}."
        )


async def main() -> None:
    try:
        await seed_menu_items()
    finally:
        await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())