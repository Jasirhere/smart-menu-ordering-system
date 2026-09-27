"use client";

import { useEffect, useState } from "react";
import {
  BellRing,
  LoaderCircle,
  ShoppingBag,
  Table2,
} from "lucide-react";
import Link from "next/link";
type FloorTable = {
  table_id: string;
  table_number: number;
  status: "free" | "occupied";
  active_session_id: string | null;
  active_orders: number;
  has_new_staff_request: boolean;
};

export default function AdminFloorPage() {
  const [tables, setTables] = useState<FloorTable[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadFloor() {
      const apiBaseUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL ??
        "http://127.0.0.1:8000";

      try {
        const response = await fetch(
          `${apiBaseUrl}/admin/floor`
        );

        if (!response.ok) {
          return;
        }

        const data: FloorTable[] =
          await response.json();

        if (!cancelled) {
          setTables(data);
          setIsLoading(false);
        }
      } catch {
        // Keep last known floor state
      }
    }

    loadFloor();

    const intervalId = window.setInterval(
      loadFloor,
      3000
    );

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <LoaderCircle
          className="animate-spin text-[#855300]"
          size={32}
        />
      </div>
    );
  }

  const occupiedCount = tables.filter(
    (table) => table.status === "occupied"
  ).length;

  return (
    <main className="p-6 lg:p-10">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-[#855300]">
          Live Operations
        </p>

        <h1 className="font-heading mt-2 text-4xl font-bold">
          Restaurant Floor
        </h1>

        <p className="mt-2 text-sm text-[#5f5e5a]">
          {occupiedCount} occupied ·{" "}
          {tables.length - occupiedCount} free
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {tables.map((table) => {
          const isOccupied =
            table.status === "occupied";

          return (
            <article
              key={table.table_id}
              className={`rounded-2xl border p-6 shadow-sm ${
                table.has_new_staff_request
                  ? "border-red-300 bg-red-50"
                  : isOccupied
                    ? "border-amber-200 bg-amber-50"
                    : "border-green-200 bg-white"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white">
                  <Table2 size={23} />
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    isOccupied
                      ? "bg-amber-200 text-amber-900"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {isOccupied ? "Occupied" : "Free"}
                </span>
              </div>

              <h2 className="font-heading mt-5 text-3xl font-bold">
                Table {table.table_number}
              </h2>

              <div className="mt-5 space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <ShoppingBag size={18} />
                  <span>
                    {table.active_orders} active order
                    {table.active_orders === 1
                      ? ""
                      : "s"}
                  </span>
                </div>

                {table.has_new_staff_request && (
                  <div className="flex items-center gap-3 rounded-xl bg-red-100 px-3 py-3 text-sm font-bold text-red-700">
                    <BellRing size={18} />
                    Staff requested
                  </div>
                )}
              </div>

              {table.active_orders > 0 && (
                <Link
                  href={`/admin/orders?table=${table.table_number}`}
                  className="mt-5 flex w-full items-center justify-center rounded-xl bg-[#27211e] px-4 py-3 text-sm font-semibold text-white transition hover:bg-black"
                >
                  View Orders
                </Link>
              )}
            </article>
          );
        })}
      </div>
    </main>
  );
}