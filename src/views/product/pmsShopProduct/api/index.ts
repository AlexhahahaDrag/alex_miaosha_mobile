import type { PmsShopProductData } from '../config';
import { getData, postData, putData, deleteData, baseService } from '@/views/common/api/index';
import type { CommonPageResult, ResponseBody } from '@/types/api';

const basePmsShopProduct = '/pms-shop-product';

const PmsShopProductUrl = {
	page: '/page',
	url: '',
	newestPage: '/newestPage',
	hisInfo: '/hisInfo',
};

export function getPmsShopProductPage(
	params: PmsShopProductData,
	pageNum: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<ResponseBody<CommonPageResult<PmsShopProductData>>> {
	const url = `${baseService.product + basePmsShopProduct + PmsShopProductUrl.page}`;
	return postData(url, params, {
		pageNum: pageNum ?? 1,
		pageSize: pageSize ?? 10,
	});
}

export function getNewestPmsShopProductPage(
	params: PmsShopProductData,
	pageNum: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<ResponseBody<CommonPageResult<PmsShopProductData>>> {
	const url = `${baseService.product + basePmsShopProduct + PmsShopProductUrl.newestPage}`;
	return postData(url, params, {
		pageNum: pageNum ?? 1,
		pageSize: pageSize ?? 10,
	});
}

export function getPmsShopProductDetail(id: number): Promise<ResponseBody<PmsShopProductData>> {
	return getData(`${baseService.product + basePmsShopProduct + PmsShopProductUrl.url}`, { id });
}

export function deletePmsShopProduct(ids: string): Promise<ResponseBody<boolean>> {
	return deleteData(
		`${baseService.product + basePmsShopProduct + PmsShopProductUrl.url}?ids=${ids}`,
	);
}

export function getProductHisInfo(
	skuId: string,
	startTime: string | null,
): Promise<ResponseBody<PmsShopProductData>> {
	return getData(
		`${baseService.product + basePmsShopProduct + PmsShopProductUrl.hisInfo}?skuId=${
			skuId
		}${startTime ? `&startTime=${startTime}` : ''}`,
	);
}

export function addPmsShopProduct(
	params: PmsShopProductData,
): Promise<ResponseBody<PmsShopProductData>> {
	return postData(baseService.product + basePmsShopProduct + PmsShopProductUrl.url, params);
}

export function updatePmsShopProduct(
	params: PmsShopProductData,
): Promise<ResponseBody<PmsShopProductData>> {
	return putData(baseService.product + basePmsShopProduct + PmsShopProductUrl.url, params);
}
