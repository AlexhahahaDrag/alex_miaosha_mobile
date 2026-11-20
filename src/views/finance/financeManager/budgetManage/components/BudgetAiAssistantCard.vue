<template>
	<div class="ai-budget-row">
		<!-- 收起态单行入口（融入统一设置卡片） -->
		<div
			class="ai-header"
			data-testid="btn-mobile-toggle-ai"
			@click="toggleAiExpanded"
		>
			<div class="ai-title-wrap">
				<span class="ai-title">AI 口语与测算</span>
				<span
					v-if="!aiRecommending && aiRecommendData?.moderateAmount"
					class="ai-brief-tag"
				>
					¥{{ (aiRecommendData.moderateAmount || 0).toFixed(0) }}
				</span>
			</div>
			<div
				class="ai-header-right"
				@click.stop
			>
				<div
					class="ai-action-btn"
					data-testid="btn-mobile-ai-recommend"
					:class="{ 'is-loading': aiRecommending }"
					@click="onFetchAiRecommend(true)"
				>
					<van-icon
						name="replay"
						:class="{ 'spin-icon': aiRecommending }"
					/>
					<span>{{ aiRecommending ? '测算中' : aiRecommendData ? '重测' : '测算' }}</span>
				</div>
				<van-icon
					:name="isAiExpanded ? 'arrow-up' : 'arrow-down'"
					class="toggle-icon"
					@click="toggleAiExpanded"
				/>
			</div>
		</div>

		<!-- 展开区域 -->
		<div
			v-if="isAiExpanded"
			class="ai-expanded-area"
		>
			<!-- 口语化指令输入 -->
			<div
				v-if="canEditBudget"
				class="ai-command-wrap"
			>
				<div class="ai-input-box">
					<input
						v-model="aiCommandInput"
						class="ai-input"
						data-testid="mobile-ai-command-input"
						type="text"
						placeholder="如：“设2500预算，重点管餐饮”"
						@keyup.enter="onAiParseCommand"
					/>
					<van-icon
						v-if="aiCommandInput"
						name="clear"
						class="ai-clear-icon"
						@click="clearAiCommandInput"
					/>
					<button
						class="ai-parse-btn"
						data-testid="btn-mobile-ai-parse"
						:disabled="aiParsing"
						@click="onAiParseCommand"
					>
						{{ aiParsing ? '解析中' : '回填' }}
					</button>
				</div>
				<div class="ai-sample-chips">
					<span
						v-for="sample in aiCommandSamples"
						:key="sample"
						class="sample-chip"
						@click="applyAiSample(sample)"
					>
						{{ sample }}
					</span>
				</div>
			</div>

			<!-- 测算推荐详情 -->
			<div
				v-if="aiRecommendData"
				class="ai-recommend-body"
			>
				<div class="ai-advice-header">
					<div class="ai-advice-text">
						{{ aiRecommendData.healthAdvice }}
					</div>
					<span
						v-if="aiRecommendData.isFallback"
						class="ai-mode-tag ai-mode-tag--fallback"
					>规则测算</span>
					<span
						v-else
						class="ai-mode-tag ai-mode-tag--ai"
					>AI 分析</span>
				</div>
				<div
					v-if="aiRecommendData.dailyLimitSuggest"
					class="ai-daily-suggest"
				>
					建议日均控制在
					<span class="num">¥{{ aiRecommendData.dailyLimitSuggest.toFixed(2) }}</span>
					以内
				</div>

				<!-- 三档推荐胶囊 -->
				<div class="ai-tier-grid">
					<div
						class="ai-tier-cell"
						:class="{
							active: modelValueAmount === aiRecommendData.savingAmount,
						}"
						@click="handleApplyTier(aiRecommendData.savingAmount)"
					>
						<div class="tier-name">节约 85%</div>
						<div class="tier-val">¥{{ (aiRecommendData.savingAmount || 0).toFixed(0) }}</div>
					</div>
					<div
						class="ai-tier-cell ai-tier-cell--recom"
						data-testid="btn-mobile-apply-moderate"
						:class="{
							active: modelValueAmount === aiRecommendData.moderateAmount,
						}"
						@click="handleApplyTier(aiRecommendData.moderateAmount)"
					>
						<span class="recom-badge">推荐</span>
						<div class="tier-name">适度 100%</div>
						<div class="tier-val">¥{{ (aiRecommendData.moderateAmount || 0).toFixed(0) }}</div>
					</div>
					<div
						class="ai-tier-cell"
						:class="{
							active: modelValueAmount === aiRecommendData.relaxedAmount,
						}"
						@click="handleApplyTier(aiRecommendData.relaxedAmount)"
					>
						<div class="tier-name">宽松 115%</div>
						<div class="tier-val">¥{{ (aiRecommendData.relaxedAmount || 0).toFixed(0) }}</div>
					</div>
				</div>

				<!-- 重点管控分类一键采纳 -->
				<div
					v-if="aiRecommendData.recommendedCategories?.length"
					class="ai-recom-cats"
				>
					<div class="cats-label">建议管控</div>
					<div class="cats-tags">
						<span
							v-for="cat in aiRecommendData.recommendedCategories"
							:key="cat"
							class="cat-tag"
						>
							{{ cat }}
						</span>
					</div>
					<span
						v-if="canEditBudget"
						class="apply-cat-btn"
						@click="handleApplyCategories(aiRecommendData.recommendedCategories)"
					>
						采纳分类
					</span>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { showFailToast, showSuccessToast } from 'vant';
