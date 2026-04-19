import type { PmsShopWantProductData } from '../config';
import { getData, postData, putData, deleteData, baseService } from '@/views/common/api/index';
import type { CommonPageResult, ResponseBody } from '@/types/api';

const basePmsShopWantProduct = '/pms-shop-want-product';

const PmsShopWantProductUrl = {
	page: '/page',
	url: '',
};

export function getPmsShopWantProductPage(
	params: PmsShopWantProductData,
	pageNum: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<ResponseBody<CommonPageResult<PmsShopWantProductData>>> {
	const url = `${baseService.product + basePmsShopWantProduct + PmsShopWantProductUrl.page}`;
	return postData(url, params, {
		pageNum: pageNum ?? 1,
		pageSize: pageSize ?? 10,
	});
}

export function getPmsShopWantProductDetail(
	id: number,
): Promise<ResponseBody<PmsShopWantProductData>> {
	return getData(
		`${baseService.product + basePmsShopWantProduct + PmsShopWantProductUrl.url}?id=${id}`,
	);
}

export function deletePmsShopWantProduct(ids: string): Promise<ResponseBody<boolean>> {
	return deleteData(
		`${baseService.product + basePmsShopWantProduct + PmsShopWantProductUrl.url}?ids=${ids}`,
	);
}

export function addPmsShopWantProduct(
	params: PmsShopWantProductData,
): Promise<ResponseBody<PmsShopWantProductData>> {
	return postData(baseService.product + basePmsShopWantProduct + PmsShopWantProductUrl.url, params);
}

export function updatePmsShopWantProduct(
	params: PmsShopWantProductData,
): Promise<ResponseBody<PmsShopWantProductData>> {
	return putData(baseService.product + basePmsShopWantProduct + PmsShopWantProductUrl.url, params);
}
