<template>
	<div class="consume-overview-container">
		<!-- 顶部问候与简介 -->
		<div class="greeting-section">
			<div class="greeting-title">您好，用户</div>
			<div class="greeting-desc">以下是您的消费卡总体情况</div>
		</div>

		<!-- 统计卡片网格 -->
		<div class="stats-grid">
			<div class="stat-card">
				<div class="stat-card-row">
					<div class="stat-left">
						<div class="stat-label">总消费卡</div>
						<div class="stat-value">{{ statistics.totalCards }}</div>
					</div>
					<div class="stat-right stat-icon orange">
						<van-icon name="coupon-o" />
					</div>
				</div>
				<div class="stat-delta positive">
					<van-icon name="arrow-up" />
					<span>较上月 +{{ statisticsDelta.totalCards }}</span>
				</div>
			</div>

			<div class="stat-card">
				<div class="stat-card-row">
					<div class="stat-left">
						<div class="stat-label">总余额</div>
						<div class="stat-value"> ¥{{ formatNumber(statistics.totalBalance) }} </div>
					</div>
					<div class="stat-right stat-icon green">
						<van-icon name="gold-coin-o" />
					</div>
				</div>
				<div class="stat-delta positive">
					<van-icon name="arrow-up" />
					<span>较上月 +¥{{ formatNumber(statisticsDelta.totalBalance) }}</span>
				</div>
			</div>

			<div class="stat-card">
				<div class="stat-card-row">
					<div class="stat-left">
						<div class="stat-label">本月消费</div>
						<div class="stat-value"> ¥{{ formatNumber(statistics.monthlySpend) }} </div>
					</div>
					<div class="stat-right stat-icon red">
						<van-icon name="cart-o" />
					</div>
				</div>
				<div class="stat-delta negative">
					<van-icon name="arrow-up" />
					<span>较上月 +¥{{ formatNumber(statisticsDelta.monthlySpend) }}</span>
				</div>
			</div>

			<div class="stat-card">
				<div class="stat-card-row">
					<div class="stat-left">
						<div class="stat-label">本月充值</div>
						<div class="stat-value"> ¥{{ formatNumber(statistics.monthlyRecharge) }} </div>
					</div>
					<div class="stat-right stat-icon orange-light">
						<van-icon name="add-o" />
					</div>
				</div>
				<div class="stat-delta positive">
					<van-icon name="arrow-up" />
					<span>较上月 +¥{{ formatNumber(statisticsDelta.monthlyRecharge) }}</span>
				</div>
			</div>
		</div>

		<!-- 消费趋势卡片 -->
		<div class="trend-card">
			<div class="trend-header">
				<div class="trend-title">消费趋势</div>
				<div class="period-switch">
					<van-button
						size="mini"
						:type="selectedPeriod === 'week' ? 'primary' : 'default'"
						round
						@click="handleSwitchPeriod('week')"
					>
						周
					</van-button>
					<van-button
						size="mini"
						:type="selectedPeriod === 'month' ? 'primary' : 'default'"
						round
						@click="handleSwitchPeriod('month')"
					>
						月
					</van-button>
					<van-button
						size="mini"
						:type="selectedPeriod === 'year' ? 'primary' : 'default'"
						round
						@click="handleSwitchPeriod('year')"
					>
						年
					</van-button>
				</div>
			</div>
			<div class="trend-body">
				<chart
					:options="chartOptions"
					width="100%"
					height="256px"
				/>
			</div>
		</div>

		<!-- 我的消费卡 -->
		<div class="my-cards-section">
			<div class="section-header">
				<div class="section-title">我的消费卡</div>
				<div
					class="view-all"
					@click="navigateToAll"
				>
					<van-icon name="arrow" />
					<span>查看全部</span>
				</div>
			</div>
			<div class="cards-list">
				<div
					class="card-row"
					v-for="card in cardList"
					:key="card.id"
				>
					<div
						class="card-row-left"
						:style="{ background: getTypeBg(card.cardName) }"
					>
						<svg-icon
							:name="getTypeIconName(card.cardName)"
							color="#FF7A00"
						/>
					</div>
					<div class="card-row-center">
						<div class="card-row-title">{{ card.name }}</div>
						<div class="card-row-sub"> 余额: ¥{{ formatNumber(Number(card.currentBalance ?? card.balance)) }} </div>
					</div>
					<div class="card-row-right">
						<van-button
							size="small"
							round
							type="success"
							@click="handleRecharge(card)"
						>
							充值
						</van-button>
						<van-button
							size="small"
							round
							type="danger"
							@click="handleConsume(card)"
						>
							消费
						</van-button>
					</div>
				</div>
			</div>
		</div>

		<!-- 底部 Tabbar -->
		<van-tabbar
			route
			fixed
		>
			<van-tabbar-item
				icon="bar-chart-o"
				@click="handleGoDashboard"
			>
				总览
			</van-tabbar-item>
			<van-tabbar-item
				icon="credit-pay"
				@click="navigateToAll"
			>
				消费卡
			</van-tabbar-item>
			<van-tabbar-item
				icon="clock-o"
				@click="handleGoRecords"
			>
				记录
			</van-tabbar-item>
			<van-tabbar-item
				icon="user-o"
				@click="handleGoUser"
			>
				我的
			</van-tabbar-item>
		</van-tabbar>
	</div>
