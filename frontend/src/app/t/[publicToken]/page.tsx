import {
  CheckCircle2,
  QrCode,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";

type PublicTableResponse = {
  restaurant_name: string;
  restaurant_slug: string;
  table_number: number;
};

type PublicTablePageProps = {
  params: Promise<{
    publicToken: string;
  }>;
};

async function getPublicTable(
  publicToken: string,
): Promise<PublicTableResponse | null> {
  const apiBaseUrl = process.env.API_BASE_URL;

  if (!apiBaseUrl) {
    throw new Error("API_BASE_URL is not configured.");
  }

  const response = await fetch(
    `${apiBaseUrl}/public/tables/${encodeURIComponent(publicToken)}`,
    {
      cache: "no-store",
    },
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Unable to verify this table QR code.");
  }

  return response.json();
}

export default async function PublicTablePage({
  params,
}: PublicTablePageProps) {
  const { publicToken } = await params;
  const table = await getPublicTable(publicToken);

  if (!table) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f1e8] px-5 py-10">
        <section className="w-full max-w-md rounded-[2rem] border border-red-200 bg-white p-8 text-center shadow-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-700">
            <QrCode size={30} />
          </div>

          <h1 className="font-heading mt-6 text-3xl font-bold">
            QR code not recognised
          </h1>

          <p className="mt-3 leading-7 text-[#5f5e5a]">
            This table QR code is invalid, inactive or no longer available.
            Please ask a member of staff for assistance.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f7f1e8] px-5 py-10">
      <div className="absolute -left-32 top-20 h-80 w-80 rounded-full bg-[#ffddb8]/70 blur-[110px]" />

      <div className="absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-[#944837]/15 blur-[120px]" />

      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-80px)] max-w-lg items-center">
        <div className="w-full rounded-[2.5rem] border border-[#d8c3ae] bg-white/85 p-7 text-center shadow-[0_30px_80px_rgba(83,68,52,0.16)] backdrop-blur-xl sm:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#855300] text-white">
            <UtensilsCrossed size={28} />
          </div>

          <p className="mt-6 text-sm font-bold tracking-[0.18em] text-[#855300]">
            WELCOME TO
          </p>

          <h1 className="font-heading mt-2 text-4xl font-bold text-[#1b1c1c]">
            {table.restaurant_name}
          </h1>

          <div className="mx-auto mt-7 flex w-fit items-center gap-3 rounded-2xl bg-[#ffddb8] px-6 py-4 text-[#583500]">
            <CheckCircle2 size={22} />

            <span className="font-heading text-2xl font-bold">
              Table {table.table_number}
            </span>
          </div>

          <p className="mt-6 leading-7 text-[#5f5e5a]">
            Your table has been identified successfully. You can now explore
            the menu and place your order from this device.
          </p>

          <div className="mt-8 rounded-2xl border border-[#d8c3ae] bg-[#fcf9f8] p-5">
            <div className="flex items-center justify-center gap-2 text-[#855300]">
              <Sparkles size={18} />

              <span className="text-sm font-semibold">
                AI-powered menu assistance
              </span>
            </div>

            <p className="mt-2 text-sm leading-6 text-[#5f5e5a]">
              Menu items and ordering will appear here in the next product
              slice.
            </p>
          </div>

          <p className="font-heading mt-8 text-2xl font-bold text-[#855300]">
            TableMind
          </p>
        </div>
      </section>
    </main>
  );
}