import type { Dayjs } from 'dayjs';

export interface SaleOrderInfo {
	id?: number;
	saleOrderCode?: string;
	saleOrderName?: string;
	saleAmount?: number;
	saleCount?: number;
	payWay?: string;
	saleDate?: Dayjs;
	description?: string;
	shopOrderDetailVoList?: SaleOrderDetailInfo[];
}

export interface SaleOrderDetailInfo {
	id?: number;
	orderId?: number;
	shopName?: string;
	shopCode?: string;
	oldShopCode?: string;
	saleAmount?: number;
	isValid?: string;
	saleDate?: Dayjs | string;
	payWay?: string;
	saleNum?: number;
	shopStockId?: number;
}
