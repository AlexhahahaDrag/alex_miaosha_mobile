<template>
	<div
		class="order-card"
		@click="handleClick"
	>
		<div class="card-header">
			<span class="order-code">{{ item.saleOrderCode }}</span>
			<span class="order-date">{{ item.saleDate ? dayjs(item.saleDate).format('YYYY-MM-DD') : '--' }}</span>
		</div>

		<div class="card-body">
			<div class="stat-group">
				<span class="stat-label">订单金额</span>
				<span class="stat-value amount">¥{{ commonUtils.formatAmount(item?.saleAmount, 2, '') }}</span>
			</div>
			<div class="stat-group">
				<span class="stat-label">商品数量</span>
				<span class="stat-value count">{{ commonUtils.formatAmount(item?.saleCount, 2, '') }}</span>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { type PropType } from 'vue';
import dayjs from 'dayjs';
import type { DataItem } from '../shopOrderTs';
import commonUtils from '@/utils/common/index';

const props = defineProps({
	item: {
		type: Object as PropType<DataItem>,
		required: true,
	},
});

const emit = defineEmits(['click']);

const handleClick = () => {
	if (typeof navigator !== 'undefined' && navigator.vibrate) {
		navigator.vibrate(50);
	}
	emit('click', props.item);
};
</script>

<style lang="less" scoped>
.order-card {
	background: #fff;
	border-radius: 16px;
	padding: 16px 18px;
	margin-bottom: 12px;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
	transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
	position: relative;

	&:active {
		transform: scale(0.97);
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
	}
}

.card-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 16px;
	padding-bottom: 12px;
	border-bottom: 1px dashed #f2f3f5;

	.order-code {
		font-size: 15px;
		font-weight: 600;
		color: #1a1a1a;
	}

	.order-date {
		font-size: 12px;
		color: #969799;
	}
}

.card-body {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.stat-group {
	display: flex;
	flex-direction: column;
	gap: 6px;

	&:last-child {
		align-items: flex-end;
	}

	.stat-label {
		font-size: 12px;
		color: #969799;
	}

	.stat-value {
		font-size: 18px;
		font-weight: 700;
		font-family: 'Avenir', 'Helvetica Neue', sans-serif;

		&.amount {
			color: #d32f2f;
		}

		&.count {
			color: #323233;
		}
	}
}
</style>
