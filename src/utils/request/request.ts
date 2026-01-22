import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import axios from 'axios';
import { useUserStore } from '@/store/modules/user/user';
import router from '@/router';
import { decrypt } from '@/utils/crypto';

const request = axios.create({
	// baseURL: process.env.VUE_APP_API_BASE_URL,
	timeout: 10000,
});

axios.defaults.headers.post['Content-Type'] = 'application/json';

//异常拦截处理器
const errorHandler = (error: AxiosError): Promise<any> => {
	let response = null;
	if (error.response) {
		const { status } = error.response;
		// 403 无权限
		if (status === 403) {
			router.push({ name: 'login' });
			return Promise.reject(error);
		}
		const { data } = error.response as any;
		if (data) {
			response = decrypt(data);
		}
	}
	return Promise.reject(response);
};

//请求拦截器
const requestHandler = (
	config: InternalAxiosRequestConfig,
): InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig> => {
	const userStore = useUserStore();
	const token = userStore.getToken;
	if (token) {
		config.headers['Authorization'] = token;
	} else {
		router.push({ name: 'login' });
	}
	return config;
};

//请求拦截器
const requestHandlerFile = (
	config: InternalAxiosRequestConfig,
): InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig> => {
	const userStore = useUserStore();
	const token = userStore.getToken;
	if (token) {
		config.headers['Authorization'] = token;
		config.headers['Content-Type'] = 'multipart/form-data';
	} else {
		router.push({ name: 'login' });
	}
	return config;
};

// 添加请求拦截器
request.interceptors.request.use(requestHandler, errorHandler);

//响应拦截器
const responseHandler = (response: AxiosResponse<any>): AxiosResponse<any> | Promise<any> | any => {
	const { data } = response;
	const resData = decrypt(data);
	if (resData.code == 403) {
		router.push({ name: 'login' });
		return;
	}
	return resData;
};

// 添加响应拦截器
request.interceptors.response.use(responseHandler, errorHandler);

const requestFile = axios.create({
	timeout: 30000,
});

// 添加请求拦截器
requestFile.interceptors.request.use(requestHandlerFile, errorHandler);

export { request as default, requestFile };
