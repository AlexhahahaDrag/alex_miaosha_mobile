<template>
	<div
		id="budget-manage-page"
		class="budget-manage-page"
	>
		<!-- 角色模式提示横幅 (家庭成员浏览模式) -->
		<div
			v-if="!pageLoading && !canEditBudget"
			class="readonly-notice-banner"
		>
			<van-icon
				name="info-o"
				class="notice-icon"
			/>
			<span>仅家庭管理员可修改月度预算</span>
		</div>

		<!-- 首屏骨架屏：对齐 1 张主卡 + 1 组折叠设置卡 -->
		<template v-if="pageLoading">
			<div
				class="budget-card budget-skeleton-card"
				data-testid="budget-page-skeleton"
			>
				<div class="sk-row-between">
					<div class="sk-bar sk-bar--sm sk-pulse"></div>
					<div class="sk-bar sk-bar--xs sk-pulse"></div>
				</div>
				<div class="sk-amount sk-pulse"></div>
				<div class="sk-presets">
					<span class="sk-chip sk-pulse"></span>
					<span class="sk-chip sk-pulse"></span>
					<span class="sk-chip sk-pulse"></span>
					<span class="sk-chip sk-pulse"></span>
				</div>
				<div class="sk-divider"></div>
				<div class="sk-progress sk-pulse"></div>
				<div class="sk-row-between">
					<div class="sk-bar sk-bar--md sk-pulse"></div>
					<div class="sk-bar sk-bar--md sk-pulse"></div>
				</div>
			</div>

			<div class="budget-card budget-skeleton-settings">
				<div class="sk-setting-row">
					<div class="sk-bar sk-bar--sm sk-pulse"></div>
					<div class="sk-bar sk-bar--md sk-pulse"></div>
				</div>
				<div class="sk-divider"></div>
				<div class="sk-setting-row">
					<div class="sk-bar sk-bar--md sk-pulse"></div>
					<div class="sk-bar sk-bar--xs sk-pulse"></div>
				</div>
			</div>
		</template>

		<template v-else>
			<!-- ① 主卡：月份 + 大号金额台 + 快捷/AI 填充 + 实时进度 -->
			<div class="budget-card budget-hero-card">
				<div class="hero-meta-row">
					<span class="hero-month">{{ currentMonthStr }} 预算</span>
					<span class="hero-tip">次月沿用</span>
				</div>

				<div :class="['hero-amount-box', isAmountHighlighted && 'field-highlight-pulse']">
					<span class="currency-prefix">¥</span>
					<van-field
						v-model="budgetForm.budgetAmount"
						type="number"
						placeholder="不填则不限额"
						:clearable="canEditBudget"
						:readonly="!canEditBudget"
						data-testid="input-budget-amount"
						class="hero-amount-field"
					/>
				</div>

				<div
					v-if="canEditBudget"
					class="quick-amount-presets"
				>
					<span
						v-for="item in quickPresetItems"
						:key="item.key"
						:class="['preset-chip', item.isAi && 'preset-chip--ai', numericBudgetAmount === item.amount && 'active']"
						@click="onSelectQuickAmount(item.amount)"
					>
						{{ item.label }}
					</span>
				</div>

				<!-- 实时试算精简条（直接内嵌在主卡底部） -->
				<div class="hero-sim-section">
					<div class="hero-sim-progress-row">
						<van-progress
							class="hero-progress-bar"
							:percentage="previewStats.budget > 0 ? Math.max(0, Math.min(previewStats.percent, 100)) : 0"
							:color="previewStats.isOver ? '#e11d48' : '#4f6af6'"
							track-color="#eef2f6"
							:show-pivot="false"
							stroke-width="6"
						/>
						<span
							:class="[
								'hero-sim-badge',
								previewStats.budget <= 0
									? 'hero-sim-badge--none'
									: previewStats.isOver
										? 'hero-sim-badge--over'
										: 'hero-sim-badge--normal',
							]"
						>
							{{ previewStats.budget <= 0 ? '不限额' : previewStats.isOver ? '已超支' : `已用 ${previewStats.percent}%` }}
						</span>
					</div>

					<div class="hero-sim-summary">
						<span class="sim-item">
							本月已用
							<strong class="sim-num">
								{{
									simulationLoading
										? '计算中...'
										: `${previewStats.actual < 0 ? '-' : ''}¥${Math.abs(previewStats.actual).toFixed(2)}`
								}}
							</strong>
						</span>
						<span
							v-if="previewStats.budget > 0"
							:class="['sim-item', previewStats.isOver ? 'sim-item--over' : 'sim-item--remain']"
						>
							{{ previewStats.isOver ? '超支' : '结余' }}
							<strong class="sim-num">
								{{ simulationLoading ? '计算中...' : `¥${Math.abs(previewStats.remaining).toFixed(2)}` }}
							</strong>
						</span>
					</div>
				</div>
			</div>

			<!-- ② 折叠设置卡：统计范围 + AI 口语与测算 -->
			<div class="budget-card budget-settings-card">
				<!-- 行 1：统计范围 -->
				<div class="setting-row">
					<div
						class="setting-row-header"
						data-testid="btn-toggle-budget-scope"
						@click="toggleScopeExpanded"
					>
						<span class="setting-row-title">统计范围</span>
						<div class="setting-row-right">
							<span class="setting-row-summary">{{ scopeSummaryText }}</span>
							<van-icon
								:name="isScopeExpanded ? 'arrow-up' : 'arrow-down'"
								class="setting-row-arrow"
							/>
						</div>
					</div>
					<div
						v-if="isScopeExpanded"
						class="setting-row-body"
					>
						<budget-category-selector
							v-model:selected-directions="budgetForm.selectedDirections"
							v-model:category-codes="budgetForm.categoryCodes"
							:can-edit-budget="canEditBudget"
							:recent-categories="recentCategories"
							:categories-loading="categoriesLoading"
							:is-highlighted="isCategoriesHighlighted"
							@change="onCategoryOrDirectionChange"
						/>
						<div class="dialog-hint">未选分类时统计所选方向的全部账单（不含转账）</div>
					</div>
				</div>

				<div class="setting-divider"></div>

				<!-- 行 2：AI 口语与测算 -->
				<div class="setting-row">
					<budget-ai-assistant-card
						ref="aiAssistantRef"
						:can-edit-budget="canEditBudget"
						:current-month-str="currentMonthStr"
						:model-value-amount="numericBudgetAmount"
						@apply-amount="onApplyAiAmount"
						@apply-categories="onApplyAiCategories"
						@recommend-loaded="onAiRecommendLoaded"
					/>
				</div>
			</div>
		</template>

		<!-- 底部操作悬浮栏（加载完成且有编辑权限时显示单颗主按钮） -->
		<div
			v-if="!pageLoading && canEditBudget"
			class="budget-footer-bar"
		>
			<van-button
				type="primary"
				block
				round
				class="btn-save"
				:loading="saving"
				data-testid="btn-save-budget"
				@click="onSaveBudget"
			>
				保存预算
			</van-button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { showFailToast, showSuccessToast } from 'vant';
