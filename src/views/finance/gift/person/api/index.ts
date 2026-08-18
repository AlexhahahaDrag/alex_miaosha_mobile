import { deleteData, getData, postData, putData, baseService } from '@/views/common/api';
import type { CommonPageResult, ResponseBody } from '@/types/api';
import type {
	GiftPersonBusinessInfo,
	GiftPersonInfo,
	GiftPersonProfile,
	GiftPersonQuery,
	GiftPersonRelationOptions,
	GiftPersonSummary,
} from '@/views/finance/gift/config';

const base = '/gift-person-info-t';
const pageUrl = () => `${baseService.finance}${base}/page`;
const listUrl = () => `${baseService.finance}${base}/list`;
const baseUrl = () => `${baseService.finance}${base}`;

export const getGiftPersonPage = (
	params: GiftPersonQuery | Partial<GiftPersonInfo>,
	pageNum?: number,
	pageSize?: number,
): Promise<ResponseBody<CommonPageResult<GiftPersonInfo>>> =>
	postData(pageUrl(), params, {
		pageNum: pageNum || 1,
		pageSize: pageSize || 10,
	});

export const getGiftPersonBusinessPage = (
	params: GiftPersonQuery,
	pageNum?: number,
	pageSize?: number,
): Promise<ResponseBody<CommonPageResult<GiftPersonBusinessInfo>>> =>
	postData(`${baseUrl()}/business-page`, params, {
		pageNum: pageNum || 1,
		pageSize: pageSize || 10,
	});

export const getGiftPersonSummary = (): Promise<ResponseBody<GiftPersonSummary>> =>
	getData(`${baseUrl()}/summary`);

export const getGiftPersonProfile = (id: string): Promise<ResponseBody<GiftPersonProfile>> =>
	getData(`${baseUrl()}/profile`, { id });

export const getGiftPersonRelationOptions = (
	personId?: string,
): Promise<ResponseBody<GiftPersonRelationOptions>> =>
	getData(`${baseUrl()}/relation-options`, personId ? { personId } : {});

export const getGiftPersonDetail = (id: string): Promise<ResponseBody<GiftPersonInfo>> =>
	getData(baseUrl(), { id });

export const getGiftPersonList = (
	params: GiftPersonQuery | Partial<GiftPersonInfo> = {},
): Promise<ResponseBody<GiftPersonInfo[]>> => postData(listUrl(), params);

export const addGiftPerson = (params: GiftPersonInfo): Promise<ResponseBody<GiftPersonInfo>> =>
	postData(baseUrl(), params);

export const updateGiftPerson = (params: GiftPersonInfo): Promise<ResponseBody<boolean>> =>
	putData(baseUrl(), params);

export const deleteGiftPerson = (ids: string): Promise<ResponseBody<boolean>> =>
	deleteData(baseUrl(), { ids });
