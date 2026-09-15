import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CHART_COLORS, CHART_INK, chartAxisProps, compactNumber } from '../../../utils/chartTheme';
import ChartTooltip from './ChartTooltip';

const OrdersChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={260}>
    <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
      <CartesianGrid vertical={false} stroke={CHART_INK.grid} />
      <XAxis dataKey="date" {...chartAxisProps} minTickGap={24} />
      <YAxis {...chartAxisProps} width={40} tickFormatter={compactNumber} allowDecimals={false} />
      <Tooltip
        content={<ChartTooltip color={CHART_COLORS.violet} formatter={(v) => `${v.toLocaleString()} orders`} />}
        cursor={{ stroke: CHART_INK.baseline, strokeWidth: 1 }}
      />
      <Line
        type="monotone"
        dataKey="orders"
        stroke={CHART_COLORS.violet}
        strokeWidth={2}
        dot={false}
        activeDot={{ r: 4, stroke: CHART_INK.surface, strokeWidth: 2 }}
      />
    </LineChart>
  </ResponsiveContainer>
);

export default OrdersChart;
