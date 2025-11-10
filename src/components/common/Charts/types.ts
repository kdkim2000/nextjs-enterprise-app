/**
 * Common types for Chart components
 */

export interface ChartDataPoint {
  [key: string]: string | number;
}

export interface ChartSeries {
  dataKey: string;
  name?: string;
  color?: string;
  strokeWidth?: number;
  fillOpacity?: number;
  stackId?: string;
  yAxisId?: string;
  type?: 'line' | 'bar' | 'area';
}

export interface BaseChartProps {
  data: ChartDataPoint[];
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  paper?: boolean;
  xAxisLabel?: string;
  yAxisLabel?: string;
  xAxisKey?: string;
}
