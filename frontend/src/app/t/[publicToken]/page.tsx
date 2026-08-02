import { QrCode } from "lucide-react";

import CustomerMenu, {
  type PublicTableResponse,
} from "@/components/customer/CustomerMenu";

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
    throw new Error("Unable to load the restaurant menu.");
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

  return <CustomerMenu table={table} />;
}