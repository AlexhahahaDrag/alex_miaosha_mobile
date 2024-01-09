import { useUserStore } from "@/store/modules/user/user";
import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { ResponseBody } from "@/api/typing";
import  router from "@/router";
import { decrypt } from '@/utils/crypto';

const request = axios.create({
  // baseURL: process.env.VUE_APP_API_BASE_URL,
  timeout: 6000,
});

axios.defaults.headers.post["Content-Type"] =
  "application/x-www-form-urlencoded";

//异常拦截处理器
const errorHandler = (error: AxiosError): Promise<any> => {
  if (error.response) {
    const { status } = error.response;
    // 403 无权限
    if (status === 403) {
      // todo修改提示信息
      // message.warning("请先登录！", 3);
      router.push('/Login');
    }
  }
  return Promise.reject(error);
};

//请求拦截器
const requestHandler = (
  config
): InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig> => {
  const userStore = useUserStore();
  const token = userStore.getToken;
  if (token) {
    config.headers["Authorization"] = token;
  } else {
    router.push('/Login');
  }
  return config;
};

//请求拦截器
const requestHandlerFile = (
  config
): InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig> => {
  const userStore = useUserStore();
  const token = userStore.getToken;
  if (token) {
    config.headers["Authorization"] = token;
    config.headers['Content-Type'] = 'multipart/form-data';
  } else {
    router.push('/Login');
  }
  return config;
};

// 添加请求拦截器
request.interceptors.request.use(requestHandler, errorHandler);

//响应拦截器
const responseHandler = (
  response: AxiosResponse<any>
): ResponseBody<any> | AxiosResponse<any> | Promise<any> | any => {
  const { data, request } = response;
  if (request?.responseURL?.indexOf('/user/login') >= 0) {
    return data;
  }
  let resData = decrypt(data);
  if (resData.code == 403) {
    router.push('/Login');
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
