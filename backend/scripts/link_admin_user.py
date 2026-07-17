import argparse
import asyncio
import sys
import uuid

from sqlalchemy import select

from app.db.session import AsyncSessionLocal, engine
from app.models.restaurant import Restaurant
from app.models.restaurant_member import RestaurantMember


if sys.platform == "win32":
    asyncio.set_event_loop_policy(
        asyncio.WindowsSelectorEventLoopPolicy()
    )


async def link_admin_user(auth_user_id: uuid.UUID) -> None:
    async with AsyncSessionLocal() as session:
        restaurant_result = await session.execute(
            select(Restaurant).where(
                Restaurant.slug == "the-bistro-downtown"
            )
        )

        restaurant = restaurant_result.scalar_one_or_none()

        if restaurant is None:
            raise RuntimeError("Restaurant not found. Run seed_restaurant first.")

        existing_result = await session.execute(
            select(RestaurantMember).where(
                RestaurantMember.restaurant_id == restaurant.id,
                RestaurantMember.auth_user_id == auth_user_id,
            )
        )

        if existing_result.scalar_one_or_none():
            print("User is already linked to this restaurant.")
            return

        member = RestaurantMember(
            restaurant_id=restaurant.id,
            auth_user_id=auth_user_id,
            role="admin",
        )

        session.add(member)
        await session.commit()

        print(
            "Admin linked:",
            auth_user_id,
            "→",
            restaurant.name,
        )


async def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--auth-user-id",
        required=True,
        type=uuid.UUID,
    )

    args = parser.parse_args()

    try:
        await link_admin_user(args.auth_user_id)
    finally:
        await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())