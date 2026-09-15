import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CHART_COLORS, CHART_INK, chartAxisProps, compactNumber } from '../../../utils/chartTheme';
import ChartTooltip from './ChartTooltip';

const truncateLabel = (name = '') => (name.length > 14 ? `${name.slice(0, 14)}...` : name);

const ProductPerformanceChart = ({ data }) => {
  const chartData = data.map((p) => ({ name: truncateLabel(p.name), fullName: p.name, units: p.numSold }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={chartData} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 0 }} barCategoryGap="25%">
        <CartesianGrid horizontal={false} stroke={CHART_INK.grid} />
        <XAxis type="number" {...chartAxisProps} tickFormatter={compactNumber} allowDecimals={false} />
        <YAxis type="category" dataKey="name" {...chartAxisProps} width={100} />
        <Tooltip
          content={<ChartTooltip color={CHART_COLORS.orange} formatter={(v) => `${v.toLocaleString()} sold`} />}
          cursor={{ fill: CHART_INK.grid, opacity: 0.4 }}
        />
        <Bar dataKey="units" fill={CHART_COLORS.orange} radius={[0, 4, 4, 0]} maxBarSize={20} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ProductPerformanceChart;
