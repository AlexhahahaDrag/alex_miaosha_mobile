<template>
	<div
		id="budget-manage-page"
		class="budget-manage-page"
	>
		<!-- 角色模式提示横幅 (家庭成员浏览模式) -->
		<div
			v-if="!canEditBudget"
			class="readonly-notice-banner"
		>
			<van-icon
				name="info-o"
				class="notice-icon"
			/>
			<span>家庭成员浏览模式，仅家庭管理员可调整月度预算设定</span>
		</div>

		<div class="budget-content-card">
			<!-- 预算月份 Banner -->
			<div class="budget-month-banner">
				<div class="banner-left">
					<span class="month-label">预算月份:</span>
					<span class="month-val">{{ currentMonthStr }}</span>
				</div>
				<span class="month-tip">每月独立保存，次月自动继承</span>
			</div>

			<!-- ① AI 智能助手与口语配置子组件 -->
			<budget-ai-assistant-card
				ref="aiAssistantRef"
				:can-edit-budget="canEditBudget"
				:current-month-str="currentMonthStr"
				:model-value-amount="budgetForm.budgetAmount"
				@apply-amount="onApplyAiAmount"
				@apply-categories="onApplyAiCategories"
			/>

			<!-- 预算金额输入 -->
			<van-field
				v-model.number="budgetForm.budgetAmount"
				type="number"
				label="预算金额(元)"
				placeholder="请输入预算金额"
				input-align="right"
				:readonly="!canEditBudget"
				data-testid="input-budget-amount"
				:class="['budget-amount-field', isAmountHighlighted && 'field-highlight-pulse']"
			/>

			<!-- ② 纳入统计分类多选与方向控制子组件 -->
			<budget-category-selector
				v-model:selected-directions="budgetForm.selectedDirections"
				v-model:category-codes="budgetForm.categoryCodes"
				:can-edit-budget="canEditBudget"
				:recent-categories="recentCategories"
				:categories-loading="categoriesLoading"
				:is-highlighted="isCategoriesHighlighted"
				@change="onCategoryOrDirectionChange"
			/>

			<!-- ③ 实时试算与健康度模拟卡片子组件 -->
			<budget-simulation-card
				:budget="previewStats.budget"
				:actual="previewStats.actual"
				:remaining="previewStats.remaining"
				:percent="previewStats.percent"
				:is-over="previewStats.isOver"
				:simulation-loading="simulationLoading"
			/>

			<div class="dialog-hint"> * 仅勾选的类别会计入预算，不勾选则默认统计当前所选收支方向的全部记录（不含转账）。 </div>
		</div>

		<!-- 底部操作悬浮栏 -->
		<div class="budget-footer-bar">
			<van-button
				block
				round
				class="btn-back"
				@click="onCancel"
			>
				{{ canEditBudget ? '取消' : '返回列表' }}
			</van-button>
			<van-button
				v-if="canEditBudget"
				type="primary"
				block
				round
				class="btn-save"
				:loading="saving"
				data-testid="btn-save-budget"
				@click="onSaveBudget"
			>
				保存预算设定
			</van-button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { showFailToast, showSuccessToast } from 'vant';
import { useRouter } from 'vue-router';
import BudgetAiAssistantCard from '@/views/finance/financeManager/budgetManage/components/BudgetAiAssistantCard.vue';
import BudgetCategorySelector from '@/views/finance/financeManager/budgetManage/components/BudgetCategorySelector.vue';
import BudgetSimulationCard from '@/views/finance/financeManager/budgetManage/components/BudgetSimulationCard.vue';
import { useNavBar } from '@/composables/useNavBar';
import { usePermission } from '@/composables/usePermission';
import { formatMonth, getMonthRange } from '@/utils/dayjs';
import {
	getBudgetStatus,
	saveMonthlyBudget,
	getBudgetCategories,
	getFinanceSummary,
} from '@/views/finance/financeManager/api';
import type { FinanceManagerData } from '@/views/finance/financeManager/config';

const router = useRouter();
const { hasPermission } = usePermission();

useNavBar({
	title: '零花钱预算管理',
	leftPath: '/finance/financeManager',
	visible: true,
});

const canEditBudget = computed(() => hasPermission('finance:financeManager:budget:edit'));
const currentMonthStr = computed(() => formatMonth());

const budgetForm = reactive({
	budgetAmount: 0,
	incomeAndExpenses: 'expense',
	selectedDirections: ['expense'] as string[],
	categoryCodes: [] as string[],
});

const recentCategories = ref<string[]>([]);
const categoriesLoading = ref<boolean>(false);
const simulatedActualExpense = ref<number>(0);
const simulationLoading = ref<boolean>(false);
const saving = ref<boolean>(false);
const isAmountHighlighted = ref<boolean>(false);
const isCategoriesHighlighted = ref<boolean>(false);

const aiAssistantRef = shallowRef<InstanceType<typeof BudgetAiAssistantCard>>();

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
	budgetForm.budgetAmount = amount;
	triggerAmountHighlight();
	debouncedPreview();
};

