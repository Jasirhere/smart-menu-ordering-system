"use client";

import { useEffect, useState } from "react";

type RequestStatus = "new" | "accepted" | "completed";

const reasons = [
  { value: "water", label: "Water" },
  { value: "cutlery", label: "Cutlery" },
  { value: "bill", label: "Bill" },
  { value: "assistance", label: "Assistance" },
  { value: "order_issue", label: "Order issue" },
  { value: "custom", label: "Something else" },
];

export default function CallStaff({
  publicToken,
}: {
  publicToken: string;
}) {
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [requestToken, setRequestToken] = useState<string | null>(null);
  const [requestStatus, setRequestStatus] =
    useState<RequestStatus | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function callStaff() {
    setError(null);

    if (reason === "custom" && !message.trim()) {
      setError("Please tell us what you need.");
      return;
    }

    setIsSending(true);

    try {
      const response = await fetch(
        `${apiBaseUrl}/public/tables/${publicToken}/staff-requests`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reason,
            message: reason === "custom" ? message.trim() : null,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Could not call staff.");
      }

      const data = await response.json();

      setRequestToken(data.public_token);
      setRequestStatus(data.status);
    } catch {
      setError("Could not call staff. Please try again.");
    } finally {
      setIsSending(false);
    }
  }

  useEffect(() => {
    if (
      !requestToken ||
      requestStatus === "completed"
    ) {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const response = await fetch(
          `${apiBaseUrl}/public/tables/staff-requests/${requestToken}`
        );

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        setRequestStatus(data.status);
      } catch {
        // Keep current status and try again on next poll.
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [apiBaseUrl, requestToken, requestStatus]);

  function closeCompletedRequest() {
    setIsOpen(false);
    setReason(null);
    setMessage("");
    setRequestToken(null);
    setRequestStatus(null);
    setError(null);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 left-4 z-40 rounded-full bg-[#111827] px-5 py-3 font-semibold text-white shadow-lg"
      >
        {requestStatus === "new"
          ? "Staff Requested"
          : requestStatus === "accepted"
          ? "Staff On The Way"
          : "Call Staff"}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/40">
          <div className="w-full rounded-t-3xl bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">
                Call Staff
              </h2>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-2xl"
              >
                ×
              </button>
            </div>

            {!requestStatus && (
              <>
                <p className="mt-2 text-sm text-gray-500">
                  What can we help you with?
                </p>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  {reasons.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setReason(item.value)}
                      className={`rounded-xl border p-3 text-sm font-medium ${
                        reason === item.value
                          ? "border-black bg-black text-white"
                          : "bg-white"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                {reason === "custom" && (
                  <textarea
                    value={message}
                    onChange={(event) =>
                      setMessage(event.target.value)
                    }
                    placeholder="What do you need?"
                    className="mt-4 w-full rounded-xl border p-3"
                    rows={3}
                  />
                )}

                {error && (
                  <p className="mt-3 text-sm text-red-600">
                    {error}
                  </p>
                )}

                <button
                  type="button"
                  onClick={callStaff}
                  disabled={!reason || isSending}
                  className="mt-5 w-full rounded-xl bg-[#111827] px-4 py-3 font-semibold text-white disabled:opacity-40"
                >
                  {isSending
                    ? "Calling..."
                    : "Send Request"}
                </button>
              </>
            )}

            {requestStatus === "new" && (
              <div className="py-8 text-center">
                <h3 className="text-lg font-bold">
                  Request sent
                </h3>

                <p className="mt-2 text-gray-500">
                  Waiting for a staff member to accept.
                </p>
              </div>
            )}

            {requestStatus === "accepted" && (
              <div className="py-8 text-center">
                <h3 className="text-lg font-bold">
                  Staff is on the way
                </h3>

                <p className="mt-2 text-gray-500">
                  Your request has been accepted.
                </p>
              </div>
            )}

            {requestStatus === "completed" && (
              <div className="py-8 text-center">
                <h3 className="text-lg font-bold">
                  Request completed
                </h3>

                <button
                  type="button"
                  onClick={closeCompletedRequest}
                  className="mt-5 rounded-xl bg-[#111827] px-6 py-3 font-semibold text-white"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}