import BudgetAiAssistantCard from '@/views/selfFinance/financeManager/budgetManage/components/BudgetAiAssistantCard.vue';
import BudgetCategorySelector from '@/views/selfFinance/financeManager/budgetManage/components/BudgetCategorySelector.vue';
import { useNavBar, type NavBarConfig } from '@/composables/useNavBar';
import { useTabBar } from '@/composables/useTabBar';
import { getRoutePathByName } from '@/utils/router';
import { usePermission } from '@/composables/usePermission';
import { formatMonth, getMonthRange } from '@/utils/dayjs';
import {
	getBudgetStatus,
	saveMonthlyBudget,
	getBudgetCategories,
	getFinanceSummary,
} from '@/views/selfFinance/financeManager/api';
import type { FinanceManagerData } from '@/views/selfFinance/financeManager/config';

const router = useRouter();
const { hasPermission } = usePermission();

const getFinanceManagerRoutePath = (): string =>
	getRoutePathByName(router, 'financeManager', '/selfFinance/financeManager');

const info = ref<Pick<NavBarConfig, 'title' | 'rightButton' | 'leftPath' | 'visible'>>({
	title: '零花钱预算管理',
	leftPath: getFinanceManagerRoutePath(),
	visible: true,
});
useNavBar(info);

useTabBar({
	visible: false,
});

