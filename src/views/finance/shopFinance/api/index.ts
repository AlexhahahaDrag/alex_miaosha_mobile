import type { ShopFinanceData } from '../config';
import { getData, postData, putData, deleteData, baseService } from '@/views/common/api/index';
import type { CommonPageResult, ResponseBody } from '@/types/api';

const baseShopFinance = '/shop-finance';

const ShopFinanceUrl = {
	page: '/page',
	url: '',
};

export function getShopFinancePage(
	params: ShopFinanceData,
	pageNum: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<ResponseBody<CommonPageResult<ShopFinanceData>>> {
	const url = `${baseService.finance + baseShopFinance + ShopFinanceUrl.page}`;
	return postData(url, params, {
		pageNum: pageNum ?? 1,
		pageSize: pageSize ?? 10,
	});
}

export function getShopFinanceDetail(id: string): Promise<ResponseBody<ShopFinanceData>> {
	return getData(`${baseService.finance + baseShopFinance + ShopFinanceUrl.url}`, { id });
}

export function deleteShopFinance(ids: string): Promise<ResponseBody<boolean>> {
	return deleteData(`${baseService.finance + baseShopFinance + ShopFinanceUrl.url}`, { ids });
}

export function addShopFinance(params: ShopFinanceData): Promise<ResponseBody<ShopFinanceData>> {
	return postData(baseService.finance + baseShopFinance + ShopFinanceUrl.url, params);
}

export function updateShopFinance(params: ShopFinanceData): Promise<ResponseBody<ShopFinanceData>> {
	return putData(baseService.finance + baseShopFinance + ShopFinanceUrl.url, params);
}
