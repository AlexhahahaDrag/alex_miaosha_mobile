export interface ShopFinanceAnalysisData {
	infoDate?: string;
	saleAmount?: number;
	saleNum?: number;
	saleCost?: number;
	shopName?: string;
	payWayName?: string;
	[key: string]: unknown;
}

export interface TooltipPoint {
	axisValue: string;
	marker: string;
	value: number | string;
	seriesName: string;
}

export interface ShopFinanceAnalysisParams {
	startDate?: string;
	endDate?: string;
	searchType?: string;
	[key: string]: unknown;
}
