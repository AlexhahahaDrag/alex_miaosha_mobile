import {
  getData,
  postData,
  putData,
  deleteData,
  baseService,
} from '@/api/common/index';

const baseRoleInfo = '/api/v1//role-info';

const RoleInfoUrl = {
  page: '/page',
  url: '',
};

export function getRoleInfoPage(params: any, pageNo: number | null | undefined, pageSize : number | null| undefined): Promise<any> {
  let url = baseService.user + baseRoleInfo + RoleInfoUrl.page + '?pageNum=' + (pageNo ? pageNo : 1) + '&pageSize=' + (pageSize ? pageSize : 10);
  return postData(url, params);
}

export function getRoleInfoDetail(id: number): Promise<any> {
  return getData(baseService.user + baseRoleInfo + RoleInfoUrl.url + '?id=' + id);
}

export function deleteRoleInfo(ids: string) : Promise<any>{
  return deleteData(baseService.user + baseRoleInfo + RoleInfoUrl.url + '?ids=' + ids);
}

export function addOrEditRoleInfo(
  method: string,
  params: any
): Promise<any> {
  if ('put' == method) {
    return putData(baseService.user + baseRoleInfo + RoleInfoUrl.url, params);
  } else {
    return postData(baseService.user + baseRoleInfo +  RoleInfoUrl.url, params);
  }
}
