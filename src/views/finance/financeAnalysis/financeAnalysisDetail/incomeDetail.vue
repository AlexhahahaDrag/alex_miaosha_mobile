<template>
	<div class="income-detail">
		<div class="chart-card">
			<div class="card-header">
				<div class="card-title">日消费</div>
				<div class="card-tag">单位: 元</div>
			</div>
			<div class="chart-container">
				<base-chart
					height="200px"
					width="100%"
					:options="dayChartOptions"
				/>
			</div>
		</div>

		<div class="chart-card">
			<div class="card-header">
				<div class="card-title">月消费</div>
				<div class="card-tag trend">趋势: +5.2%</div>
			</div>
			<div class="chart-container">
				<base-chart
					height="200px"
					width="100%"
					:options="monthChartOptions"
				/>
			</div>
		</div>

		<div class="section-title">近期高额消费</div>
		<div class="high-value-list">
			<div
				v-for="(item, index) in highValueList"
				:key="index"
				class="list-item"
			>
				<div class="item-left">
					<div
						class="icon-box"
						:style="{ background: item.bgColor }"
					>
						<van-icon
							v-if="item.icon"
							:name="item.icon"
							:color="item.color"
							size="20"
						/>
						<div
							v-else
							:style="{
								width: '8px',
								height: '8px',
								borderRadius: '50%',
								background: item.color,
							}"
						></div>
					</div>
					<div class="item-info">
						<div class="item-name">{{ item.name }}</div>
						<div class="item-date">{{ item.date }}</div>
					</div>
				</div>
				<div class="item-amount">-{{ item.value.toLocaleString(undefined, { minimumFractionDigits: 2 }) }}</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { getDayExpense, getMonthExpense, getIncomeAndExpense } from '@/views/finance/financeAnalysis/api';

interface Props {
	activeTab: number | string;
	dateStr: string;
	belongTo?: string | null;
}

const props = defineProps<Props>();

// State
const dayData = ref<{ date: string; value: number }[]>([]);
const monthData = ref<{ date: string; value: number }[]>([]);
const highValueList = ref<any[]>([]);

// Color Palette
const colorPalette = [
	{ color: '#FF7D00', bgColor: '#FFF7E6' },
	{ color: '#F5222D', bgColor: '#FFF1F0' },
	{ color: '#722ED1', bgColor: '#F9F0FF' },
	{ color: '#4080FF', bgColor: '#F0F5FF' },
	{ color: '#00C1DE', bgColor: '#E6FFFB' },
];

// Helper: Get Icon
const getIcon = (name: string) => {
	const iconMap: Record<string, string> = {
		餐饮: 'fire-o',
		购物: 'bag-o',
		交通: 'logistics',
		娱乐: 'music',
		微信: 'wechat',
		支付宝: 'alipay',
		京东: 'bag-o',
		话费: 'phone-o',
	};
	for (const key in iconMap) {
		if (name.includes(key)) return iconMap[key];
	}
	return '';
};

// Chart Options
const dayChartOptions = computed(() => ({
	grid: { top: 30, right: 20, bottom: 20, left: 40, containLabel: false },
	tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
	xAxis: {
		type: 'category',
		data: dayData.value.map((item) => item.date.slice(-2)), // Show DD
		axisLine: { lineStyle: { color: '#E5E5E5' } },
		axisTick: { show: false },
		axisLabel: { color: '#8c8c8c', fontSize: 10 },
	},
	yAxis: {
		type: 'value',
		splitLine: { lineStyle: { type: 'dashed', color: '#E5E5E5' } },
		axisLabel: {
			color: '#8c8c8c',
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
				color: '#F5222D',
				borderRadius: [4, 4, 0, 0],
			},
		},
	],
}));

const monthChartOptions = computed(() => ({
	grid: { top: 30, right: 20, bottom: 20, left: 40, containLabel: false },
	tooltip: { trigger: 'axis' },
	xAxis: {
		type: 'category',
		data: monthData.value.map((item) => `${parseInt(item.date.slice(-2))}月`),
		axisLine: { lineStyle: { color: '#E5E5E5' } },
		axisTick: { show: false },
		axisLabel: { color: '#8c8c8c', fontSize: 10 },
	},
	yAxis: {
		type: 'value',
		splitLine: { lineStyle: { type: 'dashed', color: '#E5E5E5' } },
		axisLabel: {
			color: '#8c8c8c',
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
			symbolSize: 8,
			itemStyle: { color: '#4080FF', borderWidth: 2, borderColor: '#fff' },
			lineStyle: { color: '#4080FF', width: 3 },
			areaStyle: {
				color: {
					type: 'linear',
					x: 0,
					y: 0,
					x2: 0,
					y2: 1,
					colorStops: [
						{ offset: 0, color: 'rgba(64, 128, 255, 0.2)' },
						{ offset: 1, color: 'rgba(64, 128, 255, 0)' },
					],
				},
			},
		},
	],
}));

// API Calls
const fetchData = async (userId: number | string | null, dateStr: string) => {
	const [dayRes, monthRes, listRes] = await Promise.all([
		getDayExpense(userId, dateStr),
		getMonthExpense(userId, dateStr),
		getIncomeAndExpense(userId, dateStr),
	]);

	// Day Expense
	if (dayRes.code === '200' && dayRes.data) {
		dayData.value = dayRes.data.map((item) => ({
			date: item.infoDate?.toString() || '',
			value: item.amount || 0,
		}));
	}

	// Month Expense
	if (monthRes.code === '200' && monthRes.data) {
		monthData.value = monthRes.data.map((item) => ({
			date: item.infoDate?.toString() || '',
			value: item.amount || 0,
		}));
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
					value: item.amount || 0,
					date: item.infoDate || '2026-01-01',
					icon: getIcon(item.typeCode || ''),
					color: palette.color,
					bgColor: palette.bgColor,
				};
			});
	}
};

const init = (dateStr: string, belongTo: string | null) => {
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
	padding: 16px;
	background-color: #f5f7fa;
	min-height: 100%;

	.chart-card {
		background: #fff;
		border-radius: 16px;
		padding: 16px;
		margin-bottom: 20px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);

		.card-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 16px;

			.card-title {
				font-size: 16px;
				font-weight: 600;
				color: #1f1f1f;
			}

			.card-tag {
				font-size: 12px;
				color: #8c8c8c;
				background: #f5f5f5;
				padding: 2px 8px;
				border-radius: 4px;

				&.trend {
					color: #52c41a; // Green for positive trend? Or use user's image logic
				}
			}
		}

		.chart-container {
			height: 200px;
		}
	}

	.section-title {
		font-size: 14px;
		color: #646566;
		margin-bottom: 12px;
		font-weight: 500;
		padding-left: 4px;
	}

	.high-value-list {
		display: flex;
		flex-direction: column;
		gap: 12px;

		.list-item {
			background: #fff;
			border-radius: 16px;
			padding: 16px;
			display: flex;
			justify-content: space-between;
			align-items: center;
			box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);

			.item-left {
				display: flex;
				align-items: center;
				gap: 12px;

				.icon-box {
					width: 44px;
					height: 44px;
					border-radius: 50%;
					display: flex; // Center icon
					align-items: center;
					justify-content: center;
				}

				.item-info {
					display: flex;
					flex-direction: column;
					gap: 4px;

					.item-name {
						font-size: 15px;
						font-weight: 600;
						color: #1f1f1f;
					}

					.item-date {
						font-size: 12px;
						color: #8c8c8c;
					}
				}
			}

			.item-amount {
				font-size: 16px;
				font-weight: 700;
				color: #1f1f1f;
			}
		}
	}
}
</style>
