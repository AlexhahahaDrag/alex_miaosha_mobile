import type { Dayjs } from 'dayjs';

export interface ItemInfo {
	name: string;
	value: number | string;
}

export interface barItem {
	xAxis?: string[];
	series?: string[][];
	yTitle?: string[];
	xTile?: string;
	yNameGap?: number;
	dataType?: string[];
	tooltip?: object;
	legend?: [];
	color?: string;
	stackInfo?: string[];
	nameInfo?: string[];
}

export interface FinanceDetail {
	id?: number;
	name?: string;
	typeCode?: string;
	amount?: number;
	fromSource?: string;
	fromSourceName?: string;
	isValid?: string;
	infoDate?: Dayjs | string;
	incomeAndExpenses?: string;
	belongTo?: string;
}

export interface ShopFinanceChainYear {
	infoDate?: string;
	saleAmount?: number;
	saleNum?: number;
	monthSaleAmount?: number;
	monthSaleNum?: number;
	yearSaleAmount?: number;
	yearSaleNum?: number;
	saleAmountChain?: number;
	saleNumChain?: number;
	saleAmountYear?: number;
	saleNumYear?: number;
	costAmount?: number;
}
