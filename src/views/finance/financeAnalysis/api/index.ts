import { getData, baseService } from '@/api/common/index';
import type { ResponseBody } from '@/types/api';

const baseFinanceAnalysis = '/api/v1/finance-analysis';

const financeAnalysisUrl = {
	getBalance: '/getBalance',
	getIncomeAndExpense: '/getIncomeAndExpense',
	getDayExpense: '/getDayExpense',
	getMonthExpense: '/getMonthExpense',
};

export interface BalanceData {
	typeCode?: string;
	typeName?: string;
	incomeAndExpenses?: string;
	amount: number;
}

export interface IncomeAndExpenseData {
	typeCode?: string;
	amount?: number;
	incomeAndExpenses?: string;
	infoDate?: string;
}

// 获取财务分析总览
export function getIncomeAndExpense(
	belongTo?: number | string | null,
	searchDate?: string,
): Promise<ResponseBody<BalanceData[]>> {
	const url = `${baseService.finance + baseFinanceAnalysis + financeAnalysisUrl.getBalance}`;
	return getData(url, { belongTo, searchDate });
}

// 获取财务分析日支出
export function getDayExpense(
	belongTo?: number | string | null,
	searchDate?: string,
): Promise<ResponseBody<IncomeAndExpenseData[]>> {
	const url = `${baseService.finance + baseFinanceAnalysis + financeAnalysisUrl.getDayExpense}`;
	return getData(url, { belongTo, searchDate });
}

// 获取财务分析月支出
export function getMonthExpense(
	belongTo?: number | string | null,
	searchDate?: string,
): Promise<ResponseBody<IncomeAndExpenseData[]>> {
	const url = `${baseService.finance + baseFinanceAnalysis + financeAnalysisUrl.getMonthExpense}`;
	return getData(url, { belongTo, searchDate });
}
