import { getDataOne, baseService } from '@/api/common/index';

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
  let url =
    baseService.finance +
    baseFinanceAnalysis +
    financeAnalysisUrl.getDayShopFinanceInfo +
    '?searchDate=' +
    searchDate;
  return getDataOne(url);
}

export function getMonthShopFinanceInfo(searchDate?: string): Promise<any> {
  let url =
    baseService.finance +
    baseFinanceAnalysis +
    financeAnalysisUrl.getMonthShopFinanceInfo +
    '?searchDate=' +
    searchDate;
  return getDataOne(url);
}

export function getShopNameInfo(searchDate?: string): Promise<any> {
  let url =
    baseService.finance +
    baseFinanceAnalysis +
    financeAnalysisUrl.getShopNameInfo +
    '?searchDate=' +
    searchDate;
  return getDataOne(url);
}

export function getPayWayInfo(searchDate?: string): Promise<any> {
  let url =
    baseService.finance +
    baseFinanceAnalysis +
    financeAnalysisUrl.getPayWayInfo +
    '?searchDate=' +
    searchDate;
  return getDataOne(url);
}

export function getChainAndYear(params?: any): Promise<any> {
  console.log(`params:`, params);
  let url =
    baseService.finance +
    baseFinanceAnalysis +
    financeAnalysisUrl.getChainAndYear +
    '?' +
    'startDate=' +
    params.startDate +
    '&endDate=' +
    params.endDate;
  return getDataOne(url);
}

export function getBenefit(params?: any): Promise<any> {
  let url = baseService.finance + baseFinanceAnalysis + financeAnalysisUrl.getBenefitInfo;
  return getDataOne(url, params);
}
