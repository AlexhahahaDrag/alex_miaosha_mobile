<template>
	<div class="overview-container">
		<!-- Hero Card: Total Assets (Tailwind Indigo Soft Gradient + 3 Subtotals) -->
		<div
			class="hero-card"
			data-testid="overview-hero-card"
		>
			<div class="hero-top-row">
				<div class="hero-title-group">
					<span class="hero-title">总资产净值 (元)</span>
					<span class="hero-subtitle">ASSET OVERVIEW</span>
				</div>
				<span class="hero-badge">存量盘点</span>
			</div>

			<!-- 查询中骨架态 -->
			<template v-if="loading">
				<div
					class="hero-skeleton"
					data-testid="overview-skeleton"
				>
					<div class="sk-hero-amount shimmer-white"></div>
					<div class="sk-hero-trends">
						<span class="sk-hero-pill shimmer-white"></span>
						<span class="sk-hero-pill shimmer-white"></span>
					</div>
				</div>
				<div class="hero-subgrid">
					<div
						v-for="label in ['可动产', '不动产', '生活缴费']"
						:key="label"
						class="hero-subcard"
					>
						<div class="subcard-label">
							<span class="subcard-dot subcard-dot--indigo"></span>
							<span>{{ label }}</span>
						</div>
						<div class="sk-subcard-val shimmer-white"></div>
					</div>
				</div>
			</template>

			<!-- 真实数据态 -->
			<template v-else>
				<div class="hero-amount">
					<span class="currency">¥</span>
					<span class="integer">{{ formattedSum.int }}</span>
					<span class="decimal">.{{ formattedSum.dec }}</span>
				</div>

				<div class="hero-trends">
					<div :class="['trend-tag', getTrendClass(totalYoy)]">
						<van-icon :name="getTrendIcon(totalYoy)" />
						<span>{{ formatTrend(totalYoy, '同比') }}</span>
					</div>
					<div :class="['trend-tag', getTrendClass(totalMom)]">
						<van-icon :name="getTrendIcon(totalMom)" />
						<span>{{ formatTrend(totalMom, '环比') }}</span>
					</div>
				</div>

				<!-- 底部三栏分项小计锚点：可动产 / 不动产 / 生活缴费 -->
				<div class="hero-subgrid">
					<div class="hero-subcard">
						<div class="subcard-label">
							<span class="subcard-dot subcard-dot--indigo"></span>
							<span>可动产</span>
						</div>
						<div class="subcard-val">
							{{ movableSubtotal < 0 ? '-' : '' }}¥{{ formatAmount(Math.abs(movableSubtotal)) }}
						</div>
					</div>
					<div class="hero-subcard">
						<div class="subcard-label">
							<span class="subcard-dot subcard-dot--emerald"></span>
							<span>不动产</span>
						</div>
						<div class="subcard-val">
							{{ immovableSubtotal < 0 ? '-' : '' }}¥{{ formatAmount(Math.abs(immovableSubtotal)) }}
						</div>
					</div>
					<div class="hero-subcard">
						<div class="subcard-label">
							<span class="subcard-dot subcard-dot--amber"></span>
							<span>生活缴费</span>
						</div>
						<div class="subcard-val"> ¥{{ formatAmount(utilitySubtotal) }} </div>
					</div>
				</div>
			</template>
		</div>

		<!-- 查询中：三组账户全量骨架屏 -->
		<template v-if="loading">
			<!-- 1. 可动产骨架 -->
			<div class="section-bar">
				<div class="section-bar-left">
					<span class="section-dot section-dot--indigo"></span>
					<span class="section-title">可动产</span>
					<span class="sk-line sk-w-10 sk-h-4 shimmer-slate"></span>
				</div>
				<span class="sk-line sk-w-20 sk-h-4 shimmer-slate"></span>
			</div>
			<div class="asset-grid">
				<div
					v-for="i in 4"
					:key="`sk-asset-${i}`"
					class="asset-card"
				>
					<div class="card-header">
						<div class="sk-icon-box shimmer-slate"></div>
						<div class="sk-line sk-w-12 sk-h-3 shimmer-slate"></div>
					</div>
					<div class="sk-line sk-w-24 sk-h-5 shimmer-slate sk-mb-2"></div>
					<div class="sk-line sk-w-28 sk-h-3 shimmer-slate"></div>
				</div>
			</div>

			<!-- 2. 不动产骨架 -->
			<div class="section-bar">
				<div class="section-bar-left">
					<span class="section-dot section-dot--emerald"></span>
					<span class="section-title">不动产</span>
					<span class="sk-line sk-w-10 sk-h-4 shimmer-slate"></span>
				</div>
				<span class="sk-line sk-w-20 sk-h-4 shimmer-slate"></span>
			</div>
			<div class="liability-list">
				<div
					v-for="i in 3"
					:key="`sk-liability-${i}`"
					class="liability-item"
				>
					<div class="item-left">
						<div class="sk-icon-box-sm shimmer-slate"></div>
						<div class="sk-col">
							<div class="sk-line sk-w-14 sk-h-4 shimmer-slate"></div>
							<div class="sk-line sk-w-24 sk-h-3 shimmer-slate"></div>
						</div>
					</div>
					<div class="sk-col sk-col--right">
						<div class="sk-line sk-w-20 sk-h-4 shimmer-slate"></div>
						<div class="sk-line sk-w-24 sk-h-3 shimmer-slate"></div>
					</div>
				</div>
			</div>

			<!-- 3. 生活缴费骨架 -->
			<div class="section-bar">
				<div class="section-bar-left">
					<span class="section-dot section-dot--amber"></span>
					<span class="section-title">生活缴费</span>
					<span class="sk-line sk-w-10 sk-h-4 shimmer-slate"></span>
				</div>
				<span class="sk-line sk-w-16 sk-h-4 shimmer-slate"></span>
			</div>
			<div class="utility-card-container">
				<div class="utility-grid">
					<div
						v-for="i in 4"
						:key="`sk-util-${i}`"
						class="utility-item"
					>
						<div class="sk-line sk-w-14 sk-h-3 shimmer-slate sk-mb-2"></div>
						<div class="sk-line sk-w-20 sk-h-4 shimmer-slate sk-mb-2"></div>
						<div class="sk-line sk-w-16 sk-h-3 shimmer-slate"></div>
					</div>
				</div>
			</div>
		</template>

		<!-- 查询完成：真实账户分组卡片 -->
		<template v-else>
			<!-- 1. 可动产 (银行卡、微信、花呗、白条) -->
			<div class="section-bar">
				<div class="section-bar-left">
					<span class="section-dot section-dot--indigo"></span>
					<span class="section-title">可动产</span>
					<span class="section-count section-count--indigo">{{ assetList.length }} 项</span>
				</div>
				<span
					class="section-subtotal"
					:class="{ negative: movableSubtotal < 0 }"
				>
					{{ movableSubtotal < 0 ? '-' : '' }}¥{{ formatAmount(Math.abs(movableSubtotal)) }}
				</span>
			</div>
			<div class="asset-grid">
				<div
					v-for="item in assetList"
					:key="item.typeCode || item.typeName"
					class="asset-card"
					@click="goToFinanceManager(item)"
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
					<div
						class="card-amount"
						:class="{ negative: (item.amount || 0) < 0 }"
					>
						{{ (item.amount || 0) < 0 ? '-' : '' }}¥{{ formatAmount(Math.abs(item.amount || 0)) }}
					</div>
					<div class="card-trends">
						<span :class="['trend', getTrendClass(item.yoyTrend)]">
							{{ formatTrend(item.yoyTrend, '同比') }}
						</span>
						<span :class="['trend', getTrendClass(item.momTrend)]">
							{{ formatTrend(item.momTrend, '环比') }}
						</span>
					</div>
				</div>
			</div>

			<!-- 2. 不动产 (现金、支付宝、京东) -->
			<template v-if="liabilityList.length > 0">
				<div class="section-bar">
					<div class="section-bar-left">
						<span class="section-dot section-dot--emerald"></span>
						<span class="section-title">不动产</span>
						<span class="section-count section-count--emerald">{{ liabilityList.length }} 项</span>
					</div>
					<span
						class="section-subtotal section-subtotal--emerald"
						:class="{ negative: immovableSubtotal < 0 }"
					>
						{{ immovableSubtotal < 0 ? '-' : '' }}¥{{ formatAmount(Math.abs(immovableSubtotal)) }}
					</span>
				</div>
				<div class="liability-list">
					<div
						v-for="item in liabilityList"
						:key="item.typeCode || item.typeName"
						class="liability-item"
						@click="goToFinanceManager(item)"
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
								<div class="item-sub">点击查看该账户收支流水</div>
							</div>
						</div>
						<div class="item-right">
							<div
								class="item-amount"
								:class="{ negative: (item.amount || 0) < 0 }"
							>
								{{ (item.amount || 0) < 0 ? '-' : '' }}¥{{ formatAmount(Math.abs(item.amount || 0)) }}
							</div>
							<div class="item-trends">
								<span
									class="item-trend"
									:class="getTrendClass(item.momTrend)"
								>
									{{ formatTrend(item.momTrend, '环比') }}
								</span>
								<span
									class="item-yoy"
									:class="getTrendClass(item.yoyTrend)"
								>
									{{ formatTrend(item.yoyTrend, '同比') }}
								</span>
							</div>
						</div>
					</div>
				</div>
			</template>

			<!-- 3. 生活缴费 (水费、燃气费、电费w/m、话费w/m/b/mj) -->
			<template v-if="utilityList.length > 0">
				<div class="section-bar">
					<div class="section-bar-left">
						<span class="section-dot section-dot--amber"></span>
						<span class="section-title">生活缴费</span>
						<span class="section-count section-count--amber">{{ utilityList.length }} 项</span>
					</div>
					<span class="section-subtotal section-subtotal--amber"> ¥{{ formatAmount(utilitySubtotal) }} </span>
				</div>
				<div class="utility-card-container">
					<div class="utility-grid">
						<div
							v-for="item in utilityList"
							:key="item.typeCode || item.typeName"
							class="utility-item"
							@click="goToFinanceManager(item)"
						>
							<div class="item-header">
								<span
									class="dot"
									:style="{ backgroundColor: getConfig(item.typeName).iconColor }"
								></span>
								<span class="name">{{ item.typeName }}</span>
							</div>
							<div
								class="amount"
								:class="{ negative: (item.amount || 0) < 0 }"
							>
								{{ (item.amount || 0) < 0 ? '-' : '' }}¥{{ formatAmount(Math.abs(item.amount || 0)) }}
							</div>
							<div
								class="trend"
								:class="getTrendClass(item.momTrend)"
							>
								{{ formatTrend(item.momTrend, '环比') }}
							</div>
						</div>
					</div>
				</div>
			</template>
		</template>
	</div>
