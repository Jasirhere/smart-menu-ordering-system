import {
  BellRing,
  ChefHat,
  Clock3,
  CreditCard,
  Sparkles,
  TrendingUp,
} from "lucide-react";

const statistics = [
  {
    label: "TODAY'S ORDERS",
    value: "42",
    detail: "12%",
    icon: TrendingUp,
    detailClass: "text-[#855300]",
  },
  {
    label: "TODAY'S REVENUE",
    value: "£1,240",
    detail: "",
    icon: CreditCard,
    detailClass: "text-[#855300]",
  },
  {
    label: "AVG PREP TIME",
    value: "12m",
    detail: "",
    icon: Clock3,
    detailClass: "text-[#944837]",
  },
  {
    label: "ACTIVE TABLES",
    value: "15",
    detail: "/ 24",
    icon: ChefHat,
    detailClass: "text-[#5f5e5a]",
  },
];

const orders = [
  {
    table: "12",
    items: "2x Wagyu Burger, 1x Truffle Fries",
    time: "Started 18m ago",
    state: "CRITICAL",
    badge: "OVERDUE",
    borderClass: "border-[#ba1a1a]",
    tableClass: "bg-[#ffdad6] text-[#93000a]",
    stateClass: "text-[#ba1a1a]",
    badgeClass: "bg-[#ba1a1a] text-white",
  },
  {
    table: "04",
    items: "1x Seafood Paella, 2x Chardonnay",
    time: "Started 10m ago",
    state: "PREPARING",
    badge: "AGING",
    borderClass: "border-[#e89611]",
    tableClass: "bg-[#ffddb8] text-[#2a1700]",
    stateClass: "text-[#855300]",
    badgeClass: "bg-[#e89611] text-[#583500]",
  },
  {
    table: "08",
    items: "1x Caesar Salad, 1x Sparkling Water",
    time: "Started 2m ago",
    state: "NEW",
    badge: "FRESH",
    borderClass: "border-green-600",
    tableClass: "bg-green-50 text-green-800",
    stateClass: "text-green-700",
    badgeClass: "bg-green-100 text-green-700",
  },
  {
    table: "21",
    items: "3x Grilled Salmon",
    time: "Started 4m ago",
    state: "",
    badge: "FRESH",
    borderClass: "border-green-600",
    tableClass: "bg-green-50 text-green-800",
    stateClass: "",
    badgeClass: "bg-green-100 text-green-700",
  },
];

export default function AdminDashboardPage() {
  const currentDate = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

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
              key={order.table}
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