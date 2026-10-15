<template>
	<!-- 本月零花钱预算卡片 (随列表自然滚动，不吸顶) -->
	<section
		class="pocket-money-card"
		:class="{ 'pocket-money-card--expanded': isBudgetCardExpanded }"
		data-testid="pocket-money-card"
	>
		<!-- 紧凑常驻条 (平时仅展示标题、余额与百分比，点击触发折叠/展开) -->
		<div
			class="pocket-money-header"
			data-testid="pocket-money-header"
			@click="toggleBudgetCardExpand"
		>
			<div class="pocket-money-title">
				<div class="title-icon-box">
					<van-icon
						name="balance-o"
						class="title-icon"
					/>
				</div>
				<span class="title-text">本月零花钱</span>
				<span
					v-if="budgetHealthStatus"
					class="health-badge"
					data-testid="budget-health-badge"
					:style="{
						color: budgetHealthStatus.color,
						backgroundColor: budgetHealthStatus.bgColor,
						borderColor: `${budgetHealthStatus.color}33`,
					}"
				>
					<span
						class="health-dot"
						:style="{ backgroundColor: budgetHealthStatus.color }"
					/>
					<span>{{ budgetHealthStatus.text }}</span>
				</span>
			</div>

			<div class="pocket-money-summary">
				<div class="summary-metric">
					<span class="metric-label">剩余</span>
					<span
						:class="['metric-val', (budgetStatus?.remainingAmount ?? 0) < 0 ? 'over' : 'remain']"
						data-testid="metric-remaining-amount"
					>
						<span class="currency-symbol">{{ (budgetStatus?.remainingAmount ?? 0) < 0 ? '-¥' : '¥' }}</span>{{ formatAmount(Math.abs(budgetStatus?.remainingAmount || 0)) }}
					</span>
				</div>
				<span class="percent-pill"> {{ budgetStatus?.usagePercent || 0 }}% </span>
				<div class="toggle-arrow-btn">
					<van-icon
						name="arrow-down"
						class="toggle-arrow"
					/>
				</div>
			</div>
		</div>

		<!-- 折叠态常驻底边微环境进度条 (Taste-Skill 隐式状态感知) -->
		<div
			v-if="!isBudgetCardExpanded && Number(budgetStatus?.budgetAmount || 0) > 0"
			class="ambient-progress-track"
		>
			<div
				class="ambient-progress-bar"
				:style="{
					width: `${Math.max(0, Math.min(100, Number(budgetStatus?.usagePercent || 0)))}%`,
					backgroundColor: progressColor,
				}"
			/>
		</div>

		<!-- 展开后的完整详细面板 -->
		<transition name="expand">
			<div
				v-show="isBudgetCardExpanded"
				class="pocket-money-body"
			>
				<div class="amount-main">
					<div class="amount-item amount-card">
						<div class="amount-label">月度预算</div>
						<div class="amount-value budget">
							<span class="amount-currency">¥</span>{{ formatAmount(budgetStatus?.budgetAmount) }}
						</div>
					</div>
					<div
						class="amount-item amount-card amount-card--clickable"
						@click.stop="drillDownBudgetMonth"
					>
						<div class="amount-label flex items-center justify-center gap-0.5">
							<span>{{ mobileSpentLabel }}</span>
							<span class="drill-tag">明细›</span>
						</div>
						<div
							:class="[
								'amount-value',
								(budgetStatus?.actualExpense ?? 0) <= 0 ? 'surplus' : budgetStatus?.isOverBudget ? 'over' : 'expense',
							]"
							title="点击联动查看当月已计明细"
						>
							<span class="amount-currency">{{ (budgetStatus?.actualExpense ?? 0) < 0 ? '-¥' : '¥' }}</span>{{ formatAmount(Math.abs(budgetStatus?.actualExpense || 0)) }}
						</div>
					</div>
					<div class="amount-item amount-card">
						<div class="amount-label">剩余额度</div>
						<div :class="['amount-value', (budgetStatus?.remainingAmount ?? 0) < 0 ? 'over' : 'remain']">
							<span class="amount-currency">{{ (budgetStatus?.remainingAmount ?? 0) < 0 ? '-¥' : '¥' }}</span>{{ formatAmount(Math.abs(budgetStatus?.remainingAmount || 0)) }}
						</div>
					</div>
				</div>

				<van-progress
					:percentage="Math.max(0, Math.min(100, Number(budgetStatus?.usagePercent || 0)))"
					:color="progressColor"
					:pivot-text="`${budgetStatus?.usagePercent || 0}%`"
					class="pocket-money-progress"
					stroke-width="6"
				/>

				<div class="pocket-money-footer">
					<div class="pocket-money-tags">
						<span class="tag-desc">统计分类:</span>
						<template v-if="cleanedCategoryList.length">
							<van-tag
								v-for="cat in displayCategoryList"
								:key="cat"
								plain
								round
								size="small"
								class="category-tag"
							>
								{{ cat }}
							</van-tag>
							<button
								v-if="cleanedCategoryList.length > 4"
								type="button"
								class="tag-expand-btn"
								@click.stop="toggleCategoriesExpand"
							>
								{{ isCategoriesExpanded ? '收起 ∧' : `+${cleanedCategoryList.length - 4}项 ∨` }}
							</button>
						</template>
						<span
							v-else
							class="tag-all"
						>
							{{ mobileDirectionLabel }}
						</span>
					</div>

					<van-button
						v-if="hasViewPermission"
						size="small"
						plain
						round
						type="primary"
						icon="setting-o"
						class="btn-edit-action"
						data-testid="btn-edit-budget"
						@click.stop="handleOpenManage"
					>
						{{ canEditBudget ? '预算设置' : '预算详情' }}
					</van-button>
				</div>
			</div>
		</transition>
	</section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { FinanceBudgetStatusVo } from '@/views/finance/financeManager/config';

