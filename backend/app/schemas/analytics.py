from decimal import Decimal

from pydantic import BaseModel


class TopSellingItem(BaseModel):
    item_name: str
    quantity_sold: int
    revenue: Decimal


class DailySalesPoint(BaseModel):
    date: str
    orders: int
    revenue: Decimal


class PeakHour(BaseModel):
    hour: int
    orders: int


class LowSellingItem(BaseModel):
    item_name: str
    quantity_sold: int
    revenue: Decimal

class PeriodComparison(BaseModel):
    orders_change_percent: Decimal | None
    revenue_change_percent: Decimal | None
    average_order_value_change_percent: Decimal | None

class AnalyticsSummaryResponse(BaseModel):
    total_orders: int
    total_revenue: Decimal
    average_order_value: Decimal
    top_selling_items: list[TopSellingItem]
    daily_sales: list[DailySalesPoint]
    peak_hours: list[PeakHour]
    low_selling_items: list[LowSellingItem]
    comparison: PeriodComparison | None = None