</template>

<script setup lang="ts">
import { showToast } from 'vant';
import { typeIconMap, type CardItem, getCardColor } from '../config/index';
import Chart from '@/views/model/chart/index.vue';
import SvgIcon from '@/views/common/icons/svgIcon.vue';
import { useNavBar } from '@/composables/useNavBar';

// 使用局部组件（通过标签 <SvgIcon /> 引用）

// 顶部 NavBar（项目全局 NavBar）
useNavBar({
	title: '消费卡总览',
	leftPath: '/selfFinance/prepaidCardInfoT',
	visible: true,
});

const router = useRouter();

// 统计数据（可后续接入接口）
const statistics = reactive({
	totalCards: 5,
	totalBalance: 2350,
	monthlySpend: 890,
	monthlyRecharge: 1500,
});
const statisticsDelta = reactive({
	totalCards: 1,
	totalBalance: 350,
	monthlySpend: 120,
	monthlyRecharge: 500,
});

// 周/月/年切换
type Period = 'week' | 'month' | 'year';
const selectedPeriod = ref<Period>('month');
const handleSwitchPeriod = (period: Period) => {
	selectedPeriod.value = period;
	rebuildChartOptions();
};

// 图表
const chartOptions = ref<Record<string, any>>({});
const makeSeriesData = (period: Period) => {
	if (period === 'week') return [120, 132, 101, 134, 90, 230, 210];
	if (period === 'year') return [320, 282, 301, 334, 390, 330, 320, 220, 180, 260, 300, 420];
	return [220, 182, 191, 234, 290, 330, 310];
};
const rebuildChartOptions = () => {
	const xAxisLabels =
		selectedPeriod.value === 'year'
			? ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
			: selectedPeriod.value === 'week'
				? ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
				: ['第1周', '第2周', '第3周', '第4周', '第5周', '第6周', '第7周'];
	chartOptions.value = {
		tooltip: { trigger: 'axis' },
		grid: { left: 8, right: 8, top: 16, bottom: 8, containLabel: true },
		xAxis: { type: 'category', data: xAxisLabels, boundaryGap: false },
		yAxis: { type: 'value' },
		series: [
			{
				name: '消费金额',
				type: 'line',
				smooth: true,
				data: makeSeriesData(selectedPeriod.value),
				areaStyle: {},
				lineStyle: { color: '#268CF2' },
				itemStyle: { color: '#268CF2' },
			},
		],
	};
};

// 卡片列表（示例数据，可替换为接口数据）
const cardList = ref<CardItem[]>([
	{
		id: 1,
		name: '海鲜达',
		balance: '750',
		currentBalance: 750,
		cardName: '淘鲜达',
		bgColor: getCardColor(0),
	},
	{
		id: 2,
		name: '百货通',
		balance: '580',
		currentBalance: 580,
		cardName: '比优特w',
		bgColor: getCardColor(1),
	},
	{
		id: 3,
		name: '咖啡联盟',
		balance: '320',
		currentBalance: 320,
		cardName: '好利来',
		bgColor: getCardColor(2),
	},
]);

// 工具函数
const formatNumber = (num: number | string): string => {
	const value = Number(num || 0);
	return value.toLocaleString('zh-CN');
};

