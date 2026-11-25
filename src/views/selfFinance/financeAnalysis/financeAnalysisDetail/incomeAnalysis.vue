<template>
	<div class="analysis-container">
		<!-- 01 · 当月核心收支结余卡片 (对齐 PC 端本月财务状况) -->
		<div class="monthly-kpi-card">
			<div class="kpi-header">
				<div class="kpi-title-group">
					<span class="kpi-icon-box">
						<van-icon name="chart-trending-o" />
					</span>
					<span class="kpi-title">本月财务状况</span>
				</div>
				<div
					v-if="analysisLoading"
					class="shimmer-bar sk-w-60 sk-h-20 sk-rounded-pill"
				></div>
				<span
					v-else
					:class="[
						'kpi-status-pill',
						netBalance < 0
							? 'kpi-status-pill--deficit'
							: netBalance > 0
								? 'kpi-status-pill--surplus'
								: 'kpi-status-pill--neutral',
					]"
				>
					{{ netBalance < 0 ? '本月赤字' : netBalance > 0 ? '本月盈余' : '收支平衡' }}
				</span>
			</div>

			<template v-if="analysisLoading">
				<div
					class="kpi-skeleton-wrap"
					data-testid="income-analysis-skeleton"
				>
					<div class="kpi-net-box">
						<div class="net-top">
							<span class="net-label">本月净结余</span>
							<span class="net-formula">本月收入 - 本月消费</span>
						</div>
						<div class="shimmer-bar sk-w-140 sk-h-28 sk-my-8"></div>
						<div class="net-footer">
							<span class="saving-label">当月储蓄率</span>
							<div class="shimmer-bar sk-w-72 sk-h-14"></div>
						</div>
					</div>
					<div class="kpi-subgrid">
						<div class="kpi-subcard kpi-subcard--income">
							<div class="sub-top">
								<span class="sub-label">本月总收入</span>
								<span class="sub-tag sub-tag--income">流入</span>
							</div>
							<div class="shimmer-bar sk-w-88 sk-h-18 sk-mt-4"></div>
						</div>
						<div class="kpi-subcard kpi-subcard--expense">
							<div class="sub-top">
								<span class="sub-label">本月总消费</span>
								<span class="sub-tag sub-tag--expense">流出</span>
							</div>
							<div class="shimmer-bar sk-w-88 sk-h-18 sk-mt-4"></div>
						</div>
					</div>
				</div>
			</template>

			<template v-else>
				<div class="kpi-net-box">
					<div class="net-top">
						<span class="net-label">本月净结余</span>
						<span class="net-formula">本月收入 - 本月消费</span>
					</div>
					<div :class="['net-amount', netBalance < 0 ? 'text-rose' : netBalance > 0 ? 'text-emerald' : 'text-slate']">
						<span class="currency"> {{ netBalance < 0 ? '-' : netBalance > 0 ? '+' : '' }}¥ </span>{{ formatAmount(Math.abs(netBalance)) }}
					</div>
					<div class="net-footer">
						<span class="saving-label">当月储蓄率</span>
						<div class="saving-right">
							<span class="saving-val">{{ savingsRateDisplay }}</span>
							<span
								v-if="incomeTotal <= 0 && expenseTotal > 0"
								class="deficit-tag"
							>
								超支赤字
							</span>
						</div>
					</div>
				</div>

				<div class="kpi-subgrid">
					<div class="kpi-subcard kpi-subcard--income">
						<div class="sub-top">
							<span class="sub-label">本月总收入</span>
							<span class="sub-tag sub-tag--income">流入</span>
						</div>
						<div class="sub-amount text-emerald"> ¥{{ formatAmount(incomeTotal) }} </div>
					</div>
					<div class="kpi-subcard kpi-subcard--expense">
						<div class="sub-top">
							<span class="sub-label">本月总消费</span>
							<span class="sub-tag sub-tag--expense">流出</span>
						</div>
						<div class="sub-amount text-rose"> ¥{{ formatAmount(expenseTotal) }} </div>
					</div>
				</div>
			</template>
		</div>

		<!-- 02 · 当月零钱消费与预算分析 (新增：1:1 对齐 PC 端零钱统计功能) -->
		<mobile-analysis-budget-card
			:loading="budgetLoading || analysisLoading"
			:budget-status="budgetStatus"
			:expense-categories="pieData.expense"
			:current-month="props.dateStr"
			:format-amount="formatAmount"
			@open-budget="goToBudgetManage"
			@view-records="goToFinanceManager()"
			@select-category="(cat) => goToFinanceManager(cat, 'expense')"
		/>

		<!-- 03 · 当月支出结构卡片 -->
		<div class="analysis-card">
			<div class="card-header-bar">
				<div class="header-left">
					<span class="dot dot--rose"></span>
					<span class="card-title">支出结构</span>
					<span class="type-pill type-pill--rose">流出</span>
				</div>
				<div
					v-if="analysisLoading"
					class="shimmer-bar sk-w-88 sk-h-18"
				></div>
				<span
					v-else
					class="card-total text-rose"
				>
					¥{{ formatAmount(expenseTotal) }}
				</span>
			</div>

			<!-- 态 1：骨架屏 -->
			<div
				v-if="analysisLoading"
				class="structure-skeleton"
				data-testid="expense-structure-skeleton"
			>
				<div class="sk-donut-wrap">
					<div class="sk-donut-ring"></div>
				</div>
				<div class="sk-legend-row">
					<div
						v-for="idx in 4"
						:key="`exp-leg-${idx}`"
						class="shimmer-bar sk-w-52 sk-h-12 sk-rounded-pill"
					></div>
				</div>
				<div class="sk-structure-list">
					<div
						v-for="idx in 4"
						:key="`exp-sk-row-${idx}`"
						class="sk-structure-row"
					>
						<div class="sk-row-top">
							<div class="sk-row-left">
								<div class="shimmer-bar sk-w-28 sk-h-28 sk-rounded-9"></div>
								<div class="shimmer-bar sk-w-60 sk-h-14"></div>
							</div>
							<div class="shimmer-bar sk-w-88 sk-h-14"></div>
						</div>
						<div class="shimmer-bar sk-w-full sk-h-6 sk-rounded-pill"></div>
					</div>
				</div>
			</div>

			<!-- 态 2：有数据 -->
			<template v-else-if="pieData.expense.length > 0">
				<div class="chart-container">
					<base-chart
						:options="expenseOptions"
						width="100%"
						:height="expenseChartHeight"
						@legend-change="handleLegendChange"
					/>
				</div>

				<div class="data-detail">
					<div class="summary-header">
						<span class="summary-label">分类支出构成 (点击分类查看明细)</span>
					</div>
					<div class="structure-list">
						<div
							v-for="(item, index) in processedExpenseList"
							:key="item.name || index"
							class="structure-item"
							@click="goToFinanceManager(item.name, 'expense')"
						>
							<div class="item-top-row">
								<div class="item-left">
									<span class="cat-emoji-box">
										{{ getCategoryEmoji(item.name) }}
									</span>
									<span class="item-name">{{ item.name }}</span>
								</div>
								<div class="item-right">
									<span class="item-amount">¥{{ formatAmount(item.value) }}</span>
									<span
										class="item-percent"
										:style="{ color: item.color }"
									>
										{{ item.percent }}%
									</span>
								</div>
							</div>
							<div class="item-bar-track">
								<div
									class="item-bar-fill"
									:style="{
										width: `${Math.max(Number(item.percent), 3)}%`,
										backgroundColor: item.color,
									}"
								></div>
							</div>
						</div>
					</div>
				</div>
			</template>

			<!-- 态 3：空状态 -->
			<div
				v-else
				class="empty-structure-state"
			>
				<div class="empty-ring empty-ring--rose">
					<span class="ring-pct">0%</span>
					<span class="ring-sub">支出构成</span>
				</div>
				<span class="empty-text">当月暂无支出分类记录</span>
			</div>
		</div>

		<!-- 04 · 当月收入结构卡片 -->
		<div class="analysis-card">
			<div class="card-header-bar">
				<div class="header-left">
					<span class="dot dot--emerald"></span>
					<span class="card-title">收入结构</span>
					<span class="type-pill type-pill--emerald">流入</span>
				</div>
				<div
					v-if="analysisLoading"
					class="shimmer-bar sk-w-88 sk-h-18"
				></div>
				<span
					v-else
					class="card-total text-emerald"
				>
					¥{{ formatAmount(incomeTotal) }}
				</span>
			</div>

			<!-- 态 1：骨架屏 -->
			<div
				v-if="analysisLoading"
				class="structure-skeleton"
				data-testid="income-structure-skeleton"
			>
				<div class="sk-donut-wrap">
					<div class="sk-donut-ring"></div>
				</div>
				<div class="sk-legend-row">
					<div
						v-for="idx in 3"
						:key="`inc-leg-${idx}`"
						class="shimmer-bar sk-w-52 sk-h-12 sk-rounded-pill"
					></div>
				</div>
				<div class="sk-structure-list">
					<div
						v-for="idx in 3"
						:key="`inc-sk-row-${idx}`"
						class="sk-structure-row"
					>
						<div class="sk-row-top">
							<div class="sk-row-left">
								<div class="shimmer-bar sk-w-28 sk-h-28 sk-rounded-9"></div>
								<div class="shimmer-bar sk-w-60 sk-h-14"></div>
							</div>
							<div class="shimmer-bar sk-w-88 sk-h-14"></div>
						</div>
						<div class="shimmer-bar sk-w-full sk-h-6 sk-rounded-pill"></div>
					</div>
				</div>
			</div>

			<!-- 态 2：有数据 -->
			<template v-else-if="pieData.income.length > 0">
				<div class="chart-container">
					<base-chart
						:options="incomeOptions"
						width="100%"
						:height="incomeChartHeight"
					/>
				</div>

				<div class="data-detail">
					<div class="summary-header">
						<span class="summary-label">分类收入构成 (点击分类查看明细)</span>
					</div>
					<div class="structure-list">
						<div
							v-for="(item, index) in processedIncomeList"
							:key="item.name || index"
							class="structure-item"
							@click="goToFinanceManager(item.name, 'income')"
						>
							<div class="item-top-row">
								<div class="item-left">
									<span class="cat-emoji-box">
										{{ getCategoryEmoji(item.name) }}
									</span>
									<span class="item-name">{{ item.name }}</span>
								</div>
								<div class="item-right">
									<span class="item-amount">¥{{ formatAmount(item.value) }}</span>
									<span
										class="item-percent"
										:style="{ color: item.color }"
									>
										{{ item.percent }}%
									</span>
								</div>
							</div>
							<div class="item-bar-track">
								<div
									class="item-bar-fill"
									:style="{
										width: `${Math.max(Number(item.percent), 3)}%`,
										backgroundColor: item.color,
									}"
								></div>
							</div>
						</div>
					</div>
				</div>
			</template>

			<!-- 态 3：空状态 -->
			<div
				v-else
				class="empty-structure-state"
			>
				<div class="empty-ring empty-ring--emerald">
					<span class="ring-pct">0%</span>
					<span class="ring-sub">收入构成</span>
				</div>
				<span class="empty-text">当月暂无收入分类记录</span>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { showNotify } from 'vant';
