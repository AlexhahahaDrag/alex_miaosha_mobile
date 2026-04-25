import type { ShopOrderData } from '../config';
import { getData, postData, putData, deleteData, baseService } from '@/views/common/api';
import type { CommonPageResult, ResponseBody } from '@/types/api';

const baseShopOrder = '/shop-order';

const ShopOrderUrl = {
	page: '/page',
	url: '',
	submitOrder: '/submitOrder',
};

export function getShopOrderPage(
	params: ShopOrderData,
	pageNum: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<ResponseBody<CommonPageResult<ShopOrderData>>> {
	const url = `${baseService.finance + baseShopOrder + ShopOrderUrl.page}`;
	return postData(url, params, {
		pageNum: pageNum ?? 1,
		pageSize: pageSize ?? 10,
	});
}

export function getShopOrderDetail(id: number): Promise<ResponseBody<ShopOrderData>> {
	return getData(`${baseService.finance + baseShopOrder + ShopOrderUrl.url}`, { id });
}

export function deleteShopOrder(ids: string): Promise<ResponseBody<boolean>> {
	return deleteData(`${baseService.finance + baseShopOrder + ShopOrderUrl.url}`, { ids });
}

export function addShopOrder(params: ShopOrderData): Promise<ResponseBody<ShopOrderData>> {
	return postData(baseService.finance + baseShopOrder + ShopOrderUrl.url, params);
}

export function updateShopOrder(params: ShopOrderData): Promise<ResponseBody<ShopOrderData>> {
	return putData(baseService.finance + baseShopOrder + ShopOrderUrl.url, params);
}

export function submitOrder(data: Params): Promise<ResponseBody<ShopOrderData>> {
	return postData(baseService.finance + baseShopOrder + ShopOrderUrl.submitOrder, data);
}
