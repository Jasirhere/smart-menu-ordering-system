import LogoutButton from "@/components/auth/LogoutButton";
export default function AdminDashboardPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f1e8]">
      <div className="rounded-3xl border border-[#d8c3ae] bg-white p-10 shadow-xl">
        <h1 className="font-heading text-4xl font-bold text-[var(--primary)]">
          Admin Dashboard
        </h1>

        <p className="mt-3 text-[var(--text-muted)]">
          Login successful. Dashboard UI will be built next.
        </p>
        <div className="mt-5">
          <LogoutButton />
        </div>
      </div>
    </main>
  );
}