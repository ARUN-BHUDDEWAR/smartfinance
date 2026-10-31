import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createTransaction } from "../services/transactionService.js";

const inputClass =
  "mt-2 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-400 focus:ring-4 focus:ring-neutral-100";

function localDateValue() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function TransactionModal({ categories, onClose, onCreated }) {
  const [type, setType] = useState("EXPENSE");
  const [form, setForm] = useState({
    amount: "",
    categoryId: "",
    date: localDateValue(),
    description: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const availableCategories = useMemo(
    () => categories.filter((category) => category.type === type),
    [categories, type],
  );

  useEffect(() => {
    setForm((current) => ({ ...current, categoryId: "" }));
  }, [type]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      await createTransaction({
        ...form,
        amount: Number(form.amount),
        categoryId: Number(form.categoryId),
      });
      await onCreated();
      onClose();
    } catch (requestError) {
      setError(requestError.response?.data?.message ?? "Could not save this transaction.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-30 grid place-items-center overflow-y-auto bg-neutral-950/30 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        aria-labelledby="transaction-modal-title"
        aria-modal="true"
        className="w-full max-w-lg rounded-3xl border border-neutral-200 bg-white p-6 shadow-xl sm:p-8"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-neutral-500">Your activity</p>
            <h2 id="transaction-modal-title" className="mt-1 text-xl font-semibold tracking-tight">
              Add transaction
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="grid size-9 place-items-center rounded-full text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900"
          >
            <X size={18} />
          </button>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 rounded-full bg-neutral-100 p-1">
            {[
              { value: "EXPENSE", label: "Expense" },
              { value: "INCOME", label: "Income" },
            ].map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setType(item.value)}
                className={`rounded-full px-4 py-2.5 text-sm font-medium transition ${
                  type === item.value ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <label className="block text-sm font-medium text-neutral-700">
            Amount (₹)
            <input
              className={inputClass}
              min="0.01"
              name="amount"
              onChange={updateField}
              placeholder="0.00"
              required
              step="0.01"
              type="number"
              value={form.amount}
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-neutral-700">
              Category
              <select
                className={inputClass}
                name="categoryId"
                onChange={updateField}
                required
                value={form.categoryId}
              >
                <option value="">Select category</option>
                {availableCategories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium text-neutral-700">
              Date
              <input
                className={inputClass}
                name="date"
                onChange={updateField}
                required
                type="date"
                value={form.date}
              />
            </label>
          </div>

          {availableCategories.length === 0 && (
            <p className="text-sm text-neutral-500">
              Add an {type.toLowerCase()} category before recording this transaction.
            </p>
          )}

          <label className="block text-sm font-medium text-neutral-700">
            Description <span className="font-normal text-neutral-400">(optional)</span>
            <input
              className={inputClass}
              maxLength={500}
              name="description"
              onChange={updateField}
              placeholder="What was this for?"
              value={form.description}
            />
          </label>

          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

          <button
            className="w-full rounded-full bg-neutral-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={saving || availableCategories.length === 0}
            type="submit"
          >
            {saving ? "Saving…" : "Save transaction"}
          </button>
        </form>
      </section>
    </div>
  );
}
