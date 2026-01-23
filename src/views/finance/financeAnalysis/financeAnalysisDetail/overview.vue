<template>
	<div class="overview-container">
		<!-- Hero Card: Total Assets -->
		<div class="hero-card">
			<div class="hero-title">总资产 (元)</div>
			<div class="hero-amount">
				<span class="integer">{{ formattedSum.int }}</span>
				<span class="decimal">.{{ formattedSum.dec }}</span>
			</div>
			<div class="hero-trends">
				<div class="trend-tag">
					<van-icon :name="getTrendIcon(totalYoy)" />
					<span>同比 {{ totalYoy || '+0.0%' }}</span>
				</div>
				<div class="trend-tag">
					<van-icon :name="getTrendIcon(totalMom)" />
					<span>环比 {{ totalMom || '+0.0%' }}</span>
				</div>
			</div>
		</div>

		<!-- Asset Grid -->
		<div class="section-title">可动产</div>
		<div class="asset-grid">
			<div
				v-for="item in assetList"
				:key="item.typeCode"
				class="asset-card"
			>
				<div class="card-header">
					<div
						class="icon-box"
						:style="{ backgroundColor: getConfig(item.typeName).color }"
					>
						<van-icon
							:name="getConfig(item.typeName).icon"
							:style="{ color: getConfig(item.typeName).iconColor }"
						/>
					</div>
					<div class="card-name">{{ item.typeName }}</div>
				</div>
				<div class="card-amount">{{ formatAmount(item.amount) }}</div>
				<div class="card-trends">
					<span :class="['trend', getTrendClass(item.yoyTrend || getConfig(item.typeName).trend1)]">
						{{ formatTrend(item.yoyTrend || getConfig(item.typeName).trend1, '同比') }}
					</span>
					<span :class="['trend', getTrendClass(item.momTrend || getConfig(item.typeName).trend2)]">
						{{ formatTrend(item.momTrend || getConfig(item.typeName).trend2, '环比') }}
					</span>
				</div>
			</div>
		</div>

		<!-- Liability Section -->
		<div
			v-if="liabilityList.length > 0"
			class="section-title"
		>
			不动产
		</div>
		<div class="liability-list">
			<div
				v-for="item in liabilityList"
				:key="item.typeCode"
				class="liability-item"
			>
				<div class="item-left">
					<div
						class="icon-box-small"
						:style="{ backgroundColor: getConfig(item.typeName).color }"
					>
						<van-icon
							:name="getConfig(item.typeName).icon"
							:style="{ color: getConfig(item.typeName).iconColor }"
						/>
					</div>
					<div class="item-info">
						<div class="item-name">{{ item.typeName }}</div>
					</div>
				</div>
				<div class="item-right">
					<div
						class="item-amount"
						:class="{ negative: (item.amount || 0) < 0 }"
					>
						{{ formatAmount(item.amount) }}
					</div>
					<div class="item-trends">
						<span
							class="item-trend"
							:class="getTrendClass(item.momTrend || getConfig(item.typeName).trend1)"
						>
							{{ formatTrend(item.momTrend || getConfig(item.typeName).trend1, '环比') }}
						</span>
						<span
							class="item-yoy"
							:class="getTrendClass(item.yoyTrend || getConfig(item.typeName).trend2)"
						>
							{{ formatTrend(item.yoyTrend || getConfig(item.typeName).trend2, '同比') }}
						</span>
					</div>
				</div>
			</div>
		</div>

		<!-- Utilities Section -->
		<div
			v-if="utilityList.length > 0"
			class="section-header"
		>
			<div class="section-title">生活缴费</div>
		</div>
		<div
			v-if="utilityList.length > 0"
			class="utility-card-container"
		>
			<div class="utility-grid">
				<div
					v-for="item in utilityList"
					:key="item.typeCode"
					class="utility-item"
				>
					<div class="item-header">
						<span
							class="dot"
							:style="{ backgroundColor: getConfig(item.typeName).iconColor }"
						></span>
						<span class="name">{{ item.typeName }}</span>
					</div>
					<div class="amount">{{ formatAmount(item.amount) }}</div>
					<div
						class="trend"
						:class="getTrendClass(item.momTrend || getConfig(item.typeName).trend1)"
					>
						{{ formatTrend(item.momTrend || getConfig(item.typeName).trend1, '环比') }}
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { showNotify } from 'vant';
import * as math from 'mathjs';
import type { FinanceDetail } from './common';
import { getBalance } from '@/views/finance/financeAnalysis/api';

interface Props {
	activeTab: number | string;
	dateStr: string;
	belongTo?: string | null;
}

const props = defineProps<Props>();

const balanceList = ref<FinanceDetail[]>([]);
const sum = ref<math.BigNumber>(math.bignumber(0));

// Type-to-UI Config Mapping
interface TypeConfig {
	icon: string;
	color: string;
	iconColor: string;
	trend1: string;
	trend2: string;
}

