import type {
	ShopFinanceAnalysisData,
	ShopFinanceAnalysisParams,
} from '@/views/finance/shopFinanceAnalysis/config';
import type { ShopFinanceChainYear } from '@/views/finance/shopFinanceAnalysis/shopFinanceAnalysisDetail/common';
import type { ResponseBody } from '@/types/api';
import { getData, baseService } from '@/views/common/api';

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

export function getChainAndYear(
	params?: ShopFinanceAnalysisParams,
): Promise<ResponseBody<ShopFinanceChainYear>> {
	const url = baseService.finance + baseFinanceAnalysis + financeAnalysisUrl.getChainAndYear;
	return getData(url, params);
}

export function getBenefit(
	params?: ShopFinanceAnalysisParams,
): Promise<ResponseBody<ShopFinanceChainYear>> {
	const url = baseService.finance + baseFinanceAnalysis + financeAnalysisUrl.getBenefitInfo;
	return getData(url, params);
}