interface Props {
	budgetStatus: FinanceBudgetStatusVo | null;
	canEditBudget?: boolean;
	hasViewPermission?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	canEditBudget: false,
	hasViewPermission: false,
});

const emit = defineEmits<{
	(e: 'drill-down'): void;
	(e: 'open-manage'): void;
}>();

const isBudgetCardExpanded = ref<boolean>(false);
const isCategoriesExpanded = ref<boolean>(false);

const toggleBudgetCardExpand = () => {
	if (navigator.vibrate) navigator.vibrate(20);
	isBudgetCardExpanded.value = !isBudgetCardExpanded.value;
};

const toggleCategoriesExpand = () => {
	if (navigator.vibrate) navigator.vibrate(20);
	isCategoriesExpanded.value = !isCategoriesExpanded.value;
};

const drillDownBudgetMonth = () => {
	emit('drill-down');
};

const handleOpenManage = () => {
	emit('open-manage');
};

const formatAmount = (value: number | string | undefined | null): string => {
	const num = Number(value || 0);
	const parts = Math.abs(num).toFixed(2).split('.');
	parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
	return parts.join('.');
};

const getBudgetProgressColor = (percent: number): string => {
	if (percent < 0) return '#07c160';
	if (percent >= 150) return '#cf1322';
	if (percent >= 100) return '#ee0a24';
	if (percent >= 90) return '#fa541c';
	if (percent >= 75) return '#ff976a';
	return '#1989fa';
};

const progressColor = computed(() => {
	return getBudgetProgressColor(Number(props.budgetStatus?.usagePercent || 0));
});

