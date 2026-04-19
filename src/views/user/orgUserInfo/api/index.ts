import { getData, postData, putData, deleteData, baseService } from '@/views/common/api/index';

const baseOrgUserInfo = '/org-user-info';

const OrgUserInfoUrl = {
	page: '/page',
	url: '',
};

export function getOrgUserInfoPage(
	params: any,
	pageNum: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<any> {
	const url = `${baseService.user + baseOrgUserInfo + OrgUserInfoUrl.page}`;
	return postData(url, params, {
		pageNum: pageNum ?? 1,
		pageSize: pageSize ?? 10,
	});
}

export function getOrgUserInfoDetail(id: number): Promise<any> {
	return getData(`${baseService.user + baseOrgUserInfo + OrgUserInfoUrl.url}?id=${id}`);
}

export function deleteOrgUserInfo(ids: string): Promise<any> {
	return deleteData(`${baseService.user + baseOrgUserInfo + OrgUserInfoUrl.url}?ids=${ids}`);
}

export function addOrgUserInfo(
	params: any
): Promise<any> {
	return postData(baseService.user + baseOrgUserInfo + OrgUserInfoUrl.url, params);
}

export function updateOrgUserInfo(
	params: any
): Promise<any> {
	return putData(baseService.user + baseOrgUserInfo + OrgUserInfoUrl.url, params);
}
