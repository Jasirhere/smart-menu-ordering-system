"use client";

import { useEffect, useMemo, useState } from "react";

type OrderItem = {
    item_name: string;
    unit_price: string;
    quantity: number;
};

type Order = {
    id: string;
    table_number: number;
    status: string;
    subtotal: string;
    created_at: string;
    items: OrderItem[];
};

const statuses = ["pending", "preparing", "ready", "served"];

const statusStyles = {
    pending: "border-orange-200 bg-orange-50",
    preparing: "border-blue-200 bg-blue-50",
    ready: "border-green-200 bg-green-50",
    served: "border-stone-200 bg-stone-100",
};

function formatPrice(value: string) {
    return new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: "GBP",
    }).format(Number(value));
}

function timeAgo(date: string) {
  const minutes = Math.floor(
    (Date.now() - new Date(date).getTime()) / 60000,
  );

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);

  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    async function updateStatus(orderId: string, nextStatus: string) {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

        const response = await fetch(
            `${apiBaseUrl}/admin/orders/${orderId}/status`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    status: nextStatus,
                }),
            },
        );

        if (!response.ok) {
            alert("Could not update order status.");
            return;
        }

        setOrders((currentOrders) =>
            currentOrders.map((order) =>
                order.id === orderId
                    ? { ...order, status: nextStatus }
                    : order,
            ),
        );

        setSelectedOrder((currentOrder) =>
            currentOrder?.id === orderId
                ? { ...currentOrder, status: nextStatus }
                : currentOrder,
        );
    }

    useEffect(() => {
        async function loadOrders() {
            try {
                const apiBaseUrl =
                    process.env.NEXT_PUBLIC_API_BASE_URL;

                const response = await fetch(
                    `${apiBaseUrl}/admin/orders`,
                );

                if (!response.ok) {
                    throw new Error("Unable to load orders.");
                }

                setOrders(await response.json());
            } catch { 
                setError("Unable to load orders.");
            } finally {
                setIsLoading(false);
            }
        }

        loadOrders();

        const interval = setInterval(loadOrders, 5000);

        return () => clearInterval(interval);
    }, []);

    const filteredOrders = orders.filter((order) => {
        const query = searchQuery.toLowerCase();

        return (
            order.id.toLowerCase().includes(query) ||
            String(order.table_number).includes(query)
        );
    });

    const groupedOrders = useMemo(
        () =>
            Object.fromEntries(
                statuses.map((status) => [
                    status,
                    filteredOrders.filter((order) => order.status === status),
                ]),
            ),
        [filteredOrders],
    );

    const activeOrders =
        groupedOrders.pending.length +
        groupedOrders.preparing.length +
        groupedOrders.ready.length;

    if (isLoading) {
        return <main className="p-10">Loading orders...</main>;
    }

    if (error) {
        return <main className="p-10 text-red-700">{error}</main>;
    }

    return (
        <main className="min-h-screen bg-[#fcf9f8] px-5 py-8 lg:px-12">
            <header className="mb-8">
                <h1 className="font-heading text-4xl font-bold">
                    Orders
                </h1>

                <p className="mt-2 text-[#5f5e5a]">
                    Manage and track restaurant orders.
                </p>
            </header>

            <input
                type="search"
                placeholder="Search table or order ID..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="mb-8 w-full max-w-md rounded-xl border bg-white px-4 py-3 outline-none"
            />

            <section className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
                <div className="rounded-xl border bg-white p-4">
                    <p className="text-xs text-gray-500">ACTIVE ORDERS</p>
                    <p className="mt-1 text-2xl font-bold">{activeOrders}</p>
                </div>

                <div className="rounded-xl border bg-white p-4">
                    <p className="text-xs text-gray-500">PENDING</p>
                    <p className="mt-1 text-2xl font-bold">
                        {groupedOrders.pending.length}
                    </p>
                </div>

                <div className="rounded-xl border bg-white p-4">
                    <p className="text-xs text-gray-500">PREPARING</p>
                    <p className="mt-1 text-2xl font-bold">
                        {groupedOrders.preparing.length}
                    </p>
                </div>

                <div className="rounded-xl border bg-white p-4">
                    <p className="text-xs text-gray-500">READY</p>
                    <p className="mt-1 text-2xl font-bold">
                        {groupedOrders.ready.length}
                    </p>
                </div>
            </section>

            <div className="grid gap-5 xl:grid-cols-4">
                {statuses.map((status) => (
                    <section
                        key={status}
                        className={`rounded-2xl border p-4 ${statusStyles[status as keyof typeof statusStyles]}`}
                    >
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="font-heading text-xl font-bold capitalize">
                                {status}
                            </h2>

                            <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold">
                                {groupedOrders[status].length}
                            </span>
                        </div>

                        <div className="space-y-4">
                            {groupedOrders[status].map((order) => (
                                <article
                                    key={order.id}
                                    onClick={() => setSelectedOrder(order)}
                                    className="cursor-pointer rounded-xl border border-[#e8ddd2] bg-white p-4 shadow-sm"
                                >
                                    <div className="flex justify-between">
                                        <div>
                                            <strong>
                                                Table {order.table_number}
                                            </strong>

                                            <p className="mt-1 text-xs text-[#5f5e5a]">
                                                #{order.id.slice(0, 8)} · {timeAgo(order.created_at)}
                                            </p>
                                        </div>

                                        <span className="text-xs text-[#5f5e5a]">
                                            {new Date(order.created_at).toLocaleTimeString(
                                                "en-GB",
                                                {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                },
                                            )}
                                        </span>
                                    </div>

                                    <div className="mt-4 space-y-1 text-sm">
                                        {order.items.map((item, index) => (
                                            <p key={index}>
                                                {item.quantity} × {item.item_name}
                                            </p>
                                        ))}
                                    </div>

                                    <div className="mt-4 border-t pt-3 font-bold">
                                        {formatPrice(order.subtotal)}
                                    </div>

                                    {order.status === "pending" && (
                                        <button
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                updateStatus(order.id, "preparing");
                                            }}
                                            className="mt-4 w-full rounded-xl bg-[#855300] px-4 py-3 text-sm font-semibold text-white"
                                        >
                                            Start Preparing
                                        </button>
                                    )}

                                    {order.status === "preparing" && (
                                        <button
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                updateStatus(order.id, "ready");
                                            }}
                                            className="mt-4 w-full rounded-xl bg-[#855300] px-4 py-3 text-sm font-semibold text-white"
                                        >
                                            Mark Ready
                                        </button>
                                    )}

                                    {order.status === "ready" && (
                                        <button
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                updateStatus(order.id, "served");
                                            }}
                                            className="mt-4 w-full rounded-xl bg-[#855300] px-4 py-3 text-sm font-semibold text-white"
                                        >
                                            Mark Served
                                        </button>
                                    )}
                                </article>
                            ))}
                        </div>
                    </section>
                ))}
            </div>

            {selectedOrder && (
                <div className="fixed inset-0 z-50">
                    <button
                        type="button"
                        onClick={() => setSelectedOrder(null)}
                        className="absolute inset-0 bg-black/30"
                        aria-label="Close order details"
                    />

                    <aside className="absolute right-0 top-0 h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-2xl">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-[#855300]">
                                    ORDER DETAILS
                                </p>

                                <h2 className="font-heading mt-1 text-3xl font-bold">
                                    Table {selectedOrder.table_number}
                                </h2>
                            </div>

                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        <p className="mt-3 break-all text-xs text-gray-500">
                            Order ID: {selectedOrder.id}
                        </p>

                        <div className="mt-6 rounded-xl bg-[#fcf9f8] p-4">
                            <p className="text-sm font-semibold capitalize">
                                Status: {selectedOrder.status}
                            </p>
                        </div>

                        <div className="mt-6 space-y-4">
                            {selectedOrder.items.map((item, index) => (
                                <div
                                    key={index}
                                    className="flex justify-between border-b pb-3"
                                >
                                    <div>
                                        <p className="font-semibold">
                                            {item.item_name}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Qty: {item.quantity}
                                        </p>
                                    </div>

                                    <p className="font-semibold">
                                        {formatPrice(
                                            (
                                                Number(item.unit_price) *
                                                item.quantity
                                            ).toFixed(2),
                                        )}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 flex justify-between border-t pt-5 text-xl font-bold">
                            <span>Total</span>
                            <span>{formatPrice(selectedOrder.subtotal)}</span>
                        </div>

                        {selectedOrder.status === "pending" && (
                            <button
                                onClick={() =>
                                    updateStatus(selectedOrder.id, "preparing")
                                }
                                className="mt-6 w-full rounded-xl bg-[#855300] px-4 py-3 font-semibold text-white"
                            >
                                Start Preparing
                            </button>
                        )}

                        {selectedOrder.status === "preparing" && (
                            <button
                                onClick={() =>
                                    updateStatus(selectedOrder.id, "ready")
                                }
                                className="mt-6 w-full rounded-xl bg-[#855300] px-4 py-3 font-semibold text-white"
                            >
                                Mark Ready
                            </button>
                        )}

                        {selectedOrder.status === "ready" && (
                            <button
                                onClick={() =>
                                    updateStatus(selectedOrder.id, "served")
                                }
                                className="mt-6 w-full rounded-xl bg-[#855300] px-4 py-3 font-semibold text-white"
                            >
                                Mark Served
                            </button>
                        )}
                    </aside>
                </div>
            )}
        </main>
    );
}
