// Validated categorical palette (see dataviz skill / references/palette.md).
// Order is fixed - it is the CVD-safety mechanism, never cycle or reorder.
export const CHART_COLORS = {
  blue: '#2a78d6',
  orange: '#eb6834',
  aqua: '#1baf7a',
  yellow: '#eda100',
  magenta: '#e87ba4',
  green: '#008300',
  violet: '#4a3aa7',
  red: '#e34948',
};

export const CHART_INK = {
  primary: '#0b0b0b',
  secondary: '#52514e',
  muted: '#898781',
  grid: '#e1e0d9',
  baseline: '#c3c2b7',
  surface: '#fcfcfb',
};

export const chartAxisProps = {
  tick: { fill: CHART_INK.muted, fontSize: 12 },
  axisLine: { stroke: CHART_INK.baseline },
  tickLine: false,
};

export const compactNumber = (value) =>
  new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value);

export const compactCurrency = (value) =>
  `$${new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value)}`;
