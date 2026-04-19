import type { MenuInfoData } from '../config';
import { getData, postData, putData, deleteData, baseService } from '@/views/common/api/index';
import type { CommonPageResult, ResponseBody } from '@/types/api';

const baseMenuInfo = '/menu-info';

const MenuInfoUrl = {
	page: '/page',
	url: '',
};

export function getMenuInfoPage(
	params: MenuInfoData,
	pageNum: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<ResponseBody<CommonPageResult<MenuInfoData>>> {
	const url = `${baseService.user + baseMenuInfo + MenuInfoUrl.page}`;
	return postData(url, params, {
		pageNum: pageNum ?? 1,
		pageSize: pageSize ?? 10,
	});
}

export function getMenuInfoDetail(id: number): Promise<ResponseBody<MenuInfoData>> {
	return getData(`${baseService.user + baseMenuInfo + MenuInfoUrl.url}`, { id });
}

export function deleteMenuInfo(ids: string): Promise<ResponseBody<boolean>> {
	return deleteData(`${baseService.user + baseMenuInfo + MenuInfoUrl.url}`, { ids });
}

export function addMenuInfo(params: MenuInfoData): Promise<ResponseBody<MenuInfoData>> {
	return postData(baseService.user + baseMenuInfo + MenuInfoUrl.url, params);
}

export function updateMenuInfo(params: MenuInfoData): Promise<ResponseBody<MenuInfoData>> {
	return putData(baseService.user + baseMenuInfo + MenuInfoUrl.url, params);
}
