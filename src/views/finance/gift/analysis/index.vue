<template>
	<div class="gift-analysis">
		<!-- 顶部收支统计卡片 -->
		<section class="report-card">
			<div>
				<span>收礼总额</span>
				<strong>{{ formatMoney(report.receive) }}</strong>
			</div>
			<div>
				<span>随礼/回礼</span>
				<strong>{{ formatMoney(report.give) }}</strong>
			</div>
			<div>
				<span>人情净值</span>
				<strong>{{ formatMoney(report.net) }}</strong>
			</div>
		</section>

		<!-- 人情收支与顺逆差走势图 / 亲友人脉图谱 -->
		<section
			class="trend-card"
			data-testid="gift-mobile-trend-card"
		>
			<div class="trend-card__header">
				<div class="title-with-badge">
					<h3>{{ activeVisualTab === 'trend' ? '📈 收支顺逆差走势' : '🕸️ 亲友人际网络图谱' }}</h3>
					<span class="trend-subtitle">{{
						activeVisualTab === 'trend' ? '柱条显示收送 · 折线呈现差额' : '以我为枢纽辐射亲友社交圈'
					}}</span>
				</div>
				<div
					class="trend-tab-toggle"
					data-testid="mobile-trend-tab-toggle"
				>
					<span
						class="toggle-btn"
						:class="{ active: activeVisualTab === 'trend' }"
						@click="switchVisualTab('trend')"
					>
						走势
					</span>
					<span
						class="toggle-btn"
						:class="{ active: activeVisualTab === 'graph' }"
						@click="switchVisualTab('graph')"
					>
						人脉
					</span>
				</div>
			</div>
			<div v-if="activeVisualTab === 'trend'">
				<div
					v-if="trendList.length === 0"
					class="empty-trend"
				>
					暂无月度人情收支记录
				</div>
				<div
					v-else
					class="trend-chart-box"
					data-testid="gift-mobile-trend-chart"
				>
					<BaseChart
						:options="trendChartOption"
						height="220px"
					/>
				</div>
			</div>
			<div v-else>
				<div
					v-if="matrixList.length === 0"
					class="empty-trend"
				>
					暂无亲友人脉数据
				</div>
				<div
					v-else
					class="trend-chart-box"
					data-testid="gift-mobile-graph-chart"
				>
					<BaseChart
						:options="mobileGraphOption"
						height="250px"
					/>
				</div>
			</div>
		</section>

		<!-- 亲友互赠收支平衡矩阵与 AI 回礼速算板块 -->
		<section
			class="matrix-card"
			data-testid="gift-balance-matrix-section"
		>
			<div class="matrix-card__header">
				<div class="title-with-badge">
					<h3>⚖️ 亲友互赠平衡矩阵</h3>
					<span
						v-if="matrixAlertCount > 0"
						class="alert-badge"
						data-testid="matrix-alert-badge"
					>
						{{ matrixAlertCount }} 人失衡预警
					</span>
				</div>
				<div class="header-desc">双向轧差对账 · 智能测算回礼</div>
			</div>

			<!-- 搜索与筛选 -->
			<div class="search-bar">
				<van-search
					v-model="searchKeyword"
					placeholder="搜索亲友姓名..."
					shape="round"
					clearable
					@search="handleSearch"
					@clear="handleSearch"
				/>
			</div>

			<!-- 圈层筛选胶囊 -->
			<div
				class="circle-chips-bar"
				data-testid="matrix-circle-chips"
			>
				<div
					v-for="chip in circleOptions"
					:key="chip.value"
					class="circle-chip"
					:class="{ active: selectedCircle === chip.value }"
					@click="handleSelectCircle(chip.value)"
				>
					{{ chip.label }}
				</div>
			</div>

			<!-- 矩阵列表 -->
			<van-loading
				v-if="matrixLoading"
				class="matrix-loading"
				type="spinner"
			>
				加载人情对账中...
			</van-loading>

			<div
				v-else-if="filteredMatrixList.length === 0"
				class="empty-tip"
			>
				暂无往来对账数据
			</div>

			<div
				v-else
				class="balance-list"
			>
				<div
					v-for="item in filteredMatrixList"
					:key="item.personId"
					class="balance-item"
					:data-testid="`balance-item-${item.personId}`"
				>
					<div class="item-main">
						<div class="person-row">
							<span class="person-name">{{ item.personName }}</span>
							<span
								v-if="item.relationTypeName || item.relationType"
								class="relation-pill"
							>
								{{ item.relationTypeName || item.relationType }}
							</span>
							<span
								class="status-pill"
								:class="item.balanceStatus.toLowerCase()"
							>
								{{ statusText(item.balanceStatus) }}
							</span>
						</div>

						<!-- 失衡预警提示条 -->
						<div
							v-if="item.isImbalancedAlert"
							class="imbalance-warning"
							data-testid="item-imbalance-warning"
							@click="handleAlertClick(item)"
						>
							⚠️ {{ item.alertReason || '单向大额礼金超180天无互动' }}
						</div>

						<div class="stat-grid">
							<div class="stat-col">
								<span class="lbl">收TA礼金</span>
								<span class="amt text-green">¥{{ item.totalReceiveAmount.toFixed(2) }}</span>
							</div>
							<div class="stat-col">
								<span class="lbl">随TA礼金</span>
								<span class="amt text-blue">¥{{ item.totalGiveAmount.toFixed(2) }}</span>
							</div>
							<div class="stat-col">
								<span class="lbl">净差额</span>
								<span
									class="amt font-bold"
									:class="getNetClass(item.balanceStatus)"
								>
									{{ item.netBalance > 0 ? '+' : '' }}¥{{ item.netBalance.toFixed(2) }}
								</span>
							</div>
						</div>
					</div>

					<div class="item-actions">
						<van-button
							size="small"
							type="primary"
							plain
							round
							class="ai-btn"
							:data-testid="`btn-ai-calc-${item.personId}`"
							@click="openAiCalculator(item)"
						>
							✨ AI 测算回礼
						</van-button>
					</div>
				</div>
			</div>
		</section>

		<!-- 方向统计 -->
		<section class="rank-card">
			<h3>方向统计</h3>
			<div
				v-for="item in rows"
				:key="item.label"
				class="rank-row"
			>
				<span>{{ item.label }}</span>
				<strong>{{ item.count }} 笔 · {{ formatMoney(item.amount) }}</strong>
			</div>
		</section>

		<!-- AI 智能洞察卡片 -->
		<section
			class="ai-insight-mount"
			data-testid="gift-analysis-ai-insight"
		>
			<gift-ai-insight-card />
		</section>

		<!-- AI 回礼测算 BottomSheet 弹窗 -->
		<gift-return-calculator-popup
			v-model="showCalculator"
			:person="selectedPerson"
		/>
	</div>
