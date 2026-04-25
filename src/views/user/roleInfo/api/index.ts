import type { RoleInfoData } from '../config';
import { getData, postData, putData, deleteData, baseService } from '@/views/common/api';
import type { CommonPageResult, ResponseBody } from '@/types/api';

const baseRoleInfo = '/role-info';

const RoleInfoUrl = {
	page: '/page',
	url: '',
};

export function getRoleInfoPage(
	params: RoleInfoData,
	pageNum: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<ResponseBody<CommonPageResult<RoleInfoData>>> {
	const url = `${baseService.user + baseRoleInfo + RoleInfoUrl.page}`;
	return postData(url, params, {
		pageNum: pageNum ?? 1,
		pageSize: pageSize ?? 10,
	});
}

export function getRoleInfoDetail(id: number): Promise<ResponseBody<RoleInfoData>> {
	return getData(`${baseService.user + baseRoleInfo + RoleInfoUrl.url}`, { id });
}

export function deleteRoleInfo(ids: string): Promise<ResponseBody<boolean>> {
	return deleteData(`${baseService.user + baseRoleInfo + RoleInfoUrl.url}`, { ids });
}

export function addRoleInfo(params: RoleInfoData): Promise<ResponseBody<RoleInfoData>> {
	return postData(baseService.user + baseRoleInfo + RoleInfoUrl.url, params);
}

export function updateRoleInfo(params: RoleInfoData): Promise<ResponseBody<RoleInfoData>> {
	return putData(baseService.user + baseRoleInfo + RoleInfoUrl.url, params);
}
