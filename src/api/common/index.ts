import { Params } from "@/types/global";
import request, { requestFile } from "@/utils/request/request";

export function postData(url: string, params: any): Promise<any> {
  return request.post<Params, any>(url, params);
}

export function putData(url: string, params: any): Promise<any> {
  return request.put<Params, any>(url, params);
}

export function getData(url: string, params: any): Promise<any> {
  return request.get<Params, any>(url, params);
}

export function getDataOne(url: string): Promise<any> {
  return request.get<Params, any>(url);
}

export function deleteData(url: string): Promise<any> {
  return request.delete<Params, any>(url);
}

export function postFileData(url: string, params: any): Promise<any> {
  return requestFile.post<Params, any>(url, params);
}

export const baseService = {
  finance: "/api/am-finance",
  user: "/api/am-user",
  mission: "/api/am-mission",
  file: "/api/am-oss",
  product: "/api/am-product",
}