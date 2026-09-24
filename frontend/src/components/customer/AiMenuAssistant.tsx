"use client";

import { FormEvent, useState } from "react";

type Recommendation = {
  id: string;
  name: string;
  price: string;
  reason: string;
};

type Message = {
  role: "user" | "assistant";
  content: string;
  recommendations?: Recommendation[];
};

export default function AiMenuAssistant({
  publicToken,
  onAddToOrder,
}: {
  publicToken: string;
  onAddToOrder: (menuItemId: string) => void;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [addedItemId, setAddedItemId] = useState<string | null>(null);

  async function askAssistant(question: string) {
    if (!question.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: question,
    };

    const previousConversation = messages
      .map(
        (message) =>
          `${message.role === "user" ? "Customer" : "Waiter"}: ${
            message.content
          }`,
      )
      .join("\n");

    setMessages((current) => [
      ...current,
      userMessage,
    ]);

    setInput("");
    setIsLoading(true);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/public/ai/menu-assistant/${publicToken}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `
${previousConversation}

Customer: ${question}
          `.trim(),
        }),
      },
    );

    setIsLoading(false);

    if (!response.ok) {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            "Sorry, I can't check the menu right now. Please try again.",
        },
      ]);

      return;
    }

    const data = await response.json();

    setMessages((current) => [
      ...current,
      {
        role: "assistant",
        content: data.reply,
        recommendations: data.recommendations ?? [],
      },
    ]);
  }

  async function sendMessage(event: FormEvent) {
    event.preventDefault();

    await askAssistant(input);
  }

  return (
    <div className="flex h-[500px] flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        {messages.length === 0 && (
          <div>
            <h2 className="font-heading text-2xl font-bold">
              AI Menu Assistant
            </h2>

            <p className="mt-2 text-sm text-[#5f5e5a]">
              Tell me what you feel like eating.
            </p>

            <div className="mt-5 space-y-2 text-sm">
              <p>Try asking:</p>
              <p>“Something spicy under £15”</p>
              <p>“I'm vegetarian and want something light”</p>
              <p>“What should I order?”</p>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {[
                "🌶️ Something spicy",
                "🥗 Something light",
                "💪 High protein",
                "🌱 Vegetarian",
                "🍰 Something sweet",
                "😈 Surprise me",
              ].map((choice) => (
                <button
                  key={choice}
                  type="button"
                  onClick={() =>
                    askAssistant(
                      `Help me choose. I want ${choice}. Recommend the best option from the menu.`,
                    )
                  }
                  className="rounded-full border px-3 py-2 text-sm hover:bg-stone-50"
                >
                  {choice}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === "user"
                ? "justify-end"
                : "justify-start"
            }`}
          >
            <div
              className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6 ${
                message.role === "user"
                  ? "bg-[#855300] text-white"
                  : "bg-stone-100 text-stone-900"
              }`}
            >
              {message.content}

              {message.recommendations?.map((item) => (
                <div
                  key={item.id}
                  className="mt-3 rounded-xl border bg-white p-4"
                >
                  <div className="flex justify-between gap-4">
                    <strong>{item.name}</strong>
                    <strong>
                      £{Number(item.price).toFixed(2)}
                    </strong>
                  </div>

                  <p className="mt-2 text-sm text-[#5f5e5a]">
                    {item.reason}
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      onAddToOrder(item.id);
                      setAddedItemId(item.id);

                      setTimeout(() => {
                        setAddedItemId(null);
                      }, 1500);
                    }}
                    className="mt-4 w-full rounded-xl bg-[#855300] px-4 py-2 font-semibold text-white"
                  >
                    {addedItemId === item.id
                      ? "Added ✓"
                      : "+ Add to order"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}

        {isLoading && (
          <p className="text-sm text-[#5f5e5a]">
            Thinking...
          </p>
        )}
      </div>

      <form
        onSubmit={sendMessage}
        className="flex gap-2 border-t p-4"
      >
        <input
          value={input}
          onChange={(event) =>
            setInput(event.target.value)
          }
          placeholder="Ask about the menu..."
          className="min-w-0 flex-1 rounded-xl border px-4 py-3"
        />

        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="rounded-xl bg-[#855300] px-5 py-3 font-semibold text-white disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}