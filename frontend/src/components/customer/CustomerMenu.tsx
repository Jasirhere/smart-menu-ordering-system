"use client";

import { useMemo, useState } from "react";
import {
  ChefHat,
  Minus,
  Plus,
  QrCode,
  Search,
  ShoppingBag,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";

import CartReviewDrawer from "@/components/customer/CartReviewDrawer";

export type PublicMenuItem = {
  id: string;
  name: string;
  description: string;
  category: string;
  price: string;
  image_url: string | null;
  dietary_label: string | null;
  sort_order: number;
};

export type PublicTableResponse = {
  restaurant_name: string;
  restaurant_slug: string;
  table_number: number;
  menu_items: PublicMenuItem[];
};

type CustomerMenuProps = {
  table: PublicTableResponse;
  publicToken: string;
};

type PlacedOrder = {
  id: string;
  status: string;
  subtotal: string;
  table_number: number;
  created_at: string;
};

function formatPrice(price: string): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(Number(price));
}

export default function CustomerMenu({
  table,
  publicToken,
}: CustomerMenuProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<PlacedOrder | null>(null);

  function addToCart(menuItemId: string) {
    setCart((currentCart) => ({
      ...currentCart,
      [menuItemId]: (currentCart[menuItemId] ?? 0) + 1,
    }));
  }

  function removeFromCart(menuItemId: string) {
    setCart((currentCart) => {
      const currentQuantity = currentCart[menuItemId] ?? 0;

      if (currentQuantity <= 1) {
        const updatedCart = { ...currentCart };
        delete updatedCart[menuItemId];
        return updatedCart;
      }

      return {
        ...currentCart,
        [menuItemId]: currentQuantity - 1,
      };
    });
  }

  function clearCart() {
    setCart({});
    setIsCartOpen(false);
  }
  async function placeOrder() {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

    if (!apiBaseUrl) {
      alert("API URL is not configured.");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch(`${apiBaseUrl}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          public_token: publicToken,
          items: cartItems.map((item) => ({
            menu_item_id: item.id,
            quantity: item.quantity,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Order failed");
      }

      const order: PlacedOrder = await response.json();

      setCart({});
      setIsCartOpen(false);
      setPlacedOrder(order);
    } catch {
      alert("Could not place order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const categories = useMemo(
    () => [
      "All",
      ...Array.from(
        new Set(
          table.menu_items.map(
            (menuItem) => menuItem.category,
          ),
        ),
      ),
    ],
    [table.menu_items],
  );

  const filteredItems = useMemo(() => {
    const normalisedSearch = searchQuery
      .trim()
      .toLowerCase();

    return table.menu_items.filter((menuItem) => {
      const matchesCategory =
        activeCategory === "All" ||
        menuItem.category === activeCategory;

      const matchesSearch =
        normalisedSearch.length === 0 ||
        menuItem.name
          .toLowerCase()
          .includes(normalisedSearch) ||
        menuItem.description
          .toLowerCase()
          .includes(normalisedSearch) ||
        menuItem.category
          .toLowerCase()
          .includes(normalisedSearch);

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery, table.menu_items]);

  const featuredItem = table.menu_items[0] ?? null;

  const totalCartItems = Object.values(cart).reduce(
    (total, quantity) => total + quantity,
    0,
  );

  const totalCartPrice = table.menu_items.reduce(
    (total, menuItem) =>
      total +
      Number(menuItem.price) *
      (cart[menuItem.id] ?? 0),
    0,
  );

  const cartItems = useMemo(
    () =>
      table.menu_items
        .filter(
          (menuItem) =>
            (cart[menuItem.id] ?? 0) > 0,
        )
        .map((menuItem) => ({
          id: menuItem.id,
          name: menuItem.name,
          price: menuItem.price,
          quantity: cart[menuItem.id] ?? 0,
        })),
    [cart, table.menu_items],
  );

  return (
    <main className="min-h-screen bg-[#fbf7f3] pb-32 text-[#241c18]">
      {placedOrder && (
        <div className="mx-auto mt-5 max-w-xl px-5">
          <div className="rounded-2xl border border-green-200 bg-green-50 p-5 text-center">
            <h2 className="text-xl font-bold text-green-800">
              Order placed ✅
            </h2>

            <p className="mt-2">
              Table {placedOrder.table_number}
            </p>

            <p className="font-semibold">
              Total: {formatPrice(placedOrder.subtotal)}
            </p>

            <p className="capitalize">
              Status: {placedOrder.status}
            </p>

            <p className="mt-2 text-xs text-gray-500">
              Order ID: {placedOrder.id}
            </p>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-40 border-b border-[#eaded4] bg-[#fbf7f3]/95 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8 lg:px-12">
          <div className="min-w-0">
            <p className="font-heading truncate text-xl font-bold text-[#8a4f12] sm:text-2xl">
              {table.restaurant_name}
            </p>

            <p className="text-xs tracking-[0.16em] text-[#76665b]">
              DIGITAL DINING
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2 rounded-full border border-[#e2cdb8] bg-white px-4 py-2 shadow-sm">
            <UtensilsCrossed
              size={17}
              className="text-[#9a5d00]"
            />

            <span className="text-sm font-bold text-[#704300]">
              Table {table.table_number}
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-10 lg:px-12">
        <section className="grid gap-6 lg:grid-cols-[1fr_1.1fr] lg:items-stretch">
          <div className="flex flex-col justify-center rounded-[2rem] border border-[#eaded4] bg-white p-6 shadow-sm sm:p-8 lg:p-10">
            <div className="flex w-fit items-center gap-2 rounded-full bg-[#fff0d9] px-4 py-2 text-sm font-semibold text-[#8a5200]">
              <Sparkles size={16} />
              Welcome to your table
            </div>

            <h1 className="font-heading mt-5 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              Explore the menu and order at your
              pace.
            </h1>

            <p className="mt-5 max-w-xl text-base leading-7 text-[#6f6259] sm:text-lg">
              You are ordering from{" "}
              <strong className="text-[#3b2b22]">
                Table {table.table_number}
              </strong>
              . Your table remains linked throughout
              this visit.
            </p>

            <div className="mt-7 rounded-2xl border border-[#ead4b7] bg-[#fff8ec] p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#9a5d00] text-white">
                  <Sparkles size={20} />
                </div>

                <div>
                  <p className="font-semibold">
                    Not sure what to order?
                  </p>

                  <p className="mt-1 text-sm text-[#74655b]">
                    AI recommendations will be added
                    after the ordering flow.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {featuredItem && (
            <article className="relative min-h-[360px] overflow-hidden rounded-[2rem] border border-[#d9c4b2] bg-[#2f211b] shadow-lg sm:min-h-[430px]">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={
                  featuredItem.image_url
                    ? {
                      backgroundImage: `url("${featuredItem.image_url}")`,
                    }
                    : undefined
                }
              />

              {!featuredItem.image_url && (
                <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_top_left,#c9863d,#714319_48%,#241815)]">
                  <ChefHat
                    size={100}
                    strokeWidth={1.2}
                    className="text-white/25"
                  />
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
                <span className="rounded-full bg-[#b96d3e] px-3 py-1.5 text-xs font-bold tracking-wide">
                  FEATURED DISH
                </span>

                <div className="mt-4 flex items-end justify-between gap-5">
                  <div className="min-w-0">
                    <h2 className="font-heading text-3xl font-bold sm:text-4xl">
                      {featuredItem.name}
                    </h2>

                    <p className="mt-2 max-w-xl text-sm leading-6 text-white/80 sm:text-base">
                      {featuredItem.description}
                    </p>
                  </div>

                  <p className="shrink-0 text-xl font-bold sm:text-2xl">
                    {formatPrice(featuredItem.price)}
                  </p>
                </div>
              </div>
            </article>
          )}
        </section>

        <section className="mt-8">
          <label className="relative block">
            <Search
              size={21}
              className="absolute left-5 top-1/2 -translate-y-1/2 text-[#806f64]"
            />

            <input
              type="search"
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(event.target.value)
              }
              placeholder="Search dishes, drinks or categories..."
              className="h-15 w-full rounded-2xl border border-[#e4d5c9] bg-white pl-14 pr-5 text-base outline-none transition placeholder:text-[#9b8f87] focus:border-[#9a5d00] focus:ring-4 focus:ring-[#9a5d00]/10"
            />
          </label>
        </section>

        <section className="mt-6">
          <div className="flex gap-3 overflow-x-auto pb-2">
            {categories.map((category) => {
              const isActive =
                activeCategory === category;

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() =>
                    setActiveCategory(category)
                  }
                  className={`shrink-0 rounded-full border px-5 py-2.5 text-sm font-semibold transition ${isActive
                    ? "border-[#9a5d00] bg-[#9a5d00] text-white"
                    : "border-[#e1d2c6] bg-white text-[#4e4037] hover:border-[#9a5d00]"
                    }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-9">
          <div className="flex items-end justify-between gap-5">
            <div>
              <p className="text-sm font-bold tracking-[0.16em] text-[#9a5d00]">
                OUR MENU
              </p>

              <h2 className="font-heading mt-2 text-3xl font-bold sm:text-4xl">
                {activeCategory === "All"
                  ? "Discover our dishes"
                  : activeCategory}
              </h2>
            </div>

            <p className="shrink-0 text-sm text-[#76685e]">
              {filteredItems.length} item
              {filteredItems.length === 1
                ? ""
                : "s"}
            </p>
          </div>

          {filteredItems.length > 0 ? (
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filteredItems.map((menuItem) => (
                <article
                  key={menuItem.id}
                  className="group flex min-w-0 flex-col overflow-hidden rounded-[1.75rem] border border-[#e6d8cc] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="relative flex h-44 items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top_left,#ffd8a4,#c47b31_55%,#7c461a)] sm:h-48">
                    {menuItem.image_url ? (
                      <div
                        className="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-105"
                        style={{
                          backgroundImage: `url("${menuItem.image_url}")`,
                        }}
                      />
                    ) : (
                      <ChefHat
                        size={64}
                        strokeWidth={1.3}
                        className="text-white/50"
                      />
                    )}

                    <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-[#744400] backdrop-blur">
                      {menuItem.category}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-heading min-w-0 text-2xl font-bold">
                        {menuItem.name}
                      </h3>

                      <p className="shrink-0 text-lg font-bold text-[#a14f11]">
                        {formatPrice(menuItem.price)}
                      </p>
                    </div>

                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#71645b]">
                      {menuItem.description}
                    </p>

                    {menuItem.dietary_label && (
                      <div className="mt-4">
                        <span className="rounded-full bg-[#edf7ed] px-3 py-1.5 text-xs font-semibold text-[#267234]">
                          {menuItem.dietary_label}
                        </span>
                      </div>
                    )}

                    <div className="mt-auto border-t border-[#eee3da] pt-4">
                      {(cart[menuItem.id] ?? 0) ===
                        0 ? (
                        <button
                          type="button"
                          onClick={() =>
                            addToCart(menuItem.id)
                          }
                          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#9a5d00] px-4 py-3 font-semibold text-white transition hover:bg-[#7f4d00]"
                        >
                          <Plus size={18} />
                          Add to order
                        </button>
                      ) : (
                        <div className="flex items-center justify-between rounded-xl bg-[#fff4e5] p-2">
                          <button
                            type="button"
                            onClick={() =>
                              removeFromCart(
                                menuItem.id,
                              )
                            }
                            className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-[#8a5200] shadow-sm transition hover:bg-[#f8eee5]"
                            aria-label={`Remove one ${menuItem.name}`}
                          >
                            <Minus size={18} />
                          </button>

                          <span className="font-bold text-[#5c3900]">
                            {cart[menuItem.id]}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              addToCart(menuItem.id)
                            }
                            className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#9a5d00] text-white shadow-sm transition hover:bg-[#7f4d00]"
                            aria-label={`Add another ${menuItem.name}`}
                          >
                            <Plus size={18} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-[2rem] border border-dashed border-[#d8c6b8] bg-white p-10 text-center sm:p-14">
              <QrCode
                size={34}
                className="mx-auto text-[#9a5d00]"
              />

              <h3 className="font-heading mt-4 text-2xl font-bold">
                No matching dishes
              </h3>

              <p className="mt-2 text-[#74665c]">
                Try another search or select a
                different category.
              </p>
            </div>
          )}
        </section>
      </div>

      {totalCartItems > 0 && (
        <div className="fixed inset-x-0 bottom-4 z-50 px-4 sm:px-6">
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="mx-auto flex w-full max-w-xl items-center justify-between rounded-2xl bg-[#27211e] px-5 py-4 text-white shadow-2xl transition hover:bg-black"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
                <ShoppingBag size={20} />
              </span>

              <div className="min-w-0 text-left">
                <p className="text-sm font-semibold">
                  View your order
                </p>

                <p className="text-xs text-white/70">
                  {totalCartItems} item
                  {totalCartItems === 1
                    ? ""
                    : "s"}
                </p>
              </div>
            </div>

            <span className="shrink-0 text-lg font-bold">
              {formatPrice(
                totalCartPrice.toFixed(2),
              )}
            </span>
          </button>
        </div>
      )}

      <CartReviewDrawer
        isOpen={isCartOpen}
        restaurantName={table.restaurant_name}
        tableNumber={table.table_number}
        items={cartItems}
        subtotal={totalCartPrice}
        onClose={() => setIsCartOpen(false)}
        onAdd={addToCart}
        onRemove={removeFromCart}
        onClear={clearCart}
        onPlaceOrder={placeOrder}
        isSubmitting={isSubmitting}
      />
    </main>
  );
}