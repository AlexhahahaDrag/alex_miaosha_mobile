<template>
	<div class="income-detail">
		<!-- 01 · 收支趋势分析卡片 (日/月 Segmented 一键切换 + 真实峰值汇总) -->
		<div class="chart-card">
			<div class="card-header">
				<div class="header-left">
					<span class="dot dot--indigo"></span>
					<span class="card-title">
						{{ trendMode === 'day' ? '当月日消费趋势' : '月度消费走势' }}
					</span>
				</div>

				<!-- Segmented Control: 当月日趋势 / 月度趋势 -->
				<div class="trend-segment">
					<button
						type="button"
						:class="['seg-btn', { active: trendMode === 'day' }]"
						data-testid="trend-mode-day"
						@click="switchTrendMode('day')"
					>
						日趋势
					</button>
					<button
						type="button"
						:class="['seg-btn', { active: trendMode === 'month' }]"
						data-testid="trend-mode-month"
						@click="switchTrendMode('month')"
					>
						月趋势
					</button>
				</div>
			</div>

			<!-- 真实数据摘要胶囊栏 (替代原写死的 +5.2%) -->
			<div class="chart-meta-row">
				<template v-if="detailLoading">
					<div class="shimmer-bar sk-w-120 sk-h-24 sk-rounded-pill"></div>
					<div class="shimmer-bar sk-w-132 sk-h-24 sk-rounded-pill"></div>
				</template>
				<template v-else>
					<div class="meta-pill">
						<span class="meta-label">区间累计</span>
						<strong class="meta-val">¥{{ formatAmount(currentTotalAmount) }}</strong>
					</div>
					<div
						v-if="currentPeakItem"
						class="meta-pill meta-pill--peak"
					>
						<span class="meta-label">峰值 ({{ currentPeakItem.label }})</span>
						<strong class="meta-val text-rose">¥{{ formatAmount(currentPeakItem.value) }}</strong>
					</div>
				</template>
			</div>

			<!-- 态 1：走势图流光骨架屏 -->
			<div
				v-if="detailLoading"
				class="chart-skeleton"
				data-testid="income-detail-skeleton"
			>
				<div class="sk-bars-area">
					<div
						v-for="(barH, idx) in skeletonBarHeights"
						:key="`trend-sk-bar-${idx}`"
						class="sk-bar-col"
					>
						<div
							class="shimmer-bar sk-bar-fill"
							:style="{ height: `${barH}%` }"
						></div>
						<div class="shimmer-bar sk-w-16 sk-h-8 sk-rounded-4"></div>
					</div>
				</div>
			</div>
			<!-- 态 2：真实走势图 -->
			<div
				v-else
				class="chart-container"
			>
				<base-chart
					height="210px"
					width="100%"
					:options="trendMode === 'day' ? dayChartOptions : monthChartOptions"
				/>
			</div>
		</div>

		<!-- 02 · 近期高额消费列表 (带分类 Emoji 与点击下钻账单流水) -->
		<div class="section-bar">
			<div class="section-bar-left">
				<span class="section-dot"></span>
				<span class="section-title">当月高额消费 Top 榜</span>
				<div
					v-if="detailLoading"
					class="shimmer-bar sk-w-40 sk-h-18 sk-rounded-pill"
				></div>
				<span
					v-else
					class="section-count"
				>
					{{ highValueList.length }} 笔
				</span>
			</div>
			<button
				type="button"
				class="all-records-link"
				@click="goToFinanceManager()"
			>
				<span>全部账单</span>
				<van-icon name="arrow" />
			</button>
		</div>

		<!-- 态 1：高额消费列表流光骨架屏 -->
		<div
			v-if="detailLoading"
			class="high-value-list"
			data-testid="high-value-list-skeleton"
		>
			<div
				v-for="idx in 4"
				:key="`hv-sk-${idx}`"
				class="list-item list-item--skeleton"
			>
				<div class="item-left">
					<div class="shimmer-bar sk-w-40 sk-h-40 sk-rounded-12"></div>
					<div class="item-info">
						<div class="item-name-row">
							<div class="shimmer-bar sk-w-72 sk-h-14"></div>
							<div class="shimmer-bar sk-w-36 sk-h-14 sk-rounded-pill"></div>
						</div>
						<div class="shimmer-bar sk-w-88 sk-h-10 sk-mt-4"></div>
					</div>
				</div>
				<div class="item-right">
					<div class="shimmer-bar sk-w-80 sk-h-16"></div>
					<div class="shimmer-bar sk-w-52 sk-h-10 sk-mt-6 sk-ml-auto"></div>
				</div>
			</div>
		</div>
		<!-- 态 2：有数据 -->
		<div
			v-else-if="highValueList.length > 0"
			class="high-value-list"
		>
			<div
				v-for="(item, index) in highValueList"
				:key="index"
				class="list-item"
				@click="goToFinanceManager(item.name)"
			>
				<div class="item-left">
					<div
						class="icon-box"
						:style="{ background: item.bgColor }"
					>
						<span class="emoji-icon">{{ getCategoryEmoji(item.name) }}</span>
					</div>
					<div class="item-info">
						<div class="item-name-row">
							<span class="item-name">{{ item.name }}</span>
							<span class="rank-pill">TOP {{ index + 1 }}</span>
						</div>
						<div class="item-date">{{ item.date }}</div>
					</div>
				</div>
				<div class="item-right">
					<div class="item-amount">-¥{{ formatAmount(item.value) }}</div>
					<div class="item-drill-hint">查看流水 ›</div>
				</div>
			</div>
		</div>
		<div
			v-else
			class="empty-high-value"
		>
			当月暂无消费明细记录
		</div>
	</div>
