import {
	getData,
	postData,
	putData,
	deleteData,
	baseService,
} from '@/api/common/index';

const baseShopStockBatch = '/api/v1//shop-stock-batch';

const ShopStockBatchUrl = {
	page: '/page',
	url: '',
};

export function getShopStockBatchPage(
	params: any,
	pageNo: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<any> {
	let url =
		baseService.finance +
		baseShopStockBatch +
		ShopStockBatchUrl.page +
		'?pageNum=' +
		(pageNo ? pageNo : 1) +
		'&pageSize=' +
		(pageSize ? pageSize : 10);
	console.log(`getShopStockBatchPage   params:`, params);
	return postData(url, params);
}

export function getShopStockBatchDetail(id: number): Promise<any> {
	return getData(
		baseService.finance +
			baseShopStockBatch +
			ShopStockBatchUrl.url +
			'?id=' +
			id,
	);
}

export function deleteShopStockBatch(ids: string): Promise<any> {
	return deleteData(
		baseService.finance +
			baseShopStockBatch +
			ShopStockBatchUrl.url +
			'?ids=' +
			ids,
	);
}

export function addOrEditShopStockBatch(
	method: string,
	params: any,
): Promise<any> {
	if ('put' == method) {
		return putData(
			baseService.finance + baseShopStockBatch + ShopStockBatchUrl.url,
			params,
		);
	} else {
		return postData(
			baseService.finance + baseShopStockBatch + ShopStockBatchUrl.url,
			params,
		);
	}
}
