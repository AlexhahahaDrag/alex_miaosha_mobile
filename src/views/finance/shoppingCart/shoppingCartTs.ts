export interface ShopCartInfo {
	id?: number;
	shopId?: number;
	userId?: number;
	customerId?: number;
	isValid?: string;
	saleNum?: number;
	stockNum?: number;
	shopName?: string;
	shopCode?: string;
	saleAmount?: number;
	category?: string;
	purchasePlace?: string;
	oldShopCode?: string;
	description?: string;
	checked?: boolean;
}
