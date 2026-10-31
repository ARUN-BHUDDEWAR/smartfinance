import { ArrowRight, Plus, WalletCards } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import BudgetBar from "../components/BudgetBar.jsx";
import StatCard from "../components/StatCard.jsx";
import TransactionModal from "../components/TransactionModal.jsx";
import TransactionTable from "../components/TransactionTable.jsx";
import { getCategories } from "../services/categoryService.js";
import { getCurrentBudget, setBudget } from "../services/budgetService.js";
import { deleteTransaction, getSummary, getTransactions } from "../services/transactionService.js";

const today = new Date();
const currentMonth = today.getMonth() + 1;
const currentYear = today.getFullYear();

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [budget, setBudgetState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [budgetLimit, setBudgetLimit] = useState("");
  const [savingBudget, setSavingBudget] = useState(false);

  const loadDashboard = useCallback(async () => {
    setError("");
    try {
      const [summaryData, pageData, categoryData] = await Promise.all([
        getSummary(),
        getTransactions(0, 5),
        getCategories(),
      ]);
      setSummary(summaryData);
      setTransactions(pageData.content);
      setCategories(categoryData);
      try {
        setBudgetState(await getCurrentBudget());
      } catch (budgetError) {
        if (budgetError.response?.status === 404) {
          setBudgetState(null);
        } else {
          throw budgetError;
        }
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message ?? "Could not load your dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  async function handleDelete(transaction) {
    if (!window.confirm("Delete this transaction? This cannot be undone.")) return;
    setError("");
    try {
      await deleteTransaction(transaction.id);
      await loadDashboard();
    } catch (requestError) {
      setError(requestError.response?.data?.message ?? "Could not delete this transaction.");
    }
  }

  async function handleBudgetSubmit(event) {
    event.preventDefault();
    setSavingBudget(true);
    setError("");
    try {
      const saved = await setBudget({
        monthlyLimit: Number(budgetLimit),
        month: currentMonth,
        year: currentYear,
      });
      setBudgetState(saved);
      setShowBudgetForm(false);
      setBudgetLimit("");
    } catch (requestError) {
      setError(requestError.response?.data?.message ?? "Could not save your budget.");
    } finally {
      setSavingBudget(false);
    }
  }

  if (loading) {
    return <main className="mx-auto max-w-7xl px-5 py-16 text-sm text-neutral-500 sm:px-8">Loading your dashboard…</main>;
  }

  return (
    <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-sm font-medium text-neutral-500">Your finances</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-950">Overview</h1>
          <p className="mt-2 text-sm text-neutral-500">A clear view of your money, all in one place.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/categories"
            className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100"
          >
            <WalletCards size={16} />
            Categories
          </Link>
          <button
            type="button"
            onClick={() => setShowTransactionModal(true)}
            className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-700"
          >
            <Plus size={16} />
            Add transaction
          </button>
        </div>
      </header>

      {error && <p role="alert" className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Total income" value={summary?.totalIncome} variant="income" />
        <StatCard title="Total expenses" value={summary?.totalExpense} variant="expense" />
        <StatCard title="Net balance" value={summary?.balance} variant="balance" />
      </section>

      <section className="mt-6">
        <BudgetBar budget={budget} onSetBudget={() => setShowBudgetForm(true)} />
      </section>

      {showBudgetForm && (
        <div
          className="fixed inset-0 z-30 grid place-items-center bg-neutral-950/30 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowBudgetForm(false);
          }}
        >
          <section aria-labelledby="budget-title" aria-modal="true" className="w-full max-w-md rounded-3xl border border-neutral-200 bg-white p-7 shadow-xl" role="dialog">
            <p className="text-sm text-neutral-500">{today.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</p>
            <h2 id="budget-title" className="mt-1 text-xl font-semibold">Set monthly budget</h2>
            <form className="mt-6 space-y-5" onSubmit={handleBudgetSubmit}>
              <label className="block text-sm font-medium text-neutral-700">
                Monthly limit (₹)
                <input
                  autoFocus
                  className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3 outline-none focus:border-neutral-400 focus:ring-4 focus:ring-neutral-100"
                  min="0.01"
                  onChange={(event) => setBudgetLimit(event.target.value)}
                  required
                  step="0.01"
                  type="number"
                  value={budgetLimit}
                />
              </label>
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowBudgetForm(false)} className="w-full rounded-full border border-neutral-200 px-4 py-3 text-sm font-medium hover:bg-neutral-50">
                  Cancel
                </button>
                <button type="submit" disabled={savingBudget} className="w-full rounded-full bg-neutral-900 px-4 py-3 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50">
                  {savingBudget ? "Saving…" : "Save budget"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      <section className="mt-8 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 px-5 py-5 sm:px-6">
          <div>
            <h2 className="font-semibold text-neutral-900">Recent transactions</h2>
            <p className="mt-1 text-sm text-neutral-500">Your latest activity</p>
          </div>
          <Link to="/transactions" className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-900">
            View all <ArrowRight size={15} />
          </Link>
        </div>
        <TransactionTable
          transactions={transactions}
          onDelete={handleDelete}
          compact
          emptyMessage="No transactions yet. Add one to get started."
        />
      </section>

      {showTransactionModal && (
        <TransactionModal
          categories={categories}
          onClose={() => setShowTransactionModal(false)}
          onCreated={loadDashboard}
        />
      )}
    </main>
  );
}
