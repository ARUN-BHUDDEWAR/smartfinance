import { ArrowLeft, ArrowRight, Plus, SlidersHorizontal } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import TransactionTable from "../components/TransactionTable.jsx";
import { getCategories } from "../services/categoryService.js";
import { deleteTransaction, getTransactions } from "../services/transactionService.js";

export default function Transactions() {
  const [pageData, setPageData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [type, setType] = useState("ALL");
  const [categoryId, setCategoryId] = useState("");
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [transactions, categoryList] = await Promise.all([
        getTransactions(page, 10, type, categoryId),
        getCategories(),
      ]);
      setPageData(transactions);
      setCategories(categoryList);
    } catch (requestError) {
      setError(requestError.response?.data?.message ?? "Could not load transactions.");
    } finally {
      setLoading(false);
    }
  }, [page, type, categoryId]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  async function handleDelete(transaction) {
    if (!window.confirm("Delete this transaction? This cannot be undone.")) return;
    setError("");
    try {
      await deleteTransaction(transaction.id);
      await loadTransactions();
    } catch (requestError) {
      setError(requestError.response?.data?.message ?? "Could not delete this transaction.");
    }
  }

  function updateType(value) {
    setPage(0);
    setType(value);
    setCategoryId("");
  }

  function updateCategory(event) {
    setPage(0);
    setCategoryId(event.target.value);
  }

  return (
    <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-sm font-medium text-neutral-500">Your activity</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-950">Transactions</h1>
          <p className="mt-2 text-sm text-neutral-500">Browse and manage your transaction history.</p>
        </div>
        <Link to="/dashboard" className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-700">
          <Plus size={16} /> Add transaction
        </Link>
      </header>

      <section className="mt-8 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-100 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-2 text-sm font-medium text-neutral-700">
            <SlidersHorizontal size={16} />
            Filters
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex gap-1 rounded-full bg-neutral-100 p-1" aria-label="Filter by transaction type">
              {[
                ["ALL", "All"],
                ["INCOME", "Income"],
                ["EXPENSE", "Expense"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => updateType(value)}
                  aria-pressed={type === value}
                  className={`rounded-full px-3 py-2 text-xs font-medium transition sm:px-4 sm:text-sm ${
                    type === value ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-900"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <select
              aria-label="Filter by category"
              className="rounded-full border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-700 outline-none focus:border-neutral-400"
              onChange={updateCategory}
              value={categoryId}
            >
              <option value="">All categories</option>
              {categories
                .filter((category) => type === "ALL" || category.type === type)
                .map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
            </select>
          </div>
        </div>

        {error && <p role="alert" className="mx-5 mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 sm:mx-6">{error}</p>}
        {loading ? (
          <p className="px-6 py-12 text-center text-sm text-neutral-500">Loading transactions…</p>
        ) : (
          <TransactionTable
            transactions={pageData?.content ?? []}
            onDelete={handleDelete}
            emptyMessage="No transactions match these filters."
          />
        )}

        <footer className="flex items-center justify-between border-t border-neutral-100 px-5 py-4 sm:px-6">
          <p className="text-sm text-neutral-500">
            {pageData?.totalElements ?? 0} transaction{pageData?.totalElements === 1 ? "" : "s"}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(0, current - 1))}
              disabled={loading || page === 0}
              className="grid size-9 place-items-center rounded-full border border-neutral-200 text-neutral-600 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Previous page"
            >
              <ArrowLeft size={16} />
            </button>
            <span className="min-w-16 text-center text-sm text-neutral-500">
              {pageData ? `${pageData.number + 1} / ${Math.max(pageData.totalPages, 1)}` : "—"}
            </span>
            <button
              type="button"
              onClick={() => setPage((current) => current + 1)}
              disabled={loading || !pageData || page + 1 >= pageData.totalPages}
              className="grid size-9 place-items-center rounded-full border border-neutral-200 text-neutral-600 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Next page"
            >
              <ArrowRight size={16} />
            </button>
          </div>
        </footer>
      </section>
    </main>
  );
}
