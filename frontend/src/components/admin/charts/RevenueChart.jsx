import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CHART_COLORS, CHART_INK, chartAxisProps, compactCurrency } from '../../../utils/chartTheme';
import ChartTooltip from './ChartTooltip';

const RevenueChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={260}>
    <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
      <defs>
        <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={CHART_COLORS.blue} stopOpacity={0.18} />
          <stop offset="100%" stopColor={CHART_COLORS.blue} stopOpacity={0.02} />
        </linearGradient>
      </defs>
      <CartesianGrid vertical={false} stroke={CHART_INK.grid} strokeDasharray="0" />
      <XAxis dataKey="date" {...chartAxisProps} minTickGap={24} />
      <YAxis {...chartAxisProps} width={56} tickFormatter={compactCurrency} />
      <Tooltip content={<ChartTooltip color={CHART_COLORS.blue} formatter={(v) => `$${v.toLocaleString()}`} />} cursor={{ stroke: CHART_INK.baseline, strokeWidth: 1 }} />
      <Area
        type="monotone"
        dataKey="revenue"
        stroke={CHART_COLORS.blue}
        strokeWidth={2}
        fill="url(#revenueFill)"
        activeDot={{ r: 4, stroke: CHART_INK.surface, strokeWidth: 2 }}
      />
    </AreaChart>
  </ResponsiveContainer>
);

export default RevenueChart;
