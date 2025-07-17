import { getData, baseService } from '@/api/common/index';

const baseFinanceAnalysis = '/api/v1/finance-analysis';

const financeAnalysisUrl = {
	getBalance: '/getBalance',
	getIncomeAndExpense: '/getIncomeAndExpense',
	getDayExpense: '/getDayExpense',
	getMonthExpense: '/getMonthExpense',
};

// 获取财务分析总览
export function getBalance(
	belongTo?: number | string | null,
	searchDate?: string,
): Promise<any> {
	let url =
		baseService.finance +
		baseFinanceAnalysis +
		financeAnalysisUrl.getBalance +
		'?searchDate=' +
		searchDate;
	if (belongTo) {
		url += '&belongTo=' + belongTo;
	}
	return getData(url);
}

// 获取财务分析收支分析
export function getIncomeAndExpense(
	belongTo?: number | string | null,
	searchDate?: string,
	type?: string,
): Promise<any> {
	let url =
		baseService.finance +
		baseFinanceAnalysis +
		financeAnalysisUrl.getIncomeAndExpense +
		'?1=1';
	if (belongTo) {
		url += '&belongTo=' + belongTo;
	}
	if (searchDate) {
		url += '&searchDate=' + searchDate;
	}
	if (type) {
		url += '&type=' + type;
	}
	return getData(url);
}

// 获取财务分析日支出
export function getDayExpense(
	belongTo?: number | string | null,
	searchDate?: string,
): Promise<any> {
	let url =
		baseService.finance +
		baseFinanceAnalysis +
		financeAnalysisUrl.getDayExpense +
		'?searchDate=' +
		searchDate;
	if (belongTo) {
		url += '&belongTo=' + belongTo;
	}
	return getData(url);
}

// 获取财务分析月支出
export function getMonthExpense(
	belongTo?: number | string | null,
	searchDate?: string,
): Promise<any> {
	let url =
		baseService.finance +
		baseFinanceAnalysis +
		financeAnalysisUrl.getMonthExpense +
		'?searchDate=' +
		searchDate;
	if (belongTo) {
		url += '&belongTo=' + belongTo;
	}
	return getData(url);
}
