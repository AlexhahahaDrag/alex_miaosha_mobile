import { describe, expect, it } from 'vitest';
import { buildGiftAnalysisAiRequest } from './buildAnalysisContext';

describe('buildGiftAnalysisAiRequest', () => {
	it('keeps *Id fields as string and omits phone-like keys', () => {
		const req = buildGiftAnalysisAiRequest({
			overview: {
				totalReceive: 100,
				hostPersonId: '1234567890123456789',
				phone: '13800138000',
			},
		});
		expect(req.bizType).toBe('gift-analysis');
		expect(req.context.overview).toMatchObject({
			totalReceive: 100,
			hostPersonId: '1234567890123456789',
		});
		expect(JSON.stringify(req.context)).not.toContain('13800138000');
		expect(typeof (req.context.overview as { hostPersonId: unknown }).hostPersonId).toBe('string');
	});

	it('stringifies numeric id fields and strips nested mobile keys', () => {
		const req = buildGiftAnalysisAiRequest({
			overview: { netAmount: 50 },
			personRanking: [
				{
					id: 9007199254740991,
					personId: 42,
					mobilePhone: '13900001111',
					personName: '张三',
				},
			],
		});
		expect(req.context.personRanking).toEqual([
			{
				id: '9007199254740991',
				personId: '42',
				personName: '张三',
			},
		]);
		expect(JSON.stringify(req.context)).not.toContain('13900001111');
	});

	it('includes optional analysis sections when provided', () => {
		const req = buildGiftAnalysisAiRequest({
			overview: { recordCount: 3 },
			trend: [{ label: '2026-01', receiveAmount: 100 }],
			relationDistribution: [{ relationType: 'friend', count: 2 }],
			eventRanking: [{ eventName: '婚宴', amount: 500 }],
		});
		expect(req.content).toBeTruthy();
		expect(req.depth).toBe(2);
		expect(req.context).toMatchObject({
			overview: { recordCount: 3 },
			trend: [{ label: '2026-01', receiveAmount: 100 }],
			relationDistribution: [{ relationType: 'friend', count: 2 }],
			eventRanking: [{ eventName: '婚宴', amount: 500 }],
		});
	});
});
