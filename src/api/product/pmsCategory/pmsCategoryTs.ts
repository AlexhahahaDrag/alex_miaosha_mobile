import { getData, postData, putData, deleteData, baseService } from '@/api/common/index';

const basePmsCategory = '/api/v1//pms-category';

const PmsCategoryUrl = {
	page: '/page',
	url: '',
};

export function getPmsCategoryPage(
	params: any,
	pageNum: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<any> {
	const url = `${baseService.product + basePmsCategory + PmsCategoryUrl.page}`;
	return postData(url, params, {
		pageNum: pageNum ? pageNum : 1,
		pageSize: pageSize ? pageSize : 10,
	});
}

export function getPmsCategoryDetail(id: number): Promise<any> {
	return getData(`${baseService.product + basePmsCategory + PmsCategoryUrl.url}?id=${id}`);
}

export function deletePmsCategory(ids: string): Promise<any> {
	return deleteData(`${baseService.product + basePmsCategory + PmsCategoryUrl.url}?ids=${ids}`);
}

export function addOrEditPmsCategory(method: string, params: any): Promise<any> {
	if ('put' == method) {
		return putData(baseService.product + basePmsCategory + PmsCategoryUrl.url, params);
	} else {
		return postData(baseService.product + basePmsCategory + PmsCategoryUrl.url, params);
	}
}
