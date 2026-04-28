import type { ShopOrderDetailData } from '../config';
import { getData, postData, putData, deleteData, baseService } from '@/views/common/api';
import type { CommonPageResult, ResponseBody } from '@/types/api';

const baseShopOrderDetail = '/shop-order-detail';

const ShopOrderDetailUrl = {
	page: '/page',
	url: '',
};

export function getShopOrderDetailPage(
	params: ShopOrderDetailData,
	pageNum: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<ResponseBody<CommonPageResult<ShopOrderDetailData>>> {
	const url = `${baseService.finance + baseShopOrderDetail + ShopOrderDetailUrl.page}`;
	return postData(url, params, {
		pageNum: pageNum ?? 1,
		pageSize: pageSize ?? 10,
	});
}

export function getShopOrderDetailDetail(id: string): Promise<ResponseBody<ShopOrderDetailData>> {
	return getData(`${baseService.finance + baseShopOrderDetail + ShopOrderDetailUrl.url}`, { id });
}

export function deleteShopOrderDetail(ids: string): Promise<ResponseBody<boolean>> {
	return deleteData(
		`${baseService.finance + baseShopOrderDetail + ShopOrderDetailUrl.url}?ids=${ids}`,
	);
}

export function addShopOrderDetail(
	params: ShopOrderDetailData,
): Promise<ResponseBody<ShopOrderDetailData>> {
	return postData(baseService.finance + baseShopOrderDetail + ShopOrderDetailUrl.url, params);
}

export function updateShopOrderDetail(
	params: ShopOrderDetailData,
): Promise<ResponseBody<ShopOrderDetailData>> {
	return putData(baseService.finance + baseShopOrderDetail + ShopOrderDetailUrl.url, params);
}
