'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";

interface InventoryItem {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  minStock: number;
  updatedAt: string;
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantityChanges, setQuantityChanges] = useState<Record<string, number | "">>({});
  const [savingState, setSavingState] = useState<Record<string, boolean>>({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmItem, setConfirmItem] = useState<InventoryItem | null>(null);
  const [checkingRecipes, setCheckingRecipes] = useState(false);
  const [recipesList, setRecipesList] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);

  // New item form state
  const [showNewForm, setShowNewForm] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    unit: "",
    quantity: "",
    minStock: "",
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchInventory();
  }, []);

  async function fetchInventory() {
    setLoading(true);
    try {
      const res = await fetch("/api/inventory");
      if (!res.ok) throw new Error("Failed to fetch inventory");
      const data = await res.json();
      setItems(data);
    } catch {
      toast.error("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  }

  function handleQuantityChange(id: string, val: string) {
    if (val === "") {
      setQuantityChanges((p) => ({ ...p, [id]: "" }));
      return;
    }
    const num = Number(val);
    if (!isNaN(num)) setQuantityChanges((p) => ({ ...p, [id]: num }));
  }

  async function saveQuantityChange(item: InventoryItem) {
    const change = quantityChanges[item.id];
    if (change === undefined || change === "" || change === 0) {
      toast("Please enter a non-zero quantity change");
      return;
    }
    if (item.quantity + change < 0) {
      toast.error("Resulting quantity cannot be negative");
      return;
    }
    setSavingState((prev) => ({ ...prev, [item.id]: true }));
    try {
      const res = await fetch("/api/inventory", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, quantityChange: change }),
      });
      if (!res.ok) throw new Error("Save failed");
      toast.success(`Updated "${item.name}"`);
      setQuantityChanges((prev) => ({ ...prev, [item.id]: "" }));
      await fetchInventory();
    } catch {
      toast.error("Failed to update quantity");
    }
    setSavingState((prev) => ({ ...prev, [item.id]: false }));
  }

  function handleNewItemChange(field: keyof typeof newItem, val: string) {
    setNewItem((prev) => ({ ...prev, [field]: val }));
  }

  function resetNewItemForm() {
    setNewItem({ name: "", unit: "", quantity: "", minStock: "" });
    setShowNewForm(false);
  }

  async function createNewItem(e: React.FormEvent) {
    e.preventDefault();
    const { name, unit, quantity, minStock } = newItem;

    if (!name.trim() || !unit.trim() || quantity === "" || minStock === "") {
      toast.error("Please fill all the fields");
      return;
    }

    if (Number(quantity) < 0 || Number(minStock) < 0) {
      toast.error("Quantity fields must be non-negative numbers");
      return;
    }

    if (!/^[a-zA-Z]{1,10}$/.test(unit.trim())) {
      toast.error("Unit must be text only (e.g., pcs, kg)");
      return;
    }

    setCreating(true);
    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          unit: unit.trim(),
          quantity: Number(quantity),
          minStock: Number(minStock),
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Failed to add inventory item");
        setCreating(false);
        return;
      }
      toast.success("Inventory item added");
      resetNewItemForm();
      await fetchInventory();
    } catch {
      toast.error("Failed to add inventory item");
    }
    setCreating(false);
  }

  async function handleDeleteRequest(item: InventoryItem) {
    setConfirmItem(item);
    setShowConfirm(true);
    setRecipesList([]);
    setCheckingRecipes(true);
    try {
      const res = await fetch(`/api/inventory/usage?id=${item.id}`);
      if (!res.ok) throw new Error("Failed to fetch usage");
      const data = await res.json();
      setRecipesList(data.usedIn);
    } catch {
      setRecipesList([]);
    } finally {
      setCheckingRecipes(false);
    }
  }

  async function confirmDelete() {
    if (!confirmItem) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/inventory?id=${confirmItem.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.error || "Failed to delete inventory item");
      } else {
        toast.success("Inventory item deleted");
        await fetchInventory();
      }
    } catch {
      toast.error("Failed to delete inventory item");
    }
    setDeleting(false);
    setShowConfirm(false);
    setConfirmItem(null);
  }

  if (loading)
    return (
      <div className="p-8 text-white text-center">Loading inventory...</div>
    );

  return (
    <div className="p-8 bg-blueDark min-h-screen space-y-8">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-3xl font-bold text-white">Inventory Management</h1>
        <Button
          onClick={() => setShowNewForm((f) => !f)}
          aria-expanded={showNewForm}
          aria-controls="new-inventory-form"
        >
          {showNewForm ? "Cancel Adding Item" : "Add New Inventory Item"}
        </Button>
      </div>

      {showNewForm && (
        <form
          id="new-inventory-form"
          onSubmit={createNewItem}
          className="bg-blueBase p-6 rounded-xl max-w-lg mx-auto space-y-4"
          aria-label="Add New Inventory Item Form"
        >
          <div>
            <label
              htmlFor="name"
              className="block text-white font-semibold mb-1"
            >
              Name
            </label>
            <input
              id="name"
              type="text"
              required
              className="w-full px-4 py-2 rounded bg-blueDark text-white border border-slate-600 focus:ring-2 focus:ring-accent"
              value={newItem.name}
              onChange={(e) => handleNewItemChange("name", e.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="unit"
              className="block text-white font-semibold mb-1"
            >
              Unit (e.g., kg, pcs)
            </label>
            <input
              id="unit"
              type="text"
              required
              className="w-full px-4 py-2 rounded bg-blueDark text-white border border-slate-600 focus:ring-2 focus:ring-accent"
              value={newItem.unit}
              onChange={(e) => handleNewItemChange("unit", e.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="quantity"
              className="block text-white font-semibold mb-1"
            >
              Current Quantity
            </label>
            <input
              id="quantity"
              type="number"
              min="0"
              required
              className="w-full px-4 py-2 rounded bg-blueDark text-white border border-slate-600 focus:ring-2 focus:ring-accent"
              value={newItem.quantity}
              onChange={(e) => handleNewItemChange("quantity", e.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="minStock"
              className="block text-white font-semibold mb-1"
            >
              Alert Unit (Min Stock)
            </label>
            <input
              id="minStock"
              type="number"
              min="0"
              required
              className="w-full px-4 py-2 rounded bg-blueDark text-white border border-slate-600 focus:ring-2 focus:ring-accent"
              value={newItem.minStock}
              onChange={(e) => handleNewItemChange("minStock", e.target.value)}
            />
          </div>
          <Button type="submit" disabled={creating}>
            {creating ? "Adding..." : "Add Item"}
          </Button>
        </form>
      )}

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        {items.map((item) => {
          const changeVal = quantityChanges[item.id];
          const editValue = changeVal === undefined ? "" : String(changeVal);
          const projectedQuantity =
            item.quantity + (typeof changeVal === "number" ? changeVal : 0);
          const updatedFormatted = new Date(item.updatedAt).toLocaleString();
          return (
            <div
              key={item.id}
              className="bg-blueBase p-6 rounded-3xl shadow-lg flex flex-col relative"
            >
              <button
                className="absolute top-0 right-0 p-2 text-slate-400 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-600"
                onClick={() => handleDeleteRequest(item)}
                aria-label={`Delete ${item.name}`}
                type="button"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.2}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 7v12a2 2 0 002 2h8a2 2 0 002-2V7M9 7V4a2 2 0 012-2h2a2 2 0 012 2v3m4 0H5"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10 11v6m4-6v6"
                  />
                </svg>
              </button>
              <h2 className="text-xl font-semibold text-white mb-3">
                {item.name}
              </h2>
              <p className="mb-2 text-white">
                <strong>Unit:</strong> {item.unit}
              </p>
              <p className="mb-2 text-white">
                <strong>Current Quantity:</strong> {item.quantity} {item.unit}
              </p>
              <p className="mb-4 text-white">
                <strong>Alert Unit (Min Stock):</strong> {item.minStock}{" "}
                {item.unit}
              </p>
              <p className="mb-4 text-slate-400">
                <strong>Last Edited:</strong> {updatedFormatted}
              </p>
              <label
                htmlFor={`change-${item.id}`}
                className="text-white font-semibold block mb-1"
              >
                Change in Quantity
              </label>
              <input
                type="number"
                id={`change-${item.id}`}
                step="any"
                value={editValue}
                onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                className="w-full px-4 py-2 mb-2 rounded bg-blueDark text-white border border-slate-600 focus:ring-2 focus:ring-accent"
                placeholder="e.g. 5 to add, -2 to remove"
                aria-describedby={`proj-${item.id}`}
              />
              <p id={`proj-${item.id}`} className="mb-4 text-slate-400">
                Projection:{" "}
                <strong>
                  {projectedQuantity} {item.unit}
                </strong>
              </p>
              <Button
                size="sm"
                disabled={
                  savingState[item.id] || !editValue || Number(editValue) === 0
                }
                onClick={() => saveQuantityChange(item)}
              >
                {savingState[item.id] ? "Saving..." : "Update Quantity"}
              </Button>
            </div>
          );
        })}
      </div>

      {/* Confirmation Modal */}
      {showConfirm && confirmItem && (
        <div className="fixed inset-0 z-50 bg-black/40 flex justify-center items-center p-4">
          <div className="bg-blueBase rounded-xl p-6 max-w-sm w-full">
            <h3 className="font-bold text-xl text-white mb-4">
              Delete "{confirmItem.name}"?
            </h3>
            {checkingRecipes ? (
              <p className="text-white">Checking usage...</p>
            ) : recipesList.length > 0 ? (
              <>
                <p className="mb-2 text-slate-300">
                  <strong>This ingredient is used in:</strong>
                </p>
                <ul className="list-disc list-inside max-h-48 overflow-y-auto mb-4">
                  {recipesList.map((recipeName) => (
                    <li key={recipeName}>{recipeName}</li>
                  ))}
                </ul>
                <p className="mb-4 text-red-400 font-medium">
                  If you delete this ingredient, it will be removed from all
                  above recipes.
                </p>
              </>
            ) : (
              <p className="mb-4 text-green-400">
                This ingredient is not used in any recipes.
              </p>
            )}
            <div className="flex gap-4 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowConfirm(false);
                  setConfirmItem(null);
                }}
              >
                Cancel
              </Button>
              <Button
                color="red"
                onClick={confirmDelete}
                disabled={deleting || checkingRecipes}
              >
                {deleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
