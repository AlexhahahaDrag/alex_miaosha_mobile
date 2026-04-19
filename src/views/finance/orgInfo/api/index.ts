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
	const url = `${baseService.finance + baseOrgInfo + OrgInfoUrl.page}`;
	return postData(url, params, {
		pageNum: pageNum ?? 1,
		pageSize: pageSize ?? 10,
	});
}

export function getOrgInfoDetail(id: number): Promise<any> {
	return getData(`${baseService.finance + baseOrgInfo + OrgInfoUrl.url}?id=${id}`);
}

export function deleteOrgInfo(ids: string): Promise<any> {
	return deleteData(`${baseService.finance + baseOrgInfo + OrgInfoUrl.url}?ids=${ids}`);
}

export function addOrgInfo(
	params: any
): Promise<any> {
	return postData(baseService.finance + baseOrgInfo + OrgInfoUrl.url, params);
}

export function updateOrgInfo(
	params: any
): Promise<any> {
	return putData(baseService.finance + baseOrgInfo + OrgInfoUrl.url, params);
}
