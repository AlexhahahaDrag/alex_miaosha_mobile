import { getData, postData, putData, deleteData, baseService } from '@/views/common/api/index';

const baseShopOrderDetail = '/shop-order-detail';

const ShopOrderDetailUrl = {
	page: '/page',
	url: '',
};

export function getShopOrderDetailPage(
	params: any,
	pageNum: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<any> {
	const url = `${baseService.finance + baseShopOrderDetail + ShopOrderDetailUrl.page}`;
	return postData(url, params, {
		pageNum: pageNum ?? 1,
		pageSize: pageSize ?? 10,
	});
}

export function getShopOrderDetailDetail(id: number): Promise<any> {
	return getData(`${baseService.finance + baseShopOrderDetail + ShopOrderDetailUrl.url}?id=${id}`);
}

export function deleteShopOrderDetail(ids: string): Promise<any> {
	return deleteData(
		`${baseService.finance + baseShopOrderDetail + ShopOrderDetailUrl.url}?ids=${ids}`,
	);
}

export function addShopOrderDetail(
	params: any
): Promise<any> {
	return postData(baseService.finance + baseShopOrderDetail + ShopOrderDetailUrl.url, params);
}

export function updateShopOrderDetail(
	params: any
): Promise<any> {
	return putData(baseService.finance + baseShopOrderDetail + ShopOrderDetailUrl.url, params);
}