const typeConfig: Record<string, TypeConfig> = {
	现金: { icon: 'balance-pay', color: '#e8f5e9', iconColor: '#4caf50', trend1: '+1.2%', trend2: '-0.5%' },
	银行卡: { icon: 'card', color: '#e3f2fd', iconColor: '#1976d2', trend1: '+8.4%', trend2: '+2.1%' },
	微信: { icon: 'wechat', color: '#f1f8e9', iconColor: '#7cb342', trend1: '0.0%', trend2: '' },
	支付宝: { icon: 'qr', color: '#e1f5fe', iconColor: '#03a9f4', trend1: '+15%', trend2: '+5%' },
	花呗: { icon: 'credit-pay', color: '#e3f2fd', iconColor: '#1976d2', trend1: '-12.4%', trend2: '+2.1%' },
	京东: { icon: 'bag-o', color: '#ffebee', iconColor: '#f44336', trend1: '+5.2%', trend2: '+10%' },
	白条: { icon: 'bill-o', color: '#fff3e0', iconColor: '#ff9800', trend1: '0.0%', trend2: '' },
	水费: { icon: 'circle', color: '#e3f2fd', iconColor: '#42a5f5', trend1: '-15%', trend2: '' },
	燃气费: { icon: 'circle', color: '#fff3e0', iconColor: '#ff9800', trend1: '+2.4%', trend2: '' },
	电费w: { icon: 'circle', color: '#fff9c4', iconColor: '#fbc02d', trend1: '0.0%', trend2: '' },
	电费m: { icon: 'circle', color: '#fff3e0', iconColor: '#ffa726', trend1: '0.0%', trend2: '' },
	话费w: { icon: 'circle', color: '#e8f5e9', iconColor: '#66bb6a', trend1: '+1.2%', trend2: '' },
	话费m: { icon: 'circle', color: '#e0f2f1', iconColor: '#4db6ac', trend1: '-0.8%', trend2: '' },
	话费b: { icon: 'circle', color: '#e8eaf6', iconColor: '#7986cb', trend1: '-2.1%', trend2: '' },
	话费mj: { icon: 'circle', color: '#f3e5f5', iconColor: '#ba68c8', trend1: '+5.6%', trend2: '' },
};

const defaultConfig = { icon: 'apps-o', color: '#f2f3f5', iconColor: '#969799', trend1: '', trend2: '' };

const getConfig = (name?: string) => typeConfig[name || ''] || defaultConfig;

const getTrendClass = (trend?: string) => {
	if (!trend || trend === '0.0%' || trend === '' || trend.includes('无')) return 'stable';
	return trend.startsWith('+') ? 'up' : 'down';
};

const formatTrend = (trend: string | undefined, defaultPrefix: string) => {
	if (!trend || trend === '0.0%' || trend === '' || trend.includes('无')) {
		return `${defaultPrefix} 无波动`;
	}
	return `${defaultPrefix} ${trend}`;
};

const getTrendIcon = (trend?: string) => {
	if (!trend || trend === '0.0%' || trend.includes('无')) return 'minus';
	return trend.startsWith('+') ? 'ascending' : 'descending';
};

