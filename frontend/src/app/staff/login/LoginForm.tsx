"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, LockKeyhole, Mail } from "lucide-react";

import { createClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage("");
    setIsLoading(true);

    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMessage("Email or password is incorrect.");
      setIsLoading(false);
      return;
    }

    router.replace("/admin/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-semibold">
          Work email
        </label>

        <div className="flex items-center gap-3 rounded-xl border border-[#d8c3ae] bg-[#fcf9f8] px-4 focus-within:border-[var(--primary)]">
          <Mail size={18} className="text-[var(--text-muted)]" />

          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="admin@restaurant.com"
            className="w-full bg-transparent py-3.5 text-sm outline-none"
          />
        </div>
      </div>

      <div>
        <label htmlFor="password" className="mb-2 block text-sm font-semibold">
          Password
        </label>

        <div className="flex items-center gap-3 rounded-xl border border-[#d8c3ae] bg-[#fcf9f8] px-4 focus-within:border-[var(--primary)]">
          <LockKeyhole size={18} className="text-[var(--text-muted)]" />

          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            className="w-full bg-transparent py-3.5 text-sm outline-none"
          />
        </div>
      </div>

      {errorMessage && (
        <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? "Signing in..." : "Sign in to dashboard"}

        {!isLoading && <ArrowRight size={18} />}
      </button>
    </form>
  );
}