import type { RolePermissionInfoData } from '../config';
import { getData, postData, putData, deleteData, baseService } from '@/views/common/api';
import type { CommonPageResult, ResponseBody } from '@/types/api';

const baseRolePermissionInfo = '/role-permission-info';

const RolePermissionInfoUrl = {
	page: '/page',
	url: '',
};

export function getRolePermissionInfoPage(
	params: RolePermissionInfoData,
	pageNum: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<ResponseBody<CommonPageResult<RolePermissionInfoData>>> {
	const url = `${baseService.user + baseRolePermissionInfo + RolePermissionInfoUrl.page}`;
	return postData(url, params, {
		pageNum: pageNum ?? 1,
		pageSize: pageSize ?? 10,
	});
}

export function getRolePermissionInfoDetail(
	id: string,
): Promise<ResponseBody<RolePermissionInfoData>> {
	return getData(
		`${baseService.user + baseRolePermissionInfo + RolePermissionInfoUrl.url}?id=${id}`,
	);
}

export function deleteRolePermissionInfo(ids: string): Promise<ResponseBody<boolean>> {
	return deleteData(
		`${baseService.user + baseRolePermissionInfo + RolePermissionInfoUrl.url}?ids=${ids}`,
	);
}

export function addRolePermissionInfo(
	params: RolePermissionInfoData,
): Promise<ResponseBody<RolePermissionInfoData>> {
	return postData(baseService.user + baseRolePermissionInfo + RolePermissionInfoUrl.url, params);
}

export function updateRolePermissionInfo(
	params: RolePermissionInfoData,
): Promise<ResponseBody<RolePermissionInfoData>> {
	return putData(baseService.user + baseRolePermissionInfo + RolePermissionInfoUrl.url, params);
}
