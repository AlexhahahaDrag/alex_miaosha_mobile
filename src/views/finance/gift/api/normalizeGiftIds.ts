const giftIdKeys = new Set(['id', 'creator', 'updater', 'operator', 'deleter']);

function shouldNormalizeGiftId(key: string) {
	return giftIdKeys.has(key) || key.endsWith('Id');
}

/** 递归把 id / *Id 字段从 number|bigint 转为 string，避免前端精度丢失 */
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
