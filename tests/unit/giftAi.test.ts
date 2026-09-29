import { describe, expect, it } from 'vitest';
import { normalizeGiftAiParseVo } from '@/views/finance/gift/config';
import type { GiftRecordAiParseVo, GiftRecordRecommendAmount } from '@/views/finance/gift/config';

describe('Gift AI Mobile Feature Tests', () => {
	it('normalizeGiftAiParseVo correctly converts number/bigint IDs to string for ID safety', () => {
		const raw = {
			personName: '张三',
			personId: 1810856881968091138n,
			eventId: 1810856882504962050n,
			direction: 'RECEIVE',
			amount: 1000,
			remark: '满月红包',
		};

		const parsed = normalizeGiftAiParseVo(raw);

		expect(typeof parsed.personId).toBe('string');
		expect(parsed.personId).toBe('1810856881968091138');
		expect(typeof parsed.eventId).toBe('string');
		expect(parsed.eventId).toBe('1810856882504962050');
		expect(parsed.amount).toBe(1000);
		expect(parsed.personName).toBe('张三');
	});

	it('normalizeGiftAiParseVo preserves string IDs and handles empty/null gracefully', () => {
		expect(normalizeGiftAiParseVo(null)).toEqual({});
		expect(normalizeGiftAiParseVo(undefined)).toEqual({});

		const withStrings: GiftRecordAiParseVo = {
			personId: '1810856881968091138',
			personName: '李四',
			amount: 500,
			direction: 'GIVE',
		};
		const result = normalizeGiftAiParseVo(withStrings);
		expect(result.personId).toBe('1810856881968091138');
		expect(result.direction).toBe('GIVE');
	});

	it('GiftRecordRecommendAmount holds aiReasoning and aiGreetingTip fields', () => {
		const recommend: GiftRecordRecommendAmount = {
			recommendedAmount: 600,
			reason: '平级同辈随礼常规',
			aiReasoning: '好友乔迁随礼双数吉利，推荐600或800元',
			aiGreetingTip: '乔迁新居，福满门庭！祝新家大吉，诸事顺遂！',
		};

		expect(recommend.aiReasoning).toContain('好友乔迁');
		expect(recommend.aiGreetingTip).toContain('乔迁新居');
		expect(recommend.recommendedAmount).toBe(600);
	});
});
