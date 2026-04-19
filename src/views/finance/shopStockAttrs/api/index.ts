import { getData, postData, putData, deleteData, baseService } from '@/views/common/api/index';

const baseShopStockAttrs = '/shop-stock-attrs';

const ShopStockAttrsUrl = {
	page: '/page',
	url: '',
};

export function getShopStockAttrsPage(
	params: any,
	pageNum: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<any> {
	const url = `${baseService.finance + baseShopStockAttrs + ShopStockAttrsUrl.page}`;
	return postData(url, params, {
		pageNum: pageNum ?? 1,
		pageSize: pageSize ?? 10,
	});
}

export function getShopStockAttrsDetail(id: number): Promise<any> {
	return getData(`${baseService.finance + baseShopStockAttrs + ShopStockAttrsUrl.url}?id=${id}`);
}

export function deleteShopStockAttrs(ids: string): Promise<any> {
	return deleteData(
		`${baseService.finance + baseShopStockAttrs + ShopStockAttrsUrl.url}?ids=${ids}`,
	);
}

export function addShopStockAttrs(
	params: any
): Promise<any> {
	return postData(baseService.finance + baseShopStockAttrs + ShopStockAttrsUrl.url, params);
}

export function updateShopStockAttrs(
	params: any
): Promise<any> {
	return putData(baseService.finance + baseShopStockAttrs + ShopStockAttrsUrl.url, params);
}