import { recommendBudget, parseBudgetCommand } from '@/views/finance/financeManager/api';
import type { FinanceBudgetAiRecommendVo } from '@/views/finance/financeManager/config';

interface Props {
	canEditBudget?: boolean;
	currentMonthStr: string;
	modelValueAmount?: number;
}

const props = withDefaults(defineProps<Props>(), {
	canEditBudget: false,
	modelValueAmount: 0,
});

const emit = defineEmits<{
	(e: 'apply-amount', amount: number): void;
	(e: 'apply-categories', categories: string[]): void;
	(e: 'recommend-loaded', moderateAmount: number): void;
}>();

const isAiExpanded = ref<boolean>(false);
const aiRecommending = ref<boolean>(false);
const aiParsing = ref<boolean>(false);
const aiCommandInput = ref<string>('');
const aiRecommendData = ref<FinanceBudgetAiRecommendVo | null>(null);

const aiCommandSamples = ['设2500预算管餐饮交通', '每月2000管餐饮', '不设上限'];

const clearAiCommandInput = () => {
	aiCommandInput.value = '';
	navigator.vibrate?.(10);
};

const toggleAiExpanded = () => {
	isAiExpanded.value = !isAiExpanded.value;
	navigator.vibrate?.(10);
};

const applyAiSample = (sample: string) => {
	aiCommandInput.value = sample;
	onAiParseCommand();
};

const onFetchAiRecommend = async (manual = false) => {
	if (manual) navigator.vibrate?.(10);
	aiRecommending.value = true;
	try {
		const month = props.currentMonthStr;
		const {
			code,
			data,
			message: msg,
		} = await recommendBudget({
			budgetMonth: month,
		});
		if (code === '200' && data) {
			aiRecommendData.value = data;
			emit('recommend-loaded', Number(data.moderateAmount || 0));
			isAiExpanded.value = true;
			if (manual) {
				showSuccessToast('AI 测算完成');
			}
		} else if (manual) {
			showFailToast(msg || 'AI 测算服务暂不可用');
		}
	} catch (e: any) {
		if (manual) {
			showFailToast(e?.message || '获取 AI 推荐失败');
		}
	} finally {
		aiRecommending.value = false;
	}
};

const onAiParseCommand = async () => {
	if (!aiCommandInput.value || !aiCommandInput.value.trim()) {
		showFailToast('请输入指令');
		return;
	}
	navigator.vibrate?.(10);
	aiParsing.value = true;
	try {
		const month = props.currentMonthStr;
		const {
			code,
			data,
			message: msg,
		} = await parseBudgetCommand({
			command: aiCommandInput.value.trim(),
			budgetMonth: month,
		});
		if (code === '200' && data) {
			if (data.hasBudget && data.amount !== undefined && data.amount !== null) {
				emit('apply-amount', Number(data.amount));
			}
			if (data.hasCategories && data.categories && data.categories.length > 0) {
				emit('apply-categories', [...data.categories]);
			}
			showSuccessToast(data.reasoning || '已应用 AI 配置');
		} else {
			showFailToast(msg || '未能解析该指令');
		}
	} catch (e: any) {
		showFailToast(e?.message || '指令解析失败');
	} finally {
		aiParsing.value = false;
	}
};

const handleApplyTier = (amount?: number) => {
	if (!props.canEditBudget || amount === undefined || amount === null) return;
	emit('apply-amount', Number(amount));
};

const handleApplyCategories = (categories?: string[]) => {
	if (!props.canEditBudget || !categories || !categories.length) return;
	emit('apply-categories', [...categories]);
	showSuccessToast('已采纳推荐分类');
};

onMounted(() => {
	onFetchAiRecommend(false);
});

defineExpose({
	fetchAiRecommend: () => onFetchAiRecommend(true),
});
</script>