</template>

<script lang="ts" setup>
import { showNotify } from 'vant';
import type { FinanceDetail } from '@/views/finance/financeAnalysis/financeAnalysisDetail/common';
import { getBalance } from '@/views/finance/financeAnalysis/api';
import { triggerHaptic } from '@/utils/haptics';
import { saveBalanceSnapshot } from '@/views/finance/financeAnalysis/composables/useAnalysisOfflineCache';

interface Props {
	activeTab: number | string;
	dateStr: string;
	belongTo?: string | null;
}

const props = defineProps<Props>();

const router = useRouter();
const loading = ref<boolean>(false);
const balanceList = ref<FinanceDetail[]>([]);
const sum = ref<number>(0);

// Type-to-UI Config Mapping (Tailwind Soft UI Tints)
interface TypeConfig {
	icon: string;
	color: string;
	iconColor: string;
}

const typeConfig: Record<string, TypeConfig> = {
	现金: { icon: 'balance-pay', color: 'rgba(16, 185, 129, 0.12)', iconColor: '#10b981' },
	银行卡: { icon: 'card', color: 'rgba(79, 106, 246, 0.12)', iconColor: '#4f6af6' },
	微信: { icon: 'wechat', color: 'rgba(16, 185, 129, 0.12)', iconColor: '#059669' },
	支付宝: { icon: 'qr', color: 'rgba(14, 165, 233, 0.12)', iconColor: '#0284c7' },
	花呗: { icon: 'credit-pay', color: 'rgba(244, 63, 94, 0.1)', iconColor: '#f43f5e' },
	京东: { icon: 'bag-o', color: 'rgba(244, 63, 94, 0.1)', iconColor: '#e11d48' },
	白条: { icon: 'bill-o', color: 'rgba(245, 158, 11, 0.12)', iconColor: '#d97706' },
	水费: { icon: 'circle', color: 'rgba(14, 165, 233, 0.12)', iconColor: '#0ea5e9' },
	燃气费: { icon: 'circle', color: 'rgba(245, 158, 11, 0.12)', iconColor: '#f59e0b' },
	电费w: { icon: 'circle', color: 'rgba(234, 179, 8, 0.14)', iconColor: '#eab308' },
	电费m: { icon: 'circle', color: 'rgba(245, 158, 11, 0.14)', iconColor: '#d97706' },
	话费w: { icon: 'circle', color: 'rgba(16, 185, 129, 0.12)', iconColor: '#10b981' },
	话费m: { icon: 'circle', color: 'rgba(20, 184, 166, 0.12)', iconColor: '#14b8a6' },
	话费b: { icon: 'circle', color: 'rgba(99, 102, 241, 0.12)', iconColor: '#6366f1' },
	话费mj: { icon: 'circle', color: 'rgba(139, 92, 246, 0.12)', iconColor: '#8b5cf6' },
};

