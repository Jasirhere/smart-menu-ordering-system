import Link from "next/link";
import LoginForm from "./LoginForm";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Building2,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";

export default function StaffLoginPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f7f1e8] px-5 py-8 text-[#1b1c1c] sm:px-8 lg:px-12">
      {/* Background decoration */}
      <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-[#ffddb8]/60 blur-[120px]" />
      <div className="absolute -right-40 bottom-0 h-[420px] w-[420px] rounded-full bg-[#944837]/15 blur-[130px]" />

      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "radial-gradient(#855300 0.8px, transparent 0.8px)",
          backgroundSize: "18px 18px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl">
        {/* Header */}
        <header className="flex items-center justify-between">
          <Link
            href="/"
            className="font-heading text-2xl font-bold text-[var(--primary)] sm:text-3xl"
          >
            TableMind
          </Link>

          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-semibold text-[var(--primary)] transition hover:gap-3"
          >
            <ArrowLeft size={17} />
            Back to website
          </Link>
        </header>

        <section className="grid min-h-[calc(100vh-100px)] items-center gap-14 py-12 lg:grid-cols-[1.05fr_0.95fr]">
          {/* Left content */}
          <div className="max-w-xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#ffddb8] px-3 py-1.5 text-xs font-semibold text-[#583500]">
              <Sparkles size={15} />
              Restaurant Operations Hub
            </div>

            <h1 className="font-heading text-5xl leading-[1.08] font-bold sm:text-6xl">
              Run every table from{" "}
              <span className="italic text-[var(--primary)]">
                one calm dashboard.
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-8 text-[var(--text-muted)]">
              Manage live orders, menu items, tables and restaurant activity
              without switching between multiple systems.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-[#d8c3ae] bg-white/60 p-5 backdrop-blur">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ffddb8] text-[var(--primary)]">
                  <UtensilsCrossed size={20} />
                </div>

                <h2 className="mt-4 font-semibold">Live order control</h2>

                <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
                  Track pending, preparing, ready and served orders.
                </p>
              </div>

              <div className="rounded-2xl border border-[#d8c3ae] bg-white/60 p-5 backdrop-blur">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ffddb8] text-[var(--primary)]">
                  <BadgeCheck size={20} />
                </div>

                <h2 className="mt-4 font-semibold">One secure workspace</h2>

                <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
                  Each restaurant sees only its own menu, tables and orders.
                </p>
              </div>
            </div>
          </div>

          {/* Login card */}
          <div className="mx-auto w-full max-w-md">
            <div className="rounded-[2rem] border border-[#d8c3ae] bg-white/80 p-7 shadow-[0_30px_80px_rgba(83,68,52,0.16)] backdrop-blur-xl sm:p-9">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--primary)] text-white">
                <Building2 size={23} />
              </div>

              <h2 className="font-heading mt-7 text-3xl font-bold">
                Staff Portal
              </h2>

              <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
                Enter your restaurant ID and password to access the staff dashboard.
              </p>

              <LoginForm />

              <div className="mt-7 flex items-start gap-3 rounded-xl bg-[#f6f3f2] p-4">
                <ShieldCheck
                  size={19}
                  className="mt-0.5 shrink-0 text-[var(--primary)]"
                />

                <p className="text-xs leading-5 text-[var(--text-muted)]">
                  Staff accounts are created or invited by the restaurant
                  administrator. Authentication will be connected during the
                  Supabase Auth slice.
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-center gap-2 text-xs text-[var(--text-muted)]">
              <span className="h-2 w-2 rounded-full bg-green-700" />
              TableMind services operational
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}