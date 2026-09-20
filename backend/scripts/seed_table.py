import asyncio
import sys

from sqlalchemy import select

from app.db.session import AsyncSessionLocal, engine
from app.models.restaurant import Restaurant
from app.models.restaurant_table import RestaurantTable


if sys.platform == "win32":
    asyncio.set_event_loop_policy(
        asyncio.WindowsSelectorEventLoopPolicy()
    )


async def seed_table() -> None:
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(Restaurant).where(
                Restaurant.slug == "the-bistro-downtown"
            )
        )

        restaurant = result.scalar_one_or_none()

        if restaurant is None:
            raise RuntimeError("Restaurant not found.")

        existing_result = await session.execute(
            select(RestaurantTable).where(
                RestaurantTable.restaurant_id == restaurant.id,
                RestaurantTable.table_number == 1,
            )
        )

        existing_table = existing_result.scalar_one_or_none()

        if existing_table:
            print(
                "Table already exists:",
                existing_table.table_number,
                existing_table.public_token,
            )
            return

        table = RestaurantTable(
            restaurant_id=restaurant.id,
            table_number=1,
        )

        session.add(table)
        await session.commit()
        await session.refresh(table)

        print(
            "Table created:",
            table.table_number,
            table.public_token,
        )


async def main() -> None:
    try:
        await seed_table()
    finally:
        await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())