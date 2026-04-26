<template>
	<van-swipe-cell class="finance-card-row">
		<div
			class="finance-card-row__content"
			@click="handleClick"
		>
			<div :class="['finance-card-row__icon', iconToneClass]">
				<svg-icon
					v-if="sourceIcon?.label"
					:name="sourceIcon.label"
					class="finance-card-row__source-icon"
				/>
				<van-icon
					v-else
					:name="item.incomeAndExpenses === 'income' ? 'down' : 'up'"
					class="finance-card-row__fallback-icon"
				/>
			</div>

			<div class="finance-card-row__main">
				<div class="finance-card-row__top">
					<div class="finance-card-row__title">
						{{ displayTitle }}
					</div>
					<div
						v-if="typeLabel"
						:class="['finance-card-row__tag', amountToneClass]"
					>
						{{ typeLabel }}
					</div>
				</div>

				<div class="finance-card-row__meta">
					<span>{{ recordTime }}</span>
					<span>{{ sourceName }}</span>
				</div>
			</div>

			<div class="finance-card-row__side">
				<div :class="['finance-card-row__amount', amountToneClass]">
					{{ formattedAmount }}
				</div>
				<div class="finance-card-row__account">
					{{ accountName }}
				</div>
			</div>
		</div>

		<template #right>
			<van-button
				class="finance-card-row__delete"
				square
				type="danger"
				text="删除"
				@click="onDelete"
			/>
		</template>
	</van-swipe-cell>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue';
import dayjs from 'dayjs';
import { fromSourceTransferList, type FinanceManagerData, type FromSourceTransferItem } from '../config';

const props = defineProps({
	item: {
		type: Object as PropType<FinanceManagerData>,
		required: true,
	},
});

const emit = defineEmits(['click', 'delete']);

const displayTitle = computed(() => {
	const item = props.item;
	return item.name || item.description || item.belongToName || '未命名账单';
});

const typeLabel = computed(() => props.item.typeName || props.item.typeCode || '');

const sourceIcon = computed<FromSourceTransferItem | null>(() => {
	if (!props.item.fromSource) {
		return null;
	}
	return fromSourceTransferList.find((source) => props.item.fromSource?.includes(source.value)) || null;
});

const sourceName = computed(() => props.item.fromSourceName || sourceIcon.value?.name || '未知来源');

const accountName = computed(() => props.item.belongToName || '个人账户');

const amountToneClass = computed(() => (props.item.incomeAndExpenses === 'income' ? 'is-income' : 'is-expense'));

const iconToneClass = computed(() =>
	props.item.incomeAndExpenses === 'income' ? 'finance-card-row__icon--income' : 'finance-card-row__icon--expense',
);

const formattedAmount = computed(() => {
	const amount = Number(props.item.amount || 0);
	const prefix = props.item.incomeAndExpenses === 'income' ? '+' : '-';
	return `${prefix}¥${amount.toFixed(2)}`;
});

const recordTime = computed(() => {
	if (!props.item.infoDate) {
		return '--:--';
	}
	return dayjs(props.item.infoDate).format('HH:mm');
});

const handleClick = () => {
	if (typeof navigator !== 'undefined' && navigator.vibrate) {
		navigator.vibrate(30);
	}
	emit('click', props.item);
};

const onDelete = () => {
	emit('delete', props.item.id);
};
</script>

<style lang="less" scoped>
.finance-card-row {
	overflow: hidden;

	&:not(:last-child) {
		border-bottom: 1px solid #f1f4f9;
	}

	&__content {
		display: grid;
		grid-template-columns: 42px minmax(0, 1fr) auto;
		gap: 12px;
		align-items: center;
		padding: 14px 16px;
		background: transparent;
	}

	&__icon {
		width: 42px;
		height: 42px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;

		&--income {
			background: linear-gradient(135deg, #effbf2 0%, #f8fffa 100%);
			color: #24a148;
		}

		&--expense {
			background: linear-gradient(135deg, #fff1f1 0%, #fff8f8 100%);
			color: #e5484d;
		}
	}

	&__source-icon {
		width: 18px;
		height: 18px;
	}

	&__fallback-icon {
		font-size: 18px;
	}

	&__main {
		min-width: 0;
	}

	&__top {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	&__title {
		flex: 1;
		min-width: 0;
		font-size: 14px;
		font-weight: 600;
		color: #24324a;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	&__tag {
		flex-shrink: 0;
		padding: 3px 8px;
		border-radius: 999px;
		font-size: 10px;
		font-weight: 600;
	}

	&__meta {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-top: 6px;
		font-size: 11px;
		color: #8b97ab;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	&__side {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 6px;
		margin-left: 8px;
	}

	&__amount {
		font-size: 16px;
		font-weight: 700;
		line-height: 1;
	}

	&__account {
		font-size: 11px;
		color: #8b97ab;
		max-width: 88px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	&__delete {
		height: 100%;
		border: none;
	}
}

.is-income {
	color: #24a148;
	background: rgba(36, 161, 72, 0.1);
}

.is-expense {
	color: #e5484d;
	background: rgba(229, 72, 77, 0.1);
}

.finance-card-row__amount.is-income,
.finance-card-row__amount.is-expense {
	background: transparent;
	padding: 0;
}
</style>
