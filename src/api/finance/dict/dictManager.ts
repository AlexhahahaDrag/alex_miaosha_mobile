import { getDataOne, postData, putData, deleteData, baseService, } from "@/api/common/index";

const baseDictManager = "/api/v1/dict-info";

const dictUrl = {
    page: '/page',
    listByBelong: '/listByBelong',
    url: "",
}

export function getDictManagerPage(params: any, pageNo: number | null | undefined, pageSize : number | null| undefined): Promise<any> {
  let url = baseService.finance + baseDictManager + dictUrl.page + "?pageNum=" + (pageNo ? pageNo : 1) + "&pageSize=" + (pageSize ? pageSize : 10);
  return postData(url, params);
}

export function getDictList(belongTo: string): Promise<any> {
  return getDataOne(baseService.finance + baseDictManager + dictUrl.listByBelong + "?belongTo=" + belongTo);
}

export function getDictManagerDetail(id: number): Promise<any> {
  return getDataOne(baseService.finance + baseDictManager + dictUrl.url + "?id=" + id);
}

export function deleteDictManager(ids: string) : Promise<any>{
  return deleteData(baseService.finance + baseDictManager + dictUrl.url + "?ids=" + ids);
}

export function addOrEditDictManager(
  method: string,
  params: any
): Promise<any> {
  if ("put" == method) {
    return putData(baseService.finance + baseDictManager + dictUrl.url, params);
  } else {
    return postData(baseService.finance + baseDictManager + dictUrl.url, params);
  }
}