<style scoped lang="less">
.ai-budget-row {
	.ai-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 14px 16px;
		cursor: pointer;

		.ai-title-wrap {
			display: flex;
			align-items: center;
			gap: 8px;
			flex: 1;
			min-width: 0;

			.ai-title {
				font-size: 14px;
				font-weight: 600;
				color: #0f172a;
				flex-shrink: 0;
			}

			.ai-brief-tag {
				font-size: 11px;
				background: #eef2ff;
				color: #4f6af6;
				padding: 2px 7px;
				border-radius: 999px;
				font-weight: 600;
				font-variant-numeric: tabular-nums;
			}
		}

		.ai-header-right {
			display: flex;
			align-items: center;
			gap: 8px;
			flex-shrink: 0;

			.toggle-icon {
				font-size: 12px;
				color: #94a3b8;
				cursor: pointer;
			}
		}

		.ai-action-btn {
			display: flex;
			align-items: center;
			gap: 3px;
			font-size: 12px;
			font-weight: 500;
			color: #4f6af6;
			cursor: pointer;
			padding: 2px 6px;
			border-radius: 6px;

			.spin-icon {
				animation: spin 1s linear infinite;
			}
		}
	}

	.ai-expanded-area {
		padding: 0 16px 16px;
	}

	.ai-command-wrap {
		.ai-input-box {
			display: flex;
			align-items: center;
			background: #f8fafc;
			border-radius: 10px;
			padding: 6px 6px 6px 12px;

			.ai-clear-icon {
				font-size: 14px;
				color: #94a3b8;
				padding: 0 4px;
				cursor: pointer;
			}

			.ai-input {
				flex: 1;
				border: none;
				outline: none;
				font-size: 12px;
				color: #0f172a;
				background: transparent;

				&::placeholder {
					color: #94a3b8;
				}
			}

			.ai-parse-btn {
				background: #4f6af6;
				color: #ffffff;
				border: none;
				border-radius: 8px;
				font-size: 11px;
				font-weight: 500;
				padding: 5px 10px;
				cursor: pointer;

				&:disabled {
					opacity: 0.6;
				}
			}
		}

		.ai-sample-chips {
			display: flex;
			align-items: center;
			gap: 6px;
			flex-wrap: wrap;
			margin-top: 8px;

			.sample-chip {
				font-size: 11px;
				color: #475569;
				background: #f1f5f9;
				border-radius: 999px;
				padding: 3px 9px;
				cursor: pointer;

				&:active {
					background: #e0e7ff;
					color: #4f6af6;
				}
			}
		}
	}

	.ai-recommend-body {
		margin-top: 10px;
		background: #f8fafc;
		border-radius: 10px;
		padding: 10px;

		.ai-advice-header {
			display: flex;
			align-items: flex-start;
			justify-content: space-between;
			gap: 8px;

			.ai-advice-text {
				font-size: 12px;
				color: #334155;
				line-height: 1.5;
				flex: 1;
			}

			.ai-mode-tag {
				font-size: 10px;
				padding: 2px 6px;
				border-radius: 999px;
				font-weight: 500;
				flex-shrink: 0;

				&--ai {
					background: #eef2ff;
					color: #4f6af6;
				}

				&--fallback {
					background: #fef3c7;
					color: #b45309;
				}
			}
		}

		.ai-daily-suggest {
			font-size: 11px;
			color: #64748b;
			margin-top: 4px;

			.num {
				font-weight: 600;
				color: #4f6af6;
				font-variant-numeric: tabular-nums;
			}
		}

		.ai-tier-grid {
			display: grid;
			grid-template-columns: repeat(3, 1fr);
			gap: 8px;
			margin-top: 10px;
			padding-top: 10px;
			border-top: 1px solid #eef2f6;

			.ai-tier-cell {
				background: #ffffff;
				border-radius: 8px;
				padding: 8px 4px;
				text-align: center;
				cursor: pointer;
				position: relative;
				transition:
					background-color 0.2s ease,
					color 0.2s ease;

				.tier-name {
					font-size: 11px;
					color: #64748b;
				}

				.tier-val {
					font-size: 13px;
					font-weight: 700;
					color: #0f172a;
					margin-top: 2px;
					font-variant-numeric: tabular-nums;
				}

				&.active {
					background: #eef2ff;

					.tier-name,
					.tier-val {
						color: #4f6af6;
					}
				}

				&--recom {
					.recom-badge {
						position: absolute;
						top: -6px;
						right: 4px;
						background: #4f6af6;
						color: #ffffff;
						font-size: 9px;
						padding: 1px 5px;
						border-radius: 999px;
						line-height: 1.2;
					}
				}
			}
		}

		.ai-recom-cats {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 6px;
			margin-top: 10px;
			padding-top: 10px;
			border-top: 1px solid #eef2f6;
			font-size: 11px;

			.cats-label {
				color: #64748b;
				flex-shrink: 0;
			}

			.cats-tags {
				display: flex;
				align-items: center;
				gap: 4px;
				overflow-x: auto;
				flex: 1;

				.cat-tag {
					background: #eef2ff;
					color: #4f6af6;
					padding: 2px 7px;
					border-radius: 999px;
					font-size: 10px;
					white-space: nowrap;
				}
			}

			.apply-cat-btn {
				color: #4f6af6;
				font-weight: 600;
				cursor: pointer;
				flex-shrink: 0;
			}
		}
	}
}

@keyframes spin {
	from {
		transform: rotate(0deg);
	}
	to {
		transform: rotate(360deg);
	}
}
</style>
