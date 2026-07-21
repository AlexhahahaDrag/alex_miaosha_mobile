import { normalizeGiftIds } from './normalizeGiftIds';
import { deleteData, getData, postData, putData, baseService } from '@/views/common/api';
import type { CommonPageResult, ResponseBody } from '@/types/api';
import type {
	GiftEventInfo,
	GiftPersonBusinessInfo,
	GiftPersonInfo,
	GiftPersonProfile,
	GiftPersonQuery,
	GiftPersonRelationOptions,
	GiftPersonSummary,
	GiftRecordInfo,
	GiftRecordQuery,
} from '@/views/finance/gift/config';

export { normalizeGiftIds } from './normalizeGiftIds';

const api = {
	person: '/gift-person-info-t',
	event: '/gift-event-info-t',
	record: '/gift-record-info-t',
};

const pageUrl = (base: string) => `${baseService.finance + base}/page`;
const listUrl = (base: string) => `${baseService.finance + base}/list`;
const baseUrl = (base: string) => `${baseService.finance + base}`;

function normalizeGiftResponse<T>(response: ResponseBody<T>): ResponseBody<T> {
	if (!response.data) {
		return response;
	}
	return {
		...response,
		data: normalizeGiftIds(response.data),
	};
}

export const getGiftPersonPage = (
	params: GiftPersonQuery | Partial<GiftPersonInfo>,
	pageNum?: number,
	pageSize?: number,
): Promise<ResponseBody<CommonPageResult<GiftPersonInfo>>> =>
	postData(pageUrl(api.person), normalizeGiftIds(params), {
		pageNum: pageNum || 1,
		pageSize: pageSize || 10,
	}).then(normalizeGiftResponse);

export const getGiftPersonBusinessPage = (
	params: GiftPersonQuery,
	pageNum?: number,
	pageSize?: number,
): Promise<ResponseBody<CommonPageResult<GiftPersonBusinessInfo>>> =>
	postData(`${baseUrl(api.person)}/business-page`, normalizeGiftIds(params), {
		pageNum: pageNum || 1,
		pageSize: pageSize || 10,
	}).then(normalizeGiftResponse);

export const getGiftPersonSummary = (): Promise<ResponseBody<GiftPersonSummary>> =>
	getData(`${baseUrl(api.person)}/summary`);

export const getGiftPersonProfile = (id: string): Promise<ResponseBody<GiftPersonProfile>> =>
	getData(`${baseUrl(api.person)}/profile`, { id }).then(normalizeGiftResponse);

export const getGiftPersonRelationOptions = (
	personId?: string,
): Promise<ResponseBody<GiftPersonRelationOptions>> =>
	getData(`${baseUrl(api.person)}/relation-options`, personId ? { personId } : {});

export const getGiftPersonDetail = (id: string): Promise<ResponseBody<GiftPersonInfo>> =>
	getData(baseUrl(api.person), { id }).then(normalizeGiftResponse);

export const getGiftPersonList = (
	params: GiftPersonQuery | Partial<GiftPersonInfo> = {},
): Promise<ResponseBody<GiftPersonInfo[]>> =>
	postData(listUrl(api.person), normalizeGiftIds(params)).then(normalizeGiftResponse);

export const addGiftPerson = (params: GiftPersonInfo): Promise<ResponseBody<GiftPersonInfo>> =>
	postData(baseUrl(api.person), normalizeGiftIds(params)).then(normalizeGiftResponse);

export const updateGiftPerson = (params: GiftPersonInfo): Promise<ResponseBody<boolean>> =>
	putData(baseUrl(api.person), normalizeGiftIds(params));

export const deleteGiftPerson = (ids: string): Promise<ResponseBody<boolean>> =>
	deleteData(baseUrl(api.person), { ids });

export const getGiftEventPage = (
	params: Partial<GiftEventInfo>,
	pageNum?: number,
	pageSize?: number,
): Promise<ResponseBody<CommonPageResult<GiftEventInfo>>> =>
	postData(pageUrl(api.event), normalizeGiftIds(params), {
		pageNum: pageNum || 1,
		pageSize: pageSize || 10,
	}).then(normalizeGiftResponse);

export const getGiftEventList = (
	params: Partial<GiftEventInfo> = {},
): Promise<ResponseBody<GiftEventInfo[]>> =>
	postData(listUrl(api.event), normalizeGiftIds(params)).then(normalizeGiftResponse);

export const addGiftEvent = (params: GiftEventInfo): Promise<ResponseBody<GiftEventInfo>> =>
	postData(baseUrl(api.event), normalizeGiftIds(params)).then(normalizeGiftResponse);

export const getGiftRecordPage = (
	params: GiftRecordQuery,
	pageNum?: number,
	pageSize?: number,
): Promise<ResponseBody<CommonPageResult<GiftRecordInfo>>> =>
	postData(pageUrl(api.record), normalizeGiftIds(params), {
		pageNum: pageNum || 1,
		pageSize: pageSize || 10,
	}).then(normalizeGiftResponse);

export const addGiftRecord = (params: GiftRecordInfo): Promise<ResponseBody<GiftRecordInfo>> =>
	postData(baseUrl(api.record), normalizeGiftIds(params)).then(normalizeGiftResponse);

export const deleteGiftRecord = (ids: string): Promise<ResponseBody<boolean>> =>
	deleteData(baseUrl(api.record), { ids });

export const getPendingReturnAmount = (receiveRecordId: string): Promise<ResponseBody<number>> =>
	getData(`${baseUrl(api.record)}/pending-return-amount`, { receiveRecordId });

export const markGiftReturned = (receiveRecordId: string): Promise<ResponseBody<boolean>> =>
	putData(`${baseUrl(api.record)}/mark-returned?receiveRecordId=${receiveRecordId}`, {});
