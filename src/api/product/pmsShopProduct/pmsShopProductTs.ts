import { getData, postData, putData, deleteData, baseService } from '@/api/common/index';

const basePmsShopProduct = '/api/v1//pms-shop-product';

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
		pageNum: pageNum ? pageNum : 1,
		pageSize: pageSize ? pageSize : 10,
	});
}

export function getNewestPmsShopProductPage(
	params: any,
	pageNum: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<any> {
	const url = `${baseService.product + basePmsShopProduct + PmsShopProductUrl.newestPage}`;
	return postData(url, params, {
		pageNum: pageNum ? pageNum : 1,
		pageSize: pageSize ? pageSize : 10,
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

export function addOrEditPmsShopProduct(method: string, params: any): Promise<any> {
	if ('put' == method) {
		return putData(baseService.product + basePmsShopProduct + PmsShopProductUrl.url, params);
	} else {
		return postData(baseService.product + basePmsShopProduct + PmsShopProductUrl.url, params);
	}
}
