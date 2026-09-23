"use client";

import { useState } from "react";

type ItemRating = {
  item_name: string;
  rating: number;
};

export type FeedbackItem = {
  id: string;
  order_id: string;
  table_number: number;
  overall_rating: number;
  comment: string | null;
  created_at: string;
  item_ratings: ItemRating[];
  is_public: boolean;
};

function stars(rating: number) {
  return "★".repeat(rating) + "☆".repeat(5 - rating);
}

export default function FeedbackList({
  feedback,
}: {
  feedback: FeedbackItem[];
}) {
  const [reviews, setReviews] = useState(feedback);

  async function toggleVisibility(review: FeedbackItem) {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/feedback/${review.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          is_public: !review.is_public,
        }),
      },
    );

    if (!response.ok) {
      alert("Could not update review.");
      return;
    }

    setReviews((current) =>
      current.map((item) =>
        item.id === review.id
          ? {
              ...item,
              is_public: !item.is_public,
            }
          : item,
      ),
    );
  }

  return (
    <div className="mt-8 space-y-5">
      {reviews.map((review) => (
        <article
          key={review.id}
          className="rounded-2xl border bg-white p-6 shadow-sm"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm text-[#5f5e5a]">
                Table {review.table_number}
              </p>

              <p className="mt-1 text-2xl text-amber-500">
                {stars(review.overall_rating)}
              </p>
            </div>

            <div className="text-right">
              <p className="text-sm text-[#5f5e5a]">
                {new Date(review.created_at).toLocaleString(
                  "en-GB",
                )}
              </p>

              <span className="mt-2 inline-block text-sm font-semibold">
                {review.is_public
                  ? "Public"
                  : "Private"}
              </span>
            </div>
          </div>

          {review.comment && (
            <p className="mt-5 leading-7">
              “{review.comment}”
            </p>
          )}

          {review.item_ratings.length > 0 && (
            <div className="mt-6 border-t pt-5">
              <p className="font-semibold">
                Item Ratings
              </p>

              <div className="mt-3 space-y-2">
                {review.item_ratings.map((item) => (
                  <div
                    key={item.item_name}
                    className="flex justify-between gap-4"
                  >
                    <span>{item.item_name}</span>

                    <span className="text-amber-500">
                      {stars(item.rating)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {review.comment && (
            <button
              onClick={() => toggleVisibility(review)}
              className="mt-6 rounded-xl bg-[#855300] px-5 py-2.5 font-semibold text-white"
            >
              {review.is_public
                ? "Unpublish Review"
                : "Publish Review"}
            </button>
          )}
        </article>
      ))}
    </div>
  );
}