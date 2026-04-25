import type { PmsBrandData } from '../config';
import { getData, postData, putData, deleteData, baseService } from '@/views/common/api';
import type { CommonPageResult, ResponseBody } from '@/types/api';

const basePmsBrand = '/pms-brand';

const PmsBrandUrl = {
	page: '/page',
	url: '',
};

export function getPmsBrandPage(
	params: PmsBrandData,
	pageNum: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<ResponseBody<CommonPageResult<PmsBrandData>>> {
	const url = `${baseService.product + basePmsBrand + PmsBrandUrl.page}`;
	return postData(url, params, {
		pageNum: pageNum ?? 1,
		pageSize: pageSize ?? 10,
	});
}

export function getPmsBrandDetail(id: number): Promise<ResponseBody<PmsBrandData>> {
	return getData(`${baseService.product + basePmsBrand + PmsBrandUrl.url}`, { id });
}

export function deletePmsBrand(ids: string): Promise<ResponseBody<boolean>> {
	return deleteData(`${baseService.product + basePmsBrand + PmsBrandUrl.url}`, { ids });
}

export function addPmsBrand(params: PmsBrandData): Promise<ResponseBody<PmsBrandData>> {
	return postData(baseService.product + basePmsBrand + PmsBrandUrl.url, params);
}

export function updatePmsBrand(params: PmsBrandData): Promise<ResponseBody<PmsBrandData>> {
	return putData(baseService.product + basePmsBrand + PmsBrandUrl.url, params);
}
