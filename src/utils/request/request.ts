import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import axios from 'axios';
import { useUserStore } from '@/store/modules/user/user';
import router from '@/router';
import { decrypt } from '@/utils/crypto';

const request = axios.create({
	timeout: 10000,
});

const requestFile = axios.create({
	timeout: 30000,
});

request.defaults.headers.post['Content-Type'] = 'application/json';
requestFile.defaults.headers.post['Content-Type'] = 'multipart/form-data';

const redirectToLogin = () => {
	if (router.currentRoute.value.name !== 'login') {
		void router.push({ name: 'login' });
	}
};

const errorHandler = (error: AxiosError): Promise<any> => {
	let response = null;

	if (error.response) {
		const { status } = error.response;
		if (status === 403) {
			redirectToLogin();
			return Promise.reject(error);
		}

		const { data } = error.response as AxiosResponse;
		if (data) {
			response = decrypt(data);
		}
	}

	return Promise.reject(response);
};

const requestHandler = (
	config: InternalAxiosRequestConfig,
): InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig> => {
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
	const userStore = useUserStore();
	const token = userStore.getToken;

	if (token) {
		config.headers.Authorization = token;
		config.headers['Content-Type'] = 'multipart/form-data';
	} else {
		redirectToLogin();
	}

	return config;
};

const responseHandler = (response: AxiosResponse<any>) => {
	const { data } = response;
	const resData = decrypt(data);

	if (resData.code == 403) {
		redirectToLogin();
		return;
	}

	return resData;
};

request.interceptors.request.use(requestHandler, errorHandler);
request.interceptors.response.use(responseHandler, errorHandler);

requestFile.interceptors.request.use(requestHandlerFile, errorHandler);
requestFile.interceptors.response.use(responseHandler, errorHandler);

export { request as default, requestFile };
