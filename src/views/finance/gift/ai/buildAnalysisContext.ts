export interface GiftAnalysisInsightInput {
	overview: Record<string, unknown>;
	trend?: unknown;
	relationDistribution?: unknown;
	eventRanking?: unknown;
	personRanking?: unknown;
}

export interface GiftAnalysisAiRequest {
	bizType: 'gift-analysis';
	content: string;
	context: Record<string, unknown>;
	depth: number;
}

const PHONE_KEY = /phone/i;
const MOBILE_KEY = /mobile/i;
const ID_KEY = /Id$/;

function isPhoneLikeKey(key: string): boolean {
	return PHONE_KEY.test(key) || MOBILE_KEY.test(key);
}

function isIdKey(key: string): boolean {
	return key === 'id' || ID_KEY.test(key);
}

/** 递归脱敏：剔除手机号类字段，ID 字段统一 string */
export function sanitizeForAiContext(value: unknown): unknown {
	if (Array.isArray(value)) {
		return value.map((item) => sanitizeForAiContext(item));
	}
	if (!value || typeof value !== 'object') {
		return value;
	}

	const source = value as Record<string, unknown>;
	const sanitized: Record<string, unknown> = {};

	for (const [key, item] of Object.entries(source)) {
		if (isPhoneLikeKey(key)) {
			continue;
		}
		if (isIdKey(key)) {
			sanitized[key] = String(item);
			continue;
		}
		sanitized[key] = sanitizeForAiContext(item);
	}

	return sanitized;
}

const GIFT_ANALYSIS_CONTENT = '请基于以下礼尚往来统计数据，给出简明洞察与可执行建议。';

export function buildGiftAnalysisAiRequest(input: GiftAnalysisInsightInput): GiftAnalysisAiRequest {
	const context: Record<string, unknown> = {
		overview: sanitizeForAiContext(input.overview),
	};

	if (input.trend !== undefined) {
		context.trend = sanitizeForAiContext(input.trend);
	}
	if (input.relationDistribution !== undefined) {
		context.relationDistribution = sanitizeForAiContext(input.relationDistribution);
	}
	if (input.eventRanking !== undefined) {
		context.eventRanking = sanitizeForAiContext(input.eventRanking);
	}
	if (input.personRanking !== undefined) {
		context.personRanking = sanitizeForAiContext(input.personRanking);
	}

	return {
		bizType: 'gift-analysis',
		content: GIFT_ANALYSIS_CONTENT,
		context,
		depth: 2,
	};
}