const defaultConfig: TypeConfig = {
	icon: 'apps-o',
	color: '#f1f5f9',
	iconColor: '#64748b',
};

const getConfig = (name?: string) => typeConfig[name || ''] || defaultConfig;

const getTrendClass = (trend?: string) => {
	if (!trend || trend === '0.0%' || trend === '' || trend.includes('无')) return 'stable';
	return trend.startsWith('+') ? 'up' : 'down';
};

const formatTrend = (trend: string | undefined, defaultPrefix: string) => {
	if (!trend || trend === '0.0%' || trend === '' || trend.includes('无')) {
		return `${defaultPrefix} —`;
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
	const [int, dec] = sum.value.toFixed(2).split('.');
	return { int: Number(int).toLocaleString(), dec };
});

// 严格保留客户规定的三类账户分组：可动产 / 不动产 / 生活缴费
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

const calcSubtotal = (list: FinanceDetail[]) => (list || []).reduce((acc, item) => acc + (Number(item.amount) || 0), 0);

const movableSubtotal = computed(() => calcSubtotal(assetList.value));
const immovableSubtotal = computed(() => calcSubtotal(liabilityList.value));
const utilitySubtotal = computed(() => calcSubtotal(utilityList.value));

interface BalanceResponse {
	list: FinanceDetail[];
	yoyTrend?: string;
	momTrend?: string;
}

