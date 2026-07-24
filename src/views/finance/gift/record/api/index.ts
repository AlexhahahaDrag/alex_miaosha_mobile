import { deleteData, getData, postData, putData, baseService } from '@/views/common/api';
import type { CommonPageResult, ResponseBody } from '@/types/api';
import type { GiftRecordInfo, GiftRecordQuery } from '@/views/finance/gift/config';

const base = '/gift-record-info-t';
const pageUrl = () => `${baseService.finance}${base}/page`;
const baseUrl = () => `${baseService.finance}${base}`;

export const getGiftRecordPage = (
	params: GiftRecordQuery,
	pageNum?: number,
	pageSize?: number,
): Promise<ResponseBody<CommonPageResult<GiftRecordInfo>>> =>
	postData(pageUrl(), params, {
		pageNum: pageNum || 1,
		pageSize: pageSize || 10,
	});

export const addGiftRecord = (params: GiftRecordInfo): Promise<ResponseBody<GiftRecordInfo>> =>
	postData(baseUrl(), params);

export const deleteGiftRecord = (ids: string): Promise<ResponseBody<boolean>> =>
	deleteData(baseUrl(), { ids });

export const getPendingReturnAmount = (receiveRecordId: string): Promise<ResponseBody<number>> =>
	getData(`${baseUrl()}/pending-return-amount`, { receiveRecordId });

export const markGiftReturned = (receiveRecordId: string): Promise<ResponseBody<boolean>> =>
	putData(`${baseUrl()}/mark-returned?receiveRecordId=${receiveRecordId}`, {});
