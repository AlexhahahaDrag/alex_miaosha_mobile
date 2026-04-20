import type { Dayjs } from 'dayjs';

export const label = reactive({
	shopName: '商品名称',
	shopCode: '商品编码',
	costAmount: '成本价',
	saleAmount: '零售价',
	isValid: '状态',
	saleDate: '进货日期',
	category: '类别',
	purchasePlace: '进货地点',
	saleNum: '数量',
});

export interface ShopStockInfo {
	id?: number;
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
