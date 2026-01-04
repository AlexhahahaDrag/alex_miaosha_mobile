import { getData, postData, putData, deleteData, baseService } from '@/api/common/index';

const basePmsSkuInfo = '/api/v1/pms-sku-info';

const PmsSkuInfoUrl = {
	page: '/page',
	url: '',
};

export function getPmsSkuInfoPage(
	params: any,
	pageNum: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<any> {
	const url = `${baseService.product + basePmsSkuInfo + PmsSkuInfoUrl.page}`;
	return postData(url, params, {
		pageNum: pageNum ? pageNum : 1,
		pageSize: pageSize ? pageSize : 10,
	});
}

export function getPmsSkuInfoDetail(id: number): Promise<any> {
	return getData(`${baseService.product + basePmsSkuInfo + PmsSkuInfoUrl.url}?id=${id}`);
}

export function deletePmsSkuInfo(ids: string): Promise<any> {
	return deleteData(`${baseService.product + basePmsSkuInfo + PmsSkuInfoUrl.url}?ids=${ids}`);
}

export function addOrEditPmsSkuInfo(method: string, params: any): Promise<any> {
	if ('put' == method) {
		return putData(baseService.product + basePmsSkuInfo + PmsSkuInfoUrl.url, params);
	} else {
		return postData(baseService.product + basePmsSkuInfo + PmsSkuInfoUrl.url, params);
	}
}
