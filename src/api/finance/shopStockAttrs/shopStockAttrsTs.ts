import {
  getDataOne,
  postData,
  putData,
  deleteData,
  baseService,
} from '@/api/common/index';

const baseShopStockAttrs = '/api/v1//shop-stock-attrs';

const ShopStockAttrsUrl = {
  page: '/page',
  url: '',
};

export function getShopStockAttrsPage(params: any, pageNo: number | null | undefined, pageSize : number | null| undefined): Promise<any> {
  let url = baseService.finance + baseShopStockAttrs + ShopStockAttrsUrl.page + '?pageNum=' + (pageNo ? pageNo : 1) + '&pageSize=' + (pageSize ? pageSize : 10);
  return postData(url, params);
}

export function getShopStockAttrsDetail(id: number): Promise<any> {
  return getDataOne(baseService.finance + baseShopStockAttrs + ShopStockAttrsUrl.url + '?id=' + id);
}

export function deleteShopStockAttrs(ids: string) : Promise<any>{
  return deleteData(baseService.finance + baseShopStockAttrs + ShopStockAttrsUrl.url + '?ids=' + ids);
}

export function addOrEditShopStockAttrs(
  method: string,
  params: any
): Promise<any> {
  if ('put' == method) {
    return putData(baseService.finance + baseShopStockAttrs + ShopStockAttrsUrl.url, params);
  } else {
    return postData(baseService.finance + baseShopStockAttrs +  ShopStockAttrsUrl.url, params);
  }
}
