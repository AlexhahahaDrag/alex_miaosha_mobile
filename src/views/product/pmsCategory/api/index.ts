import type { PmsCategoryData } from '../config';
import { getData, postData, putData, deleteData, baseService } from '@/views/common/api';
import type { CommonPageResult, ResponseBody } from '@/types/api';

const basePmsCategory = '/pms-category';

const PmsCategoryUrl = {
	page: '/page',
	url: '',
};

export function getPmsCategoryPage(
	params: PmsCategoryData,
	pageNum: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<ResponseBody<CommonPageResult<PmsCategoryData>>> {
	const url = `${baseService.product + basePmsCategory + PmsCategoryUrl.page}`;
	return postData(url, params, {
		pageNum: pageNum ?? 1,
		pageSize: pageSize ?? 10,
	});
}

export function getPmsCategoryDetail(id: string): Promise<ResponseBody<PmsCategoryData>> {
	return getData(`${baseService.product + basePmsCategory + PmsCategoryUrl.url}`, { id });
}

export function deletePmsCategory(ids: string): Promise<ResponseBody<boolean>> {
	return deleteData(`${baseService.product + basePmsCategory + PmsCategoryUrl.url}`, { ids });
}

export function addPmsCategory(params: PmsCategoryData): Promise<ResponseBody<PmsCategoryData>> {
	return postData(baseService.product + basePmsCategory + PmsCategoryUrl.url, params);
}

export function updatePmsCategory(params: PmsCategoryData): Promise<ResponseBody<PmsCategoryData>> {
	return putData(baseService.product + basePmsCategory + PmsCategoryUrl.url, params);
}
