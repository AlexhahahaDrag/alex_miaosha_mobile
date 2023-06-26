import request from "@/utils/request/request";
import {
  baseService,
} from "@/api/common/index";

// 将请求数据转换为form-data格式
// 这里不用qs，用FormData也可以，不赘述
let baseUrl = "/api/v1"

enum Api {
  login = "/user/login",
  logout = "/user/logout",
}

export interface LoginParams {
  isRememberMe?: boolean;
  username: string;
  password: string;
  type?: string;
}

function transParams(data) {
  let params = new URLSearchParams();
  for (let item in data) {
    params.append(item, data["" + item + ""]);
  }
  return params;
}

export function loginApi(params: LoginParams): Promise<any> {
  return request.post(baseService.user + baseUrl + Api.login, transParams(params));
}

export function logoutApi(): Promise<any> {
  return request.post(baseService.user + baseUrl + Api.logout);
}