import AnalyticsCharts from "@/components/admin/AnalyticsCharts";
import Link from "next/link";

type Period = "7d" | "30d" | "all";

type TopSellingItem = {
  item_name: string;
  quantity_sold: number;
  revenue: string;
};

type DailySalesPoint = {
  date: string;
  orders: number;
  revenue: string;
};

type PeakHour = {
  hour: number;
  orders: number;
};

type LowSellingItem = {
  item_name: string;
  quantity_sold: number;
  revenue: string;
};

type PeriodComparison = {
  orders_change_percent: string | null;
  revenue_change_percent: string | null;
  average_order_value_change_percent: string | null;
};

type RatedItem = {
  item_name: string;
  average_rating: string;
  ratings_count: number;
};

type AnalyticsSummary = {
  total_orders: number;
  total_revenue: string;
  average_order_value: string;
  top_selling_items: TopSellingItem[];
  daily_sales: DailySalesPoint[];
  peak_hours: PeakHour[];
  low_selling_items: LowSellingItem[];
  comparison: PeriodComparison | null;
  total_feedback: number;
  average_rating: string | null;
  feedback_response_rate: string | null;
  best_rated_items: RatedItem[];
  low_rated_items: RatedItem[];
};

function formatCurrency(value: string) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(Number(value));
}

function comparisonStyle(value: string | null) {
  if (value === null) {
    return "text-[#5f5e5a]";
  }

  return Number(value) >= 0
    ? "text-green-700"
    : "text-red-600";
}

function formatComparison(value: string | null) {
  if (value === null) {
    return "No previous-period data";
  }

  const number = Number(value);

  if (number > 0) {
    return `↑ ${number.toFixed(1)}% vs previous period`;
  }

  if (number < 0) {
    return `↓ ${Math.abs(number).toFixed(1)}% vs previous period`;
  }

  return "0.0% vs previous period";
}

function formatHour(hour: number) {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "numeric",
    hour12: true,
  }).format(new Date(2026, 0, 1, hour));
}