</template>

<script setup lang="ts">
import { showFailToast, showToast } from 'vant';
import GiftAiInsightCard from '@/views/finance/gift/ai/GiftAiInsightCard.vue';
import { triggerHaptic } from '@/utils/haptics';
import { getGiftAnalysisOverview, getGiftBalanceMatrix, getGiftAnalysisTrend } from '@/views/finance/gift/analysis/api';
import GiftReturnCalculatorPopup from '@/views/finance/gift/analysis/components/GiftReturnCalculatorPopup.vue';
import {
	GIFT_TAB_BAR,
	directionText,
	formatMoney,
	type GiftPersonBalance,
	type GiftAmountTrend,
} from '@/views/finance/gift/config';

useNavBar({ title: '统计报表', visible: true });

useTabBar({
	visible: true,
	data: [...GIFT_TAB_BAR],
});

const report = reactive({ receive: 0, give: 0, net: 0 });
const rows = ref<{ label: string; count: number; amount: number }[]>([]);

// 趋势数据
const trendList = ref<GiftAmountTrend[]>([]);
const trendChartOption = computed(() => {
	if (trendList.value.length === 0) return {};
	const xData = trendList.value.map((item) => item.label || '');
	const receiveData = trendList.value.map((item) => Number(item.receiveAmount || 0));
	const giveData = trendList.value.map((item) => Number(item.giveAmount || 0));
	const gapData = trendList.value.map((item) => Number(item.receiveAmount || 0) - Number(item.giveAmount || 0));

	return {
		tooltip: {
			trigger: 'axis',
			axisPointer: { type: 'shadow' },
			confine: true,
		},
		legend: {
			data: ['收礼', '随礼', '顺逆差'],
			top: 0,
			itemWidth: 10,
			itemHeight: 10,
			textStyle: { fontSize: 11 },
		},
		grid: {
			left: '3%',
			right: '3%',
			bottom: '3%',
			top: '36px',
			outerBoundsMode: 'same',
		},
		xAxis: {
			type: 'category',
			data: xData,
			axisLabel: { fontSize: 10, interval: 0 },
		},
		yAxis: [
			{
				type: 'value',
				splitLine: { lineStyle: { type: 'dashed', color: '#f1f5f9' } },
				axisLabel: { fontSize: 10 },
			},
			{
				type: 'value',
				show: false,
			},
		],
		series: [
			{
				name: '收礼',
				type: 'bar',
				barWidth: 10,
				data: receiveData,
				itemStyle: { color: '#10b981', borderRadius: [3, 3, 0, 0] },
			},
			{
				name: '随礼',
				type: 'bar',
				barWidth: 10,
				data: giveData,
				itemStyle: { color: '#f59e0b', borderRadius: [3, 3, 0, 0] },
			},
			{
				name: '顺逆差',
				type: 'line',
				yAxisIndex: 1,
				smooth: true,
				data: gapData,
				itemStyle: { color: '#3b82f6' },
				lineStyle: { width: 2 },
				symbolSize: 4,
			},
		],
	};
});