</template>

<script lang="ts" setup>
import { getDayExpense, getMonthExpense, getIncomeAndExpense } from '@/views/selfFinance/financeAnalysis/api';
import { getCategoryEmoji } from '@/views/selfFinance/financeManager/config';
import { triggerHaptic } from '@/utils/haptics';
import {
	loadTrendSnapshot,
	saveTrendSnapshot,
} from '@/views/selfFinance/financeAnalysis/composables/useAnalysisOfflineCache';

interface Props {
	activeTab: number | string;
	dateStr: string;
	belongTo?: string | null;
}

interface HighValueItem {
	name: string;
	value: number;
	date: string;
	color: string;
	bgColor: string;
}

const props = defineProps<Props>();
const router = useRouter();

// State
const detailLoading = ref<boolean>(false);
const trendMode = ref<'day' | 'month'>('day');
const dayData = ref<{ date: string; value: number }[]>([]);
const monthData = ref<{ date: string; value: number }[]>([]);
const highValueList = ref<HighValueItem[]>([]);
const skeletonBarHeights = [32, 58, 24, 76, 44, 90, 38, 64, 28, 52];

// Tailwind Soft UI Color Palette
const colorPalette = [
	{ color: '#f43f5e', bgColor: 'rgba(244, 63, 94, 0.1)' },
	{ color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.12)' },
	{ color: '#4f6af6', bgColor: 'rgba(79, 106, 246, 0.1)' },
	{ color: '#8b5cf6', bgColor: 'rgba(139, 92, 246, 0.1)' },
	{ color: '#06b6d4', bgColor: 'rgba(6, 182, 212, 0.1)' },
];

const formatAmount = (val?: number) => {
	if (val === undefined || val === null) return '0.00';
	return Number(val).toLocaleString(undefined, {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	});
};

const switchTrendMode = (mode: 'day' | 'month') => {
	triggerHaptic('selection');
	trendMode.value = mode;
};

const activeSeriesList = computed(() => (trendMode.value === 'day' ? dayData.value : monthData.value));

const currentTotalAmount = computed(() =>
	activeSeriesList.value.reduce((sum, item) => sum + (Number(item.value) || 0), 0),
);

const currentPeakItem = computed(() => {
	const valid = activeSeriesList.value.filter((item) => (Number(item.value) || 0) > 0);
	if (valid.length === 0) return null;
	const peak = valid.reduce((max, cur) => (cur.value > max.value ? cur : max), valid[0]);
	const rawDate = peak.date || '';
	const label = trendMode.value === 'day' ? `${rawDate.slice(-2)}日` : `${parseInt(rawDate.slice(-2) || '1', 10)}月`;
	return {
		label,
		value: peak.value,
	};
});

