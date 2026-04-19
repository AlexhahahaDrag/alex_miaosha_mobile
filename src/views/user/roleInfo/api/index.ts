import { getData, postData, putData, deleteData, baseService } from '@/views/common/api/index';

const baseRoleInfo = '/role-info';

const RoleInfoUrl = {
	page: '/page',
	url: '',
};

export function getRoleInfoPage(
	params: any,
	pageNum: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<any> {
	const url = `${baseService.user + baseRoleInfo + RoleInfoUrl.page}`;
	return postData(url, params, {
		pageNum: pageNum ?? 1,
		pageSize: pageSize ?? 10,
	});
}

export function getRoleInfoDetail(id: number): Promise<any> {
	return getData(`${baseService.user + baseRoleInfo + RoleInfoUrl.url}?id=${id}`);
}

export function deleteRoleInfo(ids: string): Promise<any> {
	return deleteData(`${baseService.user + baseRoleInfo + RoleInfoUrl.url}?ids=${ids}`);
}

export function addRoleInfo(
	params: any
): Promise<any> {
	return postData(baseService.user + baseRoleInfo + RoleInfoUrl.url, params);
}

export function updateRoleInfo(
	params: any
): Promise<any> {
	return putData(baseService.user + baseRoleInfo + RoleInfoUrl.url, params);
}
