import type { LoginResultData } from '../config';
import request from '@/utils/request/request';
import type { ResponseBody } from '@/types/api';
import { baseService } from '@/views/common/api';

// 将请求数据转换为form-data格式
// 这里不用qs，用FormData也可以，不赘述
const baseUrl = '/api/v1';

enum Api {
	login = '/user/login',
	logout = '/user/logout',
}

export interface LoginParams {
	isRememberMe?: boolean;
	username: string;
	password: string;
	type?: string;
}

function transParams(data: LoginParams): URLSearchParams {
	const params = new URLSearchParams();
	for (const item in data) {
		params.append(item, data[`${item}`]);
	}
	return params;
}

export function loginApi(params: LoginParams): Promise<ResponseBody<LoginResultData>> {
	return request.post(baseService.user + baseUrl + Api.login, transParams(params), {
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
	});
}

export function logoutApi(): Promise<ResponseBody<boolean>> {
	return request.post(baseService.user + baseUrl + Api.logout);
}
