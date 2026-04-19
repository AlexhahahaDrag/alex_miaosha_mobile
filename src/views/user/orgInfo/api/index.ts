import { getData, postData, putData, deleteData, baseService } from '@/views/common/api/index';

const baseOrgInfo = '/org-info';

const OrgInfoUrl = {
	page: '/page',
	url: '',
};

export function getOrgInfoPage(
	params: any,
	pageNum: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<any> {
	const url = `${baseService.user + baseOrgInfo + OrgInfoUrl.page}`;
	return postData(url, params, {
		pageNum: pageNum ?? 1,
		pageSize: pageSize ?? 10,
	});
}

export function getOrgInfoDetail(id: number): Promise<any> {
	return getData(`${baseService.user + baseOrgInfo + OrgInfoUrl.url}?id=${id}`);
}

export function deleteOrgInfo(ids: string): Promise<any> {
	return deleteData(`${baseService.user + baseOrgInfo + OrgInfoUrl.url}?ids=${ids}`);
}

export function addOrgInfo(
	params: any
): Promise<any> {
	return postData(baseService.user + baseOrgInfo + OrgInfoUrl.url, params);
}

export function updateOrgInfo(
	params: any
): Promise<any> {
	return putData(baseService.user + baseOrgInfo + OrgInfoUrl.url, params);
}
