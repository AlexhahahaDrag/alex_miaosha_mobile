import { describe, expect, it } from 'vitest';
import { normalizeGiftIds } from './normalizeGiftIds';

describe('normalizeGiftIds', () => {
	it('stringifies id and *Id fields recursively', () => {
		const input = {
			id: 1900000000000001002,
			giverPersonId: 9001n,
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
