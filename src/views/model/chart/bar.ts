export interface BarItem<T> {
	xAxis?: string[];
	yAxis?: {
		type: string;
		name: string;
		min?: number;
		max?: number;
		nameGap?: number;
		nameLocation?: string;
		interval?: number;
		axisLabel?: {
			show: boolean;
			rotate: number;
			interval: number;
			formatter: string;
		};
		axisTick?: {
			show: boolean;
		};
	}[];
	series?: T[][];
	yTitle?: string[];
	xTile?: string;
	yNameGap?: number;
	tooltip?: object;
	legend?: [];
	color?: string;
	grid?: {
		left?: string | number;
		right?: string | number;
		top?: string | number;
		bottom?: string | number;
	};
	dataType?: string[];
	stackInfo?: string[];
	nameInfo?: string[];
}
