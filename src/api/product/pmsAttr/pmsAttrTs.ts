import { getData, postData, putData, deleteData, baseService } from '@/api/common/index';

const basePmsAttr = '/api/v1//pms-attr';

const PmsAttrUrl = {
	page: '/page',
	url: '',
};

export function getPmsAttrPage(
	params: any,
	pageNum: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<any> {
	const url = `${baseService.product + basePmsAttr + PmsAttrUrl.page}`;
	return postData(url, params, {
		pageNum: pageNum ? pageNum : 1,
		pageSize: pageSize ? pageSize : 10,
	});
}

export function getPmsAttrDetail(id: number): Promise<any> {
	return getData(`${baseService.product + basePmsAttr + PmsAttrUrl.url}?id=${id}`);
}

export function deletePmsAttr(ids: string): Promise<any> {
	return deleteData(`${baseService.product + basePmsAttr + PmsAttrUrl.url}?ids=${ids}`);
}

export function addOrEditPmsAttr(method: string, params: any): Promise<any> {
	if ('put' == method) {
		return putData(baseService.product + basePmsAttr + PmsAttrUrl.url, params);
	} else {
		return postData(baseService.product + basePmsAttr + PmsAttrUrl.url, params);
	}
}