// 矩阵数据
const matrixList = ref<GiftPersonBalance[]>([]);
const matrixLoading = ref(false);
const searchKeyword = ref('');
const showCalculator = ref(false);
const selectedPerson = ref<GiftPersonBalance | null>(null);

// 可视化走势与图谱选项卡
const activeVisualTab = ref<'trend' | 'graph'>('trend');
const switchVisualTab = (tab: 'trend' | 'graph') => {
	activeVisualTab.value = tab;
	triggerHaptic('selection');
};

const mobileGraphOption = computed(() => {
	const list = matrixList.value || [];
	if (list.length === 0) return {};

	const nodes: any[] = [
		{
			id: 'NODE_ME',
			name: '我',
			symbolSize: 34,
			itemStyle: { color: '#2563eb' },
			label: { show: true, fontSize: 11, color: '#fff' },
		},
	];
	const links: any[] = [];

	const categories = [
		{ id: 'HUB_RELATIVE', name: '亲属', color: '#16a34a' },
		{ id: 'HUB_COLLEAGUE', name: '同事', color: '#ea580c' },
		{ id: 'HUB_FRIEND', name: '好友', color: '#7c3aed' },
		{ id: 'HUB_CLASSMATE', name: '同学', color: '#0891b2' },
	];

	categories.forEach((cat) => {
		nodes.push({
			id: cat.id,
			name: cat.name,
			symbolSize: 22,
			itemStyle: { color: cat.color },
			label: { show: true, fontSize: 10, color: '#fff' },
		});
		links.push({
			source: 'NODE_ME',
			target: cat.id,
			lineStyle: { color: cat.color, width: 2 },
		});
	});

	// 选取前 8 位往来体量最高亲友
	const topList = [...list]
		.sort(
			(a, b) =>
				Number(b.totalReceiveAmount || 0) +
				Number(b.totalGiveAmount || 0) -
				(Number(a.totalReceiveAmount || 0) + Number(a.totalGiveAmount || 0)),
		)
		.slice(0, 8);

	topList.forEach((item) => {
		let hubId = 'HUB_FRIEND';
		let hubColor = '#7c3aed';
		if (item.relationType === 'RELATIVE' || (item.relationTypeName && item.relationTypeName.includes('亲'))) {
			hubId = 'HUB_RELATIVE';
			hubColor = '#16a34a';
		} else if (item.relationType === 'COLLEAGUE' || (item.relationTypeName && item.relationTypeName.includes('同'))) {
			hubId = 'HUB_COLLEAGUE';
			hubColor = '#ea580c';
		} else if (item.relationType === 'CLASSMATE' || (item.relationTypeName && item.relationTypeName.includes('学'))) {
			hubId = 'HUB_CLASSMATE';
			hubColor = '#0891b2';
		}

		const pNodeId = `P_${item.personId}`;
		nodes.push({
			id: pNodeId,
			name: item.personName,
			symbolSize: 18,
			itemStyle: { color: hubColor },
			label: { show: true, fontSize: 9, position: 'bottom' },
		});
		links.push({
			source: hubId,
			target: pNodeId,
			lineStyle: { width: 1, opacity: 0.6 },
		});
	});

	return {
		tooltip: { show: true, confine: true },
		series: [
			{
				type: 'graph',
				layout: 'force',
				data: nodes,
				links,
				roam: false,
				force: {
					repulsion: 85,
					gravity: 0.1,
					edgeLength: [25, 60],
				},
				label: { show: true },
			},
		],
	};
});