import type { FinanceDetail } from '@/views/selfFinance/financeAnalysis/financeAnalysisDetail/common';
import { getIncomeAndExpense } from '@/views/selfFinance/financeAnalysis/api';
import { getBudgetStatus } from '@/views/selfFinance/financeManager/api';
import { getCategoryEmoji, type FinanceBudgetStatusVo } from '@/views/selfFinance/financeManager/config';
import { triggerHaptic } from '@/utils/haptics';
import {
	loadPieSnapshot,
	savePieSnapshot,
} from '@/views/selfFinance/financeAnalysis/composables/useAnalysisOfflineCache';
import MobileAnalysisBudgetCard from '@/views/selfFinance/financeAnalysis/components/MobileAnalysisBudgetCard.vue';

interface Props {
	activeTab: number | string;
	dateStr: string;
	belongTo?: string | null;
}

const props = defineProps<Props>();
const router = useRouter();

// 饼图数据接口定义
interface PieChartData {
	name: string;
	value: number;
	typeCode?: string;
	color: string;
	bgColor: string;
	itemStyle: {
		color: string;
	};
}

// Tailwind Soft UI 语义色阶
const expensePalette = [
	{ color: '#f43f5e', bgColor: 'rgba(244, 63, 94, 0.1)' },
	{ color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.1)' },
	{ color: '#4f6af6', bgColor: 'rgba(79, 106, 246, 0.1)' },
	{ color: '#8b5cf6', bgColor: 'rgba(139, 92, 246, 0.1)' },
	{ color: '#06b6d4', bgColor: 'rgba(6, 182, 212, 0.1)' },
	{ color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.1)' },
	{ color: '#ec4899', bgColor: 'rgba(236, 72, 153, 0.1)' },
	{ color: '#0ea5e9', bgColor: 'rgba(14, 165, 233, 0.1)' },
];

