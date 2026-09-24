"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type StaffRequestStatus =
  | "new"
  | "accepted"
  | "completed";

type StaffRequest = {
  id: string;
  public_token: string;
  table_id: string;
  table_number: string;
  reason: string | null;
  message: string | null;
  status: StaffRequestStatus;
  created_at: string;
  accepted_at: string | null;
  completed_at: string | null;
};

const reasonLabels: Record<string, string> = {
  water: "Water",
  cutlery: "Cutlery",
  bill: "Bill",
  assistance: "Assistance",
  order_issue: "Order issue",
  custom: "Custom request",
};

function formatReason(reason: string | null) {
  if (!reason) {
    return "Staff assistance";
  }

  return reasonLabels[reason] ?? reason;
}

function elapsedTime(date: string) {
  const seconds = Math.max(
    0,
    Math.floor(
      (Date.now() - new Date(date).getTime()) / 1000
    )
  );

  if (seconds < 60) {
    return `${seconds}s ago`;
  }

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);

  return `${hours}h ago`;
}

export default function StaffRequestsBoard() {
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    "http://127.0.0.1:8000";

  const [requests, setRequests] = useState<
    StaffRequest[]
  >([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] = useState<
    string | null
  >(null);

  const [updatingId, setUpdatingId] =
    useState<string | null>(null);

  const [soundEnabled, setSoundEnabled] =
    useState(false);

  const audioContextRef =
    useRef<AudioContext | null>(null);

  const fetchRequests = useCallback(
    async () => {
      try {
        const response = await fetch(
          `${apiBaseUrl}/admin/staff-requests`,
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            "Could not load staff requests."
          );
        }

        const data = await response.json();

        setRequests(data);
        setError(null);
      } catch {
        setError(
          "Could not load staff requests."
        );
      } finally {
        setIsLoading(false);
      }
    },
    [apiBaseUrl]
  );

  useEffect(() => {
    fetchRequests();

    const interval = setInterval(
      fetchRequests,
      3000
    );

    return () => clearInterval(interval);
  }, [fetchRequests]);

  async function updateRequest(
    requestId: string,
    status: "accepted" | "completed"
  ) {
    setUpdatingId(requestId);
    setError(null);

    try {
      const response = await fetch(
        `${apiBaseUrl}/admin/staff-requests/${requestId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();

        throw new Error(
          data.detail ??
            "Could not update request."
        );
      }

      await fetchRequests();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Could not update request."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  async function enableSound() {
    const AudioContextClass =
      window.AudioContext ||
      (
        window as typeof window & {
          webkitAudioContext?: typeof AudioContext;
        }
      ).webkitAudioContext;

    if (!AudioContextClass) {
      return;
    }

    if (!audioContextRef.current) {
      audioContextRef.current =
        new AudioContextClass();
    }

    await audioContextRef.current.resume();

    setSoundEnabled(true);
  }

  const playAlertSound = useCallback(() => {
    const audioContext =
      audioContextRef.current;

    if (
      !soundEnabled ||
      !audioContext
    ) {
      return;
    }

    const oscillator =
      audioContext.createOscillator();

    const gain =
      audioContext.createGain();

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.frequency.value = 880;

    gain.gain.setValueAtTime(
      0.12,
      audioContext.currentTime
    );

    oscillator.start();

    oscillator.stop(
      audioContext.currentTime + 0.2
    );
  }, [soundEnabled]);

  const newRequests = requests.filter(
    (request) =>
      request.status === "new"
  );

  useEffect(() => {
    if (
      !soundEnabled ||
      newRequests.length === 0
    ) {
      return;
    }

    playAlertSound();

    const interval = setInterval(
      playAlertSound,
      1800
    );

    return () =>
      clearInterval(interval);
  }, [
    soundEnabled,
    newRequests.length,
    playAlertSound,
  ]);

  const acceptedRequests =
    requests.filter(
      (request) =>
        request.status === "accepted"
    );

  const completedRequests =
    requests.filter(
      (request) =>
        request.status === "completed"
    );

  if (isLoading) {
    return (
      <div className="rounded-2xl border bg-white p-6">
        Loading staff requests...
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">
            {newRequests.length} waiting
          </span>
        </div>

        <button
          type="button"
          onClick={enableSound}
          className="rounded-xl border bg-white px-4 py-2 text-sm font-semibold shadow-sm"
        >
          {soundEnabled
            ? "Sound alerts enabled ✓"
            : "Enable sound alerts"}
        </button>
      </div>

      {error && (
        <div className="mb-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <RequestColumn
          title="Needs Attention"
          requests={newRequests}
          updatingId={updatingId}
          actionLabel="Accept"
          onAction={(id) =>
            updateRequest(id, "accepted")
          }
          urgent
        />

        <RequestColumn
          title="Accepted"
          requests={acceptedRequests}
          updatingId={updatingId}
          actionLabel="Mark Done"
          onAction={(id) =>
            updateRequest(id, "completed")
          }
        />

        <RequestColumn
          title="Completed"
          requests={completedRequests}
          updatingId={updatingId}
        />
      </div>
    </div>
  );
}

function RequestColumn({
  title,
  requests,
  updatingId,
  actionLabel,
  onAction,
  urgent = false,
}: {
  title: string;
  requests: StaffRequest[];
  updatingId: string | null;
  actionLabel?: string;
  onAction?: (id: string) => void;
  urgent?: boolean;
}) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-bold">
          {title}
        </h2>

        <span className="rounded-full bg-gray-200 px-2 py-1 text-xs">
          {requests.length}
        </span>
      </div>

      <div className="space-y-3">
        {requests.length === 0 && (
          <div className="rounded-2xl border border-dashed bg-white p-5 text-center text-sm text-gray-400">
            No requests
          </div>
        )}

        {requests.map((request) => (
          <div
            key={request.id}
            className={`rounded-2xl border bg-white p-4 shadow-sm ${
              urgent
                ? "animate-pulse border-red-300"
                : ""
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-lg font-bold">
                  Table {request.table_number}
                </p>

                <p className="mt-1 font-medium">
                  {formatReason(
                    request.reason
                  )}
                </p>
              </div>

              <span className="text-xs text-gray-500">
                {elapsedTime(
                  request.created_at
                )}
              </span>
            </div>

            {request.message && (
              <div className="mt-3 rounded-xl bg-gray-50 p-3 text-sm text-gray-700">
                {request.message}
              </div>
            )}

            {request.status ===
              "accepted" &&
              request.accepted_at && (
                <p className="mt-3 text-xs text-emerald-700">
                  Accepted
                </p>
              )}

            {request.status ===
              "completed" && (
                <p className="mt-3 text-xs text-gray-500">
                  Completed
                </p>
              )}

            {actionLabel &&
              onAction && (
                <button
                  type="button"
                  disabled={
                    updatingId ===
                    request.id
                  }
                  onClick={() =>
                    onAction(request.id)
                  }
                  className="mt-4 w-full rounded-xl bg-black px-4 py-2.5 font-semibold text-white disabled:opacity-50"
                >
                  {updatingId ===
                  request.id
                    ? "Updating..."
                    : actionLabel}
                </button>
              )}
          </div>
        ))}
      </div>
    </section>
  );
}