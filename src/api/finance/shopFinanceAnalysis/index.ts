import {
    getDataOne,
    baseService,
  } from "@/api/common/index";
  
  const baseFinanceAnalysis = "/api/v1/shop-finance-analysis";
  
  const financeAnalysisUrl = {
    getDayShopFinanceInfo: "/getDayShopFinanceInfo",
    getMonthShopFinanceInfo: "/getMonthShopFinanceInfo",
  };

export function getDayShopFinanceInfo(searchDate?: string): Promise<any> {
  let url = baseService.finance + baseFinanceAnalysis + financeAnalysisUrl.getDayShopFinanceInfo + '?searchDate=' + searchDate;
  return getDataOne(url);
}

export function getMonthShopFinanceInfo(searchDate?: string): Promise<any> {
  let url = baseService.finance + baseFinanceAnalysis + financeAnalysisUrl.getMonthShopFinanceInfo + '?searchDate=' + searchDate;
  return getDataOne(url);
}