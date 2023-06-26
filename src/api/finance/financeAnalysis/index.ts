import {
    getDataOne,
    baseService,
  } from "@/api/common/index";
  
  const baseFinanceAnalysis = "/api/v1/finance-analysis";
  
  const financeAnalysisUrl = {
    getBalance: "/getBalance",
    getIncomeAndExpense: "/getIncomeAndExpense",
    getDayExpense: "/getDayExpense",
    getMonthExpense: "/getMonthExpense",
  };

export function getBalance(belongTo?: number| null, searchDate?: string): Promise<any> {
  let url = baseService.finance + baseFinanceAnalysis + financeAnalysisUrl.getBalance + "?searchDate=" + searchDate;
  if(belongTo) {
    url += "&belongTo=" + belongTo;
  }
  return getDataOne(url);
}

export function getIncomeAndExpense(belongTo?: number| null, searchDate?: string, type?: string): Promise<any> {
  let url = baseService.finance + baseFinanceAnalysis + financeAnalysisUrl.getIncomeAndExpense + '?1=1';
  if(belongTo) {
    url += "&belongTo=" + belongTo;
  }
  if (searchDate) {
    url += "&searchDate=" + searchDate;
  }
  if(type) {
    url += "&type=" + type
  }
  return getDataOne(url);
}

export function getDayExpense(belongTo?: number| null, searchDate?: string): Promise<any> {
  let url = baseService.finance + baseFinanceAnalysis + financeAnalysisUrl.getDayExpense + '?searchDate=' + searchDate;
  if(belongTo) {
    url += "&belongTo=" + belongTo;
  }
  return getDataOne(url);
}

export function getMonthExpense(belongTo?: number| null, searchDate?: string): Promise<any> {
  let url = baseService.finance + baseFinanceAnalysis + financeAnalysisUrl.getMonthExpense + '?searchDate=' + searchDate;
  if(belongTo) {
    url += "&belongTo=" + belongTo;
  }
  return getDataOne(url);
}