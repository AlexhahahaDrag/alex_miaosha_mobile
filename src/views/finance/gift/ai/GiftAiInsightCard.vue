<template>
	<section
		v-if="visible"
		class="gift-ai-insight-card"
		data-testid="gift-ai-insight-card"
	>
		<div class="gift-ai-insight-card__head">
			<div>
				<h3>AI 解读</h3>
				<p>基于全量统计，给出简明洞察与建议</p>
			</div>
			<div class="gift-ai-insight-card__actions">
				<van-button
					type="primary"
					size="small"
					round
					data-testid="gift-ai-insight-run"
					:loading="loading"
					:disabled="runDisabled"
					@click="runInsight"
				>
					AI 解读
				</van-button>
				<van-button
					v-if="loading"
					size="small"
					round
					plain
					data-testid="gift-ai-insight-abort"
					@click="abort"
				>
					停止
				</van-button>
			</div>
		</div>
		<p
			v-if="error"
			class="gift-ai-insight-card__error"
			data-testid="gift-ai-insight-error"
		>
			{{ error }}
		</p>
		<div
			v-if="displaySummary"
			class="gift-ai-insight-card__summary"
			data-testid="gift-ai-insight-summary"
		>
			{{ displaySummary }}
		</div>
		<ul
			v-if="keyPoints.length"
			class="gift-ai-insight-card__keypoints"
			data-testid="gift-ai-insight-keypoints"
		>
			<li
				v-for="(point, index) in keyPoints"
				:key="index"
			>
				{{ point }}
			</li>
		</ul>
	</section>
</template>

<script setup lang="ts">
import { showFailToast } from 'vant';
import { chatGiftAiStream } from './api';
import { buildGiftAnalysisAiRequest, type GiftAnalysisInsightInput } from './buildAnalysisContext';
import { usePermission } from '@/composables/usePermission';
import {
	getGiftAnalysisEventRanking,
	getGiftAnalysisOverview,
	getGiftAnalysisPersonRanking,
	getGiftAnalysisRelationDistribution,
	getGiftAnalysisTrend,
} from '@/views/finance/gift/analysis/api';
import type { GiftAnalysisOverview } from '@/views/finance/gift/config';

defineOptions({
	name: 'GiftAiInsightCard',
});

const props = withDefaults(
	defineProps<{
		/** 页面已加载的 analysis 数据（可选）；overview 仍由卡片自行拉取，禁止用 Dashboard 截断汇总 */
		trend?: GiftAnalysisInsightInput['trend'];
		relationDistribution?: GiftAnalysisInsightInput['relationDistribution'];
		eventRanking?: GiftAnalysisInsightInput['eventRanking'];
		personRanking?: GiftAnalysisInsightInput['personRanking'];
		disabled?: boolean;
	}>(),
	{
		disabled: false,
	},
);

const { hasPermission } = usePermission();

const visible = computed(() => hasPermission('gift:view'));
const loading = ref(false);
const contextLoading = ref(false);
const error = ref('');
const summary = ref('');
const streamText = ref('');
const keyPoints = ref<string[]>([]);
const overview = ref<GiftAnalysisOverview | null>(null);
const insightTrend = ref<GiftAnalysisInsightInput['trend']>();
const insightRelation = ref<GiftAnalysisInsightInput['relationDistribution']>();
const insightEventRanking = ref<GiftAnalysisInsightInput['eventRanking']>();
const insightPersonRanking = ref<GiftAnalysisInsightInput['personRanking']>();

let abortController: AbortController | null = null;

const displaySummary = computed(() => summary.value || streamText.value);

const hasOverviewData = computed(() => {
	const o = overview.value;
	if (!o) return false;
	return (
		Number(o.recordCount || 0) > 0 ||
		Number(o.receiveAmount || 0) !== 0 ||
		Number(o.giveAmount || 0) !== 0 ||
		Number(o.returnAmount || 0) !== 0
	);
});

const runDisabled = computed(() => props.disabled || loading.value || contextLoading.value || !hasOverviewData.value);

const abort = () => {
	abortController?.abort();
	abortController = null;
	loading.value = false;
};

const pickOk = <T,>(res: { code?: string; data?: T; message?: string }, fallback?: T): T | undefined => {
	if (res.code === '200') return res.data ?? fallback;
	return fallback;
};

