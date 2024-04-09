import {
  getDataOne,
  postData,
  putData,
  deleteData,
  baseService,
} from '@/api/common/index';

const baseShopOrderDetail = '/api/v1//shop-order-detail';

const ShopOrderDetailUrl = {
  page: '/page',
  url: '',
};

export function getShopOrderDetailPage(params: any, pageNo: number | null | undefined, pageSize : number | null| undefined): Promise<any> {
  let url = baseService.finance + baseShopOrderDetail + ShopOrderDetailUrl.page + '?pageNum=' + (pageNo ? pageNo : 1) + '&pageSize=' + (pageSize ? pageSize : 10);
  return postData(url, params);
}

export function getShopOrderDetailDetail(id: number): Promise<any> {
  return getDataOne(baseService.finance + baseShopOrderDetail + ShopOrderDetailUrl.url + '?id=' + id);
}

export function deleteShopOrderDetail(ids: string) : Promise<any>{
  return deleteData(baseService.finance + baseShopOrderDetail + ShopOrderDetailUrl.url + '?ids=' + ids);
}

export function addOrEditShopOrderDetail(
  method: string,
  params: any
): Promise<any> {
  if ('put' == method) {
    return putData(baseService.finance + baseShopOrderDetail + ShopOrderDetailUrl.url, params);
  } else {
    return postData(baseService.finance + baseShopOrderDetail +  ShopOrderDetailUrl.url, params);
  }
}
