import type { OrgUserInfoData } from '../config';
import { getData, postData, putData, deleteData, baseService } from '@/views/common/api';
import type { CommonPageResult, ResponseBody } from '@/types/api';

const baseOrgUserInfo = '/org-user-info';

const OrgUserInfoUrl = {
	page: '/page',
	url: '',
};

export function getOrgUserInfoPage(
	params: OrgUserInfoData,
	pageNum: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<ResponseBody<CommonPageResult<OrgUserInfoData>>> {
	const url = `${baseService.user + baseOrgUserInfo + OrgUserInfoUrl.page}`;
	return postData(url, params, {
		pageNum: pageNum ?? 1,
		pageSize: pageSize ?? 10,
	});
}

export function getOrgUserInfoDetail(id: string): Promise<ResponseBody<OrgUserInfoData>> {
	return getData(`${baseService.user + baseOrgUserInfo + OrgUserInfoUrl.url}`, { id });
}

export function deleteOrgUserInfo(ids: string): Promise<ResponseBody<boolean>> {
	return deleteData(`${baseService.user + baseOrgUserInfo + OrgUserInfoUrl.url}`, { ids });
}

export function addOrgUserInfo(params: OrgUserInfoData): Promise<ResponseBody<OrgUserInfoData>> {
	return postData(baseService.user + baseOrgUserInfo + OrgUserInfoUrl.url, params);
}

export function updateOrgUserInfo(params: OrgUserInfoData): Promise<ResponseBody<OrgUserInfoData>> {
	return putData(baseService.user + baseOrgUserInfo + OrgUserInfoUrl.url, params);
}
