import { getData, postData, putData, deleteData, baseService } from '@/api/common/index';

const basePrepaidCardInfo = '/api/v1/prepaid-card-info-t';
const basePrepaidConsumeRecord = '/api/v1/prepaid-consume-record-t';

const PrepaidCardInfoUrl = {
  detail: '',
  list: '/list',
  page: '/page',
  consumeAndRecharge: '/consumeAndRecharge',
};

const PrepaidConsumeRecordUrl = {
  detail: '',
  page: '/page',
};

// 消费卡信息表相关接口
export function getPrepaidCardInfoDetail(id: number): Promise<any> {
  let url = baseService.finance + basePrepaidCardInfo + PrepaidCardInfoUrl.detail + '?id=' + id;
  return getData(url);
}

export function addPrepaidCardInfo(params: any): Promise<any> {
  let url = baseService.finance + basePrepaidCardInfo + PrepaidCardInfoUrl.detail;
  return postData(url, params);
}

export function updatePrepaidCardInfo(params: any): Promise<any> {
  let url = baseService.finance + basePrepaidCardInfo + PrepaidCardInfoUrl.detail;
  return putData(url, params);
}

export function deletePrepaidCardInfo(ids: string): Promise<any> {
  let url = baseService.finance + basePrepaidCardInfo + PrepaidCardInfoUrl.detail + '?ids=' + ids;
  return deleteData(url);
}

export function getPrepaidCardInfoList(params: any): Promise<any> {
  let url = baseService.finance + basePrepaidCardInfo + PrepaidCardInfoUrl.list;
  return postData(url, params);
}

export function getPrepaidCardInfoPage(
  params: any,
  pageNo: number | null | undefined,
  pageSize: number | null | undefined,
): Promise<any> {
  let url =
    baseService.finance +
    basePrepaidCardInfo +
    PrepaidCardInfoUrl.page +
    `?pageNum=${pageNo ? pageNo : 1}&pageSize=${pageSize ? pageSize : 10}`;
  return postData(url, params);
}

export function prepaidCardConsumeAndRecharge(params: any): Promise<any> {
  let url = baseService.finance + basePrepaidCardInfo + PrepaidCardInfoUrl.consumeAndRecharge;
  return postData(url, params);
}

// 消费卡交易记录表相关接口
export function getPrepaidConsumeRecordDetail(id: number): Promise<any> {
  let url =
    baseService.finance + basePrepaidConsumeRecord + PrepaidConsumeRecordUrl.detail + `?id=${id}`;
  return getData(url);
}

export function addPrepaidConsumeRecord(params: any): Promise<any> {
  let url = baseService.finance + basePrepaidConsumeRecord + PrepaidConsumeRecordUrl.detail;
  return postData(url, params);
}

export function updatePrepaidConsumeRecord(params: any): Promise<any> {
  let url = baseService.finance + basePrepaidConsumeRecord + PrepaidConsumeRecordUrl.detail;
  return putData(url, params);
}

export function deletePrepaidConsumeRecord(ids: string): Promise<any> {
  let url =
    baseService.finance + basePrepaidConsumeRecord + PrepaidConsumeRecordUrl.detail + `?ids=${ids}`;
  return deleteData(url);
}

export function getPrepaidConsumeRecordPage(
  params: any,
  pageNo: number | null | undefined,
  pageSize: number | null | undefined,
): Promise<any> {
  let url =
    baseService.finance +
    basePrepaidConsumeRecord +
    PrepaidConsumeRecordUrl.page +
    `?pageNum=${pageNo ? pageNo : 1}&pageSize=${pageSize ? pageSize : 10}`;
  return postData(url, params);
}