const circleOptions = [
	{ label: '全部圈子', value: 'all' },
	{ label: '亲属圈', value: 'RELATIVES' },
	{ label: '同事情', value: 'COLLEAGUE' },
	{ label: '好友圈', value: 'FRIEND' },
	{ label: '同学情', value: 'CLASSMATE' },
];
const selectedCircle = ref('all');

const handleSelectCircle = (val: string) => {
	triggerHaptic('selection');
	selectedCircle.value = val;
};

const filteredMatrixList = computed(() => {
	const kw = searchKeyword.value.trim().toLowerCase();
	const circle = selectedCircle.value;
	return matrixList.value.filter((item) => {
		const matchKw =
			!kw ||
			item.personName.toLowerCase().includes(kw) ||
			(item.relationTypeName && item.relationTypeName.toLowerCase().includes(kw));
		const matchCircle =
			circle === 'all' ||
			item.relationType === circle ||
			(circle === 'RELATIVES' && (item.relationTypeName?.includes('亲') || item.relationType?.includes('亲')));
		return matchKw && matchCircle;
	});
});

const matrixAlertCount = computed(() => {
	return matrixList.value.filter((item) => item.isImbalancedAlert).length;
});

const statusText = (status: 'SURPLUS' | 'DEFICIT' | 'BALANCED') => {
	switch (status) {
		case 'SURPLUS':
			return '礼金盈余(待回)';
		case 'DEFICIT':
			return '礼金借出(待收)';
		case 'BALANCED':
			return '收支基本持平';
		default:
			return status;
	}
};

const getNetClass = (status: 'SURPLUS' | 'DEFICIT' | 'BALANCED') => {
	if (status === 'SURPLUS') return 'text-orange';
	if (status === 'DEFICIT') return 'text-blue';
	return 'text-green';
};

const openAiCalculator = (item: GiftPersonBalance) => {
	triggerHaptic('light');
	selectedPerson.value = item;
	showCalculator.value = true;
};

const handleAlertClick = (item: GiftPersonBalance) => {
	triggerHaptic('warning');
	showToast(item.alertReason || '单向大额礼金超180天无互动');
};

