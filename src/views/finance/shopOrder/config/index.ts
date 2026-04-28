import type { Dayjs } from 'dayjs';

export interface ShopOrderData {
	id?: string;
	saleOrderCode?: string;
	saleOrderName?: string;
	saleAmount?: number;
	isValid?: string;
	saleDate?: Dayjs | string;
	description?: string;
	payWay?: string;
	saleCount?: number;
}
