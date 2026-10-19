import { deleteData, getData, postData, putData, baseService } from '@/views/common/api';
import type { CommonPageResult, ResponseBody } from '@/types/api';
import type { SysMessageInfoData, SysMessageSummaryData } from '@/views/message/config';

const base = '/sys-message-info';
const baseUrl = () => `${baseService.finance}${base}`;

const ID_KEY_PATTERN = /(^id$|Id$)/;

/**
 * 递归将所有 id / *Id 字段强制转为 string，防止雪花算法 64 位整数在 JS 中精度丢失
 */
export function normalizeMessageIds<T>(input: T): T {
	if (input === null || input === undefined) {
		return input;
	}
	if (Array.isArray(input)) {
		return input.map((item) => normalizeMessageIds(item)) as unknown as T;
	}
	if (typeof input === 'object') {
		const copy: Record<string, unknown> = {};
		for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
			if (ID_KEY_PATTERN.test(key) && (typeof value === 'number' || typeof value === 'bigint')) {
				copy[key] = String(value);
			} else if (value && typeof value === 'object') {
				copy[key] = normalizeMessageIds(value);
			} else {
				copy[key] = value;
			}
		}
		return copy as T;
	}
	return input;
}

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
