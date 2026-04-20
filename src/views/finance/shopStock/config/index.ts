import type { Dayjs } from 'dayjs';

export interface ShopStockData {
	id?: number | null;
	shopName?: string;
	oldShopCode?: string;
	shopCode?: string;
	costAmount?: number;
	saleAmount?: number;
	isValid?: string;
	saleDate?: Dayjs | string;
	category?: string;
	purchasePlace?: string;
	saleNum?: number;
	checked?: boolean;
	color?: string;
	size?: string;
	style?: string;
	stockBatch?: string;
	title?: string;
	pictureUrl?: string;
	description?: string;
	details?: string;
}
