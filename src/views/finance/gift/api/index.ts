import { deleteData, getData, postData, putData, baseService } from '@/views/common/api';
import type { CommonPageResult, ResponseBody } from '@/types/api';
import type {
	GiftEventInfo,
	GiftPersonInfo,
	GiftRecordInfo,
	GiftRecordQuery,
} from '@/views/finance/gift/config';

const api = {
	person: '/gift-person-info-t',
	event: '/gift-event-info-t',
	record: '/gift-record-info-t',
};

const pageUrl = (base: string) => `${baseService.finance + base}/page`;
const listUrl = (base: string) => `${baseService.finance + base}/list`;
const baseUrl = (base: string) => `${baseService.finance + base}`;

export const getGiftPersonPage = (
	params: Partial<GiftPersonInfo>,
	pageNum?: number,
	pageSize?: number,
): Promise<ResponseBody<CommonPageResult<GiftPersonInfo>>> =>
	postData(pageUrl(api.person), params, { pageNum: pageNum || 1, pageSize: pageSize || 10 });

export const getGiftEventPage = (
	params: Partial<GiftEventInfo>,
	pageNum?: number,
	pageSize?: number,
): Promise<ResponseBody<CommonPageResult<GiftEventInfo>>> =>
	postData(pageUrl(api.event), params, { pageNum: pageNum || 1, pageSize: pageSize || 10 });

export const getGiftEventList = (
	params: Partial<GiftEventInfo> = {},
): Promise<ResponseBody<GiftEventInfo[]>> => postData(listUrl(api.event), params);

export const getGiftPersonList = (
	params: Partial<GiftPersonInfo> = {},
): Promise<ResponseBody<GiftPersonInfo[]>> => postData(listUrl(api.person), params);

export const addGiftPerson = (params: GiftPersonInfo): Promise<ResponseBody<GiftPersonInfo>> =>
	postData(baseUrl(api.person), params);

export const addGiftEvent = (params: GiftEventInfo): Promise<ResponseBody<GiftEventInfo>> =>
	postData(baseUrl(api.event), params);

export const getGiftRecordPage = (
	params: GiftRecordQuery,
	pageNum?: number,
	pageSize?: number,
): Promise<ResponseBody<CommonPageResult<GiftRecordInfo>>> =>
	postData(pageUrl(api.record), params, { pageNum: pageNum || 1, pageSize: pageSize || 10 });

export const addGiftRecord = (params: GiftRecordInfo): Promise<ResponseBody<GiftRecordInfo>> =>
	postData(baseUrl(api.record), params);

export const deleteGiftRecord = (ids: string): Promise<ResponseBody<boolean>> =>
	deleteData(baseUrl(api.record), { ids });

export const getPendingReturnAmount = (
	receiveRecordId: string | number,
): Promise<ResponseBody<number>> =>
	getData(`${baseUrl(api.record)}/pending-return-amount`, { receiveRecordId });

export const markGiftReturned = (
	receiveRecordId: string | number,
): Promise<ResponseBody<boolean>> =>
	putData(`${baseUrl(api.record)}/mark-returned?receiveRecordId=${receiveRecordId}`, {});
