import { getData, postData, putData, deleteData, baseService } from '@/views/common/api/index';

const basePmsCategory = '/pms-category';

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
		pageNum: pageNum ?? 1,
		pageSize: pageSize ?? 10,
	});
}

export function getPmsCategoryDetail(id: number): Promise<any> {
	return getData(`${baseService.product + basePmsCategory + PmsCategoryUrl.url}?id=${id}`);
}

export function deletePmsCategory(ids: string): Promise<any> {
	return deleteData(`${baseService.product + basePmsCategory + PmsCategoryUrl.url}?ids=${ids}`);
}

export function addPmsCategory(
	params: any
): Promise<any> {
	return postData(baseService.product + basePmsCategory + PmsCategoryUrl.url, params);
}

export function updatePmsCategory(
	params: any
): Promise<any> {
	return putData(baseService.product + basePmsCategory + PmsCategoryUrl.url, params);
}
