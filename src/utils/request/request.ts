import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import axios from 'axios';
import { useUserStore } from '@/store/modules/user/user';
import router from '@/router';
import { decrypt, decryptGcm } from '@/utils/crypto';

/**
 * 根据运行环境动态获取请求超时时间 (ms)
 * - 开发环境 (development): 1 分钟 (60000ms)
 * - 测试环境 (test): 45 秒 (45000ms)
 * - 正式环境 (production): 30 秒 (30000ms)
 */
export const getRequestTimeout = (): number => {
	if (import.meta.env.VITE_APP_REQUEST_TIMEOUT) {
		const parsed = Number(import.meta.env.VITE_APP_REQUEST_TIMEOUT);
		if (!Number.isNaN(parsed) && parsed > 0) {
			return parsed;
		}
	}
	const mode = import.meta.env.MODE || import.meta.env.VITE_MODE;
	if (mode === 'development') {
		return 60 * 1000;
	}
	if (mode === 'test') {
		return 45 * 1000;
	}
	return 30 * 1000;
};

const request = axios.create({
	timeout: getRequestTimeout(),
});

const requestFile = axios.create({
	timeout: getRequestTimeout(),
});

request.defaults.headers.post['Content-Type'] = 'application/json';

const redirectToLogin = () => {
	if (router.currentRoute.value.name !== 'login') {
		void router.push({ name: 'login' });
	}
};

const errorHandler = async (error: AxiosError): Promise<unknown> => {
	let response: unknown = null;

	if (error.response) {
		const { status, headers } = error.response;
		if (status === 403) {
			redirectToLogin();
			return Promise.reject(error);
		}

		const { data } = error.response as AxiosResponse;
		if (data) {
			const version = headers ? headers['x-crypto-version'] || headers['X-Crypto-Version'] : null;
			if (version === '2.0' && typeof data === 'string') {
				response = await decryptGcm(data);
			} else {
				response = decrypt(data as string);
			}
		}
	}

	return Promise.reject(response);
};

const requestHandler = (
	config: InternalAxiosRequestConfig,
): InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig> => {
	if (config.headers) {
		config.headers['X-Crypto-Version'] = '2.0';
	}
	const userStore = useUserStore();
	const token = userStore.getToken;

	if (token) {
		config.headers.Authorization = token;
	} else {
		redirectToLogin();
	}

	return config;
};

const requestHandlerFile = (
	config: InternalAxiosRequestConfig,
): InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig> => {
	if (config.headers) {
		config.headers['X-Crypto-Version'] = '2.0';
	}
	const userStore = useUserStore();
	const token = userStore.getToken;

	if (token) {
		config.headers.Authorization = token;
	} else {
		redirectToLogin();
	}

	return config;
};

const responseHandler = async (response: AxiosResponse<unknown>) => {
	const { data, headers } = response;
	const version = headers ? headers['x-crypto-version'] || headers['X-Crypto-Version'] : null;
	let resData: any;
	if (version === '2.0' && typeof data === 'string') {
		resData = await decryptGcm(data);
	} else {
		resData = decrypt(data as string);
	}

	if (resData?.code == 403) {
		redirectToLogin();
		return Promise.reject(resData);
	}

	return resData;
};

request.interceptors.request.use(requestHandler, errorHandler);
request.interceptors.response.use(responseHandler, errorHandler);

requestFile.interceptors.request.use(requestHandlerFile, errorHandler);
requestFile.interceptors.response.use(responseHandler, errorHandler);

export default request;
export { requestFile };
