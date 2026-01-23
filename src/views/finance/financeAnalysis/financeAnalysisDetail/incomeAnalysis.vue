<template>
	<div class="analysis-container">
		<!-- 收入分析卡片 -->
		<div class="analysis-card">
			<div class="card-title">当月收入分析</div>
			<div class="chart-container">
				<base-chart
					:options="incomeOptions"
					width="100%"
					:height="incomeChartHeight"
				/>
			</div>

			<div class="data-summary">
				<div class="summary-header">
					<van-icon
						name="chart-trending-o"
						color="#4080FF"
					/>
					<span class="summary-label">数据总结</span>
				</div>
				<div class="summary-content">
					<div class="trend-item">
						<div class="trend-label">环比增长</div>
						<div class="trend-value up"> <van-icon name="trending-up" /> +5.2% </div>
					</div>
					<div class="trend-item">
						<div class="trend-label">同比增长</div>
						<div class="trend-value up"> <van-icon name="trending-up" /> +12.8% </div>
					</div>
				</div>
			</div>
		</div>

		<!-- 支出分析卡片 -->
		<div class="analysis-card">
			<div class="card-title">当月支出分析</div>
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
					<van-icon
						name="apps-o"
						color="#F5222D"
					/>
					<span class="summary-label">分类支出top5</span>
				</div>
				<div class="expense-list">
					<div
						v-for="(item, index) in processedExpenseList"
						:key="index"
						class="expense-item"
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
									size="18"
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
								<div class="item-desc">对比上月 {{ item.trendDesc }}</div>
							</div>
						</div>
						<div class="item-right">
							<div class="item-amount">{{ item.value.toLocaleString() }}</div>
							<div class="item-percent">{{ item.percent }}%</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { showNotify } from 'vant';
import type { FinanceDetail } from './common';
import { getIncomeAndExpense } from '@/views/finance/financeAnalysis/api';

interface Props {
	activeTab: number | string;
	dateStr: string;
	belongTo?: string | null;
}

const props = defineProps<Props>();

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

// 颜色配置列表
const colorPalette = [
	{ color: '#4080FF', bgColor: '#E6F7FF' },
	{ color: '#FF7D00', bgColor: '#FFF2E8' },
	{ color: '#F5222D', bgColor: '#FFF1F0' },
	{ color: '#722ED1', bgColor: '#F9F0FF' },
	{ color: '#52c41a', bgColor: '#F6FFED' },
	{ color: '#00C1DE', bgColor: '#E6FFFB' },
	{ color: '#faad14', bgColor: '#fffbe6' },
	{ color: '#eb2f96', bgColor: '#fff0f6' },
	{ color: '#2f54eb', bgColor: '#f0f5ff' },
	{ color: '#13c2c2', bgColor: '#e6fffb' },
];

// 统一管理收入和支出数据
const pieData = ref<{
	income: PieChartData[];
	expense: PieChartData[];
}>({
	income: [],
	expense: [],
});

interface ProcessedExpenseItem {
	name: string;
	value: number;
	percent: string;
	icon: string;
	color: string;
	bgColor: string;
	trendDesc: string;
}

// 将数据转换为饼图格式
const transformToPieData = (data: FinanceDetail[], type: 'income' | 'expense'): PieChartData[] => {
	const filtered = data?.filter((item) => item.incomeAndExpenses === type) || [];
	return filtered.map((item, index) => {
		const palette = colorPalette[index % colorPalette.length];
		return {
			name: item.typeCode || '',
			value: item.amount || 0,
			typeCode: item.typeCode,
			color: palette.color,
			bgColor: palette.bgColor,
			itemStyle: {
				color: palette.color,
			},
		};
	});
};

// 获取图标配置
const getIcon = (name: string) => {
	const iconMap: Record<string, string> = {
		餐饮: 'friends',
		购物: 'bag',
		住房: 'wap-home',
		交通: 'logistics',
		娱乐: 'music',
	};
	// 简单匹配
	for (const key in iconMap) {
		if (name.includes(key)) return iconMap[key];
	}
	return '';
};

// 选中的图例
const selectedLegends = ref<Record<string, boolean>>({});

const handleLegendChange = (selected: Record<string, boolean>) => {
	selectedLegends.value = selected;
};

const processedExpenseList = computed<ProcessedExpenseItem[]>(() => {
	const total = pieData.value.expense.reduce((sum, item) => sum + item.value, 0);
	return pieData.value.expense
		.filter((item) => {
			if (Object.keys(selectedLegends.value).length > 0) {
				return selectedLegends.value[item.name] !== false;
			}
			return true;
		})
		.sort((a, b) => b.value - a.value)
		.slice(0, 5) // 只展示前5
		.map((item) => {
			const icon = getIcon(item.name);
			// 模拟环比数据 (deterministic)
			const isUp = item.value % 2 === 0;
			const change = Math.floor(item.value ? item.value * 0.1 : 50);
			const trendDesc = `${isUp ? '上涨' : '下降'} ¥${change}`;

			return {
				name: item.name,
				value: item.value,
				percent: total ? ((item.value / total) * 100).toFixed(1) : '0',
				icon,
				color: item.color,
				bgColor: item.bgColor,
				trendDesc,
			};
		});
});

// 计算图表高度
const getChartHeight = (dataLength: number) => {
	const baseHeight = 250; // 预留给图表的高度
	const rowCount = Math.ceil(dataLength / 4); // 假设每行4个图例
	const legendHeight = rowCount * 26; // 每行高度 Approx
	return `${baseHeight + legendHeight + 20}px`;
};

