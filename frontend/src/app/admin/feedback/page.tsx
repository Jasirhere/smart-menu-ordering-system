import FeedbackList, {
  type FeedbackItem,
} from "@/components/admin/FeedbackList";

async function getFeedback(): Promise<FeedbackItem[]> {
  const response = await fetch(
    `${process.env.API_BASE_URL}/admin/feedback`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("Could not load feedback");
  }

  return response.json();
}

export default async function AdminFeedbackPage() {
  const feedback = await getFeedback();

  return (
    <main className="min-h-screen bg-[#fcf9f8] px-5 py-8 lg:px-12">
      <header>
        <h1 className="font-heading text-4xl font-bold">
          Customer Feedback
        </h1>

        <p className="mt-2 text-[#5f5e5a]">
          See ratings and comments from your customers.
        </p>
      </header>

      <FeedbackList feedback={feedback} />
    </main>
  );
}