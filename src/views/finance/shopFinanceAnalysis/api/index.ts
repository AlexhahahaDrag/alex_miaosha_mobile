import type { ShopFinanceAnalysisData } from '../config';
import type { ResponseBody } from '@/types/api';
import { getData, baseService } from '@/views/common/api/index';

const baseFinanceAnalysis = '/shop-finance-analysis';

const financeAnalysisUrl = {
	getDayShopFinanceInfo: '/getDayShopFinanceInfo',
	getMonthShopFinanceInfo: '/getMonthShopFinanceInfo',
	getShopNameInfo: '/getShopNameInfo',
	getPayWayInfo: '/getPayWayInfo',
	getChainAndYear: '/getChainAndYear',
	getBenefitInfo: '/getBenefitInfo',
};

export function getDayShopFinanceInfo(
	searchDate?: string,
): Promise<ResponseBody<ShopFinanceAnalysisData>> {
	const url = `${
		baseService.finance + baseFinanceAnalysis + financeAnalysisUrl.getDayShopFinanceInfo
	}?searchDate=${searchDate}`;
	return getData(url);
}

export function getMonthShopFinanceInfo(
	searchDate?: string,
): Promise<ResponseBody<ShopFinanceAnalysisData>> {
	const url = `${
		baseService.finance + baseFinanceAnalysis + financeAnalysisUrl.getMonthShopFinanceInfo
	}?searchDate=${searchDate}`;
	return getData(url);
}

export function getShopNameInfo(
	searchDate?: string,
): Promise<ResponseBody<ShopFinanceAnalysisData>> {
	const url = `${
		baseService.finance + baseFinanceAnalysis + financeAnalysisUrl.getShopNameInfo
	}?searchDate=${searchDate}`;
	return getData(url);
}

export function getPayWayInfo(searchDate?: string): Promise<ResponseBody<ShopFinanceAnalysisData>> {
	const url = `${
		baseService.finance + baseFinanceAnalysis + financeAnalysisUrl.getPayWayInfo
	}?searchDate=${searchDate}`;
	return getData(url);
}

export function getChainAndYear(params?: Params): Promise<ResponseBody<ShopFinanceAnalysisData>> {
	const url = baseService.finance + baseFinanceAnalysis + financeAnalysisUrl.getChainAndYear;
	return getData(url, { params });
}

export function getBenefit(params?: Params): Promise<ResponseBody<ShopFinanceAnalysisData>> {
	const url = baseService.finance + baseFinanceAnalysis + financeAnalysisUrl.getBenefitInfo;
	return getData(url, params);
}
