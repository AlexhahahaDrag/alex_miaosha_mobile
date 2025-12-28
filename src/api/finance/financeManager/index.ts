import { getData, postData, putData, deleteData, baseService } from '@/api/common/index';

const baseFinanceManager = '/api/v1/finance-info';

const financeMangerUrl = {
	page: '/page',
	url: '',
};

export function getFinanceMangerPage(
	params: any,
	pageNo: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<any> {
	const url = `${baseService.finance + baseFinanceManager + financeMangerUrl.page}?pageNum=${
		pageNo ? pageNo : 1
	}&pageSize=${pageSize ? pageSize : 10}`;
	return postData(url, params);
}

export function getFinanceMangerDetail(id: string): Promise<any> {
	return getData(`${baseService.finance + baseFinanceManager + financeMangerUrl.url}?id=${id}`);
}

export function deleteFinanceManager(ids: string): Promise<any> {
	return deleteData(`${baseService.finance + baseFinanceManager + financeMangerUrl.url}?ids=${ids}`);
}

export function addOrEditFinanceManger(method: string, params: any): Promise<any> {
	if ('put' == method) {
		return putData(baseService.finance + baseFinanceManager + financeMangerUrl.url, params);
	} else {
		return postData(baseService.finance + baseFinanceManager + financeMangerUrl.url, params);
	}
}
