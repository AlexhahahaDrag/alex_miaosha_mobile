<template>
	<van-swipe-cell class="card-swipe-item">
		<div
			class="finance-card"
			@click="handleClick"
		>
			<div class="card-left">
				<div class="title-row">
					<span class="title">{{ displayTitle }}</span>
					<span
						class="tag"
						v-if="item.incomeAndExpenses"
						:class="item.incomeAndExpenses"
					>
						{{ item.typeCode || '未知类别' }}
					</span>
				</div>
				<div class="date-text">
					{{ formatDate(item.infoDate, dataTimeFormat) }}
				</div>
			</div>

			<div class="card-right">
				<div
					class="amount-text"
					:class="amountClass"
				>
					{{ formattedAmount }}
				</div>
				<div class="source-info">
					<div
						class="svg-wrapper"
						v-if="item?.fromSource"
					>
						<svg-icon
							:name="sourceIcon?.label || ''"
							class="source-icon"
						/>
					</div>
					<span class="source-text">{{ sourceIcon?.name || '未知' }}</span>
				</div>
			</div>
		</div>

		<template #right>
			<van-button
				class="right_info delete-btn"
				@click="onDelete"
				square
				type="danger"
				text="删除"
			/>
		</template>
	</van-swipe-cell>
</template>

<script lang="ts" setup>
import { computed, type PropType } from 'vue';
import { fromSourceTransferList, type FinanceManagerData, type FromSourceTransferItem } from '../config/index';
import { formatDate, dataTimeFormat } from '@/utils/dayjs';

// [Variables]
const props = defineProps({
	item: {
		type: Object as PropType<FinanceManagerData>,
		required: true,
	},
});

// [Computed]
const displayTitle = computed(() => {
	const item = props.item;
	return (item.belongToName ? `${item.belongToName} - ` : '') + (item.name || '未命名');
});

const sourceIcon = computed((): FromSourceTransferItem | null => {
	if (!props.item.fromSource) return null;
	const source = fromSourceTransferList.find((s) => props.item.fromSource?.includes(s.value));
	return source || null;
});

const amountClass = computed(() => {
	return props.item.incomeAndExpenses === 'income' ? 'amount-income' : 'amount-expense';
});

const formattedAmount = computed(() => {
	const amount = props.item.amount;
	if (amount === undefined || amount === null) {
		return '--';
	}
	const prefix = props.item.incomeAndExpenses === 'income' ? '+' : '-';
	return `${prefix}¥${Number(amount).toFixed(2)}`;
});

// [Methods]
const handleClick = () => {
	// 默认触力动效
	if (typeof navigator !== 'undefined' && navigator.vibrate) {
		navigator.vibrate(50);
	}
	emit('click', props.item);
};

const onDelete = () => {
	emit('delete', props.item.id);
};

// [Emits]
const emit = defineEmits(['click', 'delete']);
</script>

<style lang="less" scoped>
.card-swipe-item {
	margin-bottom: 12px;
	border-radius: 16px;
	overflow: hidden;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03); // Softer shadow
	background-color: #fff;
	transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); // Premium easing

	&:active {
		transform: scale(0.97);
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
	}
}

.finance-card {
	background: #fff;
	padding: 16px 18px; // Slightly more compact
	display: flex;
	justify-content: space-between;
	align-items: center;
	position: relative;
}

.card-left {
	display: flex;
	flex-direction: column;
	gap: 8px;
	flex: 1;
}

.title-row {
	display: flex;
	align-items: center;
	gap: 6px;

	.title {
		font-size: 15px; // Slightly smaller but bold
		font-weight: 600;
		color: #1a1a1a;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		max-width: 140px;
	}

	.tag {
		font-size: 10px;
		padding: 2px 6px;
		border-radius: 4px;
		font-weight: 500;
		line-height: 1.2;

		&.income {
			background-color: rgba(76, 175, 80, 0.1); // Softer green
			color: #2e7d32;
		}

		&:not(.income) {
			background-color: rgba(238, 10, 36, 0.08); // Softer red
			color: #d32f2f;
		}
	}
}

.date-text {
	font-size: 11px;
	color: #999;
	letter-spacing: 0.2px;
}

.card-right {
	display: flex;
	flex-direction: column;
	align-items: flex-end;
	gap: 6px;
}

.amount-text {
	font-size: 17px;
	font-weight: 700; // More weight on amount
	font-family: 'Avenir', 'Helvetica Neue', sans-serif;

	&.amount-income {
		color: #2e7d32;
	}

	&.amount-expense {
		color: #1a1a1a; // Darker for expense, or keep red?
		// Keeping expense as dark/neutral is a high-end trend, but red is clearer.
		// Let's stick with red but a premium one.
		color: #d32f2f;
	}
}

.source-info {
	display: flex;
	align-items: center;
	gap: 4px;
	color: #999;
	font-size: 11px;

	.svg-wrapper {
		display: flex;
		align-items: center;
	}

	.source-icon {
		width: 16px;
		height: 16px;
		vertical-align: middle;
	}

	.source-text {
		vertical-align: middle;
	}
}

.delete-btn {
	height: 100%;
	border: none;
}
</style>
