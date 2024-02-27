import {
  getDataOne,
  postData,
  putData,
  deleteData,
  baseService,
} from '@/api/common/index';

const baseRoleUserInfo = '/api/v1//role-user-info';

const RoleUserInfoUrl = {
  page: '/page',
  url: '',
};

export function getRoleUserInfoPage(params: any, pageNo: number | null | undefined, pageSize : number | null| undefined): Promise<any> {
  let url = baseService.user + baseRoleUserInfo + RoleUserInfoUrl.page + '?pageNum=' + (pageNo ? pageNo : 1) + '&pageSize=' + (pageSize ? pageSize : 10);
  return postData(url, params);
}

export function getRoleUserInfoDetail(id: number): Promise<any> {
  return getDataOne(baseService.user + baseRoleUserInfo + RoleUserInfoUrl.url + '?id=' + id);
}

export function deleteRoleUserInfo(ids: string) : Promise<any>{
  return deleteData(baseService.user + baseRoleUserInfo + RoleUserInfoUrl.url + '?ids=' + ids);
}

export function addOrEditRoleUserInfo(
  method: string,
  params: any
): Promise<any> {
  if ('put' == method) {
    return putData(baseService.user + baseRoleUserInfo + RoleUserInfoUrl.url, params);
  } else {
    return postData(baseService.user + baseRoleUserInfo +  RoleUserInfoUrl.url, params);
  }
}
