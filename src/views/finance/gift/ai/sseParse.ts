/**
 * Gift AI：解析 SSE 文本块（按 \n\n 拆事件，支持半包缓冲）。
 */

export type SseEventName = 'meta' | 'delta' | 'done' | 'error' | string;

export interface SseParsedEvent {
	event: SseEventName;
	data: string;
}

/**
 * 将新增 chunk 拼入 buffer，拆出完整事件；返回剩余未完成 buffer。
 */
export function consumeSseBuffer(
	buffer: string,
	chunk: string,
): { events: SseParsedEvent[]; rest: string } {
	const combined = buffer + chunk;
	const parts = combined.split('\n\n');
	const rest = parts.pop() ?? '';
	const events: SseParsedEvent[] = [];

	for (const part of parts) {
		const trimmed = part.trim();
		if (!trimmed || trimmed.startsWith(':')) {
			continue;
		}
		let event: SseEventName = 'message';
		const dataLines: string[] = [];
		for (const line of trimmed.split('\n')) {
			if (line.startsWith('event:')) {
				event = line.slice(6).trim();
			} else if (line.startsWith('data:')) {
				dataLines.push(line.slice(5).trimStart());
			}
		}
		if (dataLines.length === 0) {
			continue;
		}
		events.push({ event, data: dataLines.join('\n') });
	}

	return { events, rest };
}

export function parseSseJson<T = unknown>(data: string): T | null {
	try {
		return JSON.parse(data) as T;
	} catch {
		return null;
	}
}
