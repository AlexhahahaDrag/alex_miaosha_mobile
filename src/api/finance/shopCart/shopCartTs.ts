import { getData, postData, putData, deleteData, baseService } from '@/api/common/index';

const baseShopCart = '/api/v1/shop-cart';

const ShopCartUrl = {
	page: '/page',
	url: '',
	list: '/list',
};

export function getShopCartPage(
	params: any,
	pageNum: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<any> {
	const url = `${baseService.finance + baseShopCart + ShopCartUrl.page}`;
	return postData(url, params, {
		pageNum: pageNum ? pageNum : 1,
		pageSize: pageSize ? pageSize : 10,
	});
}

export function getShopCartDetail(id: number): Promise<any> {
	return getData(`${baseService.finance + baseShopCart + ShopCartUrl.url}?id=${id}`);
}

export function deleteShopCart(ids: string): Promise<any> {
	return deleteData(`${baseService.finance + baseShopCart + ShopCartUrl.url}?ids=${ids}`);
}

export function addOrEditShopCart(method: string, params: any): Promise<any> {
	if ('put' == method) {
		return putData(baseService.finance + baseShopCart + ShopCartUrl.url, params);
	} else {
		return postData(baseService.finance + baseShopCart + ShopCartUrl.url, params);
	}
}

export function getShopCartList(ids?: string): Promise<any> {
	const url = baseService.finance + baseShopCart + ShopCartUrl.list + (ids ? `?ids=${ids}` : '');
	return postData(url, {});
}
