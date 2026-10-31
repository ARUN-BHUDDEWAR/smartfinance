import { ArrowDownRight, ArrowUpRight, CircleDollarSign } from "lucide-react";

const icons = {
  income: ArrowUpRight,
  expense: ArrowDownRight,
  balance: CircleDollarSign,
};

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

export default function StatCard({ title, value, variant = "balance", badge }) {
  const Icon = icons[variant] ?? CircleDollarSign;

  return (
    <article className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm font-medium text-neutral-500">{title}</p>
        <span className="grid size-9 place-items-center rounded-xl bg-neutral-100 text-neutral-700">
          <Icon size={18} strokeWidth={1.8} />
        </span>
      </div>
      <p className="mt-5 text-2xl font-semibold tracking-tight text-neutral-900">
        {currency.format(Number(value ?? 0))}
      </p>
      {badge && (
        <span className="mt-3 inline-flex rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-600">
          {badge}
        </span>
      )}
    </article>
  );
}
