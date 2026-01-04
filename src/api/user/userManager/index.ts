import type { CommonPageResult, ResponseBody } from '../../../types/api';
import { getData, postData, putData, deleteData, baseService } from '@/api/common/index';

export interface UserManagerData {
	id?: number;
	nickName?: string;
}

const baseUserManager = '/api/v1/user';

const userMangerUrl = {
	page: '/page',
	url: '',
	list: '/list',
};

export function getUserManagerPage(
	params: UserManagerData,
	pageNum: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<ResponseBody<CommonPageResult<UserManagerData>>> {
	const url = `${baseService.user + baseUserManager + userMangerUrl.page}`;
	return postData(url, params, {
		pageNum: pageNum ? pageNum : 1,
		pageSize: pageSize ? pageSize : 10,
	});
}

export function getUserManagerDetail(id: number): Promise<ResponseBody<UserManagerData>> {
	return getData(`${baseService.user + baseUserManager + userMangerUrl.url}`, { id });
}

export function deleteUserManager(ids: string): Promise<ResponseBody<boolean>> {
	return deleteData(`${baseService.user + baseUserManager + userMangerUrl.url}`, { ids });
}

export function addUserManager(params: UserManagerData): Promise<ResponseBody<boolean>> {
	return postData(baseService.user + baseUserManager + userMangerUrl.url, params);
}

export function editUserManager(params: UserManagerData): Promise<ResponseBody<boolean>> {
	return putData(baseService.user + baseUserManager + userMangerUrl.url, params);
}

export function getUserManagerList(params: unknown): Promise<ResponseBody<UserManagerData[]>> {
	const url = baseService.user + baseUserManager + userMangerUrl.list;
	return postData(url, params);
}
