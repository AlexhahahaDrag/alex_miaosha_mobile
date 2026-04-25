import type { PmsSkuInfoData } from '../config';
import { getData, postData, putData, deleteData, baseService } from '@/views/common/api';
import type { CommonPageResult, ResponseBody } from '@/types/api';

const basePmsSkuInfo = '/pms-sku-info';

const PmsSkuInfoUrl = {
	page: '/page',
	url: '',
};

export function getPmsSkuInfoPage(
	params: PmsSkuInfoData,
	pageNum: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<ResponseBody<CommonPageResult<PmsSkuInfoData>>> {
	const url = `${baseService.product + basePmsSkuInfo + PmsSkuInfoUrl.page}`;
	return postData(url, params, {
		pageNum: pageNum ?? 1,
		pageSize: pageSize ?? 10,
	});
}

export function getPmsSkuInfoDetail(id: number): Promise<ResponseBody<PmsSkuInfoData>> {
	return getData(`${baseService.product + basePmsSkuInfo + PmsSkuInfoUrl.url}`, { id });
}

export function deletePmsSkuInfo(ids: string): Promise<ResponseBody<boolean>> {
	return deleteData(`${baseService.product + basePmsSkuInfo + PmsSkuInfoUrl.url}`, { ids });
}

export function addPmsSkuInfo(params: PmsSkuInfoData): Promise<ResponseBody<PmsSkuInfoData>> {
	return postData(baseService.product + basePmsSkuInfo + PmsSkuInfoUrl.url, params);
}

export function updatePmsSkuInfo(params: PmsSkuInfoData): Promise<ResponseBody<PmsSkuInfoData>> {
	return putData(baseService.product + basePmsSkuInfo + PmsSkuInfoUrl.url, params);
}
