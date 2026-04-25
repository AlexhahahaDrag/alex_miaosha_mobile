import type { PmsAttrData } from '../config';
import { getData, postData, putData, deleteData, baseService } from '@/views/common/api';
import type { CommonPageResult, ResponseBody } from '@/types/api';

const basePmsAttr = '/pms-attr';

const PmsAttrUrl = {
	page: '/page',
	url: '',
};

export function getPmsAttrPage(
	params: PmsAttrData,
	pageNum: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<ResponseBody<CommonPageResult<PmsAttrData>>> {
	const url = `${baseService.product + basePmsAttr + PmsAttrUrl.page}`;
	return postData(url, params, {
		pageNum: pageNum ?? 1,
		pageSize: pageSize ?? 10,
	});
}

export function getPmsAttrDetail(id: number): Promise<ResponseBody<PmsAttrData>> {
	return getData(`${baseService.product + basePmsAttr + PmsAttrUrl.url}`, { id });
}

export function deletePmsAttr(ids: string): Promise<ResponseBody<boolean>> {
	return deleteData(`${baseService.product + basePmsAttr + PmsAttrUrl.url}`, { ids });
}

export function addPmsAttr(params: PmsAttrData): Promise<ResponseBody<PmsAttrData>> {
	return postData(baseService.product + basePmsAttr + PmsAttrUrl.url, params);
}

export function updatePmsAttr(params: PmsAttrData): Promise<ResponseBody<PmsAttrData>> {
	return putData(baseService.product + basePmsAttr + PmsAttrUrl.url, params);
}
