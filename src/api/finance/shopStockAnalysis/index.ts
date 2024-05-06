import { getDataOne, baseService } from '@/api/common/index';

const baseFinanceAnalysis = '/api/v1/shop-stock-analysis';

const financeAnalysisUrl = {
  getAllStockInfo: '/getAllStockInfo',
};

export function getAllStock(params?: any): Promise<any> {
  let url = baseService.finance + baseFinanceAnalysis + financeAnalysisUrl.getAllStockInfo;
  return getDataOne(url, params);
}
