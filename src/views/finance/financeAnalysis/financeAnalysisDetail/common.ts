import type { Dayjs } from 'dayjs';

export interface ItemInfo {
	name: string;
	value: number | string;
}

export interface FinanceDetail {
	id?: number;
	name?: string;
	typeCode?: string;
	typeName?: string;
	amount?: number;
	fromSource?: string;
	fromSourceName?: string;
	isValid?: string;
	infoDate?: Dayjs | string;
	incomeAndExpenses?: string;
	belongTo?: string;
	yoyTrend?: string;
	momTrend?: string;
}
