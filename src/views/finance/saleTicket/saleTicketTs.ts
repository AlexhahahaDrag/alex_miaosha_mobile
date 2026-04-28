import type { Dayjs } from 'dayjs';
import type { ShopStockData } from '../shopStock/config';

export interface SaleOrderInfo {
	id?: string;
	saleOrderCode?: string;
	saleOrderName?: string;
	saleAmount?: number;
	saleCount?: number;
	payWay?: string;
	saleDate?: Dayjs;
	description?: string;
	shopOrderDetailVoList?: ShopStockData[];
}

export interface SaleOrderDetailInfo {
	id?: string;
	orderId?: string;
	shopName?: string;
	shopCode?: string;
	oldShopCode?: string;
	saleAmount?: number;
	isValid?: string;
	saleDate?: Dayjs | string;
	payWay?: string;
	saleNum?: number;
	shopStockId?: string;
}
