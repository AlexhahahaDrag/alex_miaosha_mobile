import type { FinanceManagerData } from '../config/index';
import { getData, postData, putData, deleteData, baseService } from '@/api/common';
import type { ResponseBody, CommonPageResult } from '@/types/api';

const baseFinanceManager = '/api/v1/finance-info';

const financeMangerUrl = {
	page: '/page',
	url: '',
};

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

export function getFinanceMangerDetail(id: string): Promise<ResponseBody<FinanceManagerData>> {
	return getData(`${baseService.finance + baseFinanceManager + financeMangerUrl.url}`, { id });
}

export function deleteFinanceManager(ids: string): Promise<ResponseBody<boolean>> {
	return deleteData(`${baseService.finance + baseFinanceManager + financeMangerUrl.url}`, { ids });
}

export function addFinanceManger(params: FinanceManagerData): Promise<ResponseBody<boolean>> {
	return postData(baseService.finance + baseFinanceManager + financeMangerUrl.url, params);
}

export function editFinanceManger(params: FinanceManagerData): Promise<ResponseBody<boolean>> {
	return putData(baseService.finance + baseFinanceManager + financeMangerUrl.url, params);
}
