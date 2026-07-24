import { describe, expect, it } from 'vitest';
import {
	RELATION_CUSTOM,
	buildRelationTypeForSave,
	collapseRemark,
	directionIconName,
	formatSignedMoney,
	mapRelationToFormFields,
	maskPhone,
	relationLabel,
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
