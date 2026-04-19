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
						:class="item.isValid === '1' ? 'income' : 'expense'"
					>
						{{ item.isValid === '1' ? '有效' : '无效' }}
					</span>
				</div>
				<div class="date-text">
					{{ item?.saleDate ? String(item?.saleDate).substring(0, 10) : '--' }}
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
						v-for="source in sourceIcons"
						:key="source.value"
					>
						<svg-icon
							:name="source.label"
							class="source-icon"
						/>
					</div>
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
import { fromSourceTransferList, type ShopFinanceData } from '../config';

const props = defineProps({
	item: {
		type: Object as PropType<ShopFinanceData>,
		required: true,
	},
});

const displayTitle = computed(() => {
	const item = props.item;
	return item.shopName + (item?.saleNum ? ` (${item.saleNum}件)` : '');
});

const sourceIcons = computed(() => {
	if (!props.item.payWay) return [];
	return fromSourceTransferList.filter((s) => props.item.payWay?.includes(s.value) && s.value !== '');
});

const amountClass = computed(() => {
	return props.item.incomeAndExpenses === 'income' ? 'amount-income' : 'amount-expense';
});

const formattedAmount = computed(() => {
	const amount = props.item.saleAmount;
	if (amount === undefined || amount === null) {
		return '--';
	}
	const prefix = props.item.incomeAndExpenses === 'income' ? '' : '-';
	return `${prefix}¥${Number(amount).toFixed(2)}`;
});

const emit = defineEmits(['click', 'delete']);

const handleClick = () => {
	if (typeof navigator !== 'undefined' && navigator.vibrate) {
		navigator.vibrate(50);
	}
	emit('click', props.item);
};

const onDelete = () => {
	emit('delete', props.item.id);
};
</script>

<style lang="less" scoped>
.card-swipe-item {
	margin-bottom: 12px;
	border-radius: 16px;
	overflow: hidden;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
	background-color: #fff;
	transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

	&:active {
		transform: scale(0.97);
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
	}
}

.finance-card {
	background: #fff;
	padding: 16px 18px;
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
		font-size: 15px;
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
			background-color: rgba(76, 175, 80, 0.1);
			color: #2e7d32;
		}

		&.expense {
			background-color: rgba(238, 10, 36, 0.08);
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
	font-weight: 700;
	font-family: 'Avenir', 'Helvetica Neue', sans-serif;

	&.amount-income {
		color: #2e7d32;
	}

	&.amount-expense {
		color: #d32f2f;
	}
}

.source-info {
	display: flex;
	align-items: center;
	gap: 4px;

	.svg-wrapper {
		display: flex;
		align-items: center;
	}

	.source-icon {
		width: 16px;
		height: 16px;
		vertical-align: middle;
	}
}

.delete-btn {
	height: 100%;
	border: none;
}
</style>