// Chart Options
const dayChartOptions = computed(() => ({
	grid: { top: 20, right: 14, bottom: 22, left: 38, containLabel: false },
	tooltip: {
		trigger: 'axis',
		axisPointer: { type: 'shadow' },
	},
	xAxis: {
		type: 'category',
		data: dayData.value.map((item) => item.date.slice(-2)),
		axisLine: { lineStyle: { color: '#e2e8f0' } },
		axisTick: { show: false },
		axisLabel: { color: '#64748b', fontSize: 10 },
	},
	yAxis: {
		type: 'value',
		splitLine: { lineStyle: { type: 'dashed', color: '#f1f5f9' } },
		axisLabel: {
			color: '#64748b',
			fontSize: 10,
			formatter: (value: number) => (value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value),
		},
	},
	series: [
		{
			data: dayData.value.map((item) => item.value),
			type: 'bar',
			barWidth: 8,
			showSymbol: false,
			itemStyle: {
				color: '#f43f5e',
				borderRadius: [4, 4, 0, 0],
			},
		},
	],
}));

const monthChartOptions = computed(() => ({
	grid: { top: 20, right: 14, bottom: 22, left: 38, containLabel: false },
	tooltip: { trigger: 'axis' },
	xAxis: {
		type: 'category',
		data: monthData.value.map((item) => `${parseInt(item.date.slice(-2) || '1', 10)}月`),
		axisLine: { lineStyle: { color: '#e2e8f0' } },
		axisTick: { show: false },
		axisLabel: { color: '#64748b', fontSize: 10 },
	},
	yAxis: {
		type: 'value',
		splitLine: { lineStyle: { type: 'dashed', color: '#f1f5f9' } },
		axisLabel: {
			color: '#64748b',
			fontSize: 10,
			formatter: (value: number) => (value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value),
		},
	},
	series: [
		{
			data: monthData.value.map((item) => item.value),
			type: 'line',
			smooth: true,
			symbol: 'circle',
			symbolSize: 7,
			itemStyle: { color: '#4f6af6', borderWidth: 2, borderColor: '#fff' },
			lineStyle: { color: '#4f6af6', width: 3 },
			areaStyle: {
				color: {
					type: 'linear',
					x: 0,
					y: 0,
					x2: 0,
					y2: 1,
					colorStops: [
						{ offset: 0, color: 'rgba(79, 106, 246, 0.24)' },
						{ offset: 1, color: 'rgba(79, 106, 246, 0)' },
					],
				},
			},
		},
	],
}));

// 提取单条记录的真实消费金额（兼容后端返回 expenseAmount 或带符号 amount）
const resolveExpenseValue = (item: { amount?: number; expenseAmount?: number; incomeAmount?: number }): number => {
	if (item.expenseAmount !== undefined && item.expenseAmount !== null) {
		return Math.max(0, Number(item.expenseAmount) || 0);
	}
	const val = Number(item.amount) || 0;
	return val > 0 ? val : 0;
};

// API Calls
const fetchData = async (userId: string | null, dateStr: string) => {
	detailLoading.value = true;
	try {
		const [dayRes, monthRes, listRes] = await Promise.all([
			getDayExpense(userId, dateStr),
			getMonthExpense(userId, dateStr),
			getIncomeAndExpense(userId, dateStr),
		]);

		// Day Expense
		if (dayRes.code === '200' && dayRes.data) {
			dayData.value = dayRes.data.map((item) => ({
				date: item.infoDate?.toString() || '',
				value: resolveExpenseValue(item),
			}));
		}

		// Month Expense
		if (monthRes.code === '200' && monthRes.data) {
			monthData.value = monthRes.data.map((item) => ({
				date: item.infoDate?.toString() || '',
				value: resolveExpenseValue(item),
			}));
		}

		// 持久化日/月消费走势图离线快照
		if (dayRes.code === '200' && monthRes.code === '200') {
			saveTrendSnapshot(dayRes.data || [], monthRes.data || []);
		}

		// High Value List
		if (listRes.code === '200' && listRes.data) {
			highValueList.value = (listRes.data || [])
				.filter((item) => item.incomeAndExpenses === 'expense')
				.sort((a, b) => (b.amount || 0) - (a.amount || 0))
				.slice(0, 5)
				.map((item, index) => {
					const palette = colorPalette[index % colorPalette.length];
					return {
						name: item.typeCode || '消费',
						value: Math.abs(Number(item.amount) || 0),
						date: item.infoDate?.toString() || props.dateStr,
						color: palette.color,
						bgColor: palette.bgColor,
					};
				});
		}
	} finally {
		detailLoading.value = false;
	}
};

