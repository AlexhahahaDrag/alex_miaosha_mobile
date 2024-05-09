import {
  getData,
  postData,
  putData,
  deleteData,
  baseService,
} from '@/api/common/index';

const baseMenuInfo = '/api/v1//menu-info';

const MenuInfoUrl = {
  page: '/page',
  url: '',
};

export function getMenuInfoPage(params: any, pageNo: number | null | undefined, pageSize : number | null| undefined): Promise<any> {
  let url = baseService.user + baseMenuInfo + MenuInfoUrl.page + '?pageNum=' + (pageNo ? pageNo : 1) + '&pageSize=' + (pageSize ? pageSize : 10);
  return postData(url, params);
}

export function getMenuInfoDetail(id: number): Promise<any> {
  return getData(baseService.user + baseMenuInfo + MenuInfoUrl.url + '?id=' + id);
}

export function deleteMenuInfo(ids: string) : Promise<any>{
  return deleteData(baseService.user + baseMenuInfo + MenuInfoUrl.url + '?ids=' + ids);
}

export function addOrEditMenuInfo(
  method: string,
  params: any
): Promise<any> {
  if ('put' == method) {
    return putData(baseService.user + baseMenuInfo + MenuInfoUrl.url, params);
  } else {
    return postData(baseService.user + baseMenuInfo +  MenuInfoUrl.url, params);
  }
}