const getTypeIconName = (typeName?: string): string => {
	// vite-plugin-svg-icons 已将路径注册到 symbolId：icon-[dir]-[name]
	// 这里仅返回文件名（不含后缀），由 SvgIcon 统一拼接
	// 已在 config 中将业务名称映射到具体 svg 引用
	const entry = Object.entries(typeIconMap).find(([key]) => key === (typeName || ''));
	if (!entry) return 'shop-card';
	const filePath = entry[1] as string; // e.g. /src/assets/icons/shop/xxx.svg
	const parts = filePath.split('/');
	const nameWithExt = parts[parts.length - 1];
	return nameWithExt.replace('.svg', '');
};

const getTypeBg = (_cardName?: string): string => {
	// 根据不同类型给一个轻量底色
	return 'rgba(255, 122, 0, 0.1)';
};

// 交互
const navigateToAll = () => {
	router.push('/selfFinance/prepaidCardInfoT');
};
const handleRecharge = (card: CardItem) => {
	showToast({ message: `去给 ${card.name} 充值`, position: 'top' });
};
const handleConsume = (card: CardItem) => {
	showToast({ message: `去使用 ${card.name} 消费`, position: 'top' });
};
const handleGoDashboard = () => router.push('/dashboard');
const handleGoRecords = () => showToast('记录开发中');
const handleGoUser = () => router.push('/myself/about');

onMounted(() => {
	rebuildChartOptions();
});
</script>

<style lang="less" scoped>
.consume-overview-container {
	background: #f9fafb;
	min-height: 100%;
	padding: 16px 0 72px; // 预留底部 Tabbar 高度
}

.greeting-section {
	padding: 0 16px;
	.greeting-title {
		color: #1d2129;
		font-weight: 900;
		font-size: 19px;
		line-height: 21px;
	}
	.greeting-desc {
		margin-top: 4px;
		color: #86909c;
		font-size: 14px;
	}
}

.stats-grid {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	grid-gap: 16px;
	padding: 16px;

	.stat-card {
		background: #fff;
		border-radius: 12px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
		padding: 16px;

		.stat-card-row {
			display: flex;
			align-items: center;
			justify-content: space-between;
		}
		.stat-left {
			.stat-label {
				color: #86909c;
				font-size: 14px;
			}
			.stat-value {
				margin-top: 4px;
				color: #1d2129;
				font-weight: 700;
				font-size: 24px;
			}
		}
		.stat-right.stat-icon {
			width: 40px;
			height: 40px;
			border-radius: 9999px;
			display: flex;
			align-items: center;
			justify-content: center;
			&.orange {
				background: rgba(255, 122, 0, 0.1);
				color: #ff7a00;
			}
			&.green {
				background: rgba(0, 180, 42, 0.1);
				color: #00b42a;
			}
			&.red {
				background: rgba(245, 63, 63, 0.1);
				color: #f53f3f;
			}
			&.orange-light {
				background: rgba(255, 125, 0, 0.1);
				color: #ff7d00;
			}
		}
		.stat-delta {
			margin-top: 8px;
			display: flex;
			align-items: center;
			gap: 6px;
			font-size: 12px;
			&.positive {
				color: #00b42a;
			}
			&.negative {
				color: #f53f3f;
			}
		}
	}
}

.trend-card {
	background: #fff;
	margin: 8px 16px 16px;
	border-radius: 12px;
	box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
	.trend-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 16px;
		.trend-title {
			color: #1d2129;
			font-weight: 900;
			font-size: 18px;
		}
		.period-switch {
			display: flex;
			gap: 8px;
		}
	}
	.trend-body {
		padding: 0 16px 16px;
	}
}

.my-cards-section {
	margin: 16px;
	.section-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 28px;
		.section-title {
			color: #1d2129;
			font-weight: 900;
			font-size: 18px;
		}
		.view-all {
			display: flex;
			align-items: center;
			gap: 4px;
			color: #165dff;
			font-size: 12px;
		}
	}
	.cards-list {
		margin-top: 12px;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.card-row {
		background: #fff;
		border-radius: 12px;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
		padding: 16px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		.card-row-left {
			width: 48px;
			height: 48px;
			border-radius: 8px;
			display: flex;
			align-items: center;
			justify-content: center;
		}
		.card-row-center {
			flex: 1;
			margin: 0 12px;
			.card-row-title {
				color: #1d2129;
				font-size: 16px;
				font-weight: 500;
			}
			.card-row-sub {
				margin-top: 4px;
				color: #86909c;
				font-size: 14px;
			}
		}
		.card-row-right {
			display: flex;
			align-items: center;
			gap: 8px;
		}
	}
}
</style>