const goToFinanceManager = (categoryName?: string) => {
	triggerHaptic('light');
	const query: Record<string, string> = {};
	if (categoryName) query.typeCode = categoryName;
	if (props.belongTo && props.belongTo !== '0') {
		query.belongTo = String(props.belongTo);
	}
	router.push({ name: 'financeManager', query });
};

const init = (dateStr: string, belongTo: string | null) => {
	// SWR 优先从本地快照还原走势图数据，消除切换 Tab 或进页面时的白屏感
	const snapshot = loadTrendSnapshot();
	if (
		snapshot &&
		(snapshot.dayList.length > 0 || snapshot.monthList.length > 0) &&
		dayData.value.length === 0 &&
		monthData.value.length === 0
	) {
		dayData.value = snapshot.dayList.map((item) => ({
			date: item.infoDate?.toString() || '',
			value: resolveExpenseValue(item),
		}));
		monthData.value = snapshot.monthList.map((item) => ({
			date: item.infoDate?.toString() || '',
			value: resolveExpenseValue(item),
		}));
	}
	fetchData(belongTo, dateStr);
};

watch(
	() => [props.activeTab, props.dateStr, props.belongTo],
	() => {
		if (props.activeTab === '3') {
			init(props.dateStr, props.belongTo || null);
		}
	},
	{ immediate: true },
);
</script>

<style lang="less" scoped>
.income-detail {
	box-sizing: border-box;
	padding: 14px 16px 28px;
	background-color: #f1f4fa;
	min-height: 100%;

	.chart-card {
		background: #ffffff;
		border-radius: 18px;
		padding: 16px;
		margin-bottom: 18px;
		box-shadow: 0 4px 16px rgba(15, 23, 42, 0.04);

		.card-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 12px;
			gap: 8px;

			.header-left {
				display: flex;
				align-items: center;
				gap: 7px;
			}

			.dot {
				width: 8px;
				height: 8px;
				border-radius: 9999px;

				&--indigo {
					background: #4f6af6;
				}
			}

			.card-title {
				font-size: 15px;
				font-weight: 700;
				color: #0f172a;
			}

			.trend-segment {
				display: inline-flex;
				align-items: center;
				background: #eef2f9;
				padding: 3px;
				border-radius: 10px;
				gap: 2px;

				.seg-btn {
					border: none;
					background: transparent;
					color: #64748b;
					font-size: 11px;
					font-weight: 600;
					padding: 4px 10px;
					border-radius: 8px;
					cursor: pointer;
					transition: all 0.15s ease;

					&.active {
						background: #ffffff;
						color: #4f6af6;
						box-shadow: 0 1px 4px rgba(79, 106, 246, 0.12);
					}
				}
			}
		}

		.chart-meta-row {
			display: flex;
			align-items: center;
			gap: 8px;
			margin-bottom: 10px;
			flex-wrap: wrap;

			.meta-pill {
				background: #f8fafc;
				padding: 4px 10px;
				border-radius: 9999px;
				font-size: 11px;
				color: #64748b;
				display: inline-flex;
				align-items: center;
				gap: 5px;

				.meta-val {
					font-weight: 700;
					color: #0f172a;
					font-variant-numeric: tabular-nums;

					&.text-rose {
						color: #e11d48;
					}
				}
			}
		}

		.chart-container {
			height: 210px;
		}

		.chart-skeleton {
			height: 210px;
			display: flex;
			align-items: flex-end;
			padding: 18px 8px 10px;
			box-sizing: border-box;

			.sk-bars-area {
				width: 100%;
				height: 100%;
				display: grid;
				grid-template-columns: repeat(10, 1fr);
				align-items: end;
				gap: 10px;
			}

			.sk-bar-col {
				height: 100%;
				display: flex;
				flex-direction: column;
				justify-content: flex-end;
				align-items: center;
				gap: 8px;
			}

			.sk-bar-fill {
				width: 10px;
				border-radius: 6px 6px 2px 2px;
			}
		}
	}

	.section-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin: 4px 2px 10px;

		.section-bar-left {
			display: flex;
			align-items: center;
			gap: 7px;
		}

		.section-dot {
			width: 8px;
			height: 8px;
			border-radius: 9999px;
			background: #f43f5e;
		}

		.section-title {
			font-size: 15px;
			color: #0f172a;
			font-weight: 700;
		}

		.section-count {
			font-size: 11px;
			font-weight: 600;
			padding: 2px 8px;
			border-radius: 9999px;
			background: rgba(244, 63, 94, 0.1);
			color: #e11d48;
		}

		.all-records-link {
			border: none;
			background: transparent;
			padding: 0;
			color: #4f6af6;
			font-size: 12px;
			font-weight: 600;
			display: inline-flex;
			align-items: center;
			gap: 2px;
			cursor: pointer;
		}
	}

	.high-value-list {
		display: flex;
		flex-direction: column;
		gap: 10px;

		.list-item {
			background: #ffffff;
			border-radius: 18px;
			padding: 14px 16px;
			display: flex;
			justify-content: space-between;
			align-items: center;
			box-shadow: 0 4px 16px rgba(15, 23, 42, 0.04);
			cursor: pointer;
			transition: transform 0.15s ease;

			&:active {
				transform: scale(0.985);
			}

			.item-left {
				display: flex;
				align-items: center;
				gap: 12px;
				min-width: 0;

				.icon-box {
					width: 40px;
					height: 40px;
					border-radius: 12px;
					display: flex;
					align-items: center;
					justify-content: center;
					flex-shrink: 0;

					.emoji-icon {
						font-size: 18px;
						line-height: 1;
					}
				}

				.item-info {
					display: flex;
					flex-direction: column;
					gap: 3px;
					min-width: 0;

					.item-name-row {
						display: flex;
						align-items: center;
						gap: 6px;
					}

					.item-name {
						font-size: 14px;
						font-weight: 700;
						color: #0f172a;
						overflow: hidden;
						text-overflow: ellipsis;
						white-space: nowrap;
					}

					.rank-pill {
						font-size: 9px;
						font-weight: 700;
						padding: 1px 6px;
						border-radius: 9999px;
						background: #f1f5f9;
						color: #64748b;
						flex-shrink: 0;
					}

					.item-date {
						font-size: 11px;
						color: #94a3b8;
						font-variant-numeric: tabular-nums;
					}
				}
			}

			.item-right {
				text-align: right;
				flex-shrink: 0;

				.item-amount {
					font-size: 15px;
					font-weight: 800;
					color: #e11d48;
					font-variant-numeric: tabular-nums;
				}

				.item-drill-hint {
					font-size: 10px;
					color: #94a3b8;
					margin-top: 2px;
				}
			}
		}
	}

	.empty-high-value {
		background: #ffffff;
		border-radius: 18px;
		padding: 32px 16px;
		text-align: center;
		font-size: 12px;
		color: #94a3b8;
		box-shadow: 0 4px 16px rgba(15, 23, 42, 0.04);
	}
}

