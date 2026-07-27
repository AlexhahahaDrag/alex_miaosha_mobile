import { describe, expect, it } from 'vitest';
import {
	EVENT_TYPE_CUSTOM,
	FALLBACK_GIFT_EVENT_OPTIONS,
	RELATION_CUSTOM,
	buildEventTypeForSave,
	buildRelationTypeForSave,
	canSaveGiftEvent,
	collapseRemark,
	directionIconName,
	eventLabel,
	eventStatusText,
	formatPhoneDisplay,
	formatSignedMoney,
	mapEventTypeToFormFields,
	mapRelationToFormFields,
	maskPhone,
	normalizePhoneDigits,
	personAvatarSrc,
	relationLabel,
	resolveEventPresetCode,
	resolvePresetCode,
	shouldCollapseRemark,
	FALLBACK_GIFT_RELATION_OPTIONS,
} from './config';

describe('gift person visual helpers', () => {
	it('formatSignedMoney prefixes + for RECEIVE', () => {
		expect(formatSignedMoney('RECEIVE', 700)).toBe('+￥700.00');
	});

	it('formatSignedMoney prefixes - for GIVE and RETURN', () => {
		expect(formatSignedMoney('GIVE', 100)).toBe('-￥100.00');
		expect(formatSignedMoney('RETURN', 50)).toBe('-￥50.00');
	});

	it('directionIconName maps directions', () => {
		expect(directionIconName('RECEIVE')).toBe('gift-o');
		expect(directionIconName('GIVE')).toBe('cash-back-record');
		expect(directionIconName('RETURN')).toBe('replay');
		expect(directionIconName(undefined)).toBe('orders-o');
	});
});

describe('gift event type helpers', () => {
	it('resolveEventPresetCode maps 婚礼 id to WEDDING', () => {
		expect(resolveEventPresetCode('9100000000000000001')).toBe('WEDDING');
	});

	it('mapEventTypeToFormFields uses CUSTOM for unknown type', () => {
		const form = mapEventTypeToFormFields({ eventType: '同学聚会' });
		expect(form.eventTypeMode).toBe(EVENT_TYPE_CUSTOM);
		expect(form.customEventType).toBe('同学聚会');
	});

	it('buildEventTypeForSave returns eventTypeOptionId for preset mode', () => {
		expect(buildEventTypeForSave({ eventTypeMode: '9100000000000000002' })).toEqual({
			eventTypeOptionId: '9100000000000000002',
		});
	});

	it('eventLabel resolves WEDDING to 婚礼', () => {
		expect(eventLabel('WEDDING', FALLBACK_GIFT_EVENT_OPTIONS)).toBe('婚礼');
	});

	it('canSaveGiftEvent requires name and type', () => {
		expect(canSaveGiftEvent({})).toBe(false);
		expect(canSaveGiftEvent({ eventName: '婚礼', eventTypeMode: '9100000000000000001' })).toBe(true);
		expect(
			canSaveGiftEvent({
				eventName: 'x',
				eventTypeMode: EVENT_TYPE_CUSTOM,
				customEventType: '',
			}),
		).toBe(false);
	});

	it('eventStatusText defaults to 进行中', () => {
		expect(eventStatusText('已完成')).toBe('已完成');
		expect(eventStatusText(undefined)).toBe('进行中');
	});
});

describe('gift person relation helpers', () => {
	it('resolvePresetCode maps 亲属 id to RELATIVE', () => {
		expect(resolvePresetCode('9000000000000000001')).toBe('RELATIVE');
	});

	it('mapRelationToFormFields uses CUSTOM for unknown relation', () => {
		const form = mapRelationToFormFields({ relationType: '发小' });
		expect(form.relationMode).toBe(RELATION_CUSTOM);
		expect(form.customRelation).toBe('发小');
	});

	it('buildRelationTypeForSave returns relationOptionId for preset mode', () => {
		const payload = buildRelationTypeForSave({
			relationMode: '9000000000000000002',
		});
		expect(payload).toEqual({ relationOptionId: '9000000000000000002' });
	});

	it('relationLabel resolves RELATIVE to 亲属', () => {
		expect(relationLabel('RELATIVE', FALLBACK_GIFT_RELATION_OPTIONS)).toBe('亲属');
	});
});

describe('gift person phone format helpers', () => {
	it('normalizePhoneDigits strips non-digits', () => {
		expect(normalizePhoneDigits('182 2222 2222')).toBe('18222222222');
		expect(normalizePhoneDigits(undefined)).toBe('');
	});

	it('formatPhoneDisplay applies 3-4-4 for 11 digits', () => {
		expect(formatPhoneDisplay('18222222222')).toBe('182 2222 2222');
		expect(formatPhoneDisplay('12345')).toBe('12345');
	});
});

describe('gift person avatar helpers', () => {
	it('personAvatarSrc prefers preThumbnailUrl then preUrl', () => {
		expect(
			personAvatarSrc({
				fileInfoVo: {
					preUrl: 'https://cdn.example/a.png',
					preThumbnailUrl: 'https://cdn.example/a-thumb.png',
				},
			}),
		).toBe('https://cdn.example/a-thumb.png');
		expect(personAvatarSrc({ fileInfoVo: { preUrl: 'https://cdn.example/a.png' } })).toBe(
			'https://cdn.example/a.png',
		);
		expect(personAvatarSrc({})).toBe('');
	});
});

describe('gift person privacy helpers', () => {
	it('maskPhone masks 11-digit china mobile', () => {
		expect(maskPhone('18222222222')).toBe('182 **** 2222');
	});

	it('maskPhone returns empty for empty input', () => {
		expect(maskPhone('')).toBe('');
		expect(maskPhone(undefined)).toBe('');
	});

	it('maskPhone keeps non-11-digit as-is', () => {
		expect(maskPhone('12345')).toBe('12345');
	});

	it('shouldCollapseRemark uses trim length > 60', () => {
		expect(shouldCollapseRemark('a'.repeat(60))).toBe(false);
		expect(shouldCollapseRemark('a'.repeat(61))).toBe(true);
		expect(shouldCollapseRemark(`  ${'a'.repeat(61)}  `)).toBe(true);
	});

	it('collapseRemark truncates with ellipsis when over limit', () => {
		const text = 'a'.repeat(61);
		expect(collapseRemark(text)).toBe(`${'a'.repeat(60)}…`);
		expect(collapseRemark('short')).toBe('short');
	});
});
