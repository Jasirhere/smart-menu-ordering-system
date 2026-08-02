"use client";

import { useEffect } from "react";
import {
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  X,
} from "lucide-react";

export type CartLineItem = {
  id: string;
  name: string;
  price: string;
  quantity: number;
};

type CartReviewDrawerProps = {
  isOpen: boolean;
  restaurantName: string;
  tableNumber: number;
  items: CartLineItem[];
  subtotal: number;
  onClose: () => void;
  onAdd: (menuItemId: string) => void;
  onRemove: (menuItemId: string) => void;
  onClear: () => void;
};

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(price);
}

export default function CartReviewDrawer({
  isOpen,
  restaurantName,
  tableNumber,
  items,
  subtotal,
  onClose,
  onAdd,
  onRemove,
  onClear,
}: CartReviewDrawerProps) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const totalItems = items.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  return (
    <div className="fixed inset-0 z-[70]">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
        aria-label="Close cart"
      />

      <aside className="absolute inset-x-0 bottom-0 flex max-h-[88vh] flex-col overflow-hidden rounded-t-[2rem] bg-[#fbf7f3] shadow-2xl sm:inset-y-0 sm:left-auto sm:right-0 sm:max-h-none sm:w-[min(460px,100vw)] sm:rounded-l-[2rem] sm:rounded-tr-none">
        <header className="border-b border-[#eaded4] bg-white px-5 py-5 sm:px-7">
          <div className="flex items-start justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 text-[#9a5d00]">
                <ShoppingBag size={20} />

                <p className="text-sm font-bold tracking-[0.14em]">
                  YOUR ORDER
                </p>
              </div>

              <h2 className="font-heading mt-2 text-3xl font-bold">
                Table {tableNumber}
              </h2>

              <p className="mt-1 text-sm text-[#76665b]">
                {restaurantName}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#e4d5c9] bg-[#fbf7f3] transition hover:bg-[#f2e8df]"
              aria-label="Close order review"
            >
              <X size={20} />
            </button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-semibold text-[#66584f]">
              {totalItems} item{totalItems === 1 ? "" : "s"} selected
            </p>

            <button
              type="button"
              onClick={onClear}
              className="flex items-center gap-2 text-sm font-semibold text-red-700 transition hover:text-red-900"
            >
              <Trash2 size={16} />
              Clear cart
            </button>
          </div>

          <div className="mt-5 space-y-4">
            {items.map((item) => {
              const itemTotal =
                Number(item.price) * item.quantity;

              return (
                <article
                  key={item.id}
                  className="rounded-2xl border border-[#e6d8cc] bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="font-heading text-xl font-bold">
                        {item.name}
                      </h3>

                      <p className="mt-1 text-sm text-[#77685e]">
                        {formatPrice(Number(item.price))} each
                      </p>
                    </div>

                    <p className="shrink-0 font-bold text-[#9a4f11]">
                      {formatPrice(itemTotal)}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between rounded-xl bg-[#fff4e5] p-2">
                    <button
                      type="button"
                      onClick={() => onRemove(item.id)}
                      className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-[#8a5200] shadow-sm transition hover:bg-[#f8eee5]"
                      aria-label={`Remove one ${item.name}`}
                    >
                      <Minus size={18} />
                    </button>

                    <span className="font-bold text-[#5c3900]">
                      {item.quantity}
                    </span>

                    <button
                      type="button"
                      onClick={() => onAdd(item.id)}
                      className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#9a5d00] text-white shadow-sm transition hover:bg-[#7f4d00]"
                      aria-label={`Add another ${item.name}`}
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <footer className="border-t border-[#eaded4] bg-white px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-5 sm:px-7 sm:pb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#76665b]">
                Subtotal
              </p>

              <p className="text-xs text-[#95877d]">
                Table {tableNumber}
              </p>
            </div>

            <p className="font-heading text-3xl font-bold">
              {formatPrice(subtotal)}
            </p>
          </div>

          <button
            type="button"
            disabled
            className="mt-5 flex w-full cursor-not-allowed items-center justify-center rounded-2xl bg-[#9a5d00]/55 px-5 py-4 font-bold text-white"
          >
            Place order
          </button>

          <p className="mt-3 text-center text-xs leading-5 text-[#85776e]">
            Order submission will be connected to the backend in the next
            step.
          </p>
        </footer>
      </aside>
    </div>
  );
}