const formatAmount = (amount?: number) => {
	if (amount === undefined || amount === null) return '0.00';
	return amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// Data Processing
const totalYoy = ref<string>('');
const totalMom = ref<string>('');

const formattedSum = computed(() => {
	const str = math.format(sum.value, { notation: 'fixed', precision: 2 });
	const [int, dec] = str.split('.');
	return { int: Number(int).toLocaleString(), dec };
});

const assetList = computed(() =>
	balanceList.value.filter((item) => ['银行卡', '微信', '花呗', '白条'].includes(item.typeName || '')),
);

const liabilityList = computed(() =>
	balanceList.value.filter((item) => ['现金', '支付宝', '京东'].includes(item.typeName || '')),
);

const utilityList = computed(() =>
	balanceList.value.filter(
		(item) => !['银行卡', '微信', '花呗', '白条', '现金', '支付宝', '京东'].includes(item.typeName || ''),
	),
);

interface BalanceResponse {
	list: FinanceDetail[];
	yoyTrend?: string;
	momTrend?: string;
}

const getBalanceInfo = async (userId: number | string | null, dateStr: string) => {
	const { code, data, message } = await getBalance(userId, dateStr);
	if (code == '200') {
		if (Array.isArray(data)) {
			balanceList.value = data;
			totalYoy.value = '';
			totalMom.value = '';
		} else if (data && typeof data === 'object') {
			const res = data as BalanceResponse;
			balanceList.value = res.list ?? [];
			totalYoy.value = res.yoyTrend ?? '';
			totalMom.value = res.momTrend ?? '';
		}

		sum.value = (balanceList.value || []).reduce(
			(acc: math.BigNumber, item: FinanceDetail) => math.add(acc, math.bignumber(item.amount ?? 0)),
			math.bignumber(0),
		);
	} else {
		showNotify({ type: 'danger', message: message || '查询列表失败！' });
	}
};

const init = (dateStr: string, belongTo: number | string | null) => {
	getBalanceInfo(belongTo, dateStr);
};

watch(
	() => [props.activeTab, props.dateStr, props.belongTo],
	() => {
		if (props.activeTab === '1') {
			init(props.dateStr, props.belongTo || null);
		}
	},
	{ immediate: true },
);
</script>

<style lang="less" scoped>
.overview-container {
	padding: 16px;
	background-color: #f7f8fa;
	min-height: 100%;
}

.hero-card {
	background: linear-gradient(135deg, #3a7bd5 0%, #00d2ff 100%);
	border-radius: 20px;
	padding: 24px;
	color: #fff;
	box-shadow: 0 8px 24px rgba(58, 123, 213, 0.3);
	margin-bottom: 24px;

	.hero-title {
		font-size: 14px;
		opacity: 0.9;
		margin-bottom: 8px;
	}

	.hero-amount {
		margin-bottom: 16px;
		.integer {
			font-size: 36px;
			font-weight: 700;
		}
		.decimal {
			font-size: 20px;
			opacity: 0.8;
		}
	}

	.hero-trends {
		display: flex;
		gap: 12px;

		.trend-tag {
			background: rgba(255, 255, 255, 0.2);
			padding: 4px 10px;
			border-radius: 20px;
			font-size: 11px;
			display: flex;
			align-items: center;
			gap: 4px;
			backdrop-filter: blur(4px);
		}
	}
}

.section-title {
	font-size: 14px;
	color: #646566;
	margin: 20px 0 12px 4px;
	font-weight: 500;
}

.asset-grid {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 12px;

	.asset-card {
		background: #fff;
		border-radius: 16px;
		padding: 16px;
		box-shadow: 0 2px 12px rgba(0, 0, 0, 0.03);

		.card-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 12px;

			.icon-box {
				width: 36px;
				height: 36px;
				border-radius: 10px;
				display: flex;
				align-items: center;
				justify-content: center;
				font-size: 20px;
			}

			.card-name {
				font-size: 13px;
				color: #969799;
			}
		}

		.card-amount {
			font-size: 18px;
			font-weight: 600;
			color: #323233;
			margin-bottom: 6px;
		}

		.card-trends {
			display: flex;
			flex-direction: row;
			gap: 8px;
			.trend {
				font-size: 10px;
				&.up {
					color: #ee0a24;
				}
				&.down {
					color: #07c160;
				}
				&.stable {
					color: #323233;
					font-weight: 500;
				}
			}
		}
	}
}

.liability-list {
	background: #fff;
	border-radius: 16px;
	overflow: hidden;
	box-shadow: 0 2px 12px rgba(0, 0, 0, 0.03);

	.liability-item {
		display: flex;
		justify-content: space-between;
		padding: 16px;
		border-bottom: 1px solid #f2f3f5;

		&:last-child {
			border-bottom: none;
		}

		.item-left {
			display: flex;
			gap: 12px;
			align-items: center;

			.icon-box-small {
				width: 40px;
				height: 40px;
				border-radius: 10px;
				display: flex;
				align-items: center;
				justify-content: center;
				font-size: 22px;
			}

			.item-info {
				.item-name {
					font-size: 15px;
					font-weight: 500;
					color: #323233;
				}
			}
		}

		.item-right {
			text-align: right;
			display: flex;
			flex-direction: column;
			align-items: flex-end;
			gap: 4px;

			.item-amount {
				font-size: 16px;
				font-weight: 600;
				color: #323233;
				&.negative {
					color: #ee0a24;
				}
			}

			.item-trends {
				display: flex;
				gap: 8px;
				.item-trend,
				.item-yoy {
					font-size: 11px;
					&.up {
						color: #ee0a24;
					}
					&.down {
						color: #07c160;
					}
					&.stable {
						color: #969799;
					}
				}
			}
		}
	}
}

.utility-card-container {
	background: #fff;
	border-radius: 20px;
	padding: 24px 16px;
	box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
	margin-top: 12px;
}

.utility-grid {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	row-gap: 32px;
	column-gap: 12px;

	.utility-item {
		display: flex;
		flex-direction: column;
		align-items: flex-start;

		.item-header {
			display: flex;
			align-items: center;
			gap: 8px;
			margin-bottom: 8px;

			.dot {
				width: 8px;
				height: 8px;
				border-radius: 50%;
			}
			.name {
				font-size: 15px;
				color: #646566;
				font-weight: 500;
			}
		}

		.amount {
			font-size: 16px;
			font-weight: 600;
			color: #323233;
			margin-bottom: 4px;
			padding-left: 16px;
		}

		.trend {
			font-size: 11px;
			color: #969799;
			padding-left: 16px;
			&.up {
				color: #ee0a24;
			}
			&.down {
				color: #07c160;
			}
			&.stable {
				color: #323233;
				font-weight: 500;
			}
		}
	}
}
</style>
