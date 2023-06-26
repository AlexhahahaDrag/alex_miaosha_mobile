import {
  getDataOne,
  postData,
  putData,
  deleteData,
  baseService,
} from "@/api/common/index";

const basePmsBrand = "/api/v1//pms-brand";

const PmsBrandUrl = {
  page: "/page",
  url: "",
};

export function getPmsBrandPage(params: any, pageNo: number | null | undefined, pageSize : number | null| undefined): Promise<any> {
  let url = baseService.product + basePmsBrand + PmsBrandUrl.page + "?pageNum=" + (pageNo ? pageNo : 1) + "&pageSize=" + (pageSize ? pageSize : 10);
  return postData(url, params);
}

export function getPmsBrandDetail(id: number): Promise<any> {
  return getDataOne(baseService.product + basePmsBrand + PmsBrandUrl.url + "?id=" + id);
}

export function deletePmsBrand(ids: string) : Promise<any>{
  return deleteData(baseService.product + basePmsBrand + PmsBrandUrl.url + "?ids=" + ids);
}

export function addOrEditPmsBrand(
  method: string,
  params: any
): Promise<any> {
  if ("put" == method) {
    return putData(baseService.product + basePmsBrand + PmsBrandUrl.url, params);
  } else {
    return postData(baseService.product + basePmsBrand +  PmsBrandUrl.url, params);
  }
}