const onApplyAiCategories = (categories: string[]) => {
	budgetForm.categoryCodes = [...categories];
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
			results.forEach((res) => {
				if (res.code === '200' && res.data) {
					const exp = Number(res.data.totalExpense || 0);
					const inc = Number(res.data.totalIncome || 0);
					if (hasExp && !hasInc) total += exp;
					else if (!hasExp && hasInc) total += inc;
					else total += exp;
				}
			});
			simulatedActualExpense.value = total;
		} else {
			const res = await getFinanceSummary(queryParams);
			if (res.code === '200' && res.data) {
				const exp = Number(res.data.totalExpense || 0);
				const inc = Number(res.data.totalIncome || 0);
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
	categoriesLoading.value = true;
	try {
		const month = currentMonthStr.value;
		const [statusRes, catRes] = await Promise.all([getBudgetStatus(month), getBudgetCategories(month)]);

		if (catRes.code === '200' && Array.isArray(catRes.data)) {
			recentCategories.value = catRes.data.filter(
				(c) => c && c !== '支出' && c !== '收入' && c !== 'expense' && c !== 'income' && c !== '转账',
			);
		}

		if (statusRes.code === '200' && statusRes.data) {
			const d = statusRes.data;
			budgetForm.budgetAmount = Number(d.budgetAmount || 0);
			budgetForm.incomeAndExpenses = d.incomeAndExpenses || 'expense';

			if (d.incomeAndExpenses === 'all') {
				budgetForm.selectedDirections = ['expense', 'income'];
			} else if (d.incomeAndExpenses === 'income') {
				budgetForm.selectedDirections = ['income'];
			} else {
				budgetForm.selectedDirections = ['expense'];
			}

			if (Array.isArray(d.categoryCodes) && d.categoryCodes.length > 0) {
				budgetForm.categoryCodes = [...d.categoryCodes];
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
	}
};

const onSaveBudget = async () => {
	if (!canEditBudget.value) return;
	if (budgetForm.budgetAmount < 0) {
		showFailToast('预算金额不能为负数');
		return;
	}
	saving.value = true;
	try {
		const month = currentMonthStr.value;
		const { code, message } = await saveMonthlyBudget({
			budgetMonth: month,
			budgetAmount: budgetForm.budgetAmount,
			incomeAndExpenses: budgetForm.incomeAndExpenses,
			categoryCodes: budgetForm.categoryCodes,
		});

		if (code === '200') {
			showSuccessToast('预算保存成功');
			router.back();
		} else {
			showFailToast(message || '保存预算失败');
		}
	} catch {
		showFailToast('网络异常，保存失败');
	} finally {
		saving.value = false;
	}
};

const onCancel = () => {
	router.back();
};

onMounted(() => {
	initData();
});
</script>

<style scoped lang="less">
.budget-manage-page {
	min-height: 100vh;
	background-color: var(--page-bg, #f4f6fa);
	padding: 16px 16px 90px;
	box-sizing: border-box;
}

.readonly-notice-banner {
	display: flex;
	align-items: center;
	gap: 6px;
	padding: 10px 14px;
	margin-bottom: 12px;
	background-color: #fffbe6;
	border: 1px solid #ffe58f;
	border-radius: 8px;
	color: #d46b08;
	font-size: 13px;
	line-height: 1.4;

	.notice-icon {
		font-size: 16px;
		flex-shrink: 0;
	}
}

.budget-content-card {
	background: #ffffff;
	border-radius: 14px;
	padding: 16px;
	box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
}

.budget-month-banner {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 10px 12px;
	background: #f0f7ff;
	border-radius: 8px;
	margin-bottom: 14px;

	.banner-left {
		display: flex;
		align-items: center;
		gap: 6px;

		.month-label {
			font-size: 13px;
			color: #64748b;
		}

		.month-val {
			font-size: 14px;
			font-weight: 700;
			color: #1e293b;
		}
	}

	.month-tip {
		font-size: 11px;
		color: #94a3b8;
	}
}

.budget-amount-field {
	margin-bottom: 16px;
	border: 1px solid #e2e8f0;
	border-radius: 8px;
	padding: 10px 12px;
	transition: all 0.3s ease;

	:deep(.van-field__label) {
		font-size: 13px;
		font-weight: 600;
		color: #1f2937;
		width: 100px;
	}

	:deep(.van-field__control) {
		font-size: 18px;
		font-weight: 700;
		color: #1677ff;
	}
}

.field-highlight-pulse {
	animation: pulseBorder 1.2s ease-in-out;
	border-color: #6366f1 !important;
	box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.25);
}

.category-highlight-pulse {
	animation: pulseBackground 1.2s ease-in-out;
}

@keyframes pulseBorder {
	0% {
		border-color: #6366f1;
		box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.5);
	}
	50% {
		border-color: #4f46e5;
		box-shadow: 0 0 0 6px rgba(99, 102, 241, 0.3);
	}
	100% {
		border-color: #e2e8f0;
		box-shadow: 0 0 0 0 rgba(99, 102, 241, 0);
	}
}

@keyframes pulseBackground {
	0% {
		background-color: rgba(99, 102, 241, 0.1);
	}
	50% {
		background-color: rgba(99, 102, 241, 0.18);
	}
	100% {
		background-color: transparent;
	}
}

.dialog-hint {
	font-size: 11px;
	color: #9ca3af;
	line-height: 1.5;
	margin-top: 8px;
}

.budget-footer-bar {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	display: flex;
	gap: 12px;
	padding: 12px 16px env(safe-area-inset-bottom);
	background: #ffffff;
	box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
	z-index: 100;

	.btn-back {
		flex: 1;
		border-color: #d1d5db;
		color: #4b5563;
	}

	.btn-save {
		flex: 2;
	}
}
</style>
