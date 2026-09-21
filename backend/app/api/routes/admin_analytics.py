from decimal import Decimal
from datetime import datetime, timedelta, timezone
from typing import Literal
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.menu_item import MenuItem
from app.db.session import get_db
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.restaurant import Restaurant
from app.schemas.analytics import (
    AnalyticsSummaryResponse,
    TopSellingItem,
    DailySalesPoint,
    LowSellingItem,
    PeakHour,
    PeriodComparison,
)

router = APIRouter(
    prefix="/admin/analytics",
    tags=["Admin Analytics"],
)


async def get_dev_restaurant(db: AsyncSession) -> Restaurant:
    result = await db.execute(
        select(Restaurant).where(
            Restaurant.slug == "the-bistro-downtown"
        )
    )

    restaurant = result.scalar_one_or_none()

    if restaurant is None:
        raise HTTPException(
            status_code=404,
            detail="Restaurant not found",
        )

    return restaurant


@router.get(
    "/summary",
    response_model=AnalyticsSummaryResponse,
)
async def get_analytics_summary(
    period: Literal["7d", "30d", "all"] = "30d",
    db: AsyncSession = Depends(get_db),
):
    restaurant = await get_dev_restaurant(db)

    order_filters = [
        Order.restaurant_id == restaurant.id,
        Order.status != "cancelled",
    ]

    comparison = None

    if period != "all":
        days = 7 if period == "7d" else 30

        end_date = datetime.now(timezone.utc)
        start_date = end_date - timedelta(days=days)
        previous_start_date = start_date - timedelta(days=days)

        order_filters.append(
            Order.created_at >= start_date
        )

    totals_result = await db.execute(
        select(
            func.count(Order.id),
            func.coalesce(func.sum(Order.subtotal), 0),
        ).where(*order_filters)
    )

    total_orders, total_revenue = totals_result.one()

    total_orders = total_orders or 0
    total_revenue = Decimal(str(total_revenue or 0))

    average_order_value = (
        total_revenue / total_orders
        if total_orders > 0
        else Decimal("0.00")
    )

    if period != "all":
        previous_result = await db.execute(
            select(
                func.count(Order.id),
                func.coalesce(func.sum(Order.subtotal), 0),
            ).where(
                Order.restaurant_id == restaurant.id,
                Order.status != "cancelled",
                Order.created_at >= previous_start_date,
                Order.created_at < start_date,
            )
        )

        previous_orders, previous_revenue = previous_result.one()

        previous_orders = previous_orders or 0
        previous_revenue = Decimal(
            str(previous_revenue or 0)
        )

        previous_average_order_value = (
            previous_revenue / previous_orders
            if previous_orders > 0
            else Decimal("0.00")
        )

        def percentage_change(
            current: Decimal,
            previous: Decimal,
        ) -> Decimal | None:
            if previous == 0:
                return None

            return (
                ((current - previous) / previous)
                * Decimal("100")
            ).quantize(Decimal("0.01"))

        comparison = PeriodComparison(
            orders_change_percent=percentage_change(
                Decimal(total_orders),
                Decimal(previous_orders),
            ),
            revenue_change_percent=percentage_change(
                total_revenue,
                previous_revenue,
            ),
            average_order_value_change_percent=percentage_change(
                average_order_value,
                previous_average_order_value,
            ),
        )

    top_item_sales = (
        select(
            OrderItem.menu_item_id.label("menu_item_id"),
            func.sum(OrderItem.quantity).label("quantity_sold"),
            func.sum(
                OrderItem.unit_price * OrderItem.quantity
            ).label("revenue"),
        )
        .join(
            Order,
            OrderItem.order_id == Order.id,
        )
        .where(*order_filters)
        .group_by(OrderItem.menu_item_id)
        .subquery()
    )

    top_items_result = await db.execute(
        select(
            MenuItem.name.label("item_name"),
            top_item_sales.c.quantity_sold,
            top_item_sales.c.revenue,
        )
        .join(
            top_item_sales,
            MenuItem.id == top_item_sales.c.menu_item_id,
        )
        .where(
            MenuItem.restaurant_id == restaurant.id,
        )
        .order_by(
            top_item_sales.c.quantity_sold.desc()
        )
        .limit(5)
    )

    top_selling_items = [
        TopSellingItem(
            item_name=row.item_name,
            quantity_sold=row.quantity_sold,
            revenue=row.revenue,
        )
        for row in top_items_result.all()
    ]

    daily_sales_result = await db.execute(
        select(
            func.date(Order.created_at).label("date"),
            func.count(Order.id).label("orders"),
            func.coalesce(
                func.sum(Order.subtotal),
                0,
            ).label("revenue"),
        )
        .where(*order_filters)
        .group_by(func.date(Order.created_at))
        .order_by(func.date(Order.created_at))
    )

    daily_sales = [
        DailySalesPoint(
            date=str(row.date),
            orders=row.orders,
            revenue=row.revenue,
        )
        for row in daily_sales_result.all()
    ]

    peak_hours_result = await db.execute(
        select(
            func.extract(
                "hour",
                Order.created_at,
            ).label("hour"),
            func.count(Order.id).label("orders"),
        )
        .where(*order_filters)
        .group_by(
            func.extract("hour", Order.created_at)
        )
        .order_by(func.count(Order.id).desc())
        .limit(5)
    )

    peak_hours = [
        PeakHour(
            hour=int(row.hour),
            orders=row.orders,
        )
        for row in peak_hours_result.all()
    ]

    item_sales = (
        select(
            OrderItem.menu_item_id.label("menu_item_id"),
            func.sum(OrderItem.quantity).label("quantity_sold"),
            func.sum(
                OrderItem.unit_price * OrderItem.quantity
            ).label("revenue"),
        )
        .join(
            Order,
            OrderItem.order_id == Order.id,
        )
        .where(*order_filters)
        .group_by(OrderItem.menu_item_id)
        .subquery()
    )

    low_items_result = await db.execute(
        select(
            MenuItem.name.label("item_name"),
            func.coalesce(
                item_sales.c.quantity_sold,
                0,
            ).label("quantity_sold"),
            func.coalesce(
                item_sales.c.revenue,
                0,
            ).label("revenue"),
        )
        .outerjoin(
            item_sales,
            MenuItem.id == item_sales.c.menu_item_id,
        )
        .where(
            MenuItem.restaurant_id == restaurant.id,
        )
        .order_by(
            func.coalesce(
                item_sales.c.quantity_sold,
                0,
            ).asc(),
            func.coalesce(
                item_sales.c.revenue,
                0,
            ).asc(),
        )
        .limit(5)
    )

    low_selling_items = [
        LowSellingItem(
            item_name=row.item_name,
            quantity_sold=row.quantity_sold,
            revenue=row.revenue,
        )
        for row in low_items_result.all()
    ]

    return AnalyticsSummaryResponse(
        total_orders=total_orders,
        total_revenue=total_revenue,
        average_order_value=average_order_value,
        top_selling_items=top_selling_items,
        daily_sales=daily_sales,
        peak_hours=peak_hours,
        low_selling_items=low_selling_items,
        comparison=comparison,
    )