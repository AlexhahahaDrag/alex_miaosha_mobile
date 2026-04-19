import { getData, postData, putData, deleteData, baseService } from '@/views/common/api/index';

const basePmsShopProduct = '/pms-shop-product';

const PmsShopProductUrl = {
	page: '/page',
	url: '',
	newestPage: '/newestPage',
	hisInfo: '/hisInfo',
};

export function getPmsShopProductPage(
	params: any,
	pageNum: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<any> {
	const url = `${baseService.product + basePmsShopProduct + PmsShopProductUrl.page}`;
	return postData(url, params, {
		pageNum: pageNum ?? 1,
		pageSize: pageSize ?? 10,
	});
}

export function getNewestPmsShopProductPage(
	params: any,
	pageNum: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<any> {
	const url = `${baseService.product + basePmsShopProduct + PmsShopProductUrl.newestPage}`;
	return postData(url, params, {
		pageNum: pageNum ?? 1,
		pageSize: pageSize ?? 10,
	});
}

export function getPmsShopProductDetail(id: number): Promise<any> {
	return getData(`${baseService.product + basePmsShopProduct + PmsShopProductUrl.url}?id=${id}`);
}

export function deletePmsShopProduct(ids: string): Promise<any> {
	return deleteData(
		`${baseService.product + basePmsShopProduct + PmsShopProductUrl.url}?ids=${ids}`,
	);
}

export function getProductHisInfo(skuId: string, startTime: string | null): Promise<any> {
	return getData(
		`${baseService.product + basePmsShopProduct + PmsShopProductUrl.hisInfo}?skuId=${
			skuId
		}${startTime ? `&startTime=${startTime}` : ''}`,
	);
}

export function addPmsShopProduct(
	params: any
): Promise<any> {
	return postData(baseService.product + basePmsShopProduct + PmsShopProductUrl.url, params);
}

export function updatePmsShopProduct(
	params: any
): Promise<any> {
	return putData(baseService.product + basePmsShopProduct + PmsShopProductUrl.url, params);
}
