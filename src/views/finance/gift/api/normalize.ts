import type { ResponseBody } from '@/types/api';

/**
 * Gift 模块"ID 安全"护城河（纯函数，无外部依赖，供 vitest 契约锁定）。
 *
 * 约定：后端 Long 主键/外键经 Long2StringSerializer 序列化为 string；
 * 前端任何进出参里的 ID 一律保持 string，防止 JS number 精度丢失（低位变 00）。
 */

/** 除 *Id 后缀外，额外需要转 string 的公共审计字段 */
const giftIdKeys = new Set(['id', 'avatar', 'creator', 'updater', 'operator', 'deleter']);

export function shouldNormalizeGiftId(key: string): boolean {
	return giftIdKeys.has(key) || key.endsWith('Id');
}

/**
 * 递归把对象/数组中所有 ID 字段（number/bigint）转为 string。
 * 非 ID 字段与非数字 ID（已是 string）保持原样。
 */
export function normalizeGiftIds<T>(value: T): T {
	if (Array.isArray(value)) {
		return value.map((item) => normalizeGiftIds(item)) as T;
	}
	if (!value || typeof value !== 'object') {
		return value;
	}
	const source = value as Record<string, unknown>;
	const normalized: Record<string, unknown> = {};
	Object.keys(source).forEach((key) => {
		const item = source[key];
		if (shouldNormalizeGiftId(key) && (typeof item === 'number' || typeof item === 'bigint')) {
			normalized[key] = String(item);
			return;
		}
		normalized[key] = normalizeGiftIds(item);
	});
	return normalized as T;
}

/** 包装 Axios 响应，深度转换响应体中的所有 ID 字段 */
export function normalizeGiftResponse<T>(response: ResponseBody<T>): ResponseBody<T> {
	if (!response) {
		return response;
	}
	return {
		...response,
		data: normalizeGiftIds(response.data),
	};
}
