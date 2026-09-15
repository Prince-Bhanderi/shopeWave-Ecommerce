import { CHART_INK } from '../../../utils/chartTheme';

/**
 * Shared Recharts tooltip: text always uses ink tokens (never the series
 * color) - identity comes from the small colored dot beside the value.
 */
const ChartTooltip = ({ active, payload, label, formatter, color }) => {
  if (!active || !payload?.length) return null;

  return (
    <div
      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg"
      style={{ color: CHART_INK.primary }}
    >
      <p className="mb-1 font-medium" style={{ color: CHART_INK.secondary }}>
        {label}
      </p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color || entry.color }} />
          <span className="font-semibold">{formatter ? formatter(entry.value) : entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export default ChartTooltip;
