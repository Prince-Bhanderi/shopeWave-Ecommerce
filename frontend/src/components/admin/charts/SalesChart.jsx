import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CHART_COLORS, CHART_INK, chartAxisProps, compactNumber } from '../../../utils/chartTheme';
import ChartTooltip from './ChartTooltip';

const SalesChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={260}>
    <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barCategoryGap="30%">
      <CartesianGrid vertical={false} stroke={CHART_INK.grid} />
      <XAxis dataKey="date" {...chartAxisProps} minTickGap={24} />
      <YAxis {...chartAxisProps} width={40} tickFormatter={compactNumber} allowDecimals={false} />
      <Tooltip
        content={<ChartTooltip color={CHART_COLORS.aqua} formatter={(v) => `${v.toLocaleString()} units`} />}
        cursor={{ fill: CHART_INK.grid, opacity: 0.4 }}
      />
      <Bar dataKey="units" fill={CHART_COLORS.aqua} radius={[4, 4, 0, 0]} maxBarSize={24} />
    </BarChart>
  </ResponsiveContainer>
);

export default SalesChart;