const canEditBudget = computed(() => hasPermission('finance:financeManager:budget:edit'));
const currentMonthStr = computed(() => formatMonth());

const budgetForm = reactive({
	budgetAmount: '' as number | string,
	incomeAndExpenses: 'expense',
	selectedDirections: ['expense'] as string[],
	categoryCodes: [] as string[],
});

const baseAmountPresets = [1000, 2000, 3000, 5000];
const aiModerateAmount = ref<number>(0);
const isScopeExpanded = ref<boolean>(false);

const quickPresetItems = computed(() => {
	if (aiModerateAmount.value > 0) {
		const roundedAi = Math.round(aiModerateAmount.value);
		const others = baseAmountPresets.filter((v) => v !== roundedAi).slice(0, 3);
		return [
			{ key: `ai-${roundedAi}`, amount: roundedAi, label: `AI ¥${roundedAi}`, isAi: true },
			...others.map((v) => ({ key: `p-${v}`, amount: v, label: `¥${v}`, isAi: false })),
		];
	}
	return baseAmountPresets.map((v) => ({ key: `p-${v}`, amount: v, label: `¥${v}`, isAi: false }));
});

const scopeSummaryText = computed(() => {
	const dirs = budgetForm.selectedDirections;
	const hasExp = dirs.includes('expense');
	const hasInc = dirs.includes('income');
	const dirText = hasExp && hasInc ? '收支' : hasInc ? '收入' : '支出';

	const selectedCount = budgetForm.categoryCodes.length;
	const totalCount = recentCategories.value.length;
	const catText =
		selectedCount === 0 || (totalCount > 0 && selectedCount === totalCount) ? '全部账单' : `已选 ${selectedCount} 项`;
	return `${dirText} · ${catText}`;
});

const numericBudgetAmount = computed(() => {
	const val = Number(budgetForm.budgetAmount);
	return Number.isFinite(val) && val > 0 ? val : 0;
});

const pageLoading = ref<boolean>(true);
const recentCategories = ref<string[]>([]);
const categoriesLoading = ref<boolean>(false);
const simulatedActualExpense = ref<number>(0);
const simulationLoading = ref<boolean>(false);
const saving = ref<boolean>(false);
const isAmountHighlighted = ref<boolean>(false);
const isCategoriesHighlighted = ref<boolean>(false);

const aiAssistantRef = shallowRef<InstanceType<typeof BudgetAiAssistantCard>>();

const toggleScopeExpanded = () => {
	isScopeExpanded.value = !isScopeExpanded.value;
	navigator.vibrate?.(10);
};

const onAiRecommendLoaded = (moderateAmount: number) => {
	aiModerateAmount.value = moderateAmount > 0 ? moderateAmount : 0;
};

const onSelectQuickAmount = (preset: number) => {
	if (!canEditBudget.value) return;
	budgetForm.budgetAmount = preset;
	navigator.vibrate?.(10);
	debouncedPreview();
};

const triggerAmountHighlight = () => {
	isAmountHighlighted.value = true;
	navigator.vibrate?.([15, 50, 15]);
	setTimeout(() => {
		isAmountHighlighted.value = false;
	}, 1200);
};

const triggerCategoriesHighlight = () => {
	isCategoriesHighlighted.value = true;
	navigator.vibrate?.([15, 50, 15]);
	setTimeout(() => {
		isCategoriesHighlighted.value = false;
	}, 1200);
};

const onApplyAiAmount = (amount: number) => {
	budgetForm.budgetAmount = amount > 0 ? amount : '';
	triggerAmountHighlight();
	debouncedPreview();
};

const onApplyAiCategories = (categories: string[]) => {
	budgetForm.categoryCodes = [...categories];
	isScopeExpanded.value = true;
	triggerCategoriesHighlight();
	debouncedPreview();
};

const onCategoryOrDirectionChange = () => {
	const set = new Set(budgetForm.selectedDirections);
	if (set.has('expense') && set.has('income')) {
		budgetForm.incomeAndExpenses = 'all';
	} else if (set.has('income')) {
		budgetForm.incomeAndExpenses = 'income';
	} else {
		budgetForm.incomeAndExpenses = 'expense';
	}
	debouncedPreview();
};

