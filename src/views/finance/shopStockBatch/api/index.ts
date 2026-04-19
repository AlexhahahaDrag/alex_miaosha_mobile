import type { ShopStockBatchData } from '../config';
import { getData, postData, putData, deleteData, baseService } from '@/views/common/api/index';
import type { CommonPageResult, ResponseBody } from '@/types/api';

const baseShopStockBatch = '/shop-stock-batch';

const ShopStockBatchUrl = {
	page: '/page',
	url: '',
};

export function getShopStockBatchPage(
	params: ShopStockBatchData,
	pageNum: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<ResponseBody<CommonPageResult<ShopStockBatchData>>> {
	const url = `${baseService.finance + baseShopStockBatch + ShopStockBatchUrl.page}`;
	return postData(url, params, {
		pageNum: pageNum ?? 1,
		pageSize: pageSize ?? 10,
	});
}

export function getShopStockBatchDetail(id: number): Promise<ResponseBody<ShopStockBatchData>> {
	return getData(`${baseService.finance + baseShopStockBatch + ShopStockBatchUrl.url}`, { id });
}

export function deleteShopStockBatch(ids: string): Promise<ResponseBody<boolean>> {
	return deleteData(
		`${baseService.finance + baseShopStockBatch + ShopStockBatchUrl.url}?ids=${ids}`,
	);
}

export function addShopStockBatch(
	params: ShopStockBatchData,
): Promise<ResponseBody<ShopStockBatchData>> {
	return postData(baseService.finance + baseShopStockBatch + ShopStockBatchUrl.url, params);
}

export function updateShopStockBatch(
	params: ShopStockBatchData,
): Promise<ResponseBody<ShopStockBatchData>> {
	return putData(baseService.finance + baseShopStockBatch + ShopStockBatchUrl.url, params);
}
