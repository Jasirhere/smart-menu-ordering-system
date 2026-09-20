"use client";

import { useEffect, useState } from "react";
import {
  ExternalLink,
  LoaderCircle,
  QrCode,
  Table2,
} from "lucide-react";
import SavedTableQr from "@/components/admin/SavedTableQr";

type RestaurantTable = {
  id: string;
  table_number: number;
  public_token: string;
  is_active: boolean;
  created_at: string;
};

type ExistingTablesProps = {
  refreshKey: number;
};

export default function ExistingTables({
  refreshKey,
}: ExistingTablesProps) {
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    async function loadTables() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

        if (!apiBaseUrl) {
          throw new Error("Backend API URL is not configured.");
        }

        const response = await fetch(`${apiBaseUrl}/admin/tables`);

        const responseData = await response.json();

        if (!response.ok) {
          throw new Error(
            responseData.detail ?? "Unable to load tables.",
          );
        }

        if (!isCancelled) {
          setTables(responseData as RestaurantTable[]);
        }
      } catch (error) {
        if (!isCancelled) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Unable to load tables.",
          );
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    loadTables();

    return () => {
      isCancelled = true;
    };
  }, [refreshKey]);

  if (isLoading) {
    return (
      <article className="flex min-h-[520px] items-center justify-center rounded-2xl border border-[#d8c3ae] bg-white">
        <div className="text-center text-[#855300]">
          <LoaderCircle className="mx-auto animate-spin" size={30} />
          <p className="mt-3 text-sm font-semibold">Loading tables...</p>
        </div>
      </article>
    );
  }

  if (errorMessage) {
    return (
      <article className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
        {errorMessage}
      </article>
    );
  }

  if (tables.length === 0) {
    return (
      <article className="flex min-h-[520px] items-center justify-center rounded-2xl border border-dashed border-[#d8c3ae] bg-white/60 p-8 text-center">
        <div>
          <Table2
            size={34}
            className="mx-auto text-[#855300]"
          />

          <h2 className="font-heading mt-5 text-2xl font-semibold">
            No tables created yet
          </h2>

          <p className="mt-2 text-sm text-[#5f5e5a]">
            Your saved tables will appear here.
          </p>
        </div>
      </article>
    );
  }

  return (
    <article className="w-full min-w-0 rounded-2xl border border-[#d8c3ae] bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl font-semibold">
            Restaurant Tables
          </h2>

          <p className="mt-1 text-sm text-[#5f5e5a]">
            {tables.length} table{tables.length === 1 ? "" : "s"} created
          </p>
        </div>

        <QrCode size={25} className="text-[#855300]" />
      </div>

      <div className="grid w-full min-w-0 grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {tables.map((table) => (
          <section
            key={table.id}
            className="min-w-0 rounded-2xl border border-[#e8ddd2] bg-[#fcf9f8] p-5 transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#ffddb8] text-[#855300]">
                <Table2 size={22} />
              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  table.is_active
                    ? "bg-green-100 text-green-700"
                    : "bg-stone-200 text-stone-600"
                }`}
              >
                {table.is_active ? "Active" : "Inactive"}
              </span>
            </div>

            <h3 className="font-heading mt-5 text-3xl font-bold">
              Table {table.table_number}
            </h3>

            <p className="mt-2 text-xs text-[#5f5e5a]">
              Created{" "}
              {new Date(table.created_at).toLocaleDateString("en-GB")}
            </p>

            <p className="mt-3 overflow-hidden text-ellipsis whitespace-nowrap text-xs text-[#857462]">
              Token: {table.public_token}
            </p>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <SavedTableQr
                tableNumber={table.table_number}
                publicToken={table.public_token}
              />

              <a
                href={`/t/${table.public_token}`}
                target="_blank"
                rel="noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#d8c3ae] bg-white px-4 py-3 text-sm font-semibold text-[#855300]"
              >
                <ExternalLink size={16} />
                Open
              </a>
            </div>
          </section>
        ))}
      </div>
    </article>
  );
}