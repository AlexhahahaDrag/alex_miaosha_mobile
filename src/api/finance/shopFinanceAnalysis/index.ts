import { getData, baseService } from '@/api/common/index';

const baseFinanceAnalysis = '/api/v1/shop-finance-analysis';

const financeAnalysisUrl = {
	getDayShopFinanceInfo: '/getDayShopFinanceInfo',
	getMonthShopFinanceInfo: '/getMonthShopFinanceInfo',
	getShopNameInfo: '/getShopNameInfo',
	getPayWayInfo: '/getPayWayInfo',
	getChainAndYear: '/getChainAndYear',
	getBenefitInfo: '/getBenefitInfo',
};

export function getDayShopFinanceInfo(searchDate?: string): Promise<any> {
	const url = `${
		baseService.finance + baseFinanceAnalysis + financeAnalysisUrl.getDayShopFinanceInfo
	}?searchDate=${searchDate}`;
	return getData(url);
}

export function getMonthShopFinanceInfo(searchDate?: string): Promise<any> {
	const url = `${
		baseService.finance + baseFinanceAnalysis + financeAnalysisUrl.getMonthShopFinanceInfo
	}?searchDate=${searchDate}`;
	return getData(url);
}

export function getShopNameInfo(searchDate?: string): Promise<any> {
	const url = `${
		baseService.finance + baseFinanceAnalysis + financeAnalysisUrl.getShopNameInfo
	}?searchDate=${searchDate}`;
	return getData(url);
}

export function getPayWayInfo(searchDate?: string): Promise<any> {
	const url = `${
		baseService.finance + baseFinanceAnalysis + financeAnalysisUrl.getPayWayInfo
	}?searchDate=${searchDate}`;
	return getData(url);
}

export function getChainAndYear(params?: any): Promise<any> {
	const url = baseService.finance + baseFinanceAnalysis + financeAnalysisUrl.getChainAndYear;
	return getData(url, { params });
}

export function getBenefit(params?: any): Promise<any> {
	const url = baseService.finance + baseFinanceAnalysis + financeAnalysisUrl.getBenefitInfo;
	return getData(url, params);
}
