/**
 * Gift AI：前端 AI 请求结构（与后端 com.alex.api.ai.vo.AiAnalyzeReq 对齐）
 */
export interface AiAnalyzeReq {
	bizType?: string;
	content: string;
	context?: Record<string, unknown>;
	depth?: number;

	// 可选覆盖：请求级别指定引擎/模型参数
	// deepseek | rule-based | sensenova | …
	engine?: 'deepseek' | 'rule-based' | 'sensenova' | string;
	model?: string;
	temperature?: number;
	maxTokens?: number;
}

/**
 * Gift AI：前端 AI 响应结构（与后端 com.alex.api.ai.vo.AiAnalyzeResp 对齐）
 */
export interface AiAnalyzeResp {
	requestId?: string;
	summary?: string;
	keyPoints?: string[];
	engine?: string;
	costMs?: number;
}

export type AiResponseMode = 'batch' | 'stream';

export interface AiStreamHandlers {
	onMeta?: (meta: { requestId?: string; engine?: string }) => void;
	onDelta?: (text: string) => void;
	onDone?: (resp: AiAnalyzeResp) => void;
	onError?: (err: { code?: string; message?: string }) => void;
}
