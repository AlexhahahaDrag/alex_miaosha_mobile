import {
  getDataOne,
  postData,
  putData,
  deleteData,
  baseService,
} from "@/api/common/index";

const basePmsShopWantProduct = "/api/v1//pms-shop-want-product";

const PmsShopWantProductUrl = {
  page: "/page",
  url: "",
};

export function getPmsShopWantProductPage(params: any, pageNo: number | null | undefined, pageSize : number | null| undefined): Promise<any> {
  let url = baseService.product + basePmsShopWantProduct + PmsShopWantProductUrl.page + "?pageNum=" + (pageNo ? pageNo : 1) + "&pageSize=" + (pageSize ? pageSize : 10);
  return postData(url, params);
}

export function getPmsShopWantProductDetail(id: number): Promise<any> {
  return getDataOne(baseService.product + basePmsShopWantProduct + PmsShopWantProductUrl.url + "?id=" + id);
}

export function deletePmsShopWantProduct(ids: string) : Promise<any>{
  return deleteData(baseService.product + basePmsShopWantProduct + PmsShopWantProductUrl.url + "?ids=" + ids);
}

export function addOrEditPmsShopWantProduct(
  method: string,
  params: any
): Promise<any> {
  if ("put" == method) {
    return putData(baseService.product + basePmsShopWantProduct + PmsShopWantProductUrl.url, params);
  } else {
    return postData(baseService.product + basePmsShopWantProduct +  PmsShopWantProductUrl.url, params);
  }
}
