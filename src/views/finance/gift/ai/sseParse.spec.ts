import { describe, expect, it } from 'vitest';
import { consumeSseBuffer, parseSseJson } from './sseParse';

describe('consumeSseBuffer', () => {
	it('parses complete meta event and keeps partial rest', () => {
		const { events, rest } = consumeSseBuffer(
			'',
			'event: meta\ndata: {"requestId":"r1","engine":"deepseek:chat"}\n\nevent: delta\ndata: {"text":"你',
		);
		expect(events).toHaveLength(1);
		expect(events[0].event).toBe('meta');
		expect(parseSseJson(events[0].data)).toEqual({
			requestId: 'r1',
			engine: 'deepseek:chat',
		});
		expect(rest.startsWith('event: delta')).toBe(true);
	});
});