.shimmer-bar {
	border-radius: 6px;
	background: #e2e8f0;
	animation: detailShimmer 1.4s ease-in-out infinite;
}

.sk-w-16 {
	width: 16px;
}
.sk-w-36 {
	width: 36px;
}
.sk-w-40 {
	width: 40px;
}
.sk-w-52 {
	width: 52px;
}
.sk-w-72 {
	width: 72px;
}
.sk-w-80 {
	width: 80px;
}
.sk-w-88 {
	width: 88px;
}
.sk-w-120 {
	width: 120px;
}
.sk-w-132 {
	width: 132px;
}
.sk-h-8 {
	height: 8px;
}
.sk-h-10 {
	height: 10px;
}
.sk-h-14 {
	height: 14px;
}
.sk-h-16 {
	height: 16px;
}
.sk-h-18 {
	height: 18px;
}
.sk-h-24 {
	height: 24px;
}
.sk-h-40 {
	height: 40px;
}
.sk-mt-4 {
	margin-top: 4px;
}
.sk-mt-6 {
	margin-top: 6px;
}
.sk-ml-auto {
	margin-left: auto;
}
.sk-rounded-4 {
	border-radius: 4px;
}
.sk-rounded-12 {
	border-radius: 12px;
}
.sk-rounded-pill {
	border-radius: 9999px;
}

@keyframes detailShimmer {
	0%,
	100% {
		opacity: 1;
	}
	50% {
		opacity: 0.45;
	}
}
</style>
