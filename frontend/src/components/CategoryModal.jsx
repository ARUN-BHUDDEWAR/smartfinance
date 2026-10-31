import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { createCategory } from "../services/categoryService.js";

export default function CategoryModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: "", type: "EXPENSE" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      await createCategory({ name: form.name.trim(), type: form.type });
      await onCreated();
      onClose();
    } catch (requestError) {
      setError(requestError.response?.data?.message ?? "Could not create this category.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-30 grid place-items-center bg-neutral-950/30 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        aria-labelledby="category-modal-title"
        aria-modal="true"
        className="w-full max-w-md rounded-3xl border border-neutral-200 bg-white p-6 shadow-xl sm:p-8"
        role="dialog"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-neutral-500">Organize your money</p>
            <h2 id="category-modal-title" className="mt-1 text-xl font-semibold tracking-tight">
              New category
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="grid size-9 place-items-center rounded-full text-neutral-500 transition hover:bg-neutral-100"
          >
            <X size={18} />
          </button>
        </div>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-neutral-700">
            Name
            <input
              autoFocus
              className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none transition focus:border-neutral-400 focus:ring-4 focus:ring-neutral-100"
              maxLength={80}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="e.g. Groceries"
              required
              value={form.name}
            />
          </label>
          <div>
            <span className="text-sm font-medium text-neutral-700">Category type</span>
            <div className="mt-2 grid grid-cols-2 rounded-full bg-neutral-100 p-1">
              {[
                { value: "EXPENSE", label: "Expense" },
                { value: "INCOME", label: "Income" },
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setForm((current) => ({ ...current, type: item.value }))}
                  className={`rounded-full px-4 py-2.5 text-sm font-medium transition ${
                    form.type === item.value ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
          <button
            className="w-full rounded-full bg-neutral-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:opacity-50"
            disabled={saving}
            type="submit"
          >
            {saving ? "Adding…" : "Add category"}
          </button>
        </form>
      </section>
    </div>
  );
}
