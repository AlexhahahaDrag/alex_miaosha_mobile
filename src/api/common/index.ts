import type { Params } from '@/types/global';
import request, { requestFile } from '@/utils/request/request';

const apiPrefix = import.meta.env.VITE_APP_API_PREFIX;

function formatUrl(url: string) {
	// 将 /api/am-{service}/{path} 转换为 /api/am-{service}/{apiPrefix}/{path}
	// 例如：/api/am-finance/dict-info/... → /api/am-finance/api/v1/dict-info/...
	return url.replace(/^\/(api\/am-[^/]+)\/(.*)/, `/$1/${apiPrefix}/$2`).replace(/\/+/g, '/');
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
