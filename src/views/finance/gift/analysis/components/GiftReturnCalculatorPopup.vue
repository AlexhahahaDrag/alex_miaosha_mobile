<template>
	<van-popup
		v-model:show="visible"
		position="bottom"
		round
		closeable
		:style="{ maxHeight: '85%' }"
		data-testid="gift-return-calculator-popup"
		@close="handleClose"
	>
		<div class="calculator-panel">
			<div class="panel-header">
				<div class="panel-title">
					<span>🧧</span>
					<span>AI 智能回礼速算</span>
				</div>
				<div
					v-if="person"
					class="panel-sub"
				>
					对象：<strong>{{ person.personName }}</strong>
					<span
						v-if="person.relationTypeName || person.relationType"
						class="relation-tag"
					>
						{{ person.relationTypeName || person.relationType }}
					</span>
				</div>
			</div>

			<!-- 往来对账基准卡片 -->
			<div
				v-if="person"
				class="balance-summary-strip"
			>
				<div class="summary-item">
					<span class="label">累计收礼</span>
					<span class="val text-green">¥{{ person.totalReceiveAmount.toFixed(2) }}</span>
				</div>
				<div class="summary-item">
					<span class="label">累计随礼</span>
					<span class="val text-blue">¥{{ person.totalGiveAmount.toFixed(2) }}</span>
				</div>
				<div class="summary-item">
					<span class="label">当前净差额</span>
					<span
						class="val font-bold"
						:class="netBalanceClass"
					>
						{{ netBalanceText }}
					</span>
				</div>
			</div>

			<!-- 事由快捷选取 -->
			<div class="section-title">回礼事由</div>
			<div class="event-chips">
				<div
					v-for="chip in eventPresets"
					:key="chip.value"
					class="event-chip"
					:class="{ active: currentEventType === chip.value }"
					:data-testid="`event-chip-${chip.value}`"
					@click="selectEventType(chip.value)"
				>
					{{ chip.label }}
				</div>
			</div>

			<!-- 城市消费水平 (可选微调) -->
			<div class="section-title">城市生活圈</div>
			<div class="city-chips">
				<div
					v-for="city in cityTiers"
					:key="city.value"
					class="city-chip"
					:class="{ active: currentCityTier === city.value }"
					@click="selectCityTier(city.value)"
				>
					{{ city.label }}
				</div>
			</div>

			<!-- 计算触发按钮 -->
			<div class="calc-action-row">
				<van-button
					type="primary"
					block
					round
					:loading="loading"
					data-testid="ai-calc-btn"
					@click="calculateReturnGift"
				>
					⚡ 智能测算吉利回礼档位
				</van-button>
			</div>

			<!-- 计算结果呈现区域 -->
			<div
				v-if="result"
				class="result-container"
				data-testid="ai-calc-result"
			>
				<div class="tier-cards">
					<!-- 最低体面档 -->
					<div
						class="tier-card min"
						:class="{ selected: selectedTier === 'min' }"
						@click="selectTier('min')"
					>
						<div class="tier-badge">最低体面档</div>
						<div class="tier-amount">¥{{ result.minDecentAmount }}</div>
						<div class="tier-tip">礼数周全 · 绝不失礼</div>
					</div>

					<!-- 推荐平衡档 (默认高亮) -->
					<div
						class="tier-card rec"
						:class="{ selected: selectedTier === 'rec' }"
						@click="selectTier('rec')"
					>
						<div class="tier-badge popular">推荐平衡档</div>
						<div class="tier-amount">¥{{ result.recommendedAmount }}</div>
						<div class="tier-tip">对等吉利 · 增进交情</div>
					</div>

					<!-- 热络加码档 -->
					<div
						class="tier-card max"
						:class="{ selected: selectedTier === 'max' }"
						@click="selectTier('max')"
					>
						<div class="tier-badge">热络加码档</div>
						<div class="tier-amount">¥{{ result.generousAmount }}</div>
						<div class="tier-tip">厚礼相待 · 感情升温</div>
					</div>
				</div>

				<!-- 推导逻辑说明 -->
				<div class="result-box logic-box">
					<div class="box-head">
						<span>💡 算法推导逻辑</span>
						<span class="base-tag">往来基准: ¥{{ result.historicalBaseAmount }}</span>
					</div>
					<div class="box-content">{{ result.ruleSummary }}</div>
				</div>

				<!-- 吉利贺词与一键复制 -->
				<div class="result-box blessing-box">
					<div class="box-head">
						<span>📜 随礼随赠吉利贺词</span>
						<van-button
							size="mini"
							type="primary"
							plain
							round
							data-testid="copy-blessing-btn"
							@click="copyBlessing"
						>
							一键复制
						</van-button>
					</div>
					<div class="blessing-text">{{ result.blessingWords }}</div>
				</div>
			</div>
		</div>
	</van-popup>