const budgetHealthStatus = computed(() => {
	if (!props.budgetStatus) return null;
	const actual = Number(props.budgetStatus.actualExpense || 0);
	const remaining = Number(props.budgetStatus.remainingAmount || 0);
	const usage = Number(props.budgetStatus.usagePercent || 0);
	const isOver = props.budgetStatus.isOverBudget || remaining < 0;

	if (isOver) {
		return { text: '超支透支', color: '#ee0a24', bgColor: '#fff1f0' };
	}
	if (actual <= 0) {
		return { text: '资金充裕', color: '#07c160', bgColor: '#f6ffed' };
	}
	if (usage >= 80) {
		return { text: '接近限额', color: '#fa8c16', bgColor: '#fff7e6' };
	}
	return { text: '控制良好', color: '#1677ff', bgColor: '#e6f4ff' };
});

const mobileDirectionLabel = computed(() => {
	const dir = props.budgetStatus?.incomeAndExpenses || 'expense';
	const hasExp = dir.includes('expense');
	const hasInc = dir.includes('income');
	if (hasExp && hasInc) return '全部非转账收支';
	if (hasInc) return '全部非转账收入';
	return '全部非转账支出';
});

const mobileSpentLabel = computed(() => {
	const dir = props.budgetStatus?.incomeAndExpenses || 'expense';
	const hasExp = dir.includes('expense');
	const hasInc = dir.includes('income');
	if (hasExp && hasInc) return '已计金额';
	if (hasInc) return '已入金额';
	return '已用金额';
});

const cleanedCategoryList = computed(() => {
	const raw = props.budgetStatus?.categoryNames || props.budgetStatus?.categoryCodes || [];
	return raw.filter((c) => c && c !== '🪰' && c !== '支出' && c !== '收入' && c !== 'expense' && c !== 'income');
});

const displayCategoryList = computed(() => {
	if (isCategoriesExpanded.value || cleanedCategoryList.value.length <= 4) {
		return cleanedCategoryList.value;
	}
	return cleanedCategoryList.value.slice(0, 4);
});
</script>

