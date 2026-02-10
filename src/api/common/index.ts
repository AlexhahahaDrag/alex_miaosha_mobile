import type { Params } from '@/types/global';
import request, { requestFile } from '@/utils/request/request';

const apiPrefix = import.meta.env.VITE_APP_API_PREFIX;

function formatUrl(url: string) {
	if (apiPrefix && url.startsWith('/api') && !url.startsWith(apiPrefix)) {
		return url.replace(/^\/api/, apiPrefix).replace(/\/+/g, '/');
	}
	return url;
}

export function postData<T = unknown>(
	url: string,
	params: unknown,
	queryParams?: Record<string, unknown>,
): Promise<T> {
	return request.post<Params, T>(formatUrl(url), params, {
		params: queryParams,
	});
}

export function putData<T = unknown>(url: string, params: unknown): Promise<T> {
	return request.put<Params, T>(formatUrl(url), params);
}

export function getData<T = unknown>(url: string, params?: Record<string, unknown>): Promise<T> {
	return request.get<Params, T>(formatUrl(url), { params });
}

export function deleteData<T = unknown>(url: string, params?: Record<string, unknown>): Promise<T> {
	return request.delete<Params, T>(formatUrl(url), { params });
}

export function postFileData<T = unknown>(url: string, params: unknown): Promise<T> {
	return requestFile.post<Params, T>(formatUrl(url), params);
}

export const baseService = {
	finance: '/api/am-finance',
	user: '/api/am-user',
	mission: '/api/am-mission',
	file: '/api/am-oss',
	product: '/api/am-product',
};