const incomePalette = [
	{ color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.1)' },
	{ color: '#06b6d4', bgColor: 'rgba(6, 182, 212, 0.1)' },
	{ color: '#14b8a6', bgColor: 'rgba(20, 184, 166, 0.1)' },
	{ color: '#4f6af6', bgColor: 'rgba(79, 106, 246, 0.1)' },
	{ color: '#34d399', bgColor: 'rgba(52, 211, 153, 0.1)' },
];

// 统一管理收入和支出数据
const pieData = ref<{
	income: PieChartData[];
	expense: PieChartData[];
}>({
	income: [],
	expense: [],
});

// 收支分析与零钱预算加载态
const analysisLoading = ref<boolean>(false);
const budgetLoading = ref<boolean>(false);
const budgetStatus = ref<FinanceBudgetStatusVo | null>(null);

interface ProcessedStructureItem {
	name: string;
	value: number;
	percent: string;
	color: string;
	bgColor: string;
}

const formatAmount = (amount?: number) => {
	if (amount === undefined || amount === null) return '0.00';
	return Number(amount).toLocaleString(undefined, {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	});
};

// 将数据转换为饼图格式
const transformToPieData = (data: FinanceDetail[], type: 'income' | 'expense'): PieChartData[] => {
	const filtered = data?.filter((item) => item.incomeAndExpenses === type) || [];
	const paletteList = type === 'income' ? incomePalette : expensePalette;
	return filtered.map((item, index) => {
		const palette = paletteList[index % paletteList.length];
		return {
			name: item.typeCode || '未分类',
			value: Math.abs(Number(item.amount) || 0),
			typeCode: item.typeCode,
			color: palette.color,
			bgColor: palette.bgColor,
			itemStyle: {
				color: palette.color,
			},
		};
	});
};