</template>

<script setup lang="ts">
import { showToast, showSuccessToast, showFailToast } from 'vant';
import { triggerHaptic } from '@/utils/haptics';
import { recommendReturnGift } from '@/views/finance/gift/analysis/api';
import type { GiftPersonBalance, GiftReturnRecommendationVo } from '@/views/finance/gift/config';

const props = defineProps<{
	modelValue: boolean;
	person?: GiftPersonBalance | null;
}>();

const emit = defineEmits<{
	(e: 'update:modelValue', val: boolean): void;
	(e: 'selected', amount: number): void;
}>();

const visible = computed({
	get: () => props.modelValue,
	set: (val) => emit('update:modelValue', val),
});

const eventPresets = [
	{ label: '💒 婚宴结婚', value: 'WEDDING' },
	{ label: '👶 满月/百天', value: 'FULL_MONTH' },
	{ label: '🎂 生日/寿诞', value: 'BIRTHDAY' },
	{ label: '🏡 乔迁新居', value: 'HOUSEWARMING' },
	{ label: '🎓 升学金榜', value: 'EDUCATION' },
	{ label: '🕯️ 白事丧事', value: 'FUNERAL' },
];

const cityTiers = [
	{ label: '一线城市', value: 'TIER_1' },
	{ label: '新一线/二线', value: 'TIER_2' },
	{ label: '三四线及以下', value: 'TIER_3' },
];

const currentEventType = ref('WEDDING');
const currentCityTier = ref('TIER_1');
const loading = ref(false);
const result = ref<GiftReturnRecommendationVo | null>(null);
const selectedTier = ref<'min' | 'rec' | 'max'>('rec');

const netBalanceClass = computed(() => {
	if (!props.person) return '';
	if (props.person.balanceStatus === 'SURPLUS') return 'text-orange';
	if (props.person.balanceStatus === 'DEFICIT') return 'text-blue';
	return 'text-green';
});

const netBalanceText = computed(() => {
	if (!props.person) return '¥0.00';
	const prefix = props.person.netBalance > 0 ? '+' : '';
	return `${prefix}¥${props.person.netBalance.toFixed(2)}`;
});

const selectEventType = (type: string) => {
	currentEventType.value = type;
	triggerHaptic('selection');
};

const selectCityTier = (tier: string) => {
	currentCityTier.value = tier;
	triggerHaptic('selection');
};

const selectTier = (tier: 'min' | 'rec' | 'max') => {
	selectedTier.value = tier;
	triggerHaptic('light');
	if (result.value) {
		const amt =
			tier === 'min'
				? result.value.minDecentAmount
				: tier === 'rec'
					? result.value.recommendedAmount
					: result.value.generousAmount;
		emit('selected', amt);
	}
};

const calculateReturnGift = async () => {
	if (!props.person?.personId) {
		showToast('未选择联系人');
		return;
	}

	triggerHaptic('medium');
	loading.value = true;
	try {
		const { code, data, message } = await recommendReturnGift({
			personId: props.person.personId,
			eventType: currentEventType.value,
			cityTier: currentCityTier.value,
		});

		if (code === '200' || code === '00000') {
			result.value = data;
			selectedTier.value = 'rec';
			triggerHaptic('success');
		} else {
			showFailToast(message || '测算失败');
			triggerHaptic('warning');
		}
	} catch {
		showFailToast('测算服务异常');
		triggerHaptic('error');
	} finally {
		loading.value = false;
	}
};

