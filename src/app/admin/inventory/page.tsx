
'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"

interface InventoryItem {
  id: string
  name: string
  unit: string
  quantity: number
  minStock: number
  updatedAt: string
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [quantityChanges, setQuantityChanges] = useState<Record<string, number | "">>({})
  const [savingState, setSavingState] = useState<Record<string, boolean>>({})
  const [showConfirm, setShowConfirm] = useState(false)
  const [confirmItem, setConfirmItem] = useState<InventoryItem | null>(null)
  const [checkingRecipes, setCheckingRecipes] = useState(false)
  const [recipesList, setRecipesList] = useState<string[]>([])
  const [deleting, setDeleting] = useState(false)
  const [showNewForm, setShowNewForm] = useState(false)
  const [newItem, setNewItem] = useState({
    name: "",
    unit: "",
    quantity: "",
    minStock: "",
  })
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetchInventory()
  }, [])

  async function fetchInventory() {
    setLoading(true)
    try {
      const res = await fetch("/api/inventory")
      if (!res.ok) throw new Error("Failed to fetch inventory")
      const data = await res.json()
      setItems(data)
    } catch {
      toast.error("Failed to load inventory")
    } finally {
      setLoading(false)
    }
  }

  function handleQuantityChange(id: string, val: string) {
    if (val === "") {
      setQuantityChanges((p) => ({ ...p, [id]: "" }))
      return
    }
    const num = Number(val)
    if (!isNaN(num)) setQuantityChanges((p) => ({ ...p, [id]: num }))
  }

  async function saveQuantityChange(item: InventoryItem) {
    const change = quantityChanges[item.id]
    if (change === undefined || change === "" || change === 0) {
      toast("Please enter a non-zero quantity change")
      return
    }
    if (item.quantity + change < 0) {
      toast.error("Resulting quantity cannot be negative")
      return
    }
    setSavingState((prev) => ({ ...prev, [item.id]: true }))
    try {
      const res = await fetch("/api/inventory", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, quantityChange: change }),
      })
      if (!res.ok) throw new Error("Save failed")
      toast.success(`Updated "${item.name}"`)
      setQuantityChanges((prev) => ({ ...prev, [item.id]: "" }))
      await fetchInventory()
    } catch {
      toast.error("Failed to update quantity")
    }
    setSavingState((prev) => ({ ...prev, [item.id]: false }))
  }

  function handleNewItemChange(field: keyof typeof newItem, val: string) {
    setNewItem((prev) => ({ ...prev, [field]: val }))
  }

  function resetNewItemForm() {
    setNewItem({ name: "", unit: "", quantity: "", minStock: "" })
    setShowNewForm(false)
  }

  async function createNewItem(e: React.FormEvent) {
    e.preventDefault()
    const { name, unit, quantity, minStock } = newItem

    if (!name.trim() || !unit.trim() || quantity === "" || minStock === "") {
      toast.error("Please fill all the fields")
      return
    }

    if (Number(quantity) < 0 || Number(minStock) < 0) {
      toast.error("Quantity fields must be non-negative numbers")
      return
    }

    if (!/^[a-zA-Z]{1,10}$/.test(unit.trim())) {
      toast.error("Unit must be text only (e.g., pcs, kg)")
      return
    }

    setCreating(true)
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
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || "Failed to add inventory item")
        setCreating(false)
        return
      }
      toast.success("Inventory item added")
      resetNewItemForm()
      await fetchInventory()
    } catch {
      toast.error("Failed to add inventory item")
    }
    setCreating(false)
  }

  async function handleDeleteRequest(item: InventoryItem) {
    setConfirmItem(item)
    setShowConfirm(true)
    setRecipesList([])
    setCheckingRecipes(true)
    try {
      const res = await fetch(`/api/inventory/usage?id=${item.id}`)
      if (!res.ok) throw new Error("Failed to fetch usage")
      const data = await res.json()
      setRecipesList(data.usedIn)
    } catch {
      setRecipesList([])
    } finally {
      setCheckingRecipes(false)
    }
  }

  async function confirmDelete() {
    if (!confirmItem) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/inventory?id=${confirmItem.id}`, {
        method: "DELETE",
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data?.error || "Failed to delete inventory item")
      } else {
        toast.success("Inventory item deleted")
        await fetchInventory()
      }
    } catch {
      toast.error("Failed to delete inventory item")
    }
    setDeleting(false)
    setShowConfirm(false)
    setConfirmItem(null)
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-8 bg-background min-h-screen">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-8 bg-background min-h-screen space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">Inventory Management</h1>
          <p className="text-text-secondary mt-1">Track and manage your restaurant inventory</p>
        </div>
        <Button
          onClick={() => setShowNewForm((f) => !f)}
          className="btn-primary w-full sm:w-auto"
          aria-expanded={showNewForm}
          aria-controls="new-inventory-form"
        >
          {showNewForm ? "Cancel" : "Add New Item"}
        </Button>
      </div>

      {showNewForm && (
        <Card className="card max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-text">Add New Inventory Item</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              id="new-inventory-form"
              onSubmit={createNewItem}
              className="space-y-4"
              aria-label="Add New Inventory Item Form"
            >
              {["Name", "Unit", "Current Quantity", "Min Stock"].map((label, idx) => {
                const fieldKey = ["name", "unit", "quantity", "minStock"][idx] as keyof typeof newItem
                return (
                  <div key={fieldKey}>
                    <label className="form-label">{label}</label>
                    <input
                      type={fieldKey === "name" || fieldKey === "unit" ? "text" : "number"}
                      min={fieldKey.includes("quantity") || fieldKey.includes("minStock") ? "0" : undefined}
                      className="form-control"
                      value={newItem[fieldKey]}
                      onChange={(e) => handleNewItemChange(fieldKey, e.target.value)}
                      required
                    />
                  </div>
                )
              })}
              
              <Button
                type="submit"
                disabled={creating}
                className="btn-primary w-full"
              >
                {creating ? "Adding..." : "Add Item"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const changeVal = quantityChanges[item.id]
          const editValue = changeVal === undefined ? "" : String(changeVal)
          const projectedQuantity = item.quantity + (typeof changeVal === "number" ? changeVal : 0)
          const updatedFormatted = new Date(item.updatedAt).toLocaleString()
          const isLowStock = item.quantity <= item.minStock
          
          return (
            <Card key={item.id} className={`card relative ${isLowStock ? 'border-warning' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold  text-text-primary pr-8 ">
                      {item.name}
                    </CardTitle>
                    {isLowStock && (
                      <div className="flex items-center gap-1 mt-1">
                        <svg className="h-4 w-4 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <span className="text-warning text-xs font-medium">Low Stock</span>
                      </div>
                    )}
                  </div>
                  <button
                    className="absolute top-2 right-2 p-2 text-text-secondary hover:text-error focus:outline-none focus:ring-2 focus:ring-error rounded"
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
                      className="w-5 h-5"
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
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Unit:</span>
                    <span className="text-text font-medium">{item.unit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Current:</span>
                    <span className={`font-medium ${isLowStock ? 'text-warning' : 'text-text'}`}>
                      {item.quantity} {item.unit}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Min Stock:</span>
                    <span className="text-text font-medium">{item.minStock} {item.unit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Last Updated:</span>
                    <span className="text-text-secondary text-xs">{updatedFormatted}</span>
                  </div>
                </div>

                <div className="space-y-3 pt-2 border-t border-border">
                  <div>
                    <label
                      htmlFor={`change-${item.id}`}
                      className="form-label text-sm " 
                    >
                      Change Quantity
                    </label>
                    <input
                      type="number"
                      id={`change-${item.id}`}
                      step="any"
                      value={editValue}
                      onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                      className="form-control"
                      placeholder="e.g. 5 to add, -2 to remove"
                      aria-describedby={`proj-${item.id}`}
                    />
                  </div>
                  
                  <p id={`proj-${item.id}`} className="text-text-secondary text-sm">
                    Projection: <strong className="text-primary">{projectedQuantity} {item.unit}</strong>
                  </p>
                  
                  <Button
                    size="sm"
                    disabled={savingState[item.id] || !editValue || Number(editValue) === 0}
                    onClick={() => saveQuantityChange(item)}
                    className="btn-primary w-full"
                  >
                    {savingState[item.id] ? "Saving..." : "Update Quantity"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Confirmation Modal */}
      {showConfirm && confirmItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-center items-center p-4">
          <Card className="card max-w-sm w-full">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-text">
                Delete "{confirmItem.name}"?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {checkingRecipes ? (
                <p className="text-text">Checking usage...</p>
              ) : recipesList.length > 0 ? (
                <>
                  <p className="text-text">
                    <strong>This ingredient is used in:</strong>
                  </p>
                  <ul className="list-disc list-inside max-h-32 sm:max-h-48 overflow-y-auto text-text-secondary">
                    {recipesList.map((recipeName) => (
                      <li key={recipeName} className="text-sm">{recipeName}</li>
                    ))}
                  </ul>
                  <p className="text-error font-medium text-sm">
                    If you delete this ingredient, it will be removed from all above recipes.
                  </p>
                </>
              ) : (
                <p className="text-success text-sm">
                  This ingredient is not used in any recipes.
                </p>
              )}
              <div className="flex gap-3 justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowConfirm(false)
                    setConfirmItem(null)
                  }}
                  size="sm"
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmDelete}
                  disabled={deleting || checkingRecipes}
            
                  size="sm"
                >
                  {deleting ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
