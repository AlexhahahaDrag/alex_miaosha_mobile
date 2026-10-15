<template>
	<div class="ai-budget-card">
		<!-- 顶部折叠微卡片 (高度约 40px，默认常驻展示核心 AI 摘要，0 视口压迫) -->
		<div
			class="ai-header"
			@click="toggleAiExpanded"
		>
			<div class="ai-title-wrap">
				<div class="ai-badge">AI</div>
				<div class="ai-title-sub">
					<span class="ai-title">AI 智能助手</span>
					<template v-if="aiRecommending">
						<span class="ai-brief-tip animate-pulse">测算中...</span>
					</template>
					<template v-else-if="aiRecommendData">
						<span class="ai-brief-tag"> 适度 ¥{{ (aiRecommendData.moderateAmount || 0).toFixed(0) }} </span>
					</template>
					<template v-else>
						<span class="ai-brief-tip">点击智能测算</span>
					</template>
				</div>
			</div>
			<div
				class="ai-header-right"
				@click.stop
			>
				<div
					class="ai-action-btn"
					data-testid="btn-mobile-ai-recommend"
					:class="{ 'is-loading': aiRecommending }"
					@click="onFetchAiRecommend"
				>
					<van-icon
						name="replay"
						:class="{ 'spin-icon': aiRecommending }"
					/>
					<span>{{ aiRecommendData ? '重测' : '测算' }}</span>
				</div>
				<span class="action-divider">|</span>
				<div
					class="ai-toggle-btn"
					data-testid="btn-mobile-toggle-ai"
					@click="toggleAiExpanded"
				>
					<span>{{ isAiExpanded ? '收起' : '口语配置' }}</span>
					<van-icon
						:name="isAiExpanded ? 'arrow-up' : 'arrow-down'"
						class="toggle-icon"
					/>
				</div>
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
					>智能规则</span>
					<span
						v-else
						class="ai-mode-tag ai-mode-tag--ai"
					>大模型洞察</span>
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
						<div class="tier-name">节约档 (85%)</div>
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
						<div class="tier-name">适度档 (100%)</div>
						<div class="tier-val">¥{{ (aiRecommendData.moderateAmount || 0).toFixed(0) }}</div>
					</div>
					<div
						class="ai-tier-cell"
						:class="{
							active: modelValueAmount === aiRecommendData.relaxedAmount,
						}"
						@click="handleApplyTier(aiRecommendData.relaxedAmount)"
					>
						<div class="tier-name">宽松档 (115%)</div>
						<div class="tier-val">¥{{ (aiRecommendData.relaxedAmount || 0).toFixed(0) }}</div>
					</div>
				</div>

				<!-- 重点管控分类一键采纳 -->
				<div
					v-if="aiRecommendData.recommendedCategories?.length"
					class="ai-recom-cats"
				>
					<div class="cats-label">建议管控:</div>
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

	<!-- 快捷 AI 推荐条 (当有适度档推荐时轻量常驻展示) -->
	<div
		v-if="aiRecommendData?.moderateAmount"
		class="quick-ai-recommend-bar"
	>
		<span class="bar-label">AI 建议预算:</span>
		<div
			:class="['ai-quick-pill', modelValueAmount === aiRecommendData.moderateAmount && 'active']"
			@click="handleApplyTier(aiRecommendData.moderateAmount)"
		>
			<span class="pill-badge">推荐</span>
			<span class="pill-amount">¥{{ (aiRecommendData.moderateAmount || 0).toFixed(0) }}</span>
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

const onFetchAiRecommend = async () => {
	navigator.vibrate?.(10);
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
			isAiExpanded.value = true;
			showSuccessToast('AI 测算完成');
		} else {
			showFailToast(msg || 'AI 测算服务暂不可用');
		}
	} catch (e: any) {
		showFailToast(e?.message || '获取 AI 推荐失败');
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
	onFetchAiRecommend();
});

defineExpose({
	fetchAiRecommend: onFetchAiRecommend,
});
</script>

