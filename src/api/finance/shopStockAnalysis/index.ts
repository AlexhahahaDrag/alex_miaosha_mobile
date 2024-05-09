import { getData, baseService } from '@/api/common/index';

const baseFinanceAnalysis = '/api/v1/shop-stock-analysis';

const financeAnalysisUrl = {
  getAllStockInfo: '/getAllStockInfo',
  getAllAmountInfo: '/getAllAmountInfo',
  getCashAmountInfo: '/getCashAmountInfo',
};

export function getAllStock(params?: any): Promise<any> {
  let url = baseService.finance + baseFinanceAnalysis + financeAnalysisUrl.getAllStockInfo;
  return getData(url, params);
}

export function getAllAmount(params?: any): Promise<any> {
  let url = baseService.finance + baseFinanceAnalysis + financeAnalysisUrl.getAllAmountInfo;
  return getData(url, params);
}

export function getCashAmount(params?: any): Promise<any> {
  let url = baseService.finance + baseFinanceAnalysis + financeAnalysisUrl.getCashAmountInfo;
  return getData(url, params);
}
