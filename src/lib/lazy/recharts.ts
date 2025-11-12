/**
 * Lazy loading wrapper for Recharts library
 * Reduces initial bundle size by ~300KB
 */

export const loadRecharts = async () => {
  const module = await import('recharts');
  return module;
};

export const loadLineChart = async () => {
  const { LineChart } = await import('recharts');
  return LineChart;
};

export const loadBarChart = async () => {
  const { BarChart } = await import('recharts');
  return BarChart;
};

export const loadPieChart = async () => {
  const { PieChart } = await import('recharts');
  return PieChart;
};

export const loadAreaChart = async () => {
  const { AreaChart } = await import('recharts');
  return AreaChart;
};