// 实时试算与健康度模拟指标
const previewStats = computed(() => {
	const budget = Number(budgetForm.budgetAmount || 0);
	const actual = simulatedActualExpense.value;
	const remaining = budget - actual;
	const percent = budget > 0 ? Math.round((actual / budget) * 100) : 0;
	const isOver = budget > 0 && actual > budget;

	return {
		budget,
		actual,
		remaining,
		percent,
		isOver,
	};
});

let previewTimer: ReturnType<typeof setTimeout> | null = null;
const debouncedPreview = () => {
	if (previewTimer) clearTimeout(previewTimer);
	previewTimer = setTimeout(() => {
		fetchPreviewSimulation();
	}, 200);
};

watch(
	() => budgetForm.budgetAmount,
	() => {
		debouncedPreview();
	},
);

const fetchPreviewSimulation = async () => {
	simulationLoading.value = true;
	try {
		const [monthStart, monthEnd] = getMonthRange();
		const effectiveCategoryCodes = budgetForm.categoryCodes.filter(
			(c) => c !== '支出' && c !== '收入' && c !== 'expense' && c !== 'income',
		);

		const dirs = budgetForm.selectedDirections;
		const hasExp = dirs.includes('expense');
		const hasInc = dirs.includes('income');

		const queryParams: FinanceManagerData = {
			infoDateStart: monthStart,
			infoDateEnd: monthEnd,
		};

		if (effectiveCategoryCodes.length > 0) {
			const results = await Promise.all(
				effectiveCategoryCodes.map((cat) =>
					getFinanceSummary({
						...queryParams,
						typeCode: cat,
					}),
				),
			);

			let total = 0;
			results.forEach(({ code, data }) => {
				if (code === '200' && data) {
					const exp = Number(data.totalExpense || 0);
					const inc = Number(data.totalIncome || 0);
					if (hasExp && !hasInc) total += exp;
					else if (!hasExp && hasInc) total += inc;
					else total += exp;
				}
			});
			simulatedActualExpense.value = total;
		} else {
			const { code, data } = await getFinanceSummary(queryParams);
			if (code === '200' && data) {
				const exp = Number(data.totalExpense || 0);
				const inc = Number(data.totalIncome || 0);
				if (hasExp && !hasInc) simulatedActualExpense.value = exp;
				else if (!hasExp && hasInc) simulatedActualExpense.value = inc;
				else simulatedActualExpense.value = exp - inc;
			}
		}
	} catch {
		// 忽略试算临时异常
	} finally {
		simulationLoading.value = false;
	}
};

const initData = async () => {
	pageLoading.value = true;
	categoriesLoading.value = true;
	try {
		const month = currentMonthStr.value;
		const [{ code: statusCode, data: statusData }, { code: catCode, data: catData }] = await Promise.all([
			getBudgetStatus(month),
			getBudgetCategories(month),
		]);

		if (catCode === '200' && Array.isArray(catData)) {
			recentCategories.value = catData.filter(
				(c) => c && c !== '支出' && c !== '收入' && c !== 'expense' && c !== 'income' && c !== '转账',
			);
		}

		if (statusCode === '200' && statusData) {
			const parsedAmount = Number(statusData.budgetAmount || 0);
			budgetForm.budgetAmount = parsedAmount > 0 ? parsedAmount : '';
			budgetForm.incomeAndExpenses = statusData.incomeAndExpenses || 'expense';

			if (statusData.incomeAndExpenses === 'all') {
				budgetForm.selectedDirections = ['expense', 'income'];
			} else if (statusData.incomeAndExpenses === 'income') {
				budgetForm.selectedDirections = ['income'];
			} else {
				budgetForm.selectedDirections = ['expense'];
			}

			if (Array.isArray(statusData.categoryCodes) && statusData.categoryCodes.length > 0) {
				budgetForm.categoryCodes = [...statusData.categoryCodes];
			} else if (recentCategories.value.length > 0) {
				budgetForm.categoryCodes = [...recentCategories.value];
			}
		} else if (recentCategories.value.length > 0) {
			budgetForm.categoryCodes = [...recentCategories.value];
		}

		fetchPreviewSimulation();
	} catch {
		showFailToast('加载预算数据失败');
	} finally {
		categoriesLoading.value = false;
		pageLoading.value = false;
	}
};

