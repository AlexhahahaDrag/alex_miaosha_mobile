<template>
	<van-swipe-cell class="gift-record-card">
		<div
			class="gift-record-card__content"
			@click="emit('click', item)"
		>
			<div :class="['gift-record-card__icon', directionClass(item.direction)]">
				{{ directionText(item.direction).slice(0, 1) }}
			</div>
			<div class="gift-record-card__main">
				<div class="gift-record-card__title">
					<span>{{ directionText(item.direction) }}</span>
					<van-tag
						v-if="item.direction === 'RECEIVE'"
						:type="item.returnedFlag === 1 ? 'success' : 'warning'"
						plain
					>
						{{ item.returnedFlag === 1 ? '已回礼' : '待回礼' }}
					</van-tag>
				</div>
				<div class="gift-record-card__meta">
					{{ item.payTime || item.createTime || '--' }}
				</div>
				<div class="gift-record-card__remark">
					{{ item.remark || '无备注' }}
				</div>
			</div>
			<div :class="['gift-record-card__amount', directionClass(item.direction)]">
				{{ formatMoney(item.amount) }}
			</div>
		</div>
		<template #right>
			<van-button
				v-if="item.direction === 'RECEIVE' && item.returnedFlag !== 1"
				square
				type="primary"
				text="已回"
				class="gift-record-card__action"
				@click="emit('mark-returned', item)"
			/>
			<van-button
				square
				type="danger"
				text="删除"
				class="gift-record-card__action"
				@click="emit('delete', item)"
			/>
		</template>
	</van-swipe-cell>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';
import type { GiftRecordInfo } from '@/views/finance/gift/config';
import { directionClass, directionText, formatMoney } from '@/views/finance/gift/config';

defineProps({
	item: {
		type: Object as PropType<GiftRecordInfo>,
		required: true,
	},
});

const emit = defineEmits<{
	(e: 'click', item: GiftRecordInfo): void;
	(e: 'delete', item: GiftRecordInfo): void;
	(e: 'mark-returned', item: GiftRecordInfo): void;
}>();
</script>

<style scoped lang="less">
.gift-record-card {
	margin-bottom: 12px;
	border-radius: 16px;
	overflow: hidden;
	background: #fff;
	box-shadow: 0 6px 18px rgba(32, 152, 238, 0.08);
}

.gift-record-card__content {
	display: flex;
	align-items: center;
	min-height: 86px;
	padding: 14px;
	transition:
		transform 0.12s ease,
		background-color 0.12s ease;
}

.gift-record-card__content:active {
	transform: scale(0.98);
	background: #f8fbff;
}

.gift-record-card__icon {
	width: 44px;
	height: 44px;
	flex: 0 0 44px;
	border-radius: 14px;
	display: flex;
	align-items: center;
	justify-content: center;
	font-weight: 700;
	margin-right: 12px;
}

.gift-record-card__icon.is-income {
	color: #18a058;
	background: #e9f8f0;
}

.gift-record-card__icon.is-give {
	color: #d46b08;
	background: #fff4e6;
}

.gift-record-card__icon.is-return {
	color: #2098ee;
	background: #eaf6ff;
}

.gift-record-card__main {
	min-width: 0;
	flex: 1;
}

.gift-record-card__title {
	display: flex;
	align-items: center;
	gap: 8px;
	font-size: 16px;
	font-weight: 700;
	color: #1f2937;
}

.gift-record-card__meta,
.gift-record-card__remark {
	margin-top: 5px;
	font-size: 12px;
	color: #8a94a6;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.gift-record-card__amount {
	margin-left: 10px;
	font-size: 18px;
	font-weight: 800;
}

.gift-record-card__amount.is-income {
	color: #18a058;
}

.gift-record-card__amount.is-give {
	color: #d4380d;
}

.gift-record-card__amount.is-return {
	color: #2098ee;
}

.gift-record-card__action {
	height: 100%;
}
</style>
