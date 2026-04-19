import { getData, postData, putData, deleteData, baseService } from '@/views/common/api/index';

const baseRolePermissionInfo = '/role-permission-info';

const RolePermissionInfoUrl = {
	page: '/page',
	url: '',
};

export function getRolePermissionInfoPage(
	params: any,
	pageNum: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<any> {
	const url = `${baseService.user + baseRolePermissionInfo + RolePermissionInfoUrl.page}`;
	return postData(url, params, {
		pageNum: pageNum ?? 1,
		pageSize: pageSize ?? 10,
	});
}

export function getRolePermissionInfoDetail(id: number): Promise<any> {
	return getData(
		`${baseService.user + baseRolePermissionInfo + RolePermissionInfoUrl.url}?id=${id}`,
	);
}

export function deleteRolePermissionInfo(ids: string): Promise<any> {
	return deleteData(
		`${baseService.user + baseRolePermissionInfo + RolePermissionInfoUrl.url}?ids=${ids}`,
	);
}

export function addRolePermissionInfo(
	params: any
): Promise<any> {
	return postData(baseService.user + baseRolePermissionInfo + RolePermissionInfoUrl.url, params);
}

export function updateRolePermissionInfo(
	params: any
): Promise<any> {
	return putData(baseService.user + baseRolePermissionInfo + RolePermissionInfoUrl.url, params);
}
