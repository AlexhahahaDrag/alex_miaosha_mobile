import type { FinanceManagerData } from '../config';
import { getData, postData, putData, deleteData, baseService } from '@/views/common/api';
import type { ResponseBody, CommonPageResult } from '@/types/api';

const baseFinanceManager = '/finance-info';

const financeMangerUrl = {
	page: '/page',
	url: '',
};

// 获取财务记录列表
export function getFinanceMangerPage(
	params: FinanceManagerData,
	pageNum: number | undefined,
	pageSize: number | undefined,
): Promise<ResponseBody<CommonPageResult<FinanceManagerData>>> {
	const url = `${baseService.finance + baseFinanceManager + financeMangerUrl.page}`;
	return postData(url, params, {
		pageNum: pageNum ?? 1,
		pageSize: pageSize ?? 10,
	});
}

// 获取财务记录详情
export function getFinanceMangerDetail(id: string): Promise<ResponseBody<FinanceManagerData>> {
	return getData(`${baseService.finance + baseFinanceManager + financeMangerUrl.url}`, { id });
}

// 删除财务记录
export function deleteFinanceManager(ids: string): Promise<ResponseBody<boolean>> {
	return deleteData(`${baseService.finance + baseFinanceManager + financeMangerUrl.url}`, { ids });
}

// 添加财务记录
export function addFinanceManger(params: FinanceManagerData): Promise<ResponseBody<boolean>> {
	return postData(baseService.finance + baseFinanceManager + financeMangerUrl.url, params);
}

// 编辑财务记录
export function editFinanceManger(params: FinanceManagerData): Promise<ResponseBody<boolean>> {
	return putData(baseService.finance + baseFinanceManager + financeMangerUrl.url, params);
}

export interface FinanceSummaryData {
	totalExpense?: number;
	totalIncome?: number;
	totalBalance?: number;
	totalCount?: number;
}

// 获取账单收支汇总
export function getFinanceSummary(
	params: FinanceManagerData,
): Promise<ResponseBody<FinanceSummaryData>> {
	const url = `${baseService.finance + baseFinanceManager}/summary`;
	return postData(url, params);
}

const baseFinanceBudget = '/finance-budget';

// 获取月度零花钱预算与消费状态
export function getBudgetStatus(
	budgetMonth?: string,
	belongTo?: string | number,
): Promise<ResponseBody<import('../config').FinanceBudgetStatusVo>> {
	return getData(`${baseService.finance + baseFinanceBudget}/status`, {
		budgetMonth,
		yearMonth: budgetMonth,
		belongTo,
	});
}

// 保存月度零花钱预算与分类配置
export function saveMonthlyBudget(
	params: import('../config').FinanceBudgetSaveReq,
): Promise<ResponseBody<boolean>> {
	const req = {
		...params,
		budgetMonth: params.budgetMonth || params.yearMonth,
		yearMonth: params.budgetMonth || params.yearMonth,
	};
	return postData(`${baseService.finance + baseFinanceBudget}/save`, req);
}

// 获取上月及本月已有记账分类
export function getBudgetCategories(
	budgetMonth?: string,
	belongTo?: string | number,
): Promise<ResponseBody<string[]>> {
	return getData(`${baseService.finance + baseFinanceBudget}/categories`, {
		budgetMonth,
		yearMonth: budgetMonth,
		belongTo,
	});
}

// AI 智能预算测算推荐
export function recommendBudget(
	params: import('../config').FinanceBudgetAiRecommendReq,
): Promise<ResponseBody<import('../config').FinanceBudgetAiRecommendVo>> {
	return postData(`${baseService.finance + baseFinanceBudget}/ai/recommend`, params);
}

// AI 自然语言一句话预算指令解析
export function parseBudgetCommand(
	params: import('../config').FinanceBudgetAiParseReq,
): Promise<ResponseBody<import('../config').FinanceBudgetAiParseVo>> {
	return postData(`${baseService.finance + baseFinanceBudget}/ai/parse`, params);
}
