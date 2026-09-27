"use client";

import { useEffect, useMemo, useState } from "react";
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

type SharedCartPersonItem = {
  menu_item_id: string;
  participant_public_token: string;
  participant_name: string;
  quantity: number;
};

type CartReviewDrawerProps = {
  isOpen: boolean;
  restaurantName: string;
  tableNumber: number;
  items: CartLineItem[];
  currentParticipantToken: string | null;
  currentParticipantName: string;
  sharedItems: SharedCartPersonItem[];
  subtotal: number;
  onClose: () => void;
  onAdd: (menuItemId: string) => void;
  onRemove: (menuItemId: string) => void;
  onClear: () => void;
  onPlaceOrder: () => void;
  isSubmitting: boolean;
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
  currentParticipantToken,
  currentParticipantName,
  sharedItems,
  subtotal,
  onClose,
  onAdd,
  onRemove,
  onClear,
  onPlaceOrder,
  isSubmitting,
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

  const [selectedParticipant, setSelectedParticipant] =
    useState<string>("all");

  const participants = useMemo(() => {
    const people = new Map<string, string>();

    if (currentParticipantToken) {
      people.set(
        currentParticipantToken,
        currentParticipantName
      );
    }

    for (const item of sharedItems) {
      people.set(
        item.participant_public_token,
        item.participant_name
      );
    }

    return Array.from(people.entries()).map(
      ([token, name]) => ({
        token,
        name,
      })
    );
  }, [
    sharedItems,
    currentParticipantToken,
    currentParticipantName,
  ]);

  const visibleItems = useMemo(() => {
    if (selectedParticipant === "all") {
      return items;
    }

    return items
      .map((item) => {
        const quantity = sharedItems
          .filter(
            (sharedItem) =>
              sharedItem.menu_item_id === item.id &&
              sharedItem.participant_public_token ===
                selectedParticipant
          )
          .reduce(
            (total, sharedItem) =>
              total + sharedItem.quantity,
            0
          );

        return {
          ...item,
          quantity,
        };
      })
      .filter((item) => item.quantity > 0);
  }, [items, sharedItems, selectedParticipant]);

  const visibleSubtotal = visibleItems.reduce(
    (total, item) =>
      total + Number(item.price) * item.quantity,
    0
  );

  const selectedParticipantName =
    participants.find(
      (person) =>
        person.token === selectedParticipant
    )?.name ?? "";

  const canEdit =
    selectedParticipant === "all" ||
    selectedParticipant === currentParticipantToken;

  if (!isOpen) {
    return null;
  }

  const totalItems = visibleItems.reduce(
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
              Clear my items
            </button>
          </div>

          <div className="mt-4">
            <label className="mb-1 block text-xs font-semibold text-[#76665b]">
              View cart
            </label>

            <select
              value={selectedParticipant}
              onChange={(event) =>
                setSelectedParticipant(event.target.value)
              }
              className="w-full rounded-xl border border-[#e6d8cc] bg-white px-4 py-3 text-sm font-medium outline-none"
            >
              <option value="all">
                Everyone
              </option>

              {currentParticipantToken && (
                <option value={currentParticipantToken}>
                  My items ({currentParticipantName})
                </option>
              )}

              {participants
                .filter(
                  (person) =>
                    person.token !== currentParticipantToken
                )
                .map((person) => (
                  <option
                    key={person.token}
                    value={person.token}
                  >
                    {person.name}
                  </option>
                ))}
            </select>
          </div>

          <div className="mt-5 space-y-4">
            {visibleItems.map((item) => {
              const contributions = sharedItems.filter(
                (sharedItem) =>
                  sharedItem.menu_item_id === item.id &&
                  (
                    selectedParticipant === "all" ||
                    sharedItem.participant_public_token ===
                      selectedParticipant
                  )
              );
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

                      <div className="mt-3 flex flex-wrap gap-2">
                        {contributions.map((person, index) => (
                          <span
                            key={`${person.participant_name}-${index}`}
                            className="rounded-full bg-[#f3eee9] px-3 py-1 text-xs font-medium text-[#62564e]"
                          >
                            {person.participant_name} ×{person.quantity}
                          </span>
                        ))}
                      </div>
                    </div>

                    <p className="shrink-0 font-bold text-[#9a4f11]">
                      {formatPrice(itemTotal)}
                    </p>
                  </div>

                  {canEdit ? (
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
                  ) : (
                    <div className="mt-4 rounded-xl bg-[#f3eee9] px-4 py-3 text-center text-xs font-medium text-[#76665b]">
                      Viewing {selectedParticipantName}&apos;s items
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </div>

        <footer className="border-t border-[#eaded4] bg-white px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-5 sm:px-7 sm:pb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#76665b]">
                {selectedParticipant === "all"
                  ? "Table subtotal"
                  : `${selectedParticipantName}'s subtotal`}
              </p>

              {selectedParticipant !== "all" && (
                <p className="text-xs text-[#95877d]">
                  Table total {formatPrice(subtotal)}
                </p>
              )}
            </div>

            <p className="font-heading text-3xl font-bold">
              {formatPrice(
                selectedParticipant === "all"
                  ? subtotal
                  : visibleSubtotal
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={onPlaceOrder}
            disabled={isSubmitting || items.length === 0}
            className="mt-5 flex w-full items-center justify-center rounded-2xl bg-[#9a5d00] px-5 py-4 font-bold text-white transition hover:bg-[#7f4d00] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Placing order..." : "Place Order"}
          </button>

          <p className="mt-3 text-center text-xs leading-5 text-[#85776e]">
            Your order will be sent to the restaurant.
          </p>
        </footer>
      </aside>
    </div>
  );
}