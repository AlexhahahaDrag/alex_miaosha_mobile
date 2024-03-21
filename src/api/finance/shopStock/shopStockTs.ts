import {
  getDataOne,
  postData,
  putData,
  deleteData,
  baseService,
} from '@/api/common/index';

const baseShopStock = '/api/v1//shop-stock';

const ShopStockUrl = {
  page: '/page',
  url: '',
  getShopList: '/getShopList',
};

export function getShopStockPage(params: any, pageNo: number | null | undefined, pageSize : number | null| undefined): Promise<any> {
  let url = baseService.finance + baseShopStock + ShopStockUrl.page + '?pageNum=' + (pageNo ? pageNo : 1) + '&pageSize=' + (pageSize ? pageSize : 10);
  return postData(url, params);
}

export function getShopStockDetail(id: number): Promise<any> {
  return getDataOne(baseService.finance + baseShopStock + ShopStockUrl.url + '?id=' + id);
}

export function deleteShopStock(ids: string) : Promise<any>{
  return deleteData(baseService.finance + baseShopStock + ShopStockUrl.url + '?ids=' + ids);
}

export function addOrEditShopStock(
  method: string,
  params: any
): Promise<any> {
  if ('put' == method) {
    return putData(baseService.finance + baseShopStock + ShopStockUrl.url, params);
  } else {
    return postData(baseService.finance + baseShopStock +  ShopStockUrl.url, params);
  }
}

export function getShopList(ids: string): Promise<any> {
  return getDataOne(baseService.finance + baseShopStock + ShopStockUrl.getShopList + '?ids=' + ids);
}