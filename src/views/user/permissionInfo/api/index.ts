import type { PermissionInfoData } from '../config';
import { getData, postData, putData, deleteData, baseService } from '@/views/common/api';
import type { CommonPageResult, ResponseBody } from '@/types/api';

const basePermissionInfo = '/permission-info';

const PermissionInfoUrl = {
	page: '/page',
	url: '',
};

export function getPermissionInfoPage(
	params: number | null | undefined,
	pageNum: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<ResponseBody<CommonPageResult<PermissionInfoData>>> {
	const url = `${baseService.user + basePermissionInfo + PermissionInfoUrl.page}`;
	return postData(url, params, {
		pageNum: pageNum ?? 1,
		pageSize: pageSize ?? 10,
	});
}

export function getPermissionInfoDetail(id: string): Promise<ResponseBody<PermissionInfoData>> {
	return getData(`${baseService.user + basePermissionInfo + PermissionInfoUrl.url}`, { id });
}

export function deletePermissionInfo(ids: string): Promise<ResponseBody<boolean>> {
	return deleteData(`${baseService.user + basePermissionInfo + PermissionInfoUrl.url}`, { ids });
}

export function addPermissionInfo(
	params: PermissionInfoData,
): Promise<ResponseBody<PermissionInfoData>> {
	return postData(baseService.user + basePermissionInfo + PermissionInfoUrl.url, params);
}

export function updatePermissionInfo(
	params: PermissionInfoData,
): Promise<ResponseBody<PermissionInfoData>> {
	return putData(baseService.user + basePermissionInfo + PermissionInfoUrl.url, params);
}
