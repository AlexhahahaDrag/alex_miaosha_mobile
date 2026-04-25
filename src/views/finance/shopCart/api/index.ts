import type { ShopCartData } from '../config';
import { getData, postData, putData, deleteData, baseService } from '@/views/common/api';
import type { CommonPageResult, ResponseBody } from '@/types/api';

const baseShopCart = '/shop-cart';

const ShopCartUrl = {
	page: '/page',
	url: '',
	list: '/list',
};

export function getShopCartPage(
	params: ShopCartData,
	pageNum: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<ResponseBody<CommonPageResult<ShopCartData>>> {
	const url = `${baseService.finance + baseShopCart + ShopCartUrl.page}`;
	return postData(url, params, {
		pageNum: pageNum ?? 1,
		pageSize: pageSize ?? 10,
	});
}

export function getShopCartDetail(id: number): Promise<ResponseBody<ShopCartData>> {
	return getData(`${baseService.finance + baseShopCart + ShopCartUrl.url}`, { id });
}

export function deleteShopCart(ids: string): Promise<ResponseBody<boolean>> {
	return deleteData(`${baseService.finance + baseShopCart + ShopCartUrl.url}`, { ids });
}

export function addShopCart(params: ShopCartData): Promise<ResponseBody<ShopCartData>> {
	return postData(baseService.finance + baseShopCart + ShopCartUrl.url, params);
}

export function updateShopCart(params: ShopCartData): Promise<ResponseBody<ShopCartData>> {
	return putData(baseService.finance + baseShopCart + ShopCartUrl.url, params);
}

export function getShopCartList(ids?: string): Promise<ResponseBody<ShopCartData[]>> {
	const url = baseService.finance + baseShopCart + ShopCartUrl.list + (ids ? `?ids=${ids}` : '');
	return postData(url, {});
}