const incomeTotal = computed(() => pieData.value.income.reduce((sum, item) => sum + (Number(item.value) || 0), 0));

const expenseTotal = computed(() => pieData.value.expense.reduce((sum, item) => sum + (Number(item.value) || 0), 0));

const netBalance = computed(() => incomeTotal.value - expenseTotal.value);

const savingsRateDisplay = computed(() => {
	if (incomeTotal.value <= 0) return '—';
	const rate = ((incomeTotal.value - expenseTotal.value) / incomeTotal.value) * 100;
	return `${rate.toFixed(1)}%`;
});

// 选中的图例
const selectedLegends = ref<Record<string, boolean>>({});

const handleLegendChange = (selected: Record<string, boolean>) => {
	selectedLegends.value = selected;
};

const processedExpenseList = computed<ProcessedStructureItem[]>(() => {
	const filtered = pieData.value.expense.filter((item) => {
		if (Object.keys(selectedLegends.value).length > 0) {
			return selectedLegends.value[item.name] !== false;
		}
		return true;
	});
	const total = filtered.reduce((sum, item) => sum + item.value, 0);
	return filtered
		.toSorted((a, b) => b.value - a.value)
		.slice(0, 6)
		.map((item) => ({
			name: item.name,
			value: item.value,
			percent: total ? ((item.value / total) * 100).toFixed(1) : '0.0',
			color: item.color,
			bgColor: item.bgColor,
		}));
});

