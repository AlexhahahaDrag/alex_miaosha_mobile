import { deleteData, getData, postData, putData, baseService } from '@/views/common/api';
import type { CommonPageResult, ResponseBody } from '@/types/api';
import type {
	GiftEventBusinessInfo,
	GiftEventInfo,
	GiftEventQuery,
	GiftEventSummary,
	GiftEventTypeOptions,
} from '@/views/finance/gift/config';

const base = '/gift-event-info-t';
const pageUrl = () => `${baseService.finance}${base}/page`;
const listUrl = () => `${baseService.finance}${base}/list`;
const baseUrl = () => `${baseService.finance}${base}`;

export const getGiftEventPage = (
	params: GiftEventQuery | Partial<GiftEventInfo>,
	pageNum?: number,
	pageSize?: number,
): Promise<ResponseBody<CommonPageResult<GiftEventInfo>>> =>
	postData(pageUrl(), params, { pageNum: pageNum || 1, pageSize: pageSize || 10 });

export const getGiftEventBusinessPage = (
	params: GiftEventQuery,
	pageNum?: number,
	pageSize?: number,
): Promise<ResponseBody<CommonPageResult<GiftEventBusinessInfo>>> =>
	postData(`${baseUrl()}/business-page`, params, {
		pageNum: pageNum || 1,
		pageSize: pageSize || 10,
	});

export const getGiftEventSummary = (): Promise<ResponseBody<GiftEventSummary>> =>
	getData(`${baseUrl()}/summary`);

export const getGiftEventTypeOptions = (): Promise<ResponseBody<GiftEventTypeOptions>> =>
	getData(`${baseUrl()}/event-type-options`);

export const getGiftEventDetail = (id: string): Promise<ResponseBody<GiftEventInfo>> =>
	getData(baseUrl(), { id });

export const getGiftEventList = (
	params: GiftEventQuery | Partial<GiftEventInfo> = {},
): Promise<ResponseBody<GiftEventInfo[]>> => postData(listUrl(), params);

export const addGiftEvent = (params: GiftEventInfo): Promise<ResponseBody<GiftEventInfo>> =>
	postData(baseUrl(), params);

export const updateGiftEvent = (params: GiftEventInfo): Promise<ResponseBody<boolean>> =>
	putData(baseUrl(), params);

export const deleteGiftEvent = (ids: string): Promise<ResponseBody<boolean>> =>
	deleteData(baseUrl(), { ids });