const onSaveBudget = async () => {
	if (!canEditBudget.value) return;
	const rawAmount = budgetForm.budgetAmount === '' ? 0 : Number(budgetForm.budgetAmount);
	if (Number.isNaN(rawAmount) || rawAmount < 0) {
		showFailToast('预算金额不能为负数');
		return;
	}
	saving.value = true;
	try {
		const month = currentMonthStr.value;
		const { code, message } = await saveMonthlyBudget({
			budgetMonth: month,
			budgetAmount: rawAmount,
			incomeAndExpenses: budgetForm.incomeAndExpenses,
			categoryCodes: budgetForm.categoryCodes,
		});

		if (code === '200') {
			showSuccessToast('预算保存成功');
			navigateBackToFinanceManager();
		} else {
			showFailToast(message || '保存预算失败');
		}
	} catch {
		showFailToast('网络异常，保存失败');
	} finally {
		saving.value = false;
	}
};

const navigateBackToFinanceManager = () => {
	if (typeof window !== 'undefined' && window.history.length > 1) {
		router.back();
		return;
	}
	router.replace({ path: getFinanceManagerRoutePath() });
};

onMounted(() => {
	initData();
});
</script>

<style scoped lang="less">
.budget-manage-page {
	min-height: calc(100vh - var(--van-nav-bar-height, 46px));
	background-color: var(--page-bg, #f4f6fa);
	padding: 14px 16px calc(76px + env(safe-area-inset-bottom));
	box-sizing: border-box;
}

.readonly-notice-banner {
	display: flex;
	align-items: center;
	gap: 6px;
	padding: 10px 14px;
	margin-bottom: 12px;
	background-color: #fffbeb;
	border-radius: 12px;
	color: #b45309;
	font-size: 13px;
	line-height: 1.4;

	.notice-icon {
		font-size: 16px;
		flex-shrink: 0;
	}
}

.budget-card {
	background: #ffffff;
	border-radius: 16px;
	box-shadow: 0 2px 12px rgba(15, 23, 42, 0.04);
	margin-bottom: 12px;
}

/* ① 主卡：月份 + 大号金额台 + 快捷填充 + 实时进度 */
.budget-hero-card {
	padding: 18px 16px 16px;
}

.hero-meta-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 14px;

	.hero-month {
		font-size: 14px;
		font-weight: 600;
		color: #0f172a;
		font-variant-numeric: tabular-nums;
	}

	.hero-tip {
		font-size: 11px;
		color: #94a3b8;
	}
}

.hero-amount-box {
	display: flex;
	align-items: center;
	gap: 6px;
	padding-bottom: 8px;
	border-bottom: 1.5px solid #e2e8f0;
	transition: border-color 0.2s ease;

	&:focus-within {
		border-bottom-color: #4f6af6;
	}

	.currency-prefix {
		font-size: 24px;
		font-weight: 700;
		color: #94a3b8;
		line-height: 1;
	}

	.hero-amount-field {
		padding: 0;
		background: transparent;

		&::after {
			display: none;
		}

		:deep(.van-field__control) {
			font-size: 30px;
			font-weight: 700;
			color: #0f172a;
			line-height: 1.2;
			font-variant-numeric: tabular-nums;

			&::placeholder {
				font-size: 16px;
				font-weight: 400;
				color: #cbd5e1;
			}
		}
	}
}

.quick-amount-presets {
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	gap: 8px;
	margin-top: 12px;

	.preset-chip {
		text-align: center;
		padding: 6px 2px;
		font-size: 12px;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
		color: #475569;
		background: #f1f5f9;
		border-radius: 999px;
		cursor: pointer;
		white-space: nowrap;
		transition:
			background-color 0.2s ease,
			color 0.2s ease,
			transform 0.15s ease;

		&:active {
			transform: scale(0.96);
		}

		&--ai {
			background: #eef2ff;
			color: #4f6af6;
		}

		&.active {
			background: #4f6af6;
			color: #ffffff;
		}
	}
}

.hero-sim-section {
	margin-top: 16px;
	padding-top: 14px;
	border-top: 1px solid #f1f5f9;
}

