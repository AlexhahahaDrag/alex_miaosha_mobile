import type { Params } from '@/types/global';
import request, { requestFile } from '@/utils/request/request';

export function postData<T = unknown>(
	url: string,
	params: unknown,
	queryParams?: Record<string, unknown>,
): Promise<T> {
	return request.post<Params, T>(url, params, { params: queryParams });
}

export function putData<T = unknown>(url: string, params: unknown): Promise<T> {
	return request.put<Params, T>(url, params);
}

export function getData<T = unknown>(url: string, params?: Record<string, unknown>): Promise<T> {
	return request.get<Params, T>(url, { params });
}

export function deleteData<T = unknown>(url: string, params?: Record<string, unknown>): Promise<T> {
	return request.delete<Params, T>(url, { params });
}

export function postFileData<T = unknown>(url: string, params: unknown): Promise<T> {
	return requestFile.post<Params, T>(url, params);
}

export const baseService = {
	finance: '/api/am-finance',
	user: '/api/am-user',
	mission: '/api/am-mission',
	file: '/api/am-oss',
	product: '/api/am-product',
};
