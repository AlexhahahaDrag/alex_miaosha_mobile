import { getData, postData, putData, deleteData, baseService } from '@/views/common/api/index';

const baseShopOrder = '/shop-order';

const ShopOrderUrl = {
	page: '/page',
	url: '',
	submitOrder: '/submitOrder',
};

export function getShopOrderPage(
	params: any,
	pageNum: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<any> {
	const url = `${baseService.finance + baseShopOrder + ShopOrderUrl.page}`;
	return postData(url, params, {
		pageNum: pageNum ?? 1,
		pageSize: pageSize ?? 10,
	});
}

export function getShopOrderDetail(id: number): Promise<any> {
	return getData(`${baseService.finance + baseShopOrder + ShopOrderUrl.url}?id=${id}`);
}

export function deleteShopOrder(ids: string): Promise<any> {
	return deleteData(`${baseService.finance + baseShopOrder + ShopOrderUrl.url}?ids=${ids}`);
}

export function addShopOrder(
	params: any
): Promise<any> {
	return postData(baseService.finance + baseShopOrder + ShopOrderUrl.url, params);
}

export function updateShopOrder(
	params: any
): Promise<any> {
	return putData(baseService.finance + baseShopOrder + ShopOrderUrl.url, params);
}

export function submitOrder(data: any): Promise<any> {
	return postData(baseService.finance + baseShopOrder + ShopOrderUrl.submitOrder, data);
}
