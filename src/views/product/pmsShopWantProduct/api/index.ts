import { getData, postData, putData, deleteData, baseService } from '@/views/common/api/index';

const basePmsShopWantProduct = '/pms-shop-want-product';

const PmsShopWantProductUrl = {
	page: '/page',
	url: '',
};

export function getPmsShopWantProductPage(
	params: any,
	pageNum: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<any> {
	const url = `${baseService.product + basePmsShopWantProduct + PmsShopWantProductUrl.page}`;
	return postData(url, params, {
		pageNum: pageNum ?? 1,
		pageSize: pageSize ?? 10,
	});
}

export function getPmsShopWantProductDetail(id: number): Promise<any> {
	return getData(
		`${baseService.product + basePmsShopWantProduct + PmsShopWantProductUrl.url}?id=${id}`,
	);
}

export function deletePmsShopWantProduct(ids: string): Promise<any> {
	return deleteData(
		`${baseService.product + basePmsShopWantProduct + PmsShopWantProductUrl.url}?ids=${ids}`,
	);
}

export function addPmsShopWantProduct(
	params: any
): Promise<any> {
	return postData(baseService.product + basePmsShopWantProduct + PmsShopWantProductUrl.url, params);
}

export function updatePmsShopWantProduct(
	params: any
): Promise<any> {
	return putData(baseService.product + basePmsShopWantProduct + PmsShopWantProductUrl.url, params);
}
