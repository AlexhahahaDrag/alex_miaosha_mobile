import type { Dayjs } from 'dayjs';

export interface SearchInfo {
	shopName?: string;
	shopCode?: string;
	costAmount?: number;
	saleAmount?: number;
	isValid?: string;
	saleDate?: Dayjs | string;
	category?: string;
	purchasePlace?: string;
	saleNum?: number;
	isShopping?: boolean;
	title?: string;
}

export interface ShopStockInfo {
	id?: string;
	shopName: string;
	shopCode: string;
	costAmount: number;
	saleAmount: number;
	isValid: string;
	saleDate?: Dayjs | string;
	category: string;
	purchasePlace: string;
	saleNum: number;
}
