<template>
	<van-swipe-cell class="card-swipe-item">
		<div
			class="stock-card"
			@click="handleClick"
		>
			<div class="card-left">
				<div class="title-row">
					<span class="title">{{ item.shopName }}</span>
					<span
						class="tag old-code"
						v-if="item.oldShopCode"
					>
						{{ item.oldShopCode }}
					</span>
				</div>
				<div class="tags-row">
					<span
						class="attr-tag style-tag"
						v-if="item.style"
					>
						{{ item.style }}
					</span>
					<span
						class="attr-tag color-tag"
						v-if="item.color"
					>
						{{ item.color }}
					</span>
					<span
						class="attr-tag size-tag"
						v-if="item.size"
					>
						{{ item.size }}
					</span>
				</div>
			</div>

			<div class="card-right">
				<div class="stats-grid">
					<div class="stat-col">
						<span class="stat-val">{{ commonUtils.formatAmount(item?.costAmount || 0, 2, '') }}</span>
						<span class="stat-label">成本</span>
					</div>
					<div class="stat-col">
						<span class="stat-val sale">{{ commonUtils.formatAmount(item?.saleAmount || 0, 2, '') }}</span>
						<span class="stat-label">销售</span>
					</div>
					<div class="stat-col">
						<span class="stat-val stock">{{ item?.saleNum || 0 }}</span>
						<span class="stat-label">库存</span>
					</div>
				</div>
			</div>
		</div>

		<template #right>
			<van-button
				class="right_info action-btn copy-btn"
				@click="onCopy"
				square
				type="primary"
				text="复制"
			/>
			<van-button
				class="right_info action-btn delete-btn"
				@click="onDelete"
				square
				type="danger"
				text="删除"
			/>
		</template>
	</van-swipe-cell>
</template>

<script lang="ts" setup>
import { type PropType } from 'vue';
import type { ShopStockInfo } from '../shopStockTs';
import commonUtils from '@/utils/common/index';

const props = defineProps({
	item: {
		type: Object as PropType<ShopStockInfo>,
		required: true,
	},
});

const emit = defineEmits(['click', 'copy', 'delete']);

const handleClick = () => {
	if (typeof navigator !== 'undefined' && navigator.vibrate) {
		navigator.vibrate(50);
	}
	emit('click', props.item);
};

const onCopy = () => {
	emit('copy', props.item.id);
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

.stock-card {
	background: #fff;
	padding: 16px 18px;
	display: flex;
	justify-content: space-between;
	align-items: center;
	position: relative;
	gap: 12px;
}

.card-left {
	display: flex;
	flex-direction: column;
	gap: 8px;
	flex: 1;
	min-width: 0; // 配合标题的 text-overflow
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
		max-width: 120px;
	}

	.tag {
		font-size: 10px;
		padding: 2px 6px;
		border-radius: 4px;
		font-weight: 500;
		line-height: 1.2;

		&.old-code {
			background-color: rgba(25, 137, 250, 0.1);
			color: #1989fa;
		}
	}
}

.tags-row {
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	gap: 6px;

	.attr-tag {
		font-size: 10px;
		padding: 2px 6px;
		border-radius: 4px;
		font-weight: 500;
		line-height: 1.2;

		&.style-tag {
			background-color: rgba(114, 50, 221, 0.08);
			color: #7232dd;
		}

		&.color-tag {
			background-color: rgba(7, 193, 96, 0.1);
			color: #07c160;
		}

		&.size-tag {
			background-color: rgba(255, 151, 106, 0.1);
			color: #ff976a;
		}
	}
}

.card-right {
	display: flex;
	align-items: center;
}

.stats-grid {
	display: flex;
	gap: 16px;
}

.stat-col {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 4px;
	min-width: 40px;

	.stat-val {
		font-size: 14px;
		font-weight: 600;
		font-family: 'Avenir', 'Helvetica Neue', sans-serif;
		color: #1a1a1a;

		&.sale {
			color: #d32f2f;
		}

		&.stock {
			color: #1989fa;
		}
	}

	.stat-label {
		font-size: 11px;
		color: #999;
	}
}

.action-btn {
	height: 100%;
	border: none;
}
</style>
