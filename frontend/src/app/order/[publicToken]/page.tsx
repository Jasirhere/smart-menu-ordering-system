"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import CustomerFeedback from "@/components/customer/CustomerFeedback";
type TrackingItem = {
    id: string;
    item_name: string;
    unit_price: string;
    quantity: number;
};

type TrackingOrder = {
    public_token: string;
    status: string;
    subtotal: string;
    table_number: number;
    created_at: string;
    items: TrackingItem[];
    feedback_submitted: boolean;
    feedback_available: boolean;
    feedback_deadline: string | null;
};

export default function OrderTrackingPage() {
    const params = useParams<{ publicToken: string }>();
    const publicToken = params.publicToken;

    const [order, setOrder] = useState<TrackingOrder | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showFeedbackModal, setShowFeedbackModal] =
        useState(false);
    const [feedbackPromptDismissed, setFeedbackPromptDismissed] =
        useState(false);

    async function loadOrder() {
        const apiBaseUrl =
            process.env.NEXT_PUBLIC_API_BASE_URL;

        const response = await fetch(
            `${apiBaseUrl}/orders/track/${publicToken}`,
        );

        if (!response.ok) {
            return;
        }

        const data = await response.json();

        setOrder(data);
        setIsLoading(false);
    }

    useEffect(() => {
        loadOrder();

        const interval = setInterval(
            loadOrder,
            5000,
        );

        return () => clearInterval(interval);
    }, [publicToken]);

    useEffect(() => {
        if (
            order?.feedback_available &&
            !feedbackPromptDismissed
        ) {
            setShowFeedbackModal(true);
        }
    }, [order?.feedback_available, feedbackPromptDismissed]);

    if (isLoading) {
        return (
            <main className="p-10">
                Loading your order...
            </main>
        );
    }

    if (!order) {
        return (
            <main className="p-10">
                Order not found.
            </main>
        );
    }

    const steps = [
        { key: "pending", label: "Order Received" },
        { key: "preparing", label: "Preparing" },
        { key: "ready", label: "Ready" },
        { key: "served", label: "Served" },
    ];

    const currentStep = steps.findIndex(
        (step) => step.key === order.status,
    );

    return (
        <main className="min-h-screen bg-[#fcf9f8] px-5 py-10">
            <div className="mx-auto max-w-xl">
                <h1 className="font-heading text-4xl font-bold">
                    Your Order
                </h1>

                <p className="mt-2 text-[#5f5e5a]">
                    Table {order.table_number}
                </p>

                <section className="mt-8 rounded-2xl border bg-white p-6 shadow-sm">
                    <p className="text-sm text-[#5f5e5a]">
                        Order Progress
                    </p>

                    <p className="mt-2 text-2xl font-bold capitalize">
                        {order.status}
                    </p>

                    <div className="mt-6">
                        <div className="flex items-start justify-between">
                            {steps.map((step, index) => {
                                const completed = index <= currentStep;

                                return (
                                    <div
                                        key={step.key}
                                        className="flex flex-1 flex-col items-center text-center"
                                    >
                                        <div
                                            className={`flex h-10 w-10 items-center justify-center rounded-full font-bold ${completed
                                                ? "bg-[#855300] text-white"
                                                : "bg-stone-200 text-stone-500"
                                                }`}
                                        >
                                            {completed ? "✓" : index + 1}
                                        </div>

                                        <span
                                            className={`mt-2 text-xs font-semibold sm:text-sm ${completed
                                                ? "text-[#855300]"
                                                : "text-stone-400"
                                                }`}
                                        >
                                            {step.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-4 h-2 overflow-hidden rounded-full bg-stone-200">
                            <div
                                className="h-full bg-[#855300] transition-all duration-500"
                                style={{
                                    width: `${((currentStep + 1) / steps.length) * 100}%`,
                                }}
                            />
                        </div>
                    </div>
                </section>

                <section className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
                    <h2 className="font-heading text-2xl font-bold">
                        Order Details
                    </h2>

                    <div className="mt-5 space-y-4">
                        {order.items.map((item) => (
                            <div
                                key={item.item_name}
                                className="flex items-center justify-between"
                            >
                                <span>
                                    {item.quantity} × {item.item_name}
                                </span>

                                <span>
                                    £
                                    {(
                                        Number(item.unit_price) *
                                        item.quantity
                                    ).toFixed(2)}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 flex justify-between border-t pt-4 font-bold">
                        <span>Total</span>

                        <span>
                            £{Number(order.subtotal).toFixed(2)}
                        </span>
                    </div>
                </section>
                {order.feedback_available && (
                    <button
                        onClick={() => setShowFeedbackModal(true)}
                        className="mt-6 w-full rounded-2xl border bg-white p-5 text-left shadow-sm"
                    >
                        <p className="font-semibold">
                            ⭐ Rate your experience
                        </p>

                        <p className="mt-1 text-sm text-[#5f5e5a]">
                            Tell us how your meal was.
                        </p>
                    </button>
                )}

                {order.feedback_submitted && (
                    <section className="mt-6 rounded-2xl border bg-white p-6 text-center shadow-sm">
                        <p className="text-lg font-semibold">
                            ✓ Thanks for your feedback
                        </p>
                    </section>
                )}
            </div>

            {showFeedbackModal && order.feedback_available && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-[#fcf9f8] p-4">
                        <div className="mb-2 flex justify-end">
                            <button
                                onClick={() => {
                                    setShowFeedbackModal(false);
                                    setFeedbackPromptDismissed(true);
                                }}
                                className="rounded-lg px-3 py-2 text-lg"
                            >
                                ✕
                            </button>
                        </div>

                        <CustomerFeedback
                            publicToken={order.public_token}
                            items={order.items}
                            onSubmitted={() => {
                                setShowFeedbackModal(false);
                                loadOrder();
                            }}
                        />
                    </div>
                </div>
            )}
        </main>
    );
}