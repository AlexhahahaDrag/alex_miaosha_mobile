import type { PrepaidCardInfoTData } from '../config';
import { getData, postData, putData, deleteData, baseService } from '@/views/common/api/index';
import type { CommonPageResult, ResponseBody } from '@/types/api';

const basePrepaidCardInfo = '/prepaid-card-info-t';
const basePrepaidConsumeRecord = '/prepaid-consume-record-t';

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
export function getPrepaidCardInfoDetail(
	id: number | string,
): Promise<ResponseBody<PrepaidCardInfoTData>> {
	const url = baseService.finance + basePrepaidCardInfo + PrepaidCardInfoUrl.detail;
	return getData(url, { id });
}

export function addPrepaidCardInfo(
	params: PrepaidCardInfoTData,
): Promise<ResponseBody<PrepaidCardInfoTData>> {
	const url = baseService.finance + basePrepaidCardInfo + PrepaidCardInfoUrl.detail;
	return postData(url, params);
}

export function updatePrepaidCardInfo(
	params: PrepaidCardInfoTData,
): Promise<ResponseBody<PrepaidCardInfoTData>> {
	const url = baseService.finance + basePrepaidCardInfo + PrepaidCardInfoUrl.detail;
	return putData(url, params);
}

export function deletePrepaidCardInfo(ids: string): Promise<ResponseBody<boolean>> {
	const url = baseService.finance + basePrepaidCardInfo + PrepaidCardInfoUrl.detail;
	return deleteData(url, { ids });
}

export function getPrepaidCardInfoList(
	params: PrepaidCardInfoTData,
): Promise<ResponseBody<PrepaidCardInfoTData>> {
	const url = baseService.finance + basePrepaidCardInfo + PrepaidCardInfoUrl.list;
	return postData(url, params);
}

export function getPrepaidCardInfoPage(
	params: PrepaidCardInfoTData,
	pageNum: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<ResponseBody<CommonPageResult<PrepaidCardInfoTData>>> {
	const url = baseService.finance + basePrepaidCardInfo + PrepaidCardInfoUrl.page;
	return postData(url, params, {
		pageNum: pageNum ?? 1,
		pageSize: pageSize ?? 10,
	});
}

export function prepaidCardConsumeAndRecharge(
	params: PrepaidCardInfoTData,
): Promise<ResponseBody<PrepaidCardInfoTData>> {
	const url = baseService.finance + basePrepaidCardInfo + PrepaidCardInfoUrl.consumeAndRecharge;
	return postData(url, params);
}

// 消费卡交易记录表相关接口
export function getPrepaidConsumeRecordDetail(
	id: number,
): Promise<ResponseBody<PrepaidCardInfoTData>> {
	const url = baseService.finance + basePrepaidConsumeRecord + PrepaidConsumeRecordUrl.detail;
	return getData(url, { id });
}

export function addPrepaidConsumeRecord(
	params: PrepaidCardInfoTData,
): Promise<ResponseBody<PrepaidCardInfoTData>> {
	const url = baseService.finance + basePrepaidConsumeRecord + PrepaidConsumeRecordUrl.detail;
	return postData(url, params);
}

export function updatePrepaidConsumeRecord(
	params: PrepaidCardInfoTData,
): Promise<ResponseBody<PrepaidCardInfoTData>> {
	const url = baseService.finance + basePrepaidConsumeRecord + PrepaidConsumeRecordUrl.detail;
	return putData(url, params);
}

export function deletePrepaidConsumeRecord(ids: string): Promise<ResponseBody<boolean>> {
	const url = baseService.finance + basePrepaidConsumeRecord + PrepaidConsumeRecordUrl.detail;
	return deleteData(url, { ids });
}

export function getPrepaidConsumeRecordPage(
	params: PrepaidCardInfoTData,
	pageNum: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<ResponseBody<CommonPageResult<PrepaidCardInfoTData>>> {
	const url = baseService.finance + basePrepaidConsumeRecord + PrepaidConsumeRecordUrl.page;
	return postData(url, params, {
		pageNum: pageNum ?? 1,
		pageSize: pageSize ?? 10,
	});
}
