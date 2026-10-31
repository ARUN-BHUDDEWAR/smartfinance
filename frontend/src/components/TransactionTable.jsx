import { ArrowDownLeft, ArrowUpRight, Trash2 } from "lucide-react";

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
});

export default function TransactionTable({
  transactions,
  onDelete,
  emptyMessage = "Transactions will appear here once you add them.",
  compact = false,
}) {
  if (!transactions.length) {
    return (
      <div className="px-6 py-12 text-center">
        <p className="text-sm text-neutral-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-left">
        <thead>
          <tr className="border-b border-neutral-100 text-xs font-medium uppercase tracking-wide text-neutral-400">
            <th className="px-5 py-3 sm:px-6">Transaction</th>
            <th className="px-5 py-3 sm:px-6">Category</th>
            <th className="px-5 py-3 sm:px-6">Date</th>
            <th className="px-5 py-3 text-right sm:px-6">Amount</th>
            {onDelete && <th className="w-12 px-3 py-3" aria-label="Actions" />}
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => {
            const income = transaction.type === "INCOME";
            const Icon = income ? ArrowDownLeft : ArrowUpRight;
            return (
              <tr key={transaction.id} className="border-b border-neutral-100 last:border-0">
                <td className="px-5 py-4 sm:px-6">
                  <div className="flex items-center gap-3">
                    <span className={`grid size-9 shrink-0 place-items-center rounded-full ${
                      income ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                    }`}>
                      <Icon size={16} />
                    </span>
                    <span className="min-w-0">
                      <span className="block max-w-48 truncate text-sm font-medium text-neutral-900">
                        {transaction.description || transaction.categoryName}
                      </span>
                      {!compact && (
                        <span className="mt-0.5 block text-xs text-neutral-400">
                          {income ? "Income" : "Expense"}
                        </span>
                      )}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-4 sm:px-6">
                  <span className="inline-flex rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs text-neutral-600">
                    {transaction.categoryName}
                  </span>
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-sm text-neutral-500 sm:px-6">
                  {new Date(`${transaction.date}T00:00:00`).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
                <td className={`whitespace-nowrap px-5 py-4 text-right text-sm font-semibold sm:px-6 ${
                  income ? "text-emerald-700" : "text-rose-700"
                }`}>
                  {income ? "+" : "−"}{currency.format(Number(transaction.amount))}
                </td>
                {onDelete && (
                  <td className="px-3 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => onDelete(transaction)}
                      aria-label={`Delete ${transaction.description || transaction.categoryName}`}
                      className="grid size-8 place-items-center rounded-full text-neutral-400 transition hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
