import { Plus, Tag, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import CategoryModal from "../components/CategoryModal.jsx";
import { deleteCategory, getCategories } from "../services/categoryService.js";

const groups = [
  { type: "EXPENSE", title: "Expense categories", description: "Organize where your money goes." },
  { type: "INCOME", title: "Income categories", description: "Track the sources of your income." },
];

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  const loadCategories = useCallback(async () => {
    setError("");
    try {
      setCategories(await getCategories());
    } catch (requestError) {
      setError(requestError.response?.data?.message ?? "Could not load categories.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  async function handleDelete(category) {
    if (!window.confirm(`Delete the "${category.name}" category?`)) return;
    setError("");
    try {
      await deleteCategory(category.id);
      await loadCategories();
    } catch (requestError) {
      setError(requestError.response?.data?.message ?? "Could not delete this category.");
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-sm font-medium text-neutral-500">Make it yours</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-950">Categories</h1>
          <p className="mt-2 text-sm text-neutral-500">Create categories that make your finances easier to understand.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-700"
        >
          <Plus size={16} /> Add category
        </button>
      </header>

      {error && <p role="alert" className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

      {loading ? (
        <p className="mt-10 text-sm text-neutral-500">Loading categories…</p>
      ) : (
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {groups.map((group) => {
            const items = categories.filter((category) => category.type === group.type);
            return (
              <section key={group.type} className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
                <div className="border-b border-neutral-100 px-5 py-5">
                  <h2 className="font-semibold text-neutral-900">{group.title}</h2>
                  <p className="mt-1 text-sm text-neutral-500">{group.description}</p>
                </div>
                {items.length ? (
                  <ul className="divide-y divide-neutral-100">
                    {items.map((category) => (
                      <li key={category.id} className="flex items-center justify-between gap-4 px-5 py-4">
                        <span className="flex min-w-0 items-center gap-3">
                          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-neutral-100 text-neutral-600">
                            <Tag size={16} />
                          </span>
                          <span className="truncate text-sm font-medium text-neutral-800">{category.name}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDelete(category)}
                          aria-label={`Delete ${category.name}`}
                          className="grid size-9 shrink-0 place-items-center rounded-full text-neutral-400 transition hover:bg-rose-50 hover:text-rose-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="px-5 py-8 text-center text-sm text-neutral-500">No categories yet.</p>
                )}
              </section>
            );
          })}
        </div>
      )}

      {showModal && (
        <CategoryModal
          onClose={() => setShowModal(false)}
          onCreated={loadCategories}
        />
      )}
    </main>
  );
}
