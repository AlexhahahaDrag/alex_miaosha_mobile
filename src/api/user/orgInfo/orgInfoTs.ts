import { getData, postData, putData, deleteData, baseService } from '@/api/common/index';

const baseOrgInfo = '/api/v1//org-info';

const OrgInfoUrl = {
	page: '/page',
	url: '',
};

export function getOrgInfoPage(
	params: any,
	pageNo: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<any> {
	const url = `${baseService.user + baseOrgInfo + OrgInfoUrl.page}?pageNum=${
		pageNo ? pageNo : 1
	}&pageSize=${pageSize ? pageSize : 10}`;
	return postData(url, params);
}

export function getOrgInfoDetail(id: number): Promise<any> {
	return getData(`${baseService.user + baseOrgInfo + OrgInfoUrl.url}?id=${id}`);
}

export function deleteOrgInfo(ids: string): Promise<any> {
	return deleteData(`${baseService.user + baseOrgInfo + OrgInfoUrl.url}?ids=${ids}`);
}

export function addOrEditOrgInfo(method: string, params: any): Promise<any> {
	if ('put' == method) {
		return putData(baseService.user + baseOrgInfo + OrgInfoUrl.url, params);
	} else {
		return postData(baseService.user + baseOrgInfo + OrgInfoUrl.url, params);
	}
}
