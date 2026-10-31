import { AlertTriangle, PiggyBank } from "lucide-react";

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function BudgetBar({ budget, onSetBudget }) {
  const limit = Number(budget?.monthlyLimit ?? 0);
  const spending = Number(budget?.totalSpending ?? 0);
  const percent = limit > 0 ? (spending / limit) * 100 : 0;
  const clampedPercent = Math.min(percent, 100);
  const warning = percent >= 85;

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-neutral-100 text-neutral-700">
            <PiggyBank size={19} />
          </span>
          <div>
            <h2 className="font-semibold text-neutral-900">Monthly budget</h2>
            <p className="mt-1 text-sm text-neutral-500">
              {budget
                ? `${new Date(budget.year, budget.month - 1).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}`
                : "Set a limit for this month"}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onSetBudget}
          className="rounded-full border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-50"
        >
          {budget ? "Update budget" : "Set budget"}
        </button>
      </div>

      {budget ? (
        <>
          <div className="mt-7 flex flex-wrap items-end justify-between gap-3">
            <p className="text-sm text-neutral-500">
              <span className="font-semibold text-neutral-900">{currency.format(spending)}</span>
              {" "}spent of {currency.format(limit)}
            </p>
            <p className={`text-sm font-medium ${warning ? "text-amber-700" : "text-neutral-500"}`}>
              {Math.round(percent)}% used
            </p>
          </div>
          <div
            className="mt-3 h-2.5 overflow-hidden rounded-full bg-neutral-100"
            role="progressbar"
            aria-valuenow={Math.round(percent)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Monthly budget used"
          >
            <div
              className={`h-full rounded-full transition-all ${warning ? "bg-amber-500" : "bg-neutral-900"}`}
              style={{ width: `${clampedPercent}%` }}
            />
          </div>
          {warning && (
            <p className="mt-3 inline-flex items-center gap-2 text-sm text-amber-700">
              <AlertTriangle size={15} />
              You’ve used at least 85% of this month’s budget.
            </p>
          )}
        </>
      ) : (
        <p className="mt-6 text-sm leading-6 text-neutral-500">
          Add a monthly spending limit to track expenses against your goal.
        </p>
      )}
    </section>
  );
}
