import { Info } from "lucide-react";

export default function ConfidenceMeter({ confidenceScore, methodUsed }) {
  const percentage = Math.round(Math.max(0, Math.min(1, confidenceScore ?? 0)) * 100);
  const regression = methodUsed === "LINEAR_REGRESSION";
  const description = regression
    ? percentage >= 70
      ? "High fit based on consistent spending trends."
      : "Trend fit is moderate; monthly spending still varies."
    : "Recency-weighted fallback used because the trend was irregular.";

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-neutral-700">Confidence</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-neutral-900">{percentage}%</p>
        </div>
        <span className="grid size-9 place-items-center rounded-full bg-neutral-100 text-neutral-500">
          <Info size={17} />
        </span>
      </div>
      <div
        className="mt-4 h-2 overflow-hidden rounded-full bg-neutral-100"
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Forecast confidence"
      >
        <div
          className="h-full rounded-full bg-neutral-800 transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="mt-3 text-xs leading-5 text-neutral-500">{description}</p>
      <p className="mt-2 text-[11px] leading-4 text-neutral-400">
        Heuristic based on sample size and trend fit; not a guarantee of future spending.
      </p>
    </div>
  );
}
