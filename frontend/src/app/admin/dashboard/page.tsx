import {
  BellRing,
  ChefHat,
  Clock3,
  CreditCard,
  Sparkles,
  TrendingUp,
} from "lucide-react";

type DashboardSummary = {
  todays_orders: number;
  todays_revenue: string;
  active_orders: number;
  recent_orders: {
    id: string;
    table_number: number;
    status: string;
    subtotal: string;
    created_at: string;
    items: {
      item_name: string;
      unit_price: string;
      quantity: number;
    }[];
  }[];
};

async function getDashboardSummary(): Promise<DashboardSummary> {
  const apiBaseUrl = process.env.API_BASE_URL;

  const response = await fetch(
    `${apiBaseUrl}/admin/dashboard/summary`,
    { cache: "no-store" },
  );

  if (!response.ok) {
    throw new Error("Unable to load dashboard.");
  }

  return response.json();
}

export default async function AdminDashboardPage() {
  const summary = await getDashboardSummary();

  const currentDate = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  const statistics = [
    {
      label: "TODAY'S ORDERS",
      value: String(summary.todays_orders),
      detail: "",
      icon: TrendingUp,
      detailClass: "text-[#855300]",
    },
    {
      label: "TODAY'S REVENUE",
      value: new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: "GBP",
      }).format(Number(summary.todays_revenue)),
      detail: "",
      icon: CreditCard,
      detailClass: "text-[#855300]",
    },
    {
      label: "ACTIVE ORDERS",
      value: String(summary.active_orders),
      detail: "",
      icon: Clock3,
      detailClass: "text-[#944837]",
    },
    {
      label: "RECENT ORDERS",
      value: String(summary.recent_orders.length),
      detail: "",
      icon: ChefHat,
      detailClass: "text-[#5f5e5a]",
    },
  ];

  const orders = summary.recent_orders.map((order) => {
    const items = order.items
      .map((item) => `${item.quantity}x ${item.item_name}`)
      .join(", ");

    const statusStyles = {
      pending: {
        state: "PENDING",
        badge: "NEW",
        borderClass: "border-orange-500",
        tableClass: "bg-orange-100 text-orange-800",
        stateClass: "text-orange-700",
        badgeClass: "bg-orange-100 text-orange-700",
      },
      preparing: {
        state: "PREPARING",
        badge: "COOKING",
        borderClass: "border-blue-500",
        tableClass: "bg-blue-100 text-blue-800",
        stateClass: "text-blue-700",
        badgeClass: "bg-blue-100 text-blue-700",
      },
      ready: {
        state: "READY",
        badge: "READY",
        borderClass: "border-green-600",
        tableClass: "bg-green-100 text-green-800",
        stateClass: "text-green-700",
        badgeClass: "bg-green-100 text-green-700",
      },
      served: {
        state: "SERVED",
        badge: "DONE",
        borderClass: "border-stone-400",
        tableClass: "bg-stone-100 text-stone-700",
        stateClass: "text-stone-600",
        badgeClass: "bg-stone-100 text-stone-600",
      },
    };

    const style =
      statusStyles[order.status as keyof typeof statusStyles];

    return {
      id: order.id,
      table: String(order.table_number),
      items,
      time: new Date(order.created_at).toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      ...style,
    };
  });

  return (
    <main className="min-h-screen bg-[#fcf9f8] px-5 py-8 md:px-10 md:py-12 lg:px-12">
      {/* Header */}
      <header className="mb-12 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="font-heading text-4xl font-bold text-[#1b1c1c] md:text-5xl">
            Service Overview
          </h1>

          <p className="mt-2 text-[#5f5e5a]">
            Real-time hospitality performance for {currentDate}
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-full bg-[#eae7e7] px-4 py-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[#855300]" />

          <span className="text-xs font-semibold tracking-wider text-[#534434]">
            LIVE STREAM
          </span>
        </div>
      </header>

      {/* Statistics */}
      <section className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {statistics.map((statistic) => {
          const Icon = statistic.icon;

          return (
            <article
              key={statistic.label}
              className="rounded-xl border border-[#d8c3ae] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <p className="text-xs font-semibold tracking-wider text-[#5f5e5a]">
                {statistic.label}
              </p>

              <div className="mt-2 flex items-end gap-2">
                <p className="font-heading text-3xl font-semibold text-[#1b1c1c]">
                  {statistic.value}
                </p>

                <div
                  className={`mb-1 flex items-center gap-1 text-sm font-semibold ${statistic.detailClass}`}
                >
                  <Icon size={16} />
                  {statistic.detail}
                </div>
              </div>
            </article>
          );
        })}
      </section>

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-3">
        {/* Live kitchen feed */}
        <section className="space-y-4 xl:col-span-2">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold tracking-wider text-[#1b1c1c]">
              LIVE KITCHEN FEED
            </h2>

            <span className="text-xs text-[#5f5e5a]">
              Sorted by urgency
            </span>
          </div>

          {orders.map((order) => (
            <article
              key={order.id}
              className={`flex cursor-pointer flex-col gap-4 rounded-xl border-l-4 bg-white p-4 shadow-sm transition hover:translate-x-1 sm:flex-row sm:items-center ${order.borderClass}`}
            >
              <div
                className={`flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-lg ${order.tableClass}`}
              >
                <span className="text-[10px] font-semibold tracking-wider">
                  TABLE
                </span>

                <span className="font-heading text-2xl font-bold">
                  {order.table}
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-semibold text-[#1b1c1c]">
                  {order.items}
                </p>

                <p className="mt-1 text-sm text-[#5f5e5a]">
                  {order.time}

                  {order.state && (
                    <>
                      {" "}
                      ·{" "}
                      <span className={`font-bold ${order.stateClass}`}>
                        {order.state}
                      </span>
                    </>
                  )}
                </p>
              </div>

              <span
                className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${order.badgeClass}`}
              >
                {order.badge}
              </span>
            </article>
          ))}
        </section>

        {/* Right widgets */}
        <aside className="space-y-6">
          {/* AI widget */}
          <section className="intelligence-shimmer rounded-2xl border border-[#855300]/10 bg-white/70 p-6 shadow-sm backdrop-blur">
            <div className="mb-5 flex items-center gap-2 text-[#855300]">
              <Sparkles size={19} fill="currentColor" />

              <h2 className="text-sm font-bold tracking-[0.15em]">
                AI OPS ASSISTANT
              </h2>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border border-[#855300]/10 bg-white/60 p-4">
                <p className="text-sm font-medium leading-6 italic text-[#1b1c1c]">
                  “Chicken Karahi running low based on today&apos;s pace”
                </p>

                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    className="rounded-md bg-[#ffddb8] px-3 py-1.5 text-xs font-bold text-[#855300]"
                  >
                    Alert Chef
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-[#944837]/10 bg-white/60 p-4">
                <p className="text-sm font-medium leading-6 italic text-[#1b1c1c]">
                  “Table 12 waiting 15m — check-in recommended.”
                </p>

                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    className="flex items-center gap-1 rounded-md bg-[#ffdad2] px-3 py-1.5 text-xs font-bold text-[#944837]"
                  >
                    <BellRing size={13} />
                    Notify Server
                  </button>
                </div>
              </div>

              <p className="border-t border-[#d8c3ae]/40 pt-3 text-center text-[11px] text-[#5f5e5a]">
                AI analysis updated 30s ago
              </p>
            </div>
          </section>

          {/* Kitchen load */}
          <section className="rounded-2xl bg-[#eae7e7] p-6">
            <h2 className="text-sm font-bold tracking-wider text-[#1b1c1c]">
              KITCHEN LOAD
            </h2>

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#f0eded]">
              <div className="h-full w-[78%] bg-[#855300]" />
            </div>

            <div className="mt-2 flex justify-between text-sm text-[#5f5e5a]">
              <span>78% Capacity</span>
              <span>High Load</span>
            </div>
          </section>

          {/* Visual card */}
          <section
            className="relative h-48 overflow-hidden rounded-2xl bg-cover bg-center"
            style={{
              backgroundImage:
                "linear-gradient(to top, rgba(27,28,28,0.8), transparent), url('https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=900&q=80')",
            }}
          >
            <p className="absolute bottom-5 left-5 font-heading text-xl italic text-white">
              “Excellence is in the details.”
            </p>
          </section>
        </aside>
      </div>
    </main>
  );
}