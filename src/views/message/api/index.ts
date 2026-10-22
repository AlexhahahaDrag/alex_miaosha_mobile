import { deleteData, getData, postData, putData, baseService } from '@/views/common/api';
import type { CommonPageResult, ResponseBody } from '@/types/api';
import {
	normalizeMessageIds,
	type SysMessageInfoData,
	type SysMessageSummaryData,
	type UserNoticeConfigData,
} from '@/views/message/config';

export { normalizeMessageIds };

const base = '/sys-message-info';
const baseUrl = () => `${baseService.finance}${base}`;

const wrapNormalize = <T>(promise: Promise<ResponseBody<T>>): Promise<ResponseBody<T>> =>
	promise.then((res) => (res && typeof res === 'object' ? normalizeMessageIds(res) : res));

export const getSysMessagePage = (
	params: Partial<SysMessageInfoData> = {},
	pageNum: number = 1,
	pageSize: number = 10,
): Promise<ResponseBody<CommonPageResult<SysMessageInfoData>>> =>
	wrapNormalize(
		postData(`${baseUrl()}/page`, params, {
			pageNum,
			pageSize,
		}),
	);

export const getSysMessageSummary = (): Promise<ResponseBody<SysMessageSummaryData>> =>
	getData(`${baseUrl()}/summary`);

export const markSysMessageRead = (id: string): Promise<ResponseBody<boolean>> =>
	putData(`${baseUrl()}/read`, {}, { id });

export const markAllSysMessageRead = (msgType?: string): Promise<ResponseBody<number>> =>
	putData(`${baseUrl()}/read-all`, {}, msgType && msgType !== 'ALL' ? { msgType } : {});

export const publishSysMessage = (
	params: Partial<SysMessageInfoData>,
): Promise<ResponseBody<SysMessageInfoData>> => wrapNormalize(postData(baseUrl(), params));

export const deleteSysMessages = (ids: string): Promise<ResponseBody<boolean>> =>
	deleteData(baseUrl(), { ids });

const noticeConfigBaseUrl = () => `${baseService.finance}/user-notice-config`;

export const getMyNoticeConfigs = (): Promise<ResponseBody<UserNoticeConfigData[]>> =>
	wrapNormalize(getData<UserNoticeConfigData[]>(`${noticeConfigBaseUrl()}/my-configs`));

export const saveMyNoticeConfig = (
	data: Partial<UserNoticeConfigData>,
): Promise<ResponseBody<boolean>> =>
	putData<boolean>(`${noticeConfigBaseUrl()}/save-my-config`, normalizeMessageIds(data));
