import TablesWorkspace from "@/components/admin/TablesWorkspace";
export default function AdminTablesPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-[1600px] bg-[#fcf9f8] px-5 py-8 sm:px-7 md:px-10 md:py-12 lg:px-12">
      <header className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
        <div>
          <h1 className="font-heading text-4xl font-bold text-[#1b1c1c] md:text-5xl">
            Tables & QR Codes
          </h1>

          <p className="mt-2 text-[#5f5e5a]">
            Create restaurant tables and generate a unique QR code for each
            table.
          </p>
        </div>

      </header>

      <TablesWorkspace />
    </main>
  );
}