import asyncio
import sys


if sys.platform == "win32":
    asyncio.set_event_loop_policy(
        asyncio.WindowsSelectorEventLoopPolicy()
    )


from sqlalchemy import select

from app.db.session import AsyncSessionLocal, engine
from app.models.restaurant import Restaurant

async def seed_restaurant() -> None:
    async with AsyncSessionLocal() as session:
        statement = select(Restaurant).where(
            Restaurant.slug == "the-bistro-downtown"
        )

        result = await session.execute(statement)
        existing_restaurant = result.scalar_one_or_none()

        if existing_restaurant:
            print(
                "Restaurant already exists:",
                existing_restaurant.name,
                existing_restaurant.id,
            )
            return

        restaurant = Restaurant(
            name="The Bistro Downtown",
            slug="the-bistro-downtown",
        )

        session.add(restaurant)
        await session.commit()
        await session.refresh(restaurant)

        print(
            "Restaurant created:",
            restaurant.name,
            restaurant.id,
        )


async def main() -> None:
    try:
        await seed_restaurant()
    finally:
        await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())