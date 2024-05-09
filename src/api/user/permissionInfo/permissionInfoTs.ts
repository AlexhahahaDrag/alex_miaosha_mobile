import {
  getData,
  postData,
  putData,
  deleteData,
  baseService,
} from '@/api/common/index';

const basePermissionInfo = '/api/v1//permission-info';

const PermissionInfoUrl = {
  page: '/page',
  url: '',
};

export function getPermissionInfoPage(params: any, pageNo: number | null | undefined, pageSize : number | null| undefined): Promise<any> {
  let url = baseService.user + basePermissionInfo + PermissionInfoUrl.page + '?pageNum=' + (pageNo ? pageNo : 1) + '&pageSize=' + (pageSize ? pageSize : 10);
  return postData(url, params);
}

export function getPermissionInfoDetail(id: number): Promise<any> {
  return getData(baseService.user + basePermissionInfo + PermissionInfoUrl.url + '?id=' + id);
}

export function deletePermissionInfo(ids: string) : Promise<any>{
  return deleteData(baseService.user + basePermissionInfo + PermissionInfoUrl.url + '?ids=' + ids);
}

export function addOrEditPermissionInfo(
  method: string,
  params: any
): Promise<any> {
  if ('put' == method) {
    return putData(baseService.user + basePermissionInfo + PermissionInfoUrl.url, params);
  } else {
    return postData(baseService.user + basePermissionInfo +  PermissionInfoUrl.url, params);
  }
}
