import { describe, expect, it } from 'vitest';
import { normalizeGiftIds } from './normalizeGiftIds';

describe('normalizeGiftIds', () => {
	it('stringifies id and *Id fields recursively', () => {
		const input = {
			// 雪花 ID 用 bigint，避免 Number 字面量精度丢失
			id: 1900000000000001002n,
			giverPersonId: 9001,
			nested: { eventId: 42, name: 'x' },
			list: [{ receiverPersonId: 7 }],
		};
		const out = normalizeGiftIds(input);
		expect(out.id).toBe('1900000000000001002');
		expect(out.giverPersonId).toBe('9001');
		expect(out.nested.eventId).toBe('42');
		expect(out.list[0].receiverPersonId).toBe('7');
		expect(out.nested.name).toBe('x');
	});
});
