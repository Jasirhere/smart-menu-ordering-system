"use client";

import { useEffect, useState } from "react";

type MenuItem = {
  id: string;
  name: string;
  description: string;
  category: string;
  price: string;
  image_url: string | null;
  dietary_label: string | null;
  is_available: boolean;
  sort_order: number;
};

function formatPrice(value: string) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(Number(value));
}

export default function AdminMenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    dietary_label: "",
  });

  async function createMenuItem() {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

    const response = await fetch(`${apiBaseUrl}/admin/menu`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: newItem.name,
        description: newItem.description,
        category: newItem.category,
        price: newItem.price,
        dietary_label: newItem.dietary_label || null,
        image_url: null,
        is_available: true,
        sort_order: 0,
      }),
    });

    if (!response.ok) {
      alert("Could not create menu item.");
      return;
    }

    const createdItem = await response.json();

    setItems((current) => [...current, createdItem]);

    setNewItem({
      name: "",
      description: "",
      category: "",
      price: "",
      dietary_label: "",
    });

    setShowAddForm(false);
  }

  async function updateMenuItem() {
    if (!editingItem) return;

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

    const response = await fetch(
      `${apiBaseUrl}/admin/menu/${editingItem.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editingItem.name,
          description: editingItem.description,
          category: editingItem.category,
          price: editingItem.price,
          dietary_label: editingItem.dietary_label,
        }),
      },
    );

    if (!response.ok) {
      alert("Could not update menu item.");
      return;
    }

    const updatedItem = await response.json();

    setItems((current) =>
      current.map((item) =>
        item.id === updatedItem.id ? updatedItem : item,
      ),
    );

    setEditingItem(null);
  }

  async function toggleAvailability(item: MenuItem) {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

    const response = await fetch(
      `${apiBaseUrl}/admin/menu/${item.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          is_available: !item.is_available,
        }),
      },
    );

    if (!response.ok) {
      alert("Could not update availability.");
      return;
    }

    const updatedItem = await response.json();

    setItems((current) =>
      current.map((menuItem) =>
        menuItem.id === updatedItem.id ? updatedItem : menuItem,
      ),
    );
  }

  useEffect(() => {
    async function loadMenu() {
      const apiBaseUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL;

      const response = await fetch(
        `${apiBaseUrl}/admin/menu`,
      );

      setItems(await response.json());
      setIsLoading(false);
    }

    loadMenu();
  }, []);

  if (isLoading) {
    return <main className="p-10">Loading menu...</main>;
  }

  return (
    <main className="min-h-screen bg-[#fcf9f8] px-5 py-8 lg:px-12">
      <header className="mb-8">
        <div className="flex items-center justify-between gap-4">
          <h1 className="font-heading text-4xl font-bold">
            Menu Management
          </h1>

          <button
            onClick={() => setShowAddForm(true)}
            className="rounded-xl bg-[#855300] px-5 py-3 font-semibold text-white"
          >
            + Add Menu Item
          </button>
        </div>

        <p className="mt-2 text-[#5f5e5a]">
          Manage your restaurant menu.
        </p>
      </header>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <article
            key={item.id}
            className="rounded-2xl border border-[#d8c3ae] bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-heading text-2xl font-bold">
                  {item.name}
                </h2>

                <p className="mt-1 text-sm text-[#855300]">
                  {item.category}
                </p>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  item.is_available
                    ? "bg-green-100 text-green-700"
                    : "bg-stone-200 text-stone-600"
                }`}
              >
                {item.is_available
                  ? "Available"
                  : "Unavailable"}
              </span>
            </div>

            <p className="mt-4 text-sm leading-6 text-[#5f5e5a]">
              {item.description}
            </p>

            <div className="mt-5 flex items-center justify-between">
              <strong className="text-lg">
                {formatPrice(item.price)}
              </strong>

              {item.dietary_label && (
                <span className="text-xs text-green-700">
                  {item.dietary_label}
                </span>
              )}
            </div>

            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setEditingItem(item)}
                className="flex-1 rounded-xl border px-4 py-2 text-sm font-semibold"
              >
                Edit
              </button>

              <button
                onClick={() => toggleAvailability(item)}
                className="flex-1 rounded-xl bg-[#855300] px-4 py-2 text-sm font-semibold text-white"
              >
                {item.is_available
                  ? "Mark Unavailable"
                  : "Mark Available"}
              </button>
            </div>
          </article>
        ))}
      </div>

      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-2xl font-bold">
                Add Menu Item
              </h2>

              <button onClick={() => setShowAddForm(false)}>
                ✕
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <input
                placeholder="Name"
                value={newItem.name}
                onChange={(e) =>
                  setNewItem({ ...newItem, name: e.target.value })
                }
                className="w-full rounded-xl border p-3"
              />

              <input
                placeholder="Category"
                value={newItem.category}
                onChange={(e) =>
                  setNewItem({ ...newItem, category: e.target.value })
                }
                className="w-full rounded-xl border p-3"
              />

              <input
                type="number"
                placeholder="Price"
                value={newItem.price}
                onChange={(e) =>
                  setNewItem({ ...newItem, price: e.target.value })
                }
                className="w-full rounded-xl border p-3"
              />

              <textarea
                placeholder="Description"
                value={newItem.description}
                onChange={(e) =>
                  setNewItem({
                    ...newItem,
                    description: e.target.value,
                  })
                }
                className="w-full rounded-xl border p-3"
              />

              <input
                placeholder="Dietary label (optional)"
                value={newItem.dietary_label}
                onChange={(e) =>
                  setNewItem({
                    ...newItem,
                    dietary_label: e.target.value,
                  })
                }
                className="w-full rounded-xl border p-3"
              />
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 rounded-xl border px-4 py-3"
              >
                Cancel
              </button>

              <button
                onClick={createMenuItem}
                className="flex-1 rounded-xl bg-[#855300] px-4 py-3 font-semibold text-white"
              >
                Save Item
              </button>
            </div>
          </div>
        </div>
      )}

      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="font-heading text-2xl font-bold">
              Edit Menu Item
            </h2>

            <div className="mt-6 space-y-4">
              <input
                value={editingItem.name}
                onChange={(e) =>
                  setEditingItem({
                    ...editingItem,
                    name: e.target.value,
                  })
                }
                className="w-full rounded-xl border p-3"
              />

              <input
                value={editingItem.category}
                onChange={(e) =>
                  setEditingItem({
                    ...editingItem,
                    category: e.target.value,
                  })
                }
                className="w-full rounded-xl border p-3"
              />

              <input
                type="number"
                value={editingItem.price}
                onChange={(e) =>
                  setEditingItem({
                    ...editingItem,
                    price: e.target.value,
                  })
                }
                className="w-full rounded-xl border p-3"
              />

              <textarea
                value={editingItem.description}
                onChange={(e) =>
                  setEditingItem({
                    ...editingItem,
                    description: e.target.value,
                  })
                }
                className="w-full rounded-xl border p-3"
              />
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setEditingItem(null)}
                className="flex-1 rounded-xl border px-4 py-3"
              >
                Cancel
              </button>

              <button
                onClick={updateMenuItem}
                className="flex-1 rounded-xl bg-[#855300] px-4 py-3 font-semibold text-white"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}