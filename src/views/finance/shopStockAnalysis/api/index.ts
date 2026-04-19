import type { ShopStockAnalysisData } from '../config';
import { getData, baseService } from '@/views/common/api/index';

const baseFinanceAnalysis = '/shop-stock-analysis';

const financeAnalysisUrl = {
	getAllStockInfo: '/getAllStockInfo',
	getAllAmountInfo: '/getAllAmountInfo',
	getCashAmountInfo: '/getCashAmountInfo',
};

export function getAllStock(params?: Params): Promise<ResponseBody<ShopStockAnalysisData>> {
	const url = baseService.finance + baseFinanceAnalysis + financeAnalysisUrl.getAllStockInfo;
	return getData(url, params);
}

export function getAllAmount(params?: Params): Promise<ResponseBody<ShopStockAnalysisData>> {
	const url = baseService.finance + baseFinanceAnalysis + financeAnalysisUrl.getAllAmountInfo;
	return getData(url, params);
}

export function getCashAmount(params?: Params): Promise<ResponseBody<ShopStockAnalysisData>> {
	const url = baseService.finance + baseFinanceAnalysis + financeAnalysisUrl.getCashAmountInfo;
	return getData(url, params);
}
