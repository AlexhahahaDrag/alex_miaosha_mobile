import { getData, postData, putData, deleteData, baseService } from '@/views/common/api/index';

const baseRoleUserInfo = '/role-user-info';

const RoleUserInfoUrl = {
	page: '/page',
	url: '',
};

export function getRoleUserInfoPage(
	params: any,
	pageNum: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<any> {
	const url = `${baseService.user + baseRoleUserInfo + RoleUserInfoUrl.page}`;
	return postData(url, params, {
		pageNum: pageNum ?? 1,
		pageSize: pageSize ?? 10,
	});
}

export function getRoleUserInfoDetail(id: number): Promise<any> {
	return getData(`${baseService.user + baseRoleUserInfo + RoleUserInfoUrl.url}?id=${id}`);
}

export function deleteRoleUserInfo(ids: string): Promise<any> {
	return deleteData(`${baseService.user + baseRoleUserInfo + RoleUserInfoUrl.url}?ids=${ids}`);
}

export function addRoleUserInfo(
	params: any
): Promise<any> {
	return postData(baseService.user + baseRoleUserInfo + RoleUserInfoUrl.url, params);
}

export function updateRoleUserInfo(
	params: any
): Promise<any> {
	return putData(baseService.user + baseRoleUserInfo + RoleUserInfoUrl.url, params);
}
