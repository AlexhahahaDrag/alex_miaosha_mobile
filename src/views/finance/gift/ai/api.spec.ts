import { describe, expect, it, vi, afterEach } from 'vitest';
import { chatGiftAiStream } from './api';

vi.mock('@/views/common/api', () => ({
	postData: vi.fn(),
	baseService: { ai: '/api/am-ai' },
}));

vi.mock('@/store/modules/user/user', () => ({
	useUserStore: () => ({ getToken: 'Bearer test-token' }),
}));

describe('chatGiftAiStream', () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('invokes onDone when SSE done event arrives', async () => {
		const body = [
			'event: meta\ndata: {"requestId":"r1","engine":"rule-based"}\n\n',
			'event: delta\ndata: {"text":"概"}\n\n',
			'event: done\ndata: {"requestId":"r1","summary":"本月净流入为正","keyPoints":["收礼偏高"]}\n\n',
		].join('');
		const stream = new ReadableStream({
			start(controller) {
				controller.enqueue(new TextEncoder().encode(body));
				controller.close();
			},
		});
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				ok: true,
				body: stream,
			}),
		);
		const onDone = vi.fn();
		await chatGiftAiStream({ bizType: 'gift-analysis', content: '解读' }, { onDone });
		expect(onDone).toHaveBeenCalledWith(expect.objectContaining({ summary: '本月净流入为正' }));
	});
});