const applyBalanceData = (list: FinanceDetail[], yoy?: string, mom?: string) => {
	balanceList.value = list;
	totalYoy.value = yoy ?? '';
	totalMom.value = mom ?? '';
	sum.value = (list || []).reduce((acc: number, item: FinanceDetail) => acc + (Number(item.amount) || 0), 0);
};

const getBalanceInfo = async (userId: string | null, dateStr: string) => {
	loading.value = true;
	try {
		const { code, data, message } = await getBalance(userId, dateStr);
		if (code == '200') {
			let list: FinanceDetail[] = [];
			let yoy = '';
			let mom = '';
			if (Array.isArray(data)) {
				list = data;
			} else if (data && typeof data === 'object') {
				const res = data as BalanceResponse;
				list = res.list ?? [];
				yoy = res.yoyTrend ?? '';
				mom = res.momTrend ?? '';
			}

			applyBalanceData(list, yoy, mom);
			saveBalanceSnapshot(list, yoy, mom);
		} else {
			showNotify({ type: 'danger', message: message || '查询列表失败！' });
		}
	} finally {
		loading.value = false;
	}
};

const init = (dateStr: string, belongTo: number | string | null) => {
	getBalanceInfo(belongTo ? String(belongTo) : null, dateStr);
};

const goToFinanceManager = (item: FinanceDetail) => {
	triggerHaptic('medium');
	const query: Record<string, string | number> = { fromSource: item.typeCode || '' };
	if (props.belongTo && props.belongTo !== '0') {
		query.belongTo = props.belongTo;
	}
	router.push({ name: 'financeManager', query });
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
@keyframes shimmerPulse {
	0%,
	100% {
		opacity: 1;
	}
	50% {
		opacity: 0.45;
	}
}

.shimmer-white {
	background: rgba(255, 255, 255, 0.24);
	animation: shimmerPulse 1.5s ease-in-out infinite;
	border-radius: 8px;
}

.shimmer-slate {
	background: #e2e8f0;
	animation: shimmerPulse 1.5s ease-in-out infinite;
	border-radius: 8px;
}

.sk-line {
	display: inline-block;
}
.sk-w-10 {
	width: 40px;
}
.sk-w-12 {
	width: 48px;
}
.sk-w-14 {
	width: 56px;
}
.sk-w-16 {
	width: 64px;
}
.sk-w-20 {
	width: 80px;
}
.sk-w-24 {
	width: 96px;
}
.sk-w-28 {
	width: 112px;
}
.sk-h-3 {
	height: 11px;
}
.sk-h-4 {
	height: 14px;
}
.sk-h-5 {
	height: 20px;
}
.sk-mb-2 {
	margin-bottom: 8px;
}
.sk-icon-box {
	width: 34px;
	height: 34px;
	border-radius: 11px;
}
.sk-icon-box-sm {
	width: 38px;
	height: 38px;
	border-radius: 12px;
	flex-shrink: 0;
}
.sk-col {
	display: flex;
	flex-direction: column;
	gap: 6px;
	&--right {
		align-items: flex-end;
	}
}

.overview-container {
	box-sizing: border-box;
	padding: 14px 16px 28px;
	background-color: #f1f4fa;
	min-height: 100%;
}

.hero-card {
	background: linear-gradient(135deg, #4f6af6 0%, #6366f1 55%, #4f46e5 100%);
	border-radius: 22px;
	padding: 20px 18px 16px;
	color: #ffffff;
	box-shadow: 0 12px 28px -6px rgba(79, 106, 246, 0.35);
	margin-bottom: 20px;

	.hero-skeleton {
		.sk-hero-amount {
			width: 180px;
			height: 36px;
			border-radius: 10px;
			margin: 4px 0 14px;
		}
		.sk-hero-trends {
			display: flex;
			gap: 8px;
			margin-bottom: 14px;
		}
		.sk-hero-pill {
			width: 88px;
			height: 22px;
			border-radius: 9999px;
		}
	}

	.sk-subcard-val {
		width: 68px;
		height: 14px;
		border-radius: 6px;
		margin-top: 2px;
	}

	.hero-top-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 8px;
	}

	.hero-title-group {
		display: flex;
		align-items: baseline;
		gap: 8px;
	}

	.hero-title {
		font-size: 13px;
		font-weight: 600;
		opacity: 0.92;
	}

	.hero-subtitle {
		font-size: 10px;
		font-weight: 600;
		letter-spacing: 0.08em;
		opacity: 0.6;
	}

	.hero-badge {
		font-size: 11px;
		font-weight: 600;
		padding: 3px 10px;
		border-radius: 9999px;
		background: rgba(255, 255, 255, 0.16);
		backdrop-filter: blur(4px);
	}

	.hero-amount {
		margin-bottom: 12px;
		font-variant-numeric: tabular-nums;
		line-height: 1.1;

		.currency {
			font-size: 18px;
			font-weight: 700;
			margin-right: 2px;
			opacity: 0.9;
		}
		.integer {
			font-size: 34px;
			font-weight: 800;
			letter-spacing: -0.02em;
		}
		.decimal {
			font-size: 18px;
			font-weight: 700;
			opacity: 0.85;
		}
	}

	.hero-trends {
		display: flex;
		gap: 8px;
		margin-bottom: 14px;

		.trend-tag {
			background: rgba(255, 255, 255, 0.16);
			padding: 4px 10px;
			border-radius: 9999px;
			font-size: 11px;
			font-weight: 500;
			font-variant-numeric: tabular-nums;
			display: inline-flex;
			align-items: center;
			gap: 4px;
			backdrop-filter: blur(4px);
		}
	}

	.hero-subgrid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 8px;
		padding-top: 12px;
		border-top: 1px solid rgba(255, 255, 255, 0.14);
	}

	.hero-subcard {
		background: rgba(255, 255, 255, 0.12);
		border-radius: 12px;
		padding: 8px 10px;
		backdrop-filter: blur(4px);
		min-width: 0;

		.subcard-label {
			display: flex;
			align-items: center;
			gap: 5px;
			font-size: 11px;
			opacity: 0.85;
			margin-bottom: 4px;
		}

		.subcard-dot {
			width: 6px;
			height: 6px;
			border-radius: 9999px;
			flex-shrink: 0;

			&--indigo {
				background: #a5b4fc;
			}
			&--emerald {
				background: #6ee7b7;
			}
			&--amber {
				background: #fcd34d;
			}
		}

		.subcard-val {
			font-size: 12px;
			font-weight: 700;
			font-variant-numeric: tabular-nums;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}
	}
}

