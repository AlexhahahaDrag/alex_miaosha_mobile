import {
  getDataOne,
  postData,
  putData,
  deleteData,
  baseService,
} from "@/api/common/index";

const basePmsCategory = "/api/v1//pms-category";

const PmsCategoryUrl = {
  page: "/page",
  url: "",
};

export function getPmsCategoryPage(params: any, pageNo: number | null | undefined, pageSize : number | null| undefined): Promise<any> {
  let url = baseService.product + basePmsCategory + PmsCategoryUrl.page + "?pageNum=" + (pageNo ? pageNo : 1) + "&pageSize=" + (pageSize ? pageSize : 10);
  return postData(url, params);
}

export function getPmsCategoryDetail(id: number): Promise<any> {
  return getDataOne(baseService.product + basePmsCategory + PmsCategoryUrl.url + "?id=" + id);
}

export function deletePmsCategory(ids: string) : Promise<any>{
  return deleteData(baseService.product + basePmsCategory + PmsCategoryUrl.url + "?ids=" + ids);
}

export function addOrEditPmsCategory(
  method: string,
  params: any
): Promise<any> {
  if ("put" == method) {
    return putData(baseService.product + basePmsCategory + PmsCategoryUrl.url, params);
  } else {
    return postData(baseService.product + basePmsCategory +  PmsCategoryUrl.url, params);
  }
}