async function getAnalytics(
  period: Period,
): Promise<AnalyticsSummary> {
  const response = await fetch(
    `${process.env.API_BASE_URL}/admin/analytics/summary?period=${period}`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("Could not load analytics");
  }

  return response.json();
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const params = await searchParams;

  const period: Period =
    params.period === "7d" || params.period === "all"
      ? params.period
      : "30d";

  const analytics = await getAnalytics(period);

  return (
    <main className="min-h-screen bg-[#fcf9f8] px-5 py-8 lg:px-12">
      <header className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-heading text-4xl font-bold">
            Restaurant Analytics
          </h1>

          <p className="mt-2 text-[#5f5e5a]">
            Understand your restaurant performance.
          </p>
        </div>

        <div className="flex rounded-xl border bg-white p-1">
          {[
            { label: "7 Days", value: "7d" },
            { label: "30 Days", value: "30d" },
            { label: "All Time", value: "all" },
          ].map((option) => (
            <Link
              key={option.value}
              href={`/admin/analytics?period=${option.value}`}
              className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                period === option.value
                  ? "bg-[#855300] text-white"
                  : "text-[#5f5e5a] hover:bg-[#f5eee8]"
              }`}
            >
              {option.label}
            </Link>
          ))}
        </div>
      </header>

      <section className="mt-8 grid gap-5 md:grid-cols-3">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-[#5f5e5a]">
            Total Orders
          </p>

          <p className="mt-2 text-3xl font-bold">
            {analytics.total_orders}
          </p>

          {analytics.comparison && (
            <p
              className={`mt-2 text-sm font-medium ${comparisonStyle(
                analytics.comparison.orders_change_percent,
              )}`}
            >
              {formatComparison(
                analytics.comparison.orders_change_percent,
              )}
            </p>
          )}
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-[#5f5e5a]">
            Total Revenue
          </p>

          <p className="mt-2 text-3xl font-bold">
            {formatCurrency(analytics.total_revenue)}
          </p>

          {analytics.comparison && (
            <p
              className={`mt-2 text-sm font-medium ${comparisonStyle(
                analytics.comparison.revenue_change_percent,
              )}`}
            >
              {formatComparison(
                analytics.comparison.revenue_change_percent,
              )}
            </p>
          )}
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-[#5f5e5a]">
            Average Order Value
          </p>

          <p className="mt-2 text-3xl font-bold">
            {formatCurrency(
              analytics.average_order_value,
            )}
          </p>

          {analytics.comparison && (
            <p
              className={`mt-2 text-sm font-medium ${comparisonStyle(
                analytics.comparison
                  .average_order_value_change_percent,
              )}`}
            >
              {formatComparison(
                analytics.comparison
                  .average_order_value_change_percent,
              )}
            </p>
          )}
        </div>
      </section>

      <section className="mt-6 grid gap-5 md:grid-cols-3">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-[#5f5e5a]">
            Average Rating
          </p>

          <p className="mt-2 text-3xl font-bold">
            {analytics.average_rating
              ? `${Number(analytics.average_rating).toFixed(1)} ★`
              : "No ratings"}
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-[#5f5e5a]">
            Total Feedback
          </p>

          <p className="mt-2 text-3xl font-bold">
            {analytics.total_feedback}
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-[#5f5e5a]">
            Feedback Response Rate
          </p>

          <p className="mt-2 text-3xl font-bold">
            {analytics.feedback_response_rate
              ? `${Number(
                  analytics.feedback_response_rate,
                ).toFixed(1)}%`
              : "N/A"}
          </p>
        </div>
      </section>

      <AnalyticsCharts
        dailySales={analytics.daily_sales}
        topSellingItems={analytics.top_selling_items}
        peakHours={analytics.peak_hours}
      />

      <section className="mt-8">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="font-heading text-2xl font-bold">
            Daily Sales
          </h2>

          <div className="mt-5 space-y-4">
            {analytics.daily_sales.map((day) => (
              <div
                key={day.date}
                className="flex items-center justify-between border-b pb-4 last:border-0"
              >
                <div>
                  <p className="font-semibold">{day.date}</p>
                  <p className="text-sm text-[#5f5e5a]">
                    {day.orders} orders
                  </p>
                </div>

                <strong>
                  {formatCurrency(day.revenue)}
                </strong>
              </div>
            ))}
          </div>
        </div>

      </section>

      <section className="mt-8 rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="font-heading text-2xl font-bold">
          Low Selling Items
        </h2>

        <p className="mt-1 text-sm text-[#5f5e5a]">
          Items with the lowest sales volume.
        </p>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b text-sm text-[#5f5e5a]">
                <th className="pb-3">Item</th>
                <th className="pb-3">Quantity Sold</th>
                <th className="pb-3">Revenue</th>
              </tr>
            </thead>

            <tbody>
              {analytics.low_selling_items.map((item) => (
                <tr
                  key={item.item_name}
                  className="border-b last:border-0"
                >
                  <td className="py-4 font-semibold">
                    {item.item_name}
                  </td>

                  <td className="py-4">
                    {item.quantity_sold}
                  </td>

                  <td className="py-4">
                    {formatCurrency(item.revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="font-heading text-2xl font-bold">
            Best Rated Items
          </h2>

          <div className="mt-5 space-y-4">
            {analytics.best_rated_items.map((item) => (
              <div
                key={item.item_name}
                className="flex justify-between border-b pb-3 last:border-0"
              >
                <span className="font-semibold">
                  {item.item_name}
                </span>

                <span>
                  {Number(item.average_rating).toFixed(1)} ★ {" "}
                  ({item.ratings_count})
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="font-heading text-2xl font-bold">
            Needs Attention
          </h2>

          <div className="mt-5 space-y-4">
            {analytics.low_rated_items.map((item) => (
              <div
                key={item.item_name}
                className="flex justify-between border-b pb-3 last:border-0"
              >
                <span className="font-semibold">
                  {item.item_name}
                </span>

                <span>
                  {Number(item.average_rating).toFixed(1)} ★ {" "}
                  ({item.ratings_count})
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}