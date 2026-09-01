import type { AiAnalyzeReq, AiAnalyzeResp, AiStreamHandlers } from './types';
import { consumeSseBuffer, parseSseJson } from './sseParse';
import { postData, baseService } from '@/views/common/api';
import { useUserStore } from '@/store/modules/user/user';
import type { ResponseBody } from '@/types/api';

const baseAi = '/ai';
const apiPrefix = import.meta.env.VITE_APP_API_PREFIX;

/** 与 `@/views/common/api` 的 formatUrl 对齐，供 fetch 流式使用 */
function formatAiUrl(path: string): string {
	return path.replace(/^\/(api\/am-[^/]+)\/(.*)/, `/$1/${apiPrefix}/$2`).replace(/\/+/g, '/');
}

export function chatGiftAi(req: AiAnalyzeReq): Promise<ResponseBody<AiAnalyzeResp>> {
	return postData(`${baseService.ai + baseAi}/chat`, req);
}

/**
 * Gift AI：流式对话（SSE：meta | delta | done | error）
 * 使用 fetch + Authorization（与 request 拦截器同 token 来源），不用 EventSource。
 */
export async function chatGiftAiStream(
	req: AiAnalyzeReq,
	handlers: AiStreamHandlers,
	signal?: AbortSignal,
): Promise<void> {
	const userStore = useUserStore();
	const token = userStore.getToken;
	if (!token) {
		handlers.onError?.({ code: '401', message: '请先登录' });
		return;
	}

	const url = formatAiUrl(`${baseService.ai + baseAi}/chat/stream`);
	let response: Response;
	try {
		response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Accept: 'text/event-stream',
				Authorization: token,
			},
			body: JSON.stringify(req),
			signal,
		});
	} catch (e: unknown) {
		if (signal?.aborted) {
			return;
		}
		const msg = e instanceof Error ? e.message : '网络异常';
		handlers.onError?.({ code: 'NETWORK', message: msg });
		return;
	}

	if (!response.ok) {
		handlers.onError?.({
			code: String(response.status),
			message: `流式请求失败（HTTP ${response.status}）`,
		});
		return;
	}

	const body = response.body;
	if (!body) {
		handlers.onError?.({ code: 'EMPTY', message: '响应体为空' });
		return;
	}

	const reader = body.getReader();
	const decoder = new TextDecoder('utf-8');
	let buffer = '';
	let settled = false;

	const settleError = (err: { code?: string; message?: string }) => {
		if (settled) return;
		settled = true;
		handlers.onError?.(err);
	};

	const settleDone = (resp: AiAnalyzeResp) => {
		if (settled) return;
		settled = true;
		handlers.onDone?.(resp);
	};

	try {
		while (true) {
			const { done, value } = await reader.read();
			if (done) {
				break;
			}
			const { events, rest } = consumeSseBuffer(buffer, decoder.decode(value, { stream: true }));
			buffer = rest;

			for (const ev of events) {
				if (settled) {
					return;
				}
				if (ev.event === 'meta') {
					const meta = parseSseJson<{ requestId?: string; engine?: string }>(ev.data);
					if (meta) {
						handlers.onMeta?.(meta);
					}
				} else if (ev.event === 'delta') {
					const payload = parseSseJson<{ text?: string }>(ev.data);
					const text = payload?.text ?? '';
					if (text) {
						handlers.onDelta?.(text);
					}
				} else if (ev.event === 'done') {
					const resp = parseSseJson<AiAnalyzeResp>(ev.data) || {};
					settleDone(resp);
					return;
				} else if (ev.event === 'error') {
					const err = parseSseJson<{ code?: string; message?: string }>(ev.data) || {
						message: ev.data || '流式对话失败',
					};
					settleError(err);
					return;
				}
			}
		}

		if (!settled) {
			settleError({ code: 'INCOMPLETE', message: '流式连接已结束但未收到 done' });
		}
	} catch (e: unknown) {
		if (signal?.aborted) {
			return;
		}
		const msg = e instanceof Error ? e.message : '流式读取失败';
		settleError({ code: 'READ', message: msg });
	} finally {
		try {
			reader.releaseLock();
		} catch {
			// ignore
		}
	}
}

export type { AiAnalyzeReq, AiAnalyzeResp, AiStreamHandlers } from './types';