const processedIncomeList = computed<ProcessedStructureItem[]>(() => {
	const list = pieData.value.income;
	const total = list.reduce((sum, item) => sum + item.value, 0);
	return list
		.toSorted((a, b) => b.value - a.value)
		.map((item) => ({
			name: item.name,
			value: item.value,
			percent: total ? ((item.value / total) * 100).toFixed(1) : '0.0',
			color: item.color,
			bgColor: item.bgColor,
		}));
});

// 计算图表高度
const getChartHeight = (dataLength: number) => {
	const baseHeight = 230;
	const rowCount = Math.ceil(dataLength / 4);
	const legendHeight = rowCount * 24;
	return `${baseHeight + legendHeight + 16}px`;
};

const incomeChartHeight = computed(() => getChartHeight(pieData.value.income.length));
const expenseChartHeight = computed(() => getChartHeight(pieData.value.expense.length));

// ECharts 通用配置
const commonChartOptions = {
	tooltip: {
		trigger: 'item',
		formatter: '{b}: ¥{c} ({d}%)',
	},
	legend: {
		top: '215',
		icon: 'roundRect',
		itemWidth: 16,
		itemHeight: 10,
		itemGap: 10,
		textStyle: {
			color: '#475569',
			fontSize: 11,
		},
	},
};

const incomeOptions = computed(() => ({
	...commonChartOptions,
	series: [
		{
			name: '收入',
			type: 'pie',
			radius: ['38%', '56%'],
			center: ['50%', '115px'],
			avoidLabelOverlap: true,
			minAngle: 5,
			itemStyle: {
				borderRadius: 6,
				borderColor: '#fff',
				borderWidth: 2,
			},
			label: {
				show: true,
				position: 'outside',
				formatter: '{b}',
				color: '#334155',
				fontSize: 11,
			},
			emphasis: {
				label: {
					show: true,
					fontSize: 14,
					fontWeight: 'bold',
				},
			},
			labelLine: {
				show: true,
				length: 12,
				length2: 8,
			},
			data: pieData.value.income,
		},
	],
}));

const expenseOptions = computed(() => ({
	...commonChartOptions,
	series: [
		{
			name: '支出',
			type: 'pie',
			radius: ['38%', '56%'],
			center: ['50%', '115px'],
			avoidLabelOverlap: true,
			minAngle: 5,
			itemStyle: {
				borderRadius: 6,
				borderColor: '#fff',
				borderWidth: 2,
			},
			label: {
				show: true,
				position: 'outside',
				formatter: '{b}',
				color: '#334155',
				fontSize: 11,
			},
			emphasis: {
				label: {
					show: true,
					fontSize: 14,
					fontWeight: 'bold',
				},
			},
			labelLine: {
				show: true,
				length: 12,
				length2: 8,
			},
			data: pieData.value.expense,
		},
	],
}));

const getIncomeAndExpenseInfo = async (userId: string | null, dateStr: string) => {
	analysisLoading.value = true;
	try {
		const { code, data, message } = await getIncomeAndExpense(userId, dateStr);
		if (code === '200') {
			const rawList = data || [];
			pieData.value = {
				income: transformToPieData(rawList, 'income'),
				expense: transformToPieData(rawList, 'expense'),
			};
			// 保存收支饼图离线快照
			const incomeList = rawList.filter((item) => item.incomeAndExpenses === 'income');
			const expenseList = rawList.filter((item) => item.incomeAndExpenses === 'expense');
			savePieSnapshot(incomeList, expenseList);
		} else {
			showNotify({ type: 'danger', message: message || '查询列表失败！' });
		}
	} finally {
		analysisLoading.value = false;
	}
};

