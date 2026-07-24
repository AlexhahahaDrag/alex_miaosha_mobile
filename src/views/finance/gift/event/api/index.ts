import { postData, baseService } from '@/views/common/api';
import type { CommonPageResult, ResponseBody } from '@/types/api';
import type { GiftEventInfo } from '@/views/finance/gift/config';

const base = '/gift-event-info-t';
const pageUrl = () => `${baseService.finance}${base}/page`;
const listUrl = () => `${baseService.finance}${base}/list`;
const baseUrl = () => `${baseService.finance}${base}`;

export const getGiftEventPage = (
	params: Partial<GiftEventInfo>,
	pageNum?: number,
	pageSize?: number,
): Promise<ResponseBody<CommonPageResult<GiftEventInfo>>> =>
	postData(pageUrl(), params, {
		pageNum: pageNum || 1,
		pageSize: pageSize || 10,
	});

export const getGiftEventList = (
	params: Partial<GiftEventInfo> = {},
): Promise<ResponseBody<GiftEventInfo[]>> => postData(listUrl(), params);

export const addGiftEvent = (params: GiftEventInfo): Promise<ResponseBody<GiftEventInfo>> =>
	postData(baseUrl(), params);