.hero-sim-progress-row {
	display: flex;
	align-items: center;
	gap: 10px;
	margin-bottom: 10px;

	.hero-progress-bar {
		flex: 1;
	}

	.hero-sim-badge {
		font-size: 11px;
		font-weight: 600;
		padding: 2px 8px;
		border-radius: 999px;
		flex-shrink: 0;
		font-variant-numeric: tabular-nums;

		&--normal {
			background: #eef2ff;
			color: #4f6af6;
		}

		&--over {
			background: #fff1f2;
			color: #e11d48;
		}

		&--none {
			background: #f1f5f9;
			color: #64748b;
		}
	}
}

.hero-sim-summary {
	display: flex;
	justify-content: space-between;
	align-items: center;
	font-size: 12px;
	color: #64748b;

	.sim-item {
		display: inline-flex;
		align-items: center;
		gap: 4px;

		.sim-num {
			font-weight: 700;
			color: #0f172a;
			font-variant-numeric: tabular-nums;
		}

		&--remain .sim-num {
			color: #059669;
		}

		&--over .sim-num {
			color: #e11d48;
		}
	}
}

/* ② 折叠设置卡 */
.budget-settings-card {
	overflow: hidden;
	margin-bottom: 0;
}

.setting-divider {
	height: 1px;
	background: #f1f5f9;
	margin: 0 16px;
}

.setting-row-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 14px 16px;
	cursor: pointer;

	.setting-row-title {
		font-size: 14px;
		font-weight: 600;
		color: #0f172a;
	}

	.setting-row-right {
		display: flex;
		align-items: center;
		gap: 6px;
		min-width: 0;

		.setting-row-summary {
			font-size: 12px;
			color: #64748b;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}

		.setting-row-arrow {
			font-size: 12px;
			color: #94a3b8;
			flex-shrink: 0;
		}
	}
}

.setting-row-body {
	padding: 2px 16px 16px;
}

/* 首屏骨架屏 (GPU 合成 opacity 脉冲) */
.budget-skeleton-card {
	padding: 18px 16px 16px;

	.sk-row-between {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.sk-amount {
		height: 40px;
		width: 60%;
		margin: 18px 0 14px;
	}

	.sk-presets {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 8px;

		.sk-chip {
			height: 28px;
			border-radius: 999px;
		}
	}

	.sk-progress {
		height: 8px;
		margin-bottom: 12px;
		border-radius: 999px;
	}
}

.budget-skeleton-settings {
	padding: 4px 16px;

	.sk-setting-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 14px 0;
	}
}

.sk-pulse {
	background: #eef2f6;
	border-radius: 8px;
	animation: skOpacityPulse 1.4s ease-in-out infinite;
}

.sk-bar {
	height: 14px;

	&--xs {
		width: 56px;
	}

	&--sm {
		width: 88px;
	}

	&--md {
		width: 112px;
	}
}

.sk-divider {
	height: 1px;
	background: #f1f5f9;
	margin: 14px 0;
}

@keyframes skOpacityPulse {
	0%,
	100% {
		opacity: 1;
	}
	50% {
		opacity: 0.45;
	}
}

.field-highlight-pulse {
	animation: pulseBottomLine 1.2s ease-in-out;
	border-bottom-color: #4f6af6 !important;
}

.category-highlight-pulse {
	animation: pulseBackground 1.2s ease-in-out;
}

@keyframes pulseBottomLine {
	0% {
		border-bottom-color: #4f6af6;
	}
	50% {
		border-bottom-color: #818cf8;
	}
	100% {
		border-bottom-color: #e2e8f0;
	}
}

@keyframes pulseBackground {
	0% {
		background-color: rgba(79, 106, 246, 0.08);
	}
	50% {
		background-color: rgba(79, 106, 246, 0.16);
	}
	100% {
		background-color: transparent;
	}
}

.dialog-hint {
	font-size: 11px;
	color: #94a3b8;
	line-height: 1.5;
	margin-top: 4px;
}

.budget-footer-bar {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	padding: 12px 16px calc(12px + env(safe-area-inset-bottom));
	background: rgba(255, 255, 255, 0.94);
	backdrop-filter: blur(10px);
	box-shadow: 0 -2px 12px rgba(15, 23, 42, 0.05);
	z-index: 100;

	.btn-save {
		background: #4f6af6;
		border-color: #4f6af6;
		font-weight: 600;
		height: 44px;
		transition: transform 0.15s ease;

		&:active {
			transform: scale(0.98);
		}
	}
}
</style>