const copyBlessing = async () => {
	if (!result.value?.blessingWords) return;
	triggerHaptic('light');
	try {
		await navigator.clipboard.writeText(result.value.blessingWords);
		showSuccessToast('贺词已复制');
	} catch {
		showToast(result.value.blessingWords);
	}
};

const handleClose = () => {
	result.value = null;
};

// 监听弹窗打开时触觉轻触
watch(
	() => props.modelValue,
	(val) => {
		if (val) {
			triggerHaptic('medium');
			result.value = null;
		}
	},
);
</script>

<style scoped lang="less">
.calculator-panel {
	padding: 20px 16px 28px;
	background: #fbfcfe;
}

.panel-header {
	margin-bottom: 14px;
	.panel-title {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 18px;
		font-weight: 700;
		color: #1a202c;
	}
	.panel-sub {
		margin-top: 4px;
		font-size: 13px;
		color: #64748b;
		display: flex;
		align-items: center;
		gap: 6px;
		strong {
			color: #0f172a;
		}
		.relation-tag {
			font-size: 11px;
			padding: 1px 6px;
			border-radius: 4px;
			background: #e2e8f0;
			color: #475569;
		}
	}
}

.balance-summary-strip {
	display: flex;
	justify-content: space-between;
	background: #f1f5f9;
	border-radius: 10px;
	padding: 10px 12px;
	margin-bottom: 16px;
	.summary-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		.label {
			font-size: 11px;
			color: #64748b;
		}
		.val {
			font-size: 13px;
			margin-top: 2px;
		}
		.text-green {
			color: #10b981;
		}
		.text-blue {
			color: #2563eb;
		}
		.text-orange {
			color: #f97316;
		}
		.font-bold {
			font-weight: 700;
		}
	}
}

.section-title {
	font-size: 13px;
	font-weight: 600;
	color: #334155;
	margin: 12px 0 8px;
}

.event-chips,
.city-chips {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
}

.event-chip,
.city-chip {
	padding: 6px 12px;
	border-radius: 18px;
	background: #fff;
	border: 1px solid #e2e8f0;
	font-size: 12px;
	color: #475569;
	cursor: pointer;
	transition: all 0.2s;
	&.active {
		background: #ebf5ff;
		border-color: #2563eb;
		color: #2563eb;
		font-weight: 600;
	}
}

.calc-action-row {
	margin-top: 18px;
	margin-bottom: 14px;
}

.result-container {
	margin-top: 14px;
	animation: fadeIn 0.3s ease-in-out;
}

.tier-cards {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 8px;
	margin-bottom: 14px;
}

.tier-card {
	background: #fff;
	border: 1.5px solid #e2e8f0;
	border-radius: 12px;
	padding: 10px 6px;
	text-align: center;
	position: relative;
	transition: all 0.2s;
	cursor: pointer;

	.tier-badge {
		font-size: 10px;
		color: #64748b;
		margin-bottom: 4px;
		&.popular {
			color: #f59e0b;
			font-weight: 700;
		}
	}

	.tier-amount {
		font-size: 16px;
		font-weight: 800;
		color: #0f172a;
		margin-bottom: 4px;
	}

	.tier-tip {
		font-size: 10px;
		color: #94a3b8;
		transform: scale(0.9);
	}

	&.selected {
		border-color: #2563eb;
		background: #f0f7ff;
		box-shadow: 0 4px 12px rgba(37, 99, 235, 0.12);
		.tier-amount {
			color: #2563eb;
		}
	}
}

.result-box {
	background: #fff;
	border: 1px solid #e2e8f0;
	border-radius: 10px;
	padding: 10px 12px;
	margin-bottom: 10px;

	.box-head {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 12px;
		font-weight: 600;
		color: #334155;
		margin-bottom: 6px;
		.base-tag {
			font-size: 11px;
			color: #64748b;
			font-weight: normal;
		}
	}

	.box-content {
		font-size: 12px;
		color: #475569;
		line-height: 1.5;
	}

	&.blessing-box {
		background: #fffcf0;
		border-color: #fef08a;
		.blessing-text {
			font-size: 13px;
			color: #854d0e;
			font-weight: 500;
			line-height: 1.5;
			margin-top: 4px;
		}
	}
}

@keyframes fadeIn {
	from {
		opacity: 0;
		transform: translateY(8px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}
</style>
