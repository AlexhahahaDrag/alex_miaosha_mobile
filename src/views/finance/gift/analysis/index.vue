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
import { useNavBar } from '@/composables/useNavBar';
import { useTabBar } from '@/composables/useTabBar';
import { triggerHaptic } from '@/utils/haptics';
import { getGiftAnalysisOverview, getGiftBalanceMatrix } from '@/views/finance/gift/analysis/api';
import GiftReturnCalculatorPopup from '@/views/finance/gift/analysis/components/GiftReturnCalculatorPopup.vue';
import { GIFT_TAB_BAR, directionText, formatMoney, type GiftPersonBalance } from '@/views/finance/gift/config';

useNavBar({ title: '统计报表', visible: true });

useTabBar({
	visible: true,
	data: [...GIFT_TAB_BAR],
});

const report = reactive({ receive: 0, give: 0, net: 0 });
const rows = ref<{ label: string; count: number; amount: number }[]>([]);

// 矩阵数据
const matrixList = ref<GiftPersonBalance[]>([]);
const matrixLoading = ref(false);
const searchKeyword = ref('');
const showCalculator = ref(false);
const selectedPerson = ref<GiftPersonBalance | null>(null);

const filteredMatrixList = computed(() => {
	const kw = searchKeyword.value.trim().toLowerCase();
	if (!kw) return matrixList.value;
	return matrixList.value.filter(
		(item) =>
			item.personName.toLowerCase().includes(kw) ||
			(item.relationTypeName && item.relationTypeName.toLowerCase().includes(kw)),
	);
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
.matrix-card,
.rank-card {
	background: #fff;
	border-radius: 16px;
	box-shadow: 0 6px 18px rgba(32, 152, 238, 0.08);
	padding: 16px;
	margin-bottom: 14px;
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