const handleSearch = () => {
	triggerHaptic('selection');
};

const loadOverview = async () => {
	const { code, data, message } = await getGiftAnalysisOverview();
	if (code !== '200' || !data) {
		showFailToast(message || '统计加载失败');
		return;
	}
	report.receive = Number(data.receiveAmount || 0);
	report.give = Number(data.giveAmount || 0) + Number(data.returnAmount || 0);
	report.net = Number(data.netAmount ?? report.receive - report.give);
	rows.value = [
		{
			label: directionText('RECEIVE'),
			count: Number(data.receiveCount || 0),
			amount: Number(data.receiveAmount || 0),
		},
		{
			label: directionText('GIVE'),
			count: Number(data.giveCount || 0),
			amount: Number(data.giveAmount || 0),
		},
		{
			label: directionText('RETURN'),
			count: Number(data.returnCount || 0),
			amount: Number(data.returnAmount || 0),
		},
	];
};

const loadTrend = async () => {
	try {
		const { code, data } = await getGiftAnalysisTrend();
		if ((code === '200' || code === '00000') && Array.isArray(data)) {
			trendList.value = data;
		}
	} catch {
		trendList.value = [];
	}
};

const loadMatrix = async () => {
	matrixLoading.value = true;
	try {
		const { code, data } = await getGiftBalanceMatrix();
		if (code === '200' || code === '00000') {
			matrixList.value = data || [];
		}
	} catch {
		// 矩阵加载失败兜底
	} finally {
		matrixLoading.value = false;
	}
};

onMounted(() => {
	void loadOverview();
	void loadTrend();
	void loadMatrix();
});
</script>

<style scoped lang="less">
.gift-analysis {
	box-sizing: border-box;
	min-height: 100%;
	padding: 14px;
	background: #f8fbff;
}

.report-card,
.trend-card,
.matrix-card,
.rank-card {
	background: #fff;
	border-radius: 16px;
	box-shadow: 0 6px 18px rgba(32, 152, 238, 0.08);
	padding: 16px;
	margin-bottom: 14px;
}

.trend-card {
	.trend-card__header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 8px;
		.title-with-badge {
			display: flex;
			flex-direction: column;
			gap: 4px;
			h3 {
				margin: 0;
				font-size: 16px;
				font-weight: 700;
				color: #0f172a;
			}
			.trend-subtitle {
				font-size: 11px;
				color: #94a3b8;
			}
		}

		.trend-tab-toggle {
			display: inline-flex;
			background: #f1f5f9;
			padding: 2px;
			border-radius: 8px;
			gap: 2px;

			.toggle-btn {
				padding: 2px 8px;
				font-size: 11px;
				color: #64748b;
				border-radius: 6px;
				cursor: pointer;
				transition: all 0.2s;

				&.active {
					background: #ffffff;
					color: #2563eb;
					font-weight: 600;
					box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
				}
			}
		}
	}

	.empty-trend {
		text-align: center;
		font-size: 12px;
		color: #94a3b8;
		padding: 24px 0;
	}

	.trend-chart-box {
		width: 100%;
		margin-top: 4px;
	}
}

.report-card {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 10px;
}

.report-card span,
.rank-row span {
	color: #8a94a6;
	font-size: 12px;
}

.report-card strong,
.rank-row strong {
	display: block;
	margin-top: 8px;
	color: #1f2937;
}

