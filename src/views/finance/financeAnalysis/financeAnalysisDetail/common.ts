import type { Dayjs } from 'dayjs';

export interface ItemInfo {
	name: string;
	value: number | string;
}

export interface barItem<T> {
	xAxis?: string[];
	series?: T[][];
	yTitle?: string[];
	xTile: string;
	yNameGap?: number;
	tooltip?: object;
	legend?: [];
	color?: string;
}

export interface FinanceDetail {
	id?: number;
	name?: string;
	typeCode?: string;
	amount?: number;
	fromSource?: string;
	fromSourceName?: string;
	isValid?: string;
	infoDate?: Dayjs | string;
	incomeAndExpenses?: string;
	belongTo?: string;
}