const incomeChartHeight = computed(() => getChartHeight(pieData.value.income.length));
const expenseChartHeight = computed(() => getChartHeight(pieData.value.expense.length));

// ECharts 通用配置
const commonChartOptions = {
	tooltip: {
		trigger: 'item',
		formatter: '{b}: {c} ({d}%)',
	},
	legend: {
		top: '240',
		icon: 'roundRect',
		itemWidth: 24,
		itemHeight: 14,
		itemGap: 12,
		itemStyle: {
			borderRadius: 4,
		},
	},
};

const incomeOptions = computed(() => ({
	...commonChartOptions,
	// color: ['#4080FF', '#69D1FF', '#BAE7FF', '#0050B3'],
	series: [
		{
			name: '收入',
			type: 'pie',
			radius: ['40%', '55%'],
			center: ['55%', '130px'],
			avoidLabelOverlap: true,
			minAngle: 5,
			itemStyle: {
				borderRadius: 5,
			},
			label: {
				show: true,
				position: 'outside',
				formatter: '{b}',
			},
			emphasis: {
				label: {
					show: true,
					fontSize: 16,
					fontWeight: 'bold',
				},
			},
			labelLine: {
				show: true,
				length: 15,
				length2: 10,
			},
			data: pieData.value.income,
		},
	],
}));

const expenseOptions = computed(() => ({
	...commonChartOptions,
	// color: ['#FF7D00', '#F5222D', '#722ED1', '#4080FF', '#00C1DE'],
	series: [
		{
			name: '支出',
			type: 'pie',
			radius: ['35%', '55%'],
			center: ['55%', '130px'],
			avoidLabelOverlap: true,
			minAngle: 5,
			itemStyle: {
				borderRadius: 5,
			},
			label: {
				show: true,
				position: 'outside',
				formatter: '{b}',
			},
			emphasis: {
				label: {
					show: true,
					fontSize: 16,
					fontWeight: 'bold',
				},
			},
			labelLine: {
				show: true,
				length: 15,
				length2: 10,
			},
			data: pieData.value.expense,
		},
	],
}));

const getIncomeAndExpenseInfo = async (userId: string | null, dateStr: string) => {
	const { code, data, message } = await getIncomeAndExpense(userId, dateStr);
	if (code === '200') {
		pieData.value = {
			income: transformToPieData(data || [], 'income'),
			expense: transformToPieData(data || [], 'expense'),
		};
	} else {
		showNotify({ type: 'danger', message: message || '查询列表失败！' });
	}
};

const init = (dateStr: string, belongTo: string | null) => {
	getIncomeAndExpenseInfo(belongTo, dateStr);
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
	padding: 10px;
	background-color: #f5f7fa;
	min-height: 100%;

	.analysis-card {
		background: #fff;
		border-radius: 12px;
		padding: 16px;
		margin-bottom: 16px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);

		.card-title {
			font-size: 16px;
			font-weight: 600;
			color: #1f1f1f;
			text-align: center;
			margin-bottom: 16px;
		}

		.section-title {
			font-size: 14px;
			color: #646566;
			margin: 8px 0 12px 0;
			font-weight: 500;
		}

		.data-summary,
		.data-detail {
			background: #fff;

			.summary-header {
				display: flex;
				align-items: center;
				margin-bottom: 12px;
				font-size: 14px;
				font-weight: 600;
				color: #1f1f1f;

				.summary-label {
					margin-left: 6px;
				}
			}
		}

		.data-summary {
			.summary-content {
				display: flex;
				justify-content: space-between;
				gap: 12px;

				.trend-item {
					flex: 1;
					background: #f9f9f9;
					padding: 12px;
					border-radius: 8px;

					.trend-label {
						font-size: 12px;
						color: #8c8c8c;
						margin-bottom: 8px;
					}

					.trend-value {
						font-size: 16px;
						font-weight: 600;
						display: flex;
						align-items: center;
						gap: 4px;

						&.up {
							color: #52c41a;
						}
						&.down {
							color: #f5222d;
						}
					}
				}
			}
		}

		.data-detail {
			.expense-list {
				background: #f9f9f9;
				border-radius: 12px;
				padding: 4px 16px;

				.expense-item {
					display: flex;
					justify-content: space-between;
					align-items: center;
					padding: 14px 0;
					border-bottom: 1px solid rgba(0, 0, 0, 0.04);

					&:last-child {
						border-bottom: none;
					}

					.item-left {
						display: flex;
						align-items: center;
						gap: 12px;

						.icon-box {
							width: 38px;
							height: 38px;
							border-radius: 50%;
							background: #fff;
							display: flex;
							align-items: center;
							justify-content: center;
							box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
						}

						.item-info {
							display: flex;
							flex-direction: column;
							gap: 4px;

							.item-name {
								font-size: 14px;
								font-weight: 600;
								color: #1f1f1f;
							}

							.item-desc {
								font-size: 10px;
								color: #8c8c8c;
							}
						}
					}

					.item-right {
						text-align: right;
						display: flex;
						flex-direction: column;
						gap: 4px;

						.item-amount {
							font-size: 15px;
							font-weight: 700;
							color: #1f1f1f;
						}

						.item-percent {
							font-size: 10px;
							color: #8c8c8c;
						}
					}
				}
			}
		}
	}
}
</style>
