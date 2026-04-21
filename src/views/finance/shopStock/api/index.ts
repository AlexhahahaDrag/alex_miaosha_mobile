import type { ShopStockData } from '../config';
import { getData, postData, putData, deleteData, baseService } from '@/views/common/api/index';
import type { CommonPageResult, ResponseBody } from '@/types/api';

const baseShopStock = '/shop-stock';

const ShopStockUrl = {
	page: '/page',
	url: '',
	getShopList: '/getShopList',
};

export function getShopStockPage(
	params: ShopStockData,
	pageNum: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<ResponseBody<CommonPageResult<ShopStockData>>> {
	const url = `${baseService.finance + baseShopStock + ShopStockUrl.page}`;
	return postData(url, params, {
		pageNum: pageNum ?? 1,
		pageSize: pageSize ?? 10,
	});
}

export function getShopStockDetail(id: string): Promise<ResponseBody<ShopStockData>> {
	return getData(`${baseService.finance + baseShopStock + ShopStockUrl.url}`, { id });
}

export function deleteShopStock(ids: string): Promise<ResponseBody<boolean>> {
	return deleteData(`${baseService.finance + baseShopStock + ShopStockUrl.url}`, { ids });
}

export function addShopStock(params: ShopStockData): Promise<ResponseBody<ShopStockData>> {
	return postData(baseService.finance + baseShopStock + ShopStockUrl.url, params);
}

export function updateShopStock(params: ShopStockData): Promise<ResponseBody<ShopStockData>> {
	return putData(baseService.finance + baseShopStock + ShopStockUrl.url, params);
}

export function getShopList(ids: string): Promise<ResponseBody<ShopStockData[]>> {
	return getData(`${baseService.finance + baseShopStock + ShopStockUrl.getShopList}?ids=${ids}`);
}
