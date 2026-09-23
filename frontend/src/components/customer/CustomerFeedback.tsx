"use client";

import { useState } from "react";

type OrderItem = {
  id: string;
  item_name: string;
};

type Props = {
  publicToken: string;
  items: OrderItem[];
  onSubmitted: () => void;
};

export default function CustomerFeedback({
  publicToken,
  items,
  onSubmitted,
}: Props) {
  const [overallRating, setOverallRating] = useState(0);
  const [itemRatings, setItemRatings] = useState<
    Record<string, number>
  >({});
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submitFeedback() {
    if (overallRating === 0) {
      alert("Please rate your overall experience.");
      return;
    }

    setIsSubmitting(true);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/orders/track/${publicToken}/feedback`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          overall_rating: overallRating,
          comment: comment || null,
          item_ratings: Object.entries(itemRatings).map(
            ([orderItemId, rating]) => ({
              order_item_id: orderItemId,
              rating,
            }),
          ),
        }),
      },
    );

    setIsSubmitting(false);

    if (!response.ok) {
      alert("Could not submit feedback.");
      return;
    }

    onSubmitted();
  }

  function Stars({
    value,
    onChange,
  }: {
    value: number;
    onChange: (rating: number) => void;
  }) {
    return (
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            type="button"
            onClick={() => onChange(rating)}
            className={`text-3xl ${
              rating <= value
                ? "text-amber-500"
                : "text-stone-300"
            }`}
          >
            ★
          </button>
        ))}
      </div>
    );
  }

  return (
    <section className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
      <h2 className="font-heading text-2xl font-bold">
        Rate your experience
      </h2>

      <p className="mt-1 text-sm text-[#5f5e5a]">
        Your feedback helps the restaurant improve.
      </p>

      <div className="mt-6">
        <p className="mb-2 font-semibold">
          Overall experience
        </p>

        <Stars
          value={overallRating}
          onChange={setOverallRating}
        />
      </div>

      <div className="mt-6 space-y-5">
        {items.map((item) => (
          <div key={item.id}>
            <p className="mb-2 font-semibold">
              {item.item_name}
            </p>

            <Stars
              value={itemRatings[item.id] || 0}
              onChange={(rating) =>
                setItemRatings((current) => ({
                  ...current,
                  [item.id]: rating,
                }))
              }
            />
          </div>
        ))}
      </div>

      <div className="mt-6">
        <label className="font-semibold">
          Comment
        </label>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Tell us about your experience..."
          className="mt-2 min-h-28 w-full rounded-xl border p-3"
          maxLength={2000}
        />
      </div>

      <button
        onClick={submitFeedback}
        disabled={isSubmitting}
        className="mt-6 w-full rounded-xl bg-[#855300] px-5 py-3 font-semibold text-white disabled:opacity-50"
      >
        {isSubmitting
          ? "Submitting..."
          : "Submit Feedback"}
      </button>
    </section>
  );
}