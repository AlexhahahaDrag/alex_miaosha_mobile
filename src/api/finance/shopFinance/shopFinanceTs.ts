import {
  getData,
  postData,
  putData,
  deleteData,
  baseService,
} from '@/api/common/index';

const baseShopFinance = '/api/v1//shop-finance';

const ShopFinanceUrl = {
  page: '/page',
  url: '',
};

export function getShopFinancePage(params: any, pageNo: number | null | undefined, pageSize : number | null| undefined): Promise<any> {
  let url = baseService.finance + baseShopFinance + ShopFinanceUrl.page + '?pageNum=' + (pageNo ? pageNo : 1) + '&pageSize=' + (pageSize ? pageSize : 10);
  return postData(url, params);
}

export function getShopFinanceDetail(id: number): Promise<any> {
  return getData(baseService.finance + baseShopFinance + ShopFinanceUrl.url + '?id=' + id);
}

export function deleteShopFinance(ids: string) : Promise<any>{
  return deleteData(baseService.finance + baseShopFinance + ShopFinanceUrl.url + '?ids=' + ids);
}

export function addOrEditShopFinance(
  method: string,
  params: any
): Promise<any> {
  if ('put' == method) {
    return putData(baseService.finance + baseShopFinance + ShopFinanceUrl.url, params);
  } else {
    return postData(baseService.finance + baseShopFinance +  ShopFinanceUrl.url, params);
  }
}
