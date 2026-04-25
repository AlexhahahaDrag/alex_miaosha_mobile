import type { ShopStockAttrsData } from '../config';
import { getData, postData, putData, deleteData, baseService } from '@/views/common/api';
import type { CommonPageResult, ResponseBody } from '@/types/api';

const baseShopStockAttrs = '/shop-stock-attrs';

const ShopStockAttrsUrl = {
	page: '/page',
	url: '',
};

export function getShopStockAttrsPage(
	params: ShopStockAttrsData,
	pageNum: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<ResponseBody<CommonPageResult<ShopStockAttrsData>>> {
	const url = `${baseService.finance + baseShopStockAttrs + ShopStockAttrsUrl.page}`;
	return postData(url, params, {
		pageNum: pageNum ?? 1,
		pageSize: pageSize ?? 10,
	});
}

export function getShopStockAttrsDetail(id: number): Promise<ResponseBody<ShopStockAttrsData>> {
	return getData(`${baseService.finance + baseShopStockAttrs + ShopStockAttrsUrl.url}`, { id });
}

export function deleteShopStockAttrs(ids: string): Promise<ResponseBody<boolean>> {
	return deleteData(
		`${baseService.finance + baseShopStockAttrs + ShopStockAttrsUrl.url}?ids=${ids}`,
	);
}

export function addShopStockAttrs(
	params: ShopStockAttrsData,
): Promise<ResponseBody<ShopStockAttrsData>> {
	return postData(baseService.finance + baseShopStockAttrs + ShopStockAttrsUrl.url, params);
}

export function updateShopStockAttrs(
	params: ShopStockAttrsData,
): Promise<ResponseBody<ShopStockAttrsData>> {
	return putData(baseService.finance + baseShopStockAttrs + ShopStockAttrsUrl.url, params);
}