.matrix-card {
	.matrix-card__header {
		margin-bottom: 12px;
		.title-with-badge {
			display: flex;
			align-items: center;
			gap: 8px;
			h3 {
				margin: 0;
				font-size: 16px;
				font-weight: 700;
				color: #0f172a;
			}
			.alert-badge {
				font-size: 11px;
				padding: 2px 8px;
				border-radius: 12px;
				background: #fee2e2;
				color: #ef4444;
				font-weight: 600;
			}
		}
		.header-desc {
			font-size: 12px;
			color: #94a3b8;
			margin-top: 4px;
		}
	}

	.search-bar {
		margin: 0 -8px 10px;
		:deep(.van-search) {
			padding: 0 8px;
			background: transparent;
		}
	}

	.circle-chips-bar {
		display: flex;
		align-items: center;
		gap: 8px;
		overflow-x: auto;
		white-space: nowrap;
		padding-bottom: 8px;
		margin-bottom: 8px;
		-webkit-overflow-scrolling: touch;
		&::-webkit-scrollbar {
			display: none;
		}

		.circle-chip {
			display: inline-flex;
			align-items: center;
			padding: 4px 10px;
			border-radius: 14px;
			font-size: 12px;
			background: #f1f5f9;
			color: #64748b;
			cursor: pointer;
			transition: all 0.2s;
			user-select: none;

			&.active {
				background: #2563eb;
				color: #ffffff;
				font-weight: 600;
				box-shadow: 0 2px 6px rgba(37, 99, 235, 0.25);
			}
		}
	}

	.matrix-loading {
		text-align: center;
		padding: 24px 0;
		color: #94a3b8;
	}

	.empty-tip {
		text-align: center;
		font-size: 13px;
		color: #94a3b8;
		padding: 24px 0;
	}
}

.balance-list {
	display: flex;
	flex-direction: column;
	gap: 12px;
}

.balance-item {
	background: #f8fafc;
	border: 1px solid #e2e8f0;
	border-radius: 12px;
	padding: 12px;
	transition: all 0.2s;

	.item-main {
		margin-bottom: 10px;
	}

	.person-row {
		display: flex;
		align-items: center;
		gap: 6px;
		margin-bottom: 8px;

		.person-name {
			font-size: 15px;
			font-weight: 700;
			color: #1e293b;
		}

		.relation-pill {
			font-size: 11px;
			padding: 1px 6px;
			border-radius: 4px;
			background: #e2e8f0;
			color: #475569;
		}

		.status-pill {
			margin-left: auto;
			font-size: 11px;
			padding: 2px 8px;
			border-radius: 10px;
			font-weight: 600;

			&.surplus {
				background: #fff7ed;
				color: #ea580c;
				border: 1px solid #ffedd5;
			}
			&.deficit {
				background: #eff6ff;
				color: #2563eb;
				border: 1px solid #dbeafe;
			}
			&.balanced {
				background: #f0fdf4;
				color: #16a34a;
				border: 1px solid #dcfce7;
			}
		}
	}

	.imbalance-warning {
		font-size: 11px;
		color: #b91c1c;
		background: #fef2f2;
		border: 1px solid #fecaca;
		padding: 4px 8px;
		border-radius: 6px;
		margin-bottom: 8px;
		cursor: pointer;
	}

	.stat-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 6px;
		background: #fff;
		padding: 8px;
		border-radius: 8px;

		.stat-col {
			display: flex;
			flex-direction: column;
			align-items: center;

			.lbl {
				font-size: 10px;
				color: #94a3b8;
			}
			.amt {
				font-size: 12px;
				margin-top: 2px;
			}
			.text-green {
				color: #16a34a;
			}
			.text-blue {
				color: #2563eb;
			}
			.text-orange {
				color: #ea580c;
			}
			.font-bold {
				font-weight: 700;
			}
		}
	}

	.item-actions {
		display: flex;
		justify-content: flex-end;

		.ai-btn {
			height: 30px;
			padding: 0 12px;
			font-size: 12px;
			font-weight: 600;
		}
	}
}

.rank-card h3 {
	margin: 0 0 12px;
	font-size: 16px;
}

.rank-row {
	display: flex;
	justify-content: space-between;
	padding: 12px 0;
	border-top: 1px solid #f1f5f9;
}

.ai-insight-mount {
	margin: 0 -14px;
}
</style>
