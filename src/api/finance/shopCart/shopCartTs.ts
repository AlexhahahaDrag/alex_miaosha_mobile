import {
  getDataOne,
  postData,
  putData,
  deleteData,
  baseService,
} from '@/api/common/index';

const baseShopCart = '/api/v1//shop-cart';

const ShopCartUrl = {
  page: '/page',
  url: '',
};

export function getShopCartPage(params: any, pageNo: number | null | undefined, pageSize : number | null| undefined): Promise<any> {
  let url = baseService.finance + baseShopCart + ShopCartUrl.page + '?pageNum=' + (pageNo ? pageNo : 1) + '&pageSize=' + (pageSize ? pageSize : 10);
  return postData(url, params);
}

export function getShopCartDetail(id: number): Promise<any> {
  return getDataOne(baseService.finance + baseShopCart + ShopCartUrl.url + '?id=' + id);
}

export function deleteShopCart(ids: string) : Promise<any>{
  return deleteData(baseService.finance + baseShopCart + ShopCartUrl.url + '?ids=' + ids);
}

export function addOrEditShopCart(
  method: string,
  params: any
): Promise<any> {
  if ('put' == method) {
    return putData(baseService.finance + baseShopCart + ShopCartUrl.url, params);
  } else {
    return postData(baseService.finance + baseShopCart +  ShopCartUrl.url, params);
  }
}
