import { PieChart } from "lucide-react";

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function CategoryBreakdownCard({ categories = [] }) {
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-3">
        <span className="grid size-10 place-items-center rounded-xl bg-neutral-100 text-neutral-700">
          <PieChart size={18} />
        </span>
        <div>
          <h2 className="font-semibold text-neutral-900">By category</h2>
          <p className="mt-1 text-sm text-neutral-500">Based on your historical expense mix</p>
        </div>
      </div>

      {categories.length ? (
        <ul className="mt-6 space-y-5">
          {categories.map((category) => {
            const share = Math.max(0, Math.min(100, Number(category.historicalPercentageShare)));
            return (
              <li key={category.categoryName}>
                <div className="flex items-center justify-between gap-4">
                  <span className="min-w-0 truncate text-sm font-medium text-neutral-800">
                    {category.categoryName}
                  </span>
                  <span className="shrink-0 text-sm font-semibold text-neutral-900">
                    {currency.format(Number(category.predictedAmount))}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-100">
                    <div className="h-full rounded-full bg-neutral-800" style={{ width: `${share}%` }} />
                  </div>
                  <span className="w-12 text-right text-xs tabular-nums text-neutral-500">
                    {share.toFixed(1)}%
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-6 text-sm text-neutral-500">No expense categories found in this history.</p>
      )}
    </section>
  );
}
