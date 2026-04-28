import type { RoleUserInfoData } from '../config';
import { getData, postData, putData, deleteData, baseService } from '@/views/common/api';
import type { CommonPageResult, ResponseBody } from '@/types/api';

const baseRoleUserInfo = '/role-user-info';

const RoleUserInfoUrl = {
	page: '/page',
	url: '',
};

export function getRoleUserInfoPage(
	params: RoleUserInfoData,
	pageNum: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<ResponseBody<CommonPageResult<RoleUserInfoData>>> {
	const url = `${baseService.user + baseRoleUserInfo + RoleUserInfoUrl.page}`;
	return postData(url, params, {
		pageNum: pageNum ?? 1,
		pageSize: pageSize ?? 10,
	});
}

export function getRoleUserInfoDetail(id: string): Promise<ResponseBody<RoleUserInfoData>> {
	return getData(`${baseService.user + baseRoleUserInfo + RoleUserInfoUrl.url}`, { id });
}

export function deleteRoleUserInfo(ids: string): Promise<ResponseBody<boolean>> {
	return deleteData(`${baseService.user + baseRoleUserInfo + RoleUserInfoUrl.url}`, { ids });
}

export function addRoleUserInfo(params: RoleUserInfoData): Promise<ResponseBody<RoleUserInfoData>> {
	return postData(baseService.user + baseRoleUserInfo + RoleUserInfoUrl.url, params);
}

export function updateRoleUserInfo(
	params: RoleUserInfoData,
): Promise<ResponseBody<RoleUserInfoData>> {
	return putData(baseService.user + baseRoleUserInfo + RoleUserInfoUrl.url, params);
}
