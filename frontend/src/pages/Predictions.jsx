import { AlertCircle, BrainCircuit, RefreshCw, TrendingUp } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import CategoryBreakdownCard from "../components/CategoryBreakdownCard.jsx";
import ConfidenceMeter from "../components/ConfidenceMeter.jsx";
import ForecastChart from "../components/ForecastChart.jsx";
import { getPrediction } from "../services/predictionService.js";

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

const lookbackOptions = [3, 6, 12];

export default function Predictions() {
  const [months, setMonths] = useState(6);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [insufficientHistory, setInsufficientHistory] = useState(false);
  const [error, setError] = useState("");

  const loadPrediction = useCallback(async () => {
    setLoading(true);
    setError("");
    setInsufficientHistory(false);
    try {
      setPrediction(await getPrediction(months));
    } catch (requestError) {
      setPrediction(null);
      const message = requestError.response?.data?.message ?? "";
      if (requestError.response?.status === 400 && message.includes("At least two months")) {
        setInsufficientHistory(true);
      } else {
        setError(message || "Could not load your expense forecast.");
      }
    } finally {
      setLoading(false);
    }
  }, [months]);

  useEffect(() => {
    loadPrediction();
  }, [loadPrediction]);

  const targetDate = prediction
    ? new Date(prediction.targetYear, prediction.targetMonth - 1, 1)
    : null;
  const methodLabel = prediction?.methodUsed === "LINEAR_REGRESSION"
    ? "Linear regression"
    : "Recency-weighted average";

  return (
    <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-sm font-medium text-neutral-500">Plan with perspective</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-950">Expense forecast</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-500">
            A transparent projection based on your completed monthly expenses. This is a planning aid, not a guarantee.
          </p>
        </div>
        <div>
          <label htmlFor="forecast-lookback" className="mb-2 block text-xs font-medium text-neutral-500">
            Historical lookback
          </label>
          <select
            id="forecast-lookback"
            className="rounded-full border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 outline-none transition focus:border-neutral-400 focus:ring-4 focus:ring-neutral-100"
            onChange={(event) => setMonths(Number(event.target.value))}
            value={months}
          >
            {lookbackOptions.map((option) => (
              <option key={option} value={option}>{option} months</option>
            ))}
          </select>
        </div>
      </header>

      {error && (
        <div role="alert" className="mt-8 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <div className="flex-1">{error}</div>
          <button type="button" onClick={loadPrediction} className="inline-flex items-center gap-2 rounded-full px-3 py-1 font-medium hover:bg-rose-100">
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      )}

      {loading ? (
        <section className="mt-8 rounded-3xl border border-neutral-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto grid size-11 place-items-center rounded-2xl bg-neutral-100 text-neutral-700">
            <TrendingUp size={20} />
          </div>
          <p className="mt-4 text-sm text-neutral-500">Calculating your forecast…</p>
        </section>
      ) : insufficientHistory ? (
        <section className="relative mt-8 overflow-hidden rounded-3xl border border-neutral-200 bg-white px-6 py-14 text-center shadow-sm sm:px-10">
          <div className="pointer-events-none absolute -right-10 -top-20 size-64 rounded-full bg-violet-100/70 blur-3xl" />
          <div className="relative mx-auto grid size-12 place-items-center rounded-2xl bg-neutral-100 text-neutral-700">
            <BrainCircuit size={22} />
          </div>
          <h2 className="relative mt-5 text-xl font-semibold tracking-tight text-neutral-900">
            A little more history will make this useful
          </h2>
          <p className="relative mx-auto mt-3 max-w-lg text-sm leading-6 text-neutral-500">
            Forecasts need expenses recorded in at least two different completed months within your selected {months}-month window.
            Add transactions across another month, then come back to see your spending trend.
          </p>
          <p className="relative mt-4 text-xs text-neutral-400">
            Months with no recorded expenses are included as zero in the trend once enough expense history exists.
          </p>
        </section>
      ) : prediction && (
        <>
          <section className="relative mt-8 overflow-hidden rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="pointer-events-none absolute -right-16 -top-24 size-72 rounded-full bg-violet-100/60 blur-3xl" />
            <div className="relative flex flex-wrap items-start justify-between gap-6">
              <div>
                <p className="text-sm font-medium text-neutral-500">
                  Projected total spend · {targetDate.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
                </p>
                <p className="mt-3 text-4xl font-semibold tracking-tight text-neutral-950 sm:text-5xl">
                  {currency.format(Number(prediction.forecastedTotal))}
                </p>
                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-3.5 py-1.5 text-xs font-medium text-white">
                    <TrendingUp size={14} />
                    {methodLabel}
                  </span>
                  <span className="rounded-full border border-neutral-200 bg-white px-3.5 py-1.5 text-xs text-neutral-500">
                    {months}-month history
                  </span>
                </div>
              </div>
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50/80 px-5 py-4">
                <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">Method</p>
                <p className="mt-2 text-sm font-semibold text-neutral-800">{methodLabel}</p>
                <p className="mt-1 max-w-xs text-xs leading-5 text-neutral-500">
                  {prediction.methodUsed === "LINEAR_REGRESSION"
                    ? "A least-squares line fitted to monthly totals."
                    : "A weighted average that gives recent months more influence."}
                </p>
              </div>
            </div>
          </section>

          <section className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.9fr)]">
            <ForecastChart
              history={prediction.historicalMonthlyTotals}
              forecastedTotal={prediction.forecastedTotal}
              targetMonth={prediction.targetMonth}
              targetYear={prediction.targetYear}
            />
            <div className="space-y-6">
              <CategoryBreakdownCard categories={prediction.categoryBreakdown} />
              <ConfidenceMeter
                confidenceScore={prediction.confidenceScore}
                methodUsed={prediction.methodUsed}
              />
            </div>
          </section>
        </>
      )}
    </main>
  );
}
