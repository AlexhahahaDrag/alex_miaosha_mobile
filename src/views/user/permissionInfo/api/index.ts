import { getData, postData, putData, deleteData, baseService } from '@/views/common/api/index';

const basePermissionInfo = '/permission-info';

const PermissionInfoUrl = {
	page: '/page',
	url: '',
};

export function getPermissionInfoPage(
	params: number | null | undefined,
	pageNum: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<any> {
	const url = `${baseService.user + basePermissionInfo + PermissionInfoUrl.page}`;
	return postData(url, params, {
		pageNum: pageNum ?? 1,
		pageSize: pageSize ?? 10,
	});
}

export function getPermissionInfoDetail(id: number): Promise<any> {
	return getData(`${baseService.user + basePermissionInfo + PermissionInfoUrl.url}?id=${id}`);
}

export function deletePermissionInfo(ids: string): Promise<any> {
	return deleteData(`${baseService.user + basePermissionInfo + PermissionInfoUrl.url}?ids=${ids}`);
}

export function addPermissionInfo(
	params: any
): Promise<any> {
	return postData(baseService.user + basePermissionInfo + PermissionInfoUrl.url, params);
}

export function updatePermissionInfo(
	params: any
): Promise<any> {
	return putData(baseService.user + basePermissionInfo + PermissionInfoUrl.url, params);
}
