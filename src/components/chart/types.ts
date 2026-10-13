/**
 * 移动端图表组件通用类型定义
 */

export interface BarAxisItem {
	type: string;
	name: string;
	min?: number;
	max?: number;
	nameGap?: number;
	nameLocation?: string;
	interval?: number;
	axisLabel?: {
		show?: boolean;
		rotate?: number;
		interval?: number;
		formatter?: string | ((value: number) => string | number);
	};
	axisTick?: {
		show?: boolean;
	};
}

export interface BarGridConfig {
	left?: string | number;
	right?: string | number;
	top?: string | number;
	bottom?: string | number;
}

export interface BarItem<T = number> {
	xAxis?: string[];
	yAxis?: BarAxisItem[];
	series?: T[][];
	yTitle?: string[];
	xTile?: string;
	xTitle?: string;
	yNameGap?: number;
	tooltip?: Record<string, unknown>;
	legend?: unknown[];
	color?: string;
	grid?: BarGridConfig;
	dataType?: string[];
	stackInfo?: string[];
	nameInfo?: string[];
}

export interface PieChartItem {
	name: string;
	value: number;
	[key: string]: unknown;
}
