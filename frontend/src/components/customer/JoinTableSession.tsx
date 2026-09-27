"use client";

import { useState } from "react";

type JoinResult = {
  session_public_token: string;
  participant_public_token: string;
  display_name: string;
  table_number: number;
};

export default function JoinTableSession({
  publicToken,
  onJoined,
}: {
  publicToken: string;
  onJoined: (result: JoinResult) => void;
}) {
  const [name, setName] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    "http://127.0.0.1:8000";

  async function join() {
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Please enter your name.");
      return;
    }

    setIsJoining(true);
    setError(null);

    try {
      const response = await fetch(
        `${apiBaseUrl}/public/tables/${publicToken}/session/join`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            display_name: trimmedName,
          }),
        }
      );

      if (!response.ok) {
        throw new Error();
      }

      const data: JoinResult = await response.json();

      onJoined(data);
    } catch {
      setError("Could not join this table.");
    } finally {
      setIsJoining(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-5">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
        <h2 className="text-2xl font-bold">
          Join this table
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          Enter your name so everyone can see who added what.
        </p>

        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              join();
            }
          }}
          placeholder="Your name"
          maxLength={50}
          className="mt-5 w-full rounded-xl border px-4 py-3 outline-none focus:border-black"
        />

        {error && (
          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={join}
          disabled={isJoining}
          className="mt-4 w-full rounded-xl bg-black px-4 py-3 font-semibold text-white disabled:opacity-50"
        >
          {isJoining ? "Joining..." : "Join Table"}
        </button>
      </div>
    </div>
  );
}