const fetchBudgetStatusInfo = async (userId: string | null, dateStr: string) => {
	budgetLoading.value = true;
	try {
		const belongToParam = userId && userId !== '0' ? userId : undefined;
		const { code, data } = await getBudgetStatus(dateStr, belongToParam);
		if (code === '200' && data) {
			budgetStatus.value = data;
		} else {
			budgetStatus.value = null;
		}
	} catch {
		budgetStatus.value = null;
	} finally {
		budgetLoading.value = false;
	}
};

const goToBudgetManage = () => {
	triggerHaptic('light');
	const query: Record<string, string> = {};
	if (props.dateStr) query.month = props.dateStr;
	if (props.belongTo && props.belongTo !== '0') query.belongTo = String(props.belongTo);
	router.push({ path: '/finance/financeManager/budgetManage', query });
};

const goToFinanceManager = (categoryName?: string, direction?: 'income' | 'expense') => {
	triggerHaptic('light');
	const query: Record<string, string> = {};
	if (categoryName) query.typeCode = categoryName;
	if (direction) query.incomeAndExpenses = direction;
	if (props.belongTo && props.belongTo !== '0') query.belongTo = String(props.belongTo);
	router.push({ name: 'financeManager', query });
};

const init = (dateStr: string, belongTo: string | null) => {
	// SWR 优先从本地快照还原饼图数据，消除切换 Tab 时的白屏感
	const snapshot = loadPieSnapshot();
	if (
		snapshot &&
		(snapshot.income.length > 0 || snapshot.expense.length > 0) &&
		pieData.value.income.length === 0 &&
		pieData.value.expense.length === 0
	) {
		pieData.value = {
			income: transformToPieData(snapshot.income, 'income'),
			expense: transformToPieData(snapshot.expense, 'expense'),
		};
	}
	getIncomeAndExpenseInfo(belongTo, dateStr);
	fetchBudgetStatusInfo(belongTo, dateStr);
};

watch(
	() => [props.activeTab, props.dateStr, props.belongTo],
	() => {
		if (props.activeTab === '2' && props.dateStr) {
			init(props.dateStr, props.belongTo ?? '');
		}
	},
	{ immediate: true },
);
</script>

<style lang="less" scoped>
.analysis-container {
	box-sizing: border-box;
	padding: 14px 16px 28px;
	background-color: #f1f4fa;
	min-height: 100%;
}