.section-bar {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin: 18px 2px 10px;

	.section-bar-left {
		display: flex;
		align-items: center;
		gap: 7px;
	}

	.section-dot {
		width: 8px;
		height: 8px;
		border-radius: 9999px;

		&--indigo {
			background-color: #4f6af6;
		}
		&--emerald {
			background-color: #10b981;
		}
		&--amber {
			background-color: #f59e0b;
		}
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

		&--indigo {
			background: rgba(79, 106, 246, 0.1);
			color: #4f6af6;
		}
		&--emerald {
			background: rgba(16, 185, 129, 0.1);
			color: #059669;
		}
		&--amber {
			background: rgba(245, 158, 11, 0.12);
			color: #d97706;
		}
	}

	.section-subtotal {
		font-size: 14px;
		font-weight: 800;
		color: #4f6af6;
		font-variant-numeric: tabular-nums;

		&--emerald {
			color: #059669;
		}
		&--amber {
			color: #d97706;
		}
		&.negative {
			color: #f43f5e;
		}
	}
}

.asset-grid {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 10px;

	.asset-card {
		background: #ffffff;
		border-radius: 18px;
		padding: 14px;
		box-shadow: 0 4px 16px rgba(15, 23, 42, 0.04);
		cursor: pointer;
		transition: transform 0.15s ease;

		&:active {
			transform: scale(0.98);
		}

		.card-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 10px;

			.icon-box {
				width: 34px;
				height: 34px;
				border-radius: 11px;
				display: flex;
				align-items: center;
				justify-content: center;
				font-size: 18px;
			}

			.card-name {
				font-size: 13px;
				font-weight: 600;
				color: #475569;
			}
		}

		.card-amount {
			font-size: 18px;
			font-weight: 800;
			color: #0f172a;
			font-variant-numeric: tabular-nums;
			margin-bottom: 6px;

			&.negative {
				color: #f43f5e;
			}
		}

		.card-trends {
			display: flex;
			flex-direction: row;
			flex-wrap: wrap;
			gap: 6px;
			.trend {
				font-size: 10px;
				font-variant-numeric: tabular-nums;
				&.up {
					color: #f43f5e;
				}
				&.down {
					color: #10b981;
				}
				&.stable {
					color: #94a3b8;
				}
			}
		}
	}
}