/** 始终走 analysis overview，绝不使用 Dashboard record-page 截断加总 */
const loadContext = async (): Promise<boolean> => {
	contextLoading.value = true;
	try {
		const [overviewRes, trendRes, relationRes, eventRes, personRes] = await Promise.all([
			getGiftAnalysisOverview(),
			props.trend !== undefined ? Promise.resolve({ code: '200', data: props.trend }) : getGiftAnalysisTrend(),
			props.relationDistribution !== undefined
				? Promise.resolve({ code: '200', data: props.relationDistribution })
				: getGiftAnalysisRelationDistribution(),
			props.eventRanking !== undefined
				? Promise.resolve({ code: '200', data: props.eventRanking })
				: getGiftAnalysisEventRanking(),
			props.personRanking !== undefined
				? Promise.resolve({ code: '200', data: props.personRanking })
				: getGiftAnalysisPersonRanking(),
		]);

		if (overviewRes.code !== '200' || !overviewRes.data) {
			showFailToast(overviewRes.message || '统计加载失败');
			overview.value = null;
			return false;
		}

		overview.value = overviewRes.data;
		insightTrend.value = pickOk(trendRes, props.trend);
		insightRelation.value = pickOk(relationRes, props.relationDistribution);
		insightEventRanking.value = pickOk(eventRes, props.eventRanking);
		insightPersonRanking.value = pickOk(personRes, props.personRanking);
		return true;
	} catch {
		showFailToast('统计加载失败');
		overview.value = null;
		return false;
	} finally {
		contextLoading.value = false;
	}
};

const runInsight = async () => {
	if (runDisabled.value) return;

	navigator.vibrate?.(50);

	abort();
	loading.value = true;
	error.value = '';
	summary.value = '';
	streamText.value = '';
	keyPoints.value = [];

	const ok = await loadContext();
	if (!ok || !overview.value) {
		loading.value = false;
		return;
	}
	if (!hasOverviewData.value) {
		const msg = '暂无统计数据，无法解读';
		error.value = msg;
		showFailToast(msg);
		loading.value = false;
		return;
	}

	const controller = new AbortController();
	abortController = controller;

	const req = buildGiftAnalysisAiRequest({
		overview: { ...overview.value } as Record<string, unknown>,
		trend: insightTrend.value,
		relationDistribution: insightRelation.value,
		eventRanking: insightEventRanking.value,
		personRanking: insightPersonRanking.value,
	});

	try {
		await chatGiftAiStream(
			req,
			{
				onDelta: (text) => {
					streamText.value += text;
				},
				onDone: (resp) => {
					summary.value = resp.summary || streamText.value;
					keyPoints.value = Array.isArray(resp.keyPoints) ? resp.keyPoints.filter(Boolean) : [];
					streamText.value = '';
					loading.value = false;
					abortController = null;
				},
				onError: (err) => {
					const msg = err.message || 'AI 解读失败';
					error.value = msg;
					showFailToast(msg);
					loading.value = false;
					abortController = null;
				},
			},
			controller.signal,
		);

		if (controller.signal.aborted) {
			loading.value = false;
			abortController = null;
			return;
		}

		if (loading.value) {
			if (!summary.value && streamText.value) {
				summary.value = streamText.value;
				streamText.value = '';
			}
			loading.value = false;
			abortController = null;
		}
	} catch (e: unknown) {
		if (controller.signal.aborted) {
			loading.value = false;
			abortController = null;
			return;
		}
		const msg = e instanceof Error ? e.message : 'AI 解读失败';
		error.value = msg;
		showFailToast(msg);
		loading.value = false;
		abortController = null;
	}
};

onMounted(() => {
	if (visible.value) {
		void loadContext();
	}
});

onUnmounted(() => {
	abort();
});
</script>

<style scoped lang="less">
.gift-ai-insight-card {
	margin: 0 14px 12px;
	padding: 14px 16px;
	background: #fff;
	border-radius: 16px;
	box-shadow: 0 6px 18px rgba(32, 152, 238, 0.08);
}

.gift-ai-insight-card__head {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	gap: 12px;
}

.gift-ai-insight-card__head h3 {
	margin: 0;
	font-size: 16px;
	color: #1f2937;
	font-weight: 600;
}

.gift-ai-insight-card__head p {
	margin: 4px 0 0;
	font-size: 12px;
	color: #8a94a6;
	line-height: 1.4;
}

.gift-ai-insight-card__actions {
	display: flex;
	align-items: center;
	gap: 8px;
	flex-shrink: 0;
}

.gift-ai-insight-card__error {
	margin: 12px 0 0;
	color: #d92d20;
	font-size: 13px;
	line-height: 1.5;
}

.gift-ai-insight-card__summary {
	margin-top: 12px;
	color: #1f2937;
	font-size: 14px;
	line-height: 1.7;
	white-space: pre-wrap;
}

.gift-ai-insight-card__keypoints {
	margin: 10px 0 0;
	padding-left: 18px;
	color: #475467;
	font-size: 13px;
	line-height: 1.7;
}
</style>