<style scoped lang="less">
.ai-budget-card {
	background: linear-gradient(135deg, #f0f5ff 0%, #f8faff 50%, #faf5ff 100%);
	border: 1px solid #d6e4ff;
	border-radius: 12px;
	padding: 12px;
	margin-bottom: 14px;

	.ai-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		cursor: pointer;

		.ai-title-wrap {
			display: flex;
			align-items: center;
			gap: 6px;
			flex: 1;
			min-width: 0;

			.ai-badge {
				background: #4f46e5;
				color: #ffffff;
				font-size: 11px;
				font-weight: 700;
				padding: 2px 6px;
				border-radius: 6px;
				line-height: 1;
				flex-shrink: 0;
			}

			.ai-title-sub {
				display: flex;
				align-items: center;
				gap: 6px;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;

				.ai-title {
					font-size: 13px;
					font-weight: 600;
					color: #1e1b4b;
					flex-shrink: 0;
				}

				.ai-brief-tag {
					font-size: 10px;
					background: #e0e7ff;
					color: #4338ca;
					padding: 1px 5px;
					border-radius: 4px;
					font-weight: 500;
				}

				.ai-brief-tip {
					font-size: 11px;
					color: #818cf8;
				}
			}
		}

		.ai-header-right {
			display: flex;
			align-items: center;
			gap: 6px;
			flex-shrink: 0;

			.action-divider {
				color: #c7d2fe;
				font-size: 11px;
			}

			.ai-toggle-btn {
				display: flex;
				align-items: center;
				gap: 2px;
				font-size: 12px;
				color: #4b5563;
				cursor: pointer;

				.toggle-icon {
					font-size: 10px;
				}
			}
		}

		.ai-action-btn {
			display: flex;
			align-items: center;
			gap: 3px;
			font-size: 12px;
			color: #4f46e5;
			cursor: pointer;
			padding: 2px 6px;
			border-radius: 4px;

			.spin-icon {
				animation: spin 1s linear infinite;
			}
		}
	}

	.ai-expanded-area {
		margin-top: 10px;
		padding-top: 10px;
		border-top: 1px solid rgba(199, 210, 254, 0.4);
	}

	.ai-command-wrap {
		margin-top: 4px;

		.ai-input-box {
			display: flex;
			align-items: center;
			background: #ffffff;
			border: 1px solid #c7d2fe;
			border-radius: 8px;
			padding: 4px 6px 4px 10px;

			.ai-clear-icon {
				font-size: 14px;
				color: #9ca3af;
				padding: 0 4px;
				cursor: pointer;
			}

			.ai-input {
				flex: 1;
				border: none;
				outline: none;
				font-size: 12px;
				color: #1f2937;
				background: transparent;

				&::placeholder {
					color: #9ca3af;
				}
			}

			.ai-parse-btn {
				background: #4f46e5;
				color: #ffffff;
				border: none;
				border-radius: 6px;
				font-size: 11px;
				font-weight: 500;
				padding: 4px 10px;
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
			margin-top: 6px;

			.sample-chip {
				font-size: 10px;
				color: #4b5563;
				background: rgba(255, 255, 255, 0.7);
				border: 1px solid #e0e7ff;
				border-radius: 10px;
				padding: 2px 8px;
				cursor: pointer;

				&:active {
					background: #e0e7ff;
					color: #3730a3;
				}
			}
		}
	}

	.ai-recommend-body {
		margin-top: 10px;
		background: rgba(255, 255, 255, 0.85);
		border: 1px solid #e0e7ff;
		border-radius: 8px;
		padding: 10px;

		.ai-advice-header {
			display: flex;
			align-items: flex-start;
			justify-content: space-between;
			gap: 8px;

			.ai-advice-text {
				font-size: 12px;
				color: #374151;
				line-height: 1.5;
				flex: 1;
			}

			.ai-mode-tag {
				font-size: 10px;
				padding: 1px 6px;
				border-radius: 4px;
				font-weight: 500;
				flex-shrink: 0;

				&--ai {
					background: #e0e7ff;
					color: #4338ca;
				}

				&--fallback {
					background: #fef3c7;
					color: #b45309;
				}
			}
		}

		.ai-daily-suggest {
			font-size: 11px;
			color: #6b7280;
			margin-top: 4px;

			.num {
				font-weight: 600;
				color: #4f46e5;
			}
		}

		.ai-tier-grid {
			display: grid;
			grid-template-columns: repeat(3, 1fr);
			gap: 6px;
			margin-top: 8px;
			padding-top: 8px;
			border-top: 1px solid #f1f5f9;

			.ai-tier-cell {
				background: #f8fafc;
				border: 1px solid #e2e8f0;
				border-radius: 6px;
				padding: 6px 4px;
				text-align: center;
				cursor: pointer;
				position: relative;
				transition: all 0.2s;

				.tier-name {
					font-size: 10px;
					color: #64748b;
				}

				.tier-val {
					font-size: 13px;
					font-weight: 700;
					color: #1e293b;
					margin-top: 2px;
				}

				&.active {
					background: #eef2ff;
					border-color: #6366f1;

					.tier-name {
						color: #4f46e5;
					}

					.tier-val {
						color: #4338ca;
					}
				}

				&--recom {
					.recom-badge {
						position: absolute;
						top: -6px;
						right: 4px;
						background: #4f46e5;
						color: #ffffff;
						font-size: 9px;
						padding: 1px 4px;
						border-radius: 4px;
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
			margin-top: 8px;
			padding-top: 8px;
			border-top: 1px solid #f1f5f9;
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
					background: #e0e7ff;
					color: #3730a3;
					padding: 1px 6px;
					border-radius: 4px;
					font-size: 10px;
					white-space: nowrap;
				}
			}

			.apply-cat-btn {
				color: #4f46e5;
				font-weight: 600;
				cursor: pointer;
				flex-shrink: 0;
			}
		}
	}
}

.quick-ai-recommend-bar {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 8px 12px;
	margin-bottom: 14px;
	background: #f8faff;
	border: 1px dashed #c7d2fe;
	border-radius: 8px;

	.bar-label {
		font-size: 12px;
		color: #64748b;
	}

	.ai-quick-pill {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		padding: 2px 8px;
		background: #ffffff;
		border: 1px solid #c7d2fe;
		border-radius: 12px;
		cursor: pointer;
		transition: all 0.2s;

		.pill-badge {
			font-size: 9px;
			background: #4f46e5;
			color: #ffffff;
			padding: 1px 4px;
			border-radius: 3px;
			line-height: 1.1;
		}

		.pill-amount {
			font-size: 12px;
			font-weight: 700;
			color: #4f46e5;
		}

		&.active {
			background: #4f46e5;
			border-color: #4f46e5;

			.pill-badge {
				background: #ffffff;
				color: #4f46e5;
			}

			.pill-amount {
				color: #ffffff;
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