.liability-list {
	background: #ffffff;
	border-radius: 18px;
	overflow: hidden;
	box-shadow: 0 4px 16px rgba(15, 23, 42, 0.04);

	.liability-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 14px 16px;
		border-bottom: 1px solid #f1f5f9;
		cursor: pointer;
		transition: background-color 0.15s ease;

		&:active {
			background-color: #f8fafc;
		}

		&:last-child {
			border-bottom: none;
		}

		.item-left {
			display: flex;
			gap: 12px;
			align-items: center;

			.icon-box-small {
				width: 38px;
				height: 38px;
				border-radius: 12px;
				display: flex;
				align-items: center;
				justify-content: center;
				font-size: 20px;
			}

			.item-info {
				.item-name {
					font-size: 14px;
					font-weight: 700;
					color: #0f172a;
				}
				.item-sub {
					font-size: 11px;
					color: #94a3b8;
					margin-top: 2px;
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
				font-weight: 800;
				color: #0f172a;
				font-variant-numeric: tabular-nums;
				&.negative {
					color: #f43f5e;
				}
			}

			.item-trends {
				display: flex;
				gap: 8px;
				.item-trend,
				.item-yoy {
					font-size: 11px;
					font-variant-numeric: tabular-nums;
					&.up {
						color: #f43f5e;
					}
					&.down {
						color: #10b981;
					}
					&.stable {
						color: #94a3b8;
					}
				}
			}
		}
	}
}

.utility-card-container {
	background: #ffffff;
	border-radius: 18px;
	padding: 14px;
	box-shadow: 0 4px 16px rgba(15, 23, 42, 0.04);
}

.utility-grid {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 10px;

	.utility-item {
		background: #f8fafc;
		border-radius: 14px;
		padding: 12px;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		cursor: pointer;
		transition: all 0.15s ease;

		&:active {
			transform: scale(0.98);
			background: #f1f5f9;
		}

		.item-header {
			display: flex;
			align-items: center;
			gap: 6px;
			margin-bottom: 6px;

			.dot {
				width: 7px;
				height: 7px;
				border-radius: 50%;
			}
			.name {
				font-size: 13px;
				color: #475569;
				font-weight: 600;
			}
		}

		.amount {
			font-size: 15px;
			font-weight: 800;
			color: #0f172a;
			font-variant-numeric: tabular-nums;
			margin-bottom: 3px;

			&.negative {
				color: #f43f5e;
			}
		}

		.trend {
			font-size: 10px;
			color: #94a3b8;
			font-variant-numeric: tabular-nums;
			&.up {
				color: #f43f5e;
			}
			&.down {
				color: #10b981;
			}
			&.stable {
				color: #94a3b8;
			}
		}
	}
}
</style>
