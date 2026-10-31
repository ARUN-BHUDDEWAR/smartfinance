import { Area, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function monthLabel(month, year) {
  return new Date(year, month - 1, 1).toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
}

function ForecastTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  const value = point.forecast ?? point.actual;

  return (
    <div className="rounded-xl border border-neutral-200 bg-white px-4 py-3 shadow-lg">
      <p className="text-xs text-neutral-500">{label}{point.forecast !== undefined ? " · Forecast" : " · Actual"}</p>
      <p className="mt-1 text-sm font-semibold text-neutral-900">{currency.format(value)}</p>
    </div>
  );
}

function ForecastNode({ cx, cy, payload }) {
  if (payload.forecast === undefined) return null;
  return (
    <g>
      <circle cx={cx} cy={cy} r={8} fill="white" stroke="#7c3aed" strokeWidth={3} />
      <circle cx={cx} cy={cy} r={3} fill="#7c3aed" />
    </g>
  );
}

export default function ForecastChart({ history = [], forecastedTotal, targetMonth, targetYear }) {
  const targetIndex = (targetMonth - 1);
  const targetDate = new Date(targetYear, targetIndex, 1);
  const targetLabel = targetDate.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
  const chartData = history.map((entry) => ({
    label: monthLabel(entry.month, entry.year),
    actual: Number(entry.total),
  }));
  const lastActual = chartData.at(-1);
  const data = [
    ...chartData.map((point, index) => ({
      ...point,
      forecast: index === chartData.length - 1 ? point.actual : undefined,
    })),
    {
      label: targetLabel,
      actual: undefined,
      forecast: Number(forecastedTotal),
    },
  ];

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
      <div>
        <h2 className="font-semibold text-neutral-900">Monthly spending trend</h2>
        <p className="mt-1 text-sm text-neutral-500">Completed months compared with the projection</p>
      </div>
      <div className="mt-6 h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="spendingFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#404040" stopOpacity={0.14} />
                <stop offset="100%" stopColor="#404040" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#f0f0f0" />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#737373", fontSize: 12 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#a3a3a3", fontSize: 11 }}
              tickFormatter={(value) => `₹${Intl.NumberFormat("en-IN", { notation: "compact" }).format(value)}`}
              width={48}
            />
            <Tooltip content={<ForecastTooltip />} />
            <Area
              type="monotone"
              dataKey="actual"
              stroke="none"
              fill="url(#spendingFill)"
              connectNulls={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="actual"
              name="Actual"
              stroke="#262626"
              strokeWidth={2.5}
              dot={{ r: 3, fill: "#262626", strokeWidth: 0 }}
              activeDot={{ r: 5 }}
              connectNulls={false}
              isAnimationActive={false}
            />
            <Line
              type="linear"
              dataKey="forecast"
              name="Forecast"
              stroke="#7c3aed"
              strokeWidth={2}
              strokeDasharray="6 5"
              dot={<ForecastNode />}
              activeDot={{ r: 6, fill: "#7c3aed", stroke: "white", strokeWidth: 2 }}
              connectNulls
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-neutral-500">
        <span className="inline-flex items-center gap-2">
          <span className="h-0.5 w-5 bg-neutral-800" /> Actual spending
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="w-5 border-t-2 border-dashed border-violet-600" /> Forecast
        </span>
        {lastActual && (
          <span className="ml-auto">Forecast for {targetDate.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</span>
        )}
      </div>
    </section>
  );
}