<style scoped lang="less">
.pocket-money-card {
	position: relative;
	margin: 8px 12px 6px;
	padding: 10px 14px;
	background: linear-gradient(180deg, #ffffff 0%, #fafcff 100%);
	border-radius: 16px;
	box-shadow:
		0 1px 3px rgba(0, 0, 0, 0.02),
		0 4px 12px rgba(22, 119, 255, 0.04);
	border: 1px solid rgba(226, 232, 240, 0.85);
	overflow: hidden;
	transition: all 0.28s cubic-bezier(0.4, 0, 0.2, 1);

	&--expanded {
		padding: 12px 14px 14px;
		box-shadow: 0 4px 20px rgba(22, 119, 255, 0.07);
		border-color: rgba(147, 197, 253, 0.45);

		.toggle-arrow-btn {
			transform: rotate(180deg);
			background: #eef2f6;
		}
	}

	.pocket-money-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		cursor: pointer;
		user-select: none;
		min-height: 28px;
		transition: opacity 0.15s ease;

		&:active {
			opacity: 0.8;
		}

		.pocket-money-title {
			display: flex;
			align-items: center;
			gap: 7px;
			font-size: 13.5px;
			font-weight: 600;
			color: #0f172a;

			.title-icon-box {
				width: 28px;
				height: 28px;
				border-radius: 8px;
				background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
				display: flex;
				align-items: center;
				justify-content: center;
				box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.8);

				.title-icon {
					font-size: 15px;
					color: #2563eb;
				}
			}

			.title-text {
				letter-spacing: -0.2px;
			}

			.health-badge {
				display: inline-flex;
				align-items: center;
				gap: 4.5px;
				font-size: 10.5px;
				font-weight: 600;
				padding: 1.5px 7px;
				border-radius: 12px;
				border: 1px solid;
				line-height: 1.35;

				.health-dot {
					width: 5px;
					height: 5px;
					border-radius: 50%;
					display: inline-block;
				}
			}
		}

		.pocket-money-summary {
			display: flex;
			align-items: center;
			gap: 8px;

			.summary-metric {
				display: flex;
				align-items: baseline;
				gap: 4px;

				.metric-label {
					font-size: 11px;
					color: #64748b;
				}

				.metric-val {
					font-family:
						'DIN Alternate',
						-apple-system,
						BlinkMacSystemFont,
						Roboto,
						sans-serif;
					font-size: 15px;
					font-weight: 700;
					letter-spacing: -0.3px;

					.currency-symbol {
						font-size: 12px;
						font-weight: 600;
						margin-right: 0.5px;
					}

					&.remain {
						color: #0f172a;
					}

					&.over {
						color: #e11d48;
					}
				}
			}

			.percent-pill {
				font-size: 10.5px;
				font-weight: 600;
				color: #475569;
				background: #f1f5f9;
				padding: 1.5px 6.5px;
				border-radius: 10px;
				letter-spacing: -0.2px;
			}

			.toggle-arrow-btn {
				width: 20px;
				height: 20px;
				border-radius: 50%;
				display: flex;
				align-items: center;
				justify-content: center;
				background: transparent;
				transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

				.toggle-arrow {
					font-size: 11px;
					color: #94a3b8;
				}
			}
		}
	}

	.ambient-progress-track {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 2px;
		background: #f1f5f9;
		overflow: hidden;

		.ambient-progress-bar {
			height: 100%;
			border-radius: 0 1px 1px 0;
			transition:
				width 0.35s ease,
				background-color 0.3s ease;
		}
	}

	.pocket-money-body {
		padding-top: 10px;
		margin-top: 6px;
		border-top: 1px solid #f1f5f9;

		.amount-main {
			display: grid;
			grid-template-columns: repeat(3, 1fr);
			gap: 6px;
			margin-bottom: 10px;

			.amount-card {
				background: #f8fafc;
				padding: 8px 6px;
				border-radius: 10px;
				text-align: center;
				border: 1px solid transparent;
				transition: all 0.15s ease;

				&--clickable {
					cursor: pointer;

					&:active {
						background: #eef6ff;
						border-color: #bfdbfe;
						transform: scale(0.98);
					}
				}

				.amount-label {
					font-size: 10.5px;
					color: #64748b;
					margin-bottom: 2px;

					.drill-tag {
						font-size: 9.5px;
						color: #2563eb;
						font-weight: 600;
					}
				}

				.amount-value {
					font-family:
						'DIN Alternate',
						-apple-system,
						BlinkMacSystemFont,
						sans-serif;
					font-size: 15px;
					font-weight: 700;
					color: #0f172a;
					letter-spacing: -0.2px;

					.amount-currency {
						font-size: 11.5px;
						font-weight: 600;
						margin-right: 1px;
					}

					&.budget {
						color: #2563eb;
					}

					&.expense {
						color: #0f172a;
					}

					&.surplus {
						color: #059669;
					}

					&.remain {
						color: #059669;
					}

					&.over {
						color: #e11d48;
					}
				}
			}
		}

		.pocket-money-progress {
			margin: 10px 0 10px;
		}

		.pocket-money-footer {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 8px;
			padding-top: 4px;

			.pocket-money-tags {
				display: flex;
				align-items: center;
				flex-wrap: wrap;
				gap: 4px;
				flex: 1;

				.tag-desc {
					font-size: 10.5px;
					color: #94a3b8;
				}

				.category-tag {
					font-size: 10px;
					padding: 1px 6px;
				}

				.tag-expand-btn {
					background: transparent;
					border: none;
					padding: 0 4px;
					font-size: 10px;
					color: #2563eb;
					cursor: pointer;
				}

				.tag-all {
					font-size: 11px;
					color: #64748b;
				}
			}

			.btn-edit-action {
				height: 26px;
				padding: 0 10px;
				font-size: 11px;
				flex-shrink: 0;
			}
		}
	}
}

.expand-enter-active,
.expand-leave-active {
	transition: all 0.24s cubic-bezier(0.4, 0, 0.2, 1);
	max-height: 240px;
	overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
	max-height: 0;
	opacity: 0;
}
</style>
