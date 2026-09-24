import StaffRequestsBoard from "@/components/admin/StaffRequestsBoard";

export default function StaffRequestsPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">
            Staff Requests
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Live requests from restaurant tables.
          </p>
        </div>

        <StaffRequestsBoard />
      </div>
    </main>
  );
}