.monthly-kpi-card {
	background: linear-gradient(145deg, #eef2ff 0%, #ffffff 60%, #f8fafc 100%);
	border-radius: 18px;
	padding: 16px;
	margin-bottom: 14px;
	box-shadow: 0 4px 16px rgba(15, 23, 42, 0.04);

	.kpi-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 12px;
	}

	.kpi-title-group {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.kpi-icon-box {
		width: 24px;
		height: 24px;
		border-radius: 8px;
		background: rgba(79, 106, 246, 0.12);
		color: #4f6af6;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-size: 14px;
	}

	.kpi-title {
		font-size: 15px;
		font-weight: 700;
		color: #0f172a;
	}

	.kpi-status-pill {
		font-size: 11px;
		font-weight: 600;
		padding: 2px 9px;
		border-radius: 9999px;

		&--deficit {
			background: rgba(244, 63, 94, 0.12);
			color: #e11d48;
		}
		&--surplus {
			background: rgba(16, 185, 129, 0.12);
			color: #059669;
		}
		&--neutral {
			background: #f1f5f9;
			color: #64748b;
		}
	}

	.kpi-net-box {
		background: #ffffff;
		border-radius: 14px;
		padding: 12px 14px;
		margin-bottom: 10px;
		box-shadow: 0 1px 4px rgba(79, 106, 246, 0.05);

		.net-top {
			display: flex;
			align-items: center;
			justify-content: space-between;
			font-size: 12px;
			color: #64748b;
		}

		.net-formula {
			font-size: 10px;
			color: #94a3b8;
		}

		.net-amount {
			font-size: 26px;
			font-weight: 800;
			font-variant-numeric: tabular-nums;
			margin: 6px 0 8px;
			line-height: 1.15;

			.currency {
				font-size: 15px;
				margin-right: 1px;
			}
			&.text-rose {
				color: #e11d48;
			}
			&.text-emerald {
				color: #059669;
			}
			&.text-slate {
				color: #0f172a;
			}
		}

		.net-footer {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding-top: 8px;
			border-top: 1px solid #f1f5f9;
			font-size: 11px;
			color: #64748b;
		}

		.saving-right {
			display: flex;
			align-items: center;
			gap: 6px;
		}

		.saving-val {
			font-weight: 700;
			color: #0f172a;
			font-variant-numeric: tabular-nums;
		}

		.deficit-tag {
			font-size: 10px;
			font-weight: 600;
			padding: 1px 7px;
			border-radius: 9999px;
			background: rgba(244, 63, 94, 0.1);
			color: #e11d48;
		}
	}

	.kpi-subgrid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 10px;
	}

	.kpi-subcard {
		border-radius: 14px;
		padding: 11px 12px;

		&--income {
			background: rgba(16, 185, 129, 0.08);
		}
		&--expense {
			background: rgba(244, 63, 94, 0.08);
		}

		.sub-top {
			display: flex;
			align-items: center;
			justify-content: space-between;
			margin-bottom: 4px;
		}

		.sub-label {
			font-size: 11px;
			color: #475569;
			font-weight: 500;
		}

		.sub-tag {
			font-size: 9px;
			font-weight: 600;
			padding: 1px 6px;
			border-radius: 9999px;

			&--income {
				background: rgba(16, 185, 129, 0.14);
				color: #059669;
			}
			&--expense {
				background: rgba(244, 63, 94, 0.14);
				color: #e11d48;
			}
		}

		.sub-amount {
			font-size: 16px;
			font-weight: 800;
			font-variant-numeric: tabular-nums;

			&.text-emerald {
				color: #059669;
			}
			&.text-rose {
				color: #e11d48;
			}
		}
	}
}

