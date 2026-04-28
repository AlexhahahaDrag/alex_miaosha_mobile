import type { Dayjs } from 'dayjs';

export interface SearchInfo {
	saleOrderCode?: string | null;
	saleOrderName?: string;
	saleAmount?: number;
	isValid?: string;
	saleDate?: Dayjs | string;
	description?: string;
	payWay?: string;
	saleCount?: number;
}

export interface DataItem {
	saleOrderCode: string;
	saleOrderName: string;
	saleAmount: number;
	isValid: string;
	saleDate?: Dayjs | string;
	description: string;
	payWay: string;
	saleCount: number;
}
