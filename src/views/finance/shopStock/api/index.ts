import { getData, postData, putData, deleteData, baseService } from '@/views/common/api/index';

const baseShopStock = '/shop-stock';

const ShopStockUrl = {
	page: '/page',
	url: '',
	getShopList: '/getShopList',
};

export function getShopStockPage(
	params: any,
	pageNum: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<any> {
	const url = `${baseService.finance + baseShopStock + ShopStockUrl.page}`;
	return postData(url, params, {
		pageNum: pageNum ?? 1,
		pageSize: pageSize ?? 10,
	});
}

export function getShopStockDetail(id: number): Promise<any> {
	return getData(`${baseService.finance + baseShopStock + ShopStockUrl.url}?id=${id}`);
}

export function deleteShopStock(ids: string): Promise<any> {
	return deleteData(`${baseService.finance + baseShopStock + ShopStockUrl.url}?ids=${ids}`);
}

export function addShopStock(
	params: any
): Promise<any> {
	return postData(baseService.finance + baseShopStock + ShopStockUrl.url, params);
}

export function updateShopStock(
	params: any
): Promise<any> {
	return putData(baseService.finance + baseShopStock + ShopStockUrl.url, params);
}

export function getShopList(ids: string): Promise<any> {
	return getData(`${baseService.finance + baseShopStock + ShopStockUrl.getShopList}?ids=${ids}`);
}