.analysis-card {
	background: #ffffff;
	border-radius: 18px;
	padding: 16px;
	margin-bottom: 14px;
	box-shadow: 0 4px 16px rgba(15, 23, 42, 0.04);

	.card-header-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-bottom: 12px;
		margin-bottom: 8px;
		border-bottom: 1px solid #f1f5f9;

		.header-left {
			display: flex;
			align-items: center;
			gap: 7px;
		}

		.dot {
			width: 8px;
			height: 8px;
			border-radius: 9999px;

			&--rose {
				background: #f43f5e;
			}
			&--emerald {
				background: #10b981;
			}
		}

		.card-title {
			font-size: 15px;
			font-weight: 700;
			color: #0f172a;
		}

		.type-pill {
			font-size: 10px;
			font-weight: 600;
			padding: 2px 8px;
			border-radius: 9999px;

			&--rose {
				background: rgba(244, 63, 94, 0.1);
				color: #e11d48;
			}
			&--emerald {
				background: rgba(16, 185, 129, 0.1);
				color: #059669;
			}
		}

		.card-total {
			font-size: 16px;
			font-weight: 800;
			font-variant-numeric: tabular-nums;

			&.text-rose {
				color: #e11d48;
			}
			&.text-emerald {
				color: #059669;
			}
		}
	}

	.data-detail {
		margin-top: 8px;

		.summary-header {
			margin-bottom: 10px;
			font-size: 12px;
			font-weight: 600;
			color: #64748b;
		}
	}

	.structure-list {
		display: flex;
		flex-direction: column;
		gap: 12px;

		.structure-item {
			cursor: pointer;
			padding: 4px 2px;

			.item-top-row {
				display: flex;
				align-items: center;
				justify-content: space-between;
				margin-bottom: 6px;
				gap: 8px;
			}

			.item-left {
				display: flex;
				align-items: center;
				gap: 8px;
				min-width: 0;

				.cat-emoji-box {
					width: 28px;
					height: 28px;
					border-radius: 9px;
					background: #f8fafc;
					display: inline-flex;
					align-items: center;
					justify-content: center;
					font-size: 14px;
					flex-shrink: 0;
				}

				.item-name {
					font-size: 13px;
					font-weight: 600;
					color: #1e293b;
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;
				}
			}

			.item-right {
				display: flex;
				align-items: baseline;
				gap: 8px;
				font-variant-numeric: tabular-nums;
				flex-shrink: 0;

				.item-amount {
					font-size: 13px;
					font-weight: 700;
					color: #0f172a;
				}

				.item-percent {
					font-size: 11px;
					font-weight: 600;
					width: 40px;
					text-align: right;
				}
			}

			.item-bar-track {
				width: 100%;
				height: 6px;
				background: #f1f5f9;
				border-radius: 9999px;
				overflow: hidden;
			}

			.item-bar-fill {
				height: 100%;
				border-radius: 9999px;
				transition: width 0.3s ease;
			}
		}
	}

	.empty-structure-state {
		padding: 24px 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10px;

		.empty-ring {
			width: 96px;
			height: 96px;
			border-radius: 9999px;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;

			&--rose {
				border: 9px solid rgba(244, 63, 94, 0.12);
				.ring-pct {
					color: #e11d48;
				}
			}
			&--emerald {
				border: 9px solid rgba(16, 185, 129, 0.12);
				.ring-pct {
					color: #059669;
				}
			}

			.ring-pct {
				font-size: 16px;
				font-weight: 800;
				font-variant-numeric: tabular-nums;
			}

			.ring-sub {
				font-size: 10px;
				color: #94a3b8;
			}
		}

		.empty-text {
			font-size: 12px;
			color: #94a3b8;
		}
	}

	.structure-skeleton {
		padding: 12px 0 4px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 14px;

		.sk-donut-wrap {
			height: 150px;
			display: flex;
			align-items: center;
			justify-content: center;
		}

		.sk-donut-ring {
			width: 124px;
			height: 124px;
			border-radius: 9999px;
			border: 18px solid #e2e8f0;
			box-sizing: border-box;
			animation: analysisPulse 1.4s ease-in-out infinite;
		}

		.sk-legend-row {
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 8px;
			flex-wrap: wrap;
		}

		.sk-structure-list {
			width: 100%;
			display: flex;
			flex-direction: column;
			gap: 12px;
			margin-top: 4px;
		}

		.sk-structure-row {
			display: flex;
			flex-direction: column;
			gap: 6px;
		}

		.sk-row-top {
			display: flex;
			align-items: center;
			justify-content: space-between;
		}

		.sk-row-left {
			display: flex;
			align-items: center;
			gap: 8px;
		}
	}
}

.shimmer-bar {
	border-radius: 6px;
	background: #e2e8f0;
	animation: analysisPulse 1.4s ease-in-out infinite;
}

.sk-w-28 {
	width: 28px;
}
.sk-w-52 {
	width: 52px;
}
.sk-w-60 {
	width: 60px;
}
.sk-w-72 {
	width: 72px;
}
.sk-w-88 {
	width: 88px;
}
.sk-w-140 {
	width: 140px;
}
.sk-w-full {
	width: 100%;
}
.sk-h-6 {
	height: 6px;
}
.sk-h-12 {
	height: 12px;
}
.sk-h-14 {
	height: 14px;
}
.sk-h-18 {
	height: 18px;
}
.sk-h-20 {
	height: 20px;
}
.sk-h-28 {
	height: 28px;
}
.sk-mt-4 {
	margin-top: 4px;
}
.sk-my-8 {
	margin: 8px 0;
}
.sk-rounded-9 {
	border-radius: 9px;
}
.sk-rounded-pill {
	border-radius: 9999px;
}

@keyframes analysisPulse {
	0%,
	100% {
		opacity: 1;
	}
	50% {
		opacity: 0.45;
	}
}
</style>
