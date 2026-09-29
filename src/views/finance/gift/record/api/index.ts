import { deleteData, getData, postData, putData, baseService } from '@/views/common/api';
import type { CommonPageResult, ResponseBody } from '@/types/api';
import type {
	GiftRecordAiParseReq,
	GiftRecordAiParseVo,
	GiftRecordInfo,
	GiftRecordQuery,
	GiftRecordRecommendAmount,
} from '@/views/finance/gift/config';
import { normalizeGiftAiParseVo } from '@/views/finance/gift/config';

const base = '/gift-record-info-t';
const eventOptionBase = '/gift-event-type-option-t';
const pageUrl = () => `${baseService.finance}${base}/page`;
const baseUrl = () => `${baseService.finance}${base}`;
const eventOptionUrl = () => `${baseService.finance}${eventOptionBase}`;

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

/** AI 自然语言快速记账解析 */
export const aiParseGiftRecord = async (
	params: GiftRecordAiParseReq,
): Promise<ResponseBody<GiftRecordAiParseVo>> => {
	const res = await postData<ResponseBody<GiftRecordAiParseVo>>(`${baseUrl()}/ai-parse`, params);
	if (res && res.data) {
		res.data = normalizeGiftAiParseVo(res.data);
	}
	return res;
};

/** 获取智能礼金推荐与情景贺词 */
export const getGiftRecordRecommendAmount = (params: {
	personId?: string;
	eventType?: string;
	direction?: string;
}): Promise<ResponseBody<GiftRecordRecommendAmount>> =>
	getData(`${eventOptionUrl()}/recommend-amount`, params);
