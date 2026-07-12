type HealthResponse = {
  status: string;
};

async function getBackendHealth(): Promise<HealthResponse> {
  const apiBaseUrl = process.env.API_BASE_URL;

  if (!apiBaseUrl) {
    throw new Error("API_BASE_URL is not configured");
  }

  const response = await fetch(`${apiBaseUrl}/health`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Backend returned status ${response.status}`);
  }

  return response.json();
}

export default async function Home() {
  try {
    const health = await getBackendHealth();

    return (
      <main className="flex min-h-screen items-center justify-center bg-stone-100 p-6">
        <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
          <p className="text-sm font-medium text-green-700">
            Backend connected
          </p>

          <h1 className="mt-2 text-3xl font-semibold text-stone-900">
            Restaurant AI Platform
          </h1>

          <p className="mt-3 text-stone-600">
            FastAPI status: {health.status}
          </p>
        </section>
      </main>
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown connection error";

    return (
      <main className="flex min-h-screen items-center justify-center bg-stone-100 p-6">
        <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
          <p className="text-sm font-medium text-red-700">
            Backend connection failed
          </p>

          <h1 className="mt-2 text-3xl font-semibold text-stone-900">
            Restaurant AI Platform
          </h1>

          <p className="mt-3 text-stone-600">{message}</p>
        </section>
      </main>
    );
  }
}