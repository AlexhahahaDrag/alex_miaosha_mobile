import { getData, postData, putData, deleteData, baseService } from '@/views/common/api/index';

const baseShopStockBatch = '/shop-stock-batch';

const ShopStockBatchUrl = {
	page: '/page',
	url: '',
};

export function getShopStockBatchPage(
	params: any,
	pageNum: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<any> {
	const url = `${baseService.finance + baseShopStockBatch + ShopStockBatchUrl.page}`;
	return postData(url, params, {
		pageNum: pageNum ?? 1,
		pageSize: pageSize ?? 10,
	});
}

export function getShopStockBatchDetail(id: number): Promise<any> {
	return getData(`${baseService.finance + baseShopStockBatch + ShopStockBatchUrl.url}?id=${id}`);
}

export function deleteShopStockBatch(ids: string): Promise<any> {
	return deleteData(
		`${baseService.finance + baseShopStockBatch + ShopStockBatchUrl.url}?ids=${ids}`,
	);
}

export function addShopStockBatch(
	params: any
): Promise<any> {
	return postData(baseService.finance + baseShopStockBatch + ShopStockBatchUrl.url, params);
}

export function updateShopStockBatch(
	params: any
): Promise<any> {
	return putData(baseService.finance + baseShopStockBatch + ShopStockBatchUrl.url, params);
}
