import { getData, postData, putData, deleteData, baseService } from '@/views/common/api/index';

const baseShopFinance = '/shop-finance';

const ShopFinanceUrl = {
	page: '/page',
	url: '',
};

export function getShopFinancePage(
	params: any,
	pageNum: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<any> {
	const url = `${baseService.finance + baseShopFinance + ShopFinanceUrl.page}`;
	return postData(url, params, {
		pageNum: pageNum ?? 1,
		pageSize: pageSize ?? 10,
	});
}

export function getShopFinanceDetail(id: number): Promise<any> {
	return getData(`${baseService.finance + baseShopFinance + ShopFinanceUrl.url}?id=${id}`);
}

export function deleteShopFinance(ids: string): Promise<any> {
	return deleteData(`${baseService.finance + baseShopFinance + ShopFinanceUrl.url}?ids=${ids}`);
}

export function addShopFinance(
	params: any
): Promise<any> {
	return postData(baseService.finance + baseShopFinance + ShopFinanceUrl.url, params);
}

export function updateShopFinance(
	params: any
): Promise<any> {
	return putData(baseService.finance + baseShopFinance + ShopFinanceUrl.url, params);
}
