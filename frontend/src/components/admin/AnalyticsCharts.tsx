"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type DailySalesPoint = {
  date: string;
  orders: number;
  revenue: string;
};

type TopSellingItem = {
  item_name: string;
  quantity_sold: number;
  revenue: string;
};

type PeakHour = {
  hour: number;
  orders: number;
};

type Props = {
  dailySales: DailySalesPoint[];
  topSellingItems: TopSellingItem[];
  peakHours: PeakHour[];
};

export default function AnalyticsCharts({
  dailySales,
  topSellingItems,
  peakHours,
}: Props) {
  const revenueData = dailySales.map((day) => ({
    ...day,
    revenue: Number(day.revenue),
  }));

  const peakHourData = peakHours.map((hour) => ({
    hour: `${hour.hour}:00`,
    orders: hour.orders,
  }));

  return (
    <div className="mt-8 space-y-8">
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="font-heading text-2xl font-bold">
          Revenue Trend
        </h2>

        <div className="mt-6 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />

              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#855300"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="font-heading text-2xl font-bold">
            Top Selling Items
          </h2>

          <div className="mt-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topSellingItems}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="item_name" />
                <YAxis />
                <Tooltip />

                <Bar
                  dataKey="quantity_sold"
                  fill="#855300"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="font-heading text-2xl font-bold">
            Peak Ordering Hours
          </h2>

          <div className="mt-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={peakHourData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />

                <Bar
                  dataKey="orders"
                  fill="#855300"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
    </div>
  );
}