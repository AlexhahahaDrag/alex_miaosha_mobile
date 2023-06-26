import {
  getDataOne,
  postData,
  putData,
  deleteData,
  baseService,
} from "@/api/common/index";

const baseFinanceManager = "/api/v1/finance-info";

const financeMangerUrl = {
  page: "/page",
  url: "",
};

export function getFinanceMangerPage(params: any, pageNo: number | null | undefined, pageSize : number | null| undefined): Promise<any> {
  let url = baseService.finance + baseFinanceManager + financeMangerUrl.page + "?pageNum=" + (pageNo ? pageNo : 1) + "&pageSize=" + (pageSize ? pageSize : 10);
  return postData(url, params);
}

export function getFinanceMangerDetail(id: number): Promise<any> {
  return getDataOne(baseService.finance + baseFinanceManager + financeMangerUrl.url + "?id=" + id);
}

export function deleteFinanceManger(ids: string) : Promise<any>{
  return deleteData(baseService.finance + baseFinanceManager + financeMangerUrl.url + "?ids=" + ids);
}

export function addOrEditFinanceManger(
  method: string,
  params: any
): Promise<any> {
  if ("put" == method) {
    return putData(baseService.finance + baseFinanceManager + financeMangerUrl.url, params);
  } else {
    return postData(baseService.finance + baseFinanceManager + financeMangerUrl.url, params);
  }
}
