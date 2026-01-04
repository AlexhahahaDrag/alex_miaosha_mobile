import { getData, postData, putData, deleteData, baseService } from '@/api/common/index';

const baseShopStock = '/api/v1/shop-stock';

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
		pageNum: pageNum ? pageNum : 1,
		pageSize: pageSize ? pageSize : 10,
	});
}

export function getShopStockDetail(id: number): Promise<any> {
	return getData(`${baseService.finance + baseShopStock + ShopStockUrl.url}?id=${id}`);
}

export function deleteShopStock(ids: string): Promise<any> {
	return deleteData(`${baseService.finance + baseShopStock + ShopStockUrl.url}?ids=${ids}`);
}

export function addOrEditShopStock(method: string, params: any): Promise<any> {
	if ('put' == method) {
		return putData(baseService.finance + baseShopStock + ShopStockUrl.url, params);
	} else {
		return postData(baseService.finance + baseShopStock + ShopStockUrl.url, params);
	}
}

export function getShopList(ids: string): Promise<any> {
	return getData(`${baseService.finance + baseShopStock + ShopStockUrl.getShopList}?ids=${ids}`);
}
