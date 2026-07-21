import { describe, expect, it } from 'vitest';
import {
	RELATION_CUSTOM,
	buildRelationTypeForSave,
	mapRelationToFormFields,
	relationLabel,
	resolvePresetCode,
	FALLBACK_GIFT_RELATION_OPTIONS,
} from './config';

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
