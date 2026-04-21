import type { Dayjs } from 'dayjs';

export interface ShopCartData {
	shopName: string;
	shopCode: string;
	oldShopCode: string;
	shopCartCode: string;
	goodsName: string;
	goodsCode: string;
	goodsModel: string;
	unit: string;
	saleAmount: number;
	saleDate: Dayjs;
	saleNum: number;
	shopStockId: string;
	shopCartId: string;
}
