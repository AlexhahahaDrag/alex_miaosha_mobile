<template>
	<van-swipe-cell
		:class="['finance-card-row', { 'finance-card-row--bordered': !isLast }]"
		:disabled="!canDelete"
	>
		<div
			class="finance-card-row__content"
			@click="handleClick"
		>
			<div
				class="finance-card-row__icon"
				:style="{
					backgroundColor: sceneTheme.iconBg,
					color: sceneTheme.iconColor,
				}"
			>
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
						v-if="shouldShowTypeLabel"
						class="finance-card-row__tag"
						:style="{
							color: sceneTheme.tagText,
							backgroundColor: sceneTheme.tagBg,
						}"
					>
						{{ typeLabel }}
					</div>
				</div>

				<div class="finance-card-row__meta">
					<span>{{ recordTime }} · {{ displaySubtitle }}</span>
				</div>
			</div>

			<div class="finance-card-row__side">
				<div :class="['finance-card-row__amount', amountToneClass]">
					{{ formattedAmount }}
				</div>
				<div class="finance-card-row__account"> {{ directionPrefix }} {{ accountName }} </div>
			</div>
		</div>

		<template
			v-if="canDelete"
			#right
		>
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
import type { PropType } from 'vue';
import { useUserStore } from '@/store/modules/user/user';
import { usePermission } from '@/composables/usePermission';
import { formatTime } from '@/utils/dayjs';
import {
	fromSourceTransferList,
	type FinanceManagerData,
	type FromSourceTransferItem,
} from '@/views/finance/financeManager/config';

interface SceneTheme {
	iconColor: string;
	iconBg: string;
	tagText: string;
	tagBg: string;
}

const props = defineProps({
	item: {
		type: Object as PropType<FinanceManagerData>,
		required: true,
	},
	isLast: {
		type: Boolean,
		default: false,
	},
});

const emit = defineEmits(['click', 'delete']);

const displayTitle = computed(() => {
	const item = props.item;
	return item.name || '转账';
});

const sourceIcon = computed<FromSourceTransferItem | null>(() => {
	if (!props.item.fromSource) {
		return null;
	}
	return fromSourceTransferList.find((source) => props.item.fromSource?.includes(source.value)) || null;
});

const sourceName = computed(() => props.item.fromSourceName || sourceIcon.value?.name || '');

const displaySubtitle = computed(() => {
	const item = props.item;
	if (item.description && item.description.trim()) {
		return item.description.trim();
	}
	if (sourceName.value && sourceName.value.trim()) {
		return sourceName.value.trim();
	}
	return item.typeName || '日常账单';
});

const typeLabel = computed(() => props.item.typeName || props.item.typeCode || '');

const shouldShowTypeLabel = computed(() => {
	if (!typeLabel.value) return false;
	const title = displayTitle.value.trim().toLowerCase();
	const type = typeLabel.value.trim().toLowerCase();
	return title !== type;
});

const sceneTheme = computed<SceneTheme>(() => {
	const text =
		`${props.item.name || ''} ${props.item.description || ''} ${props.item.typeName || ''} ${sourceName.value || ''}`.toLowerCase();

	if (text.includes('话费') || text.includes('通讯') || text.includes('通信') || text.includes('手机')) {
		return {
			iconColor: '#F97316',
			iconBg: '#FFF7ED',
			tagText: '#EA580C',
			tagBg: '#FFEDD5',
		};
	}
	if (text.includes('水') || text.includes('用水') || text.includes('水利')) {
		return {
			iconColor: '#0284C7',
			iconBg: '#F0F9FF',
			tagText: '#0369A1',
			tagBg: '#E0F2FE',
		};
	}
	if (text.includes('燃气') || text.includes('采暖') || text.includes('天然气') || text.includes('煤气')) {
		return {
			iconColor: '#E11D48',
			iconBg: '#FFF1F2',
			tagText: '#BE123C',
			tagBg: '#FFE4E6',
		};
	}
	if (text.includes('电') || text.includes('供电') || text.includes('能源')) {
		return {
			iconColor: '#16A34A',
			iconBg: '#F0FDF4',
			tagText: '#15803D',
			tagBg: '#DCFCE7',
		};
	}
	// 银行卡 / 纯资金转账 / 通用
	return {
		iconColor: '#6366F1',
		iconBg: '#EEF2FF',
		tagText: '#4338CA',
		tagBg: '#E0F2FE',
	};
});

const accountName = computed(() => props.item.belongToName || '个人账户');

const directionPrefix = computed(() => (props.item.incomeAndExpenses === 'income' ? '来自' : '转给'));

const amountToneClass = computed(() => (props.item.incomeAndExpenses === 'income' ? 'is-income' : 'is-expense'));

const formattedAmount = computed(() => {
	const amount = Number(props.item.amount || 0);
	const prefix = props.item.incomeAndExpenses === 'income' ? '' : '-';
	return `${prefix}¥${amount.toFixed(2)}`;
});

const recordTime = computed(() => {
	if (!props.item.infoDate) {
		return '--:--';
	}
	return formatTime(props.item.infoDate, 'HH:mm');
});

const userStore = useUserStore();
const { hasPermission, isSuperAdmin } = usePermission();

const canDelete = computed(() => {
	if (!hasPermission('finance:financeManager:delete')) {
		return false;
	}
	const roleCode = userStore.getRoleInfo?.roleCode || '';
	if (isSuperAdmin.value || roleCode === 'admin' || roleCode === 'family_admin') {
		return true;
	}
	const myId = userStore.getUserInfo?.id;
	return myId !== undefined && String(props.item.belongTo) === String(myId);
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
	background: #ffffff;

	&--bordered {
		border-bottom: 1px solid #f1f5f9;
	}

	&__content {
		display: grid;
		grid-template-columns: 40px minmax(0, 1fr) auto;
		gap: 12px;
		align-items: center;
		padding: 12px 14px;
		background: #ffffff;
		transition: background-color 0.15s ease;

		&:active {
			background: #f8fafc;
		}
	}

	&__icon {
		width: 40px;
		height: 40px;
		border-radius: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	&__source-icon {
		width: 20px;
		height: 20px;
	}

	&__fallback-icon {
		font-size: 19px;
	}

	&__main {
		min-width: 0;
	}

	&__top {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	&__title {
		flex: 0 1 auto;
		min-width: 0;
		font-size: 15px;
		font-weight: 600;
		color: #1e293b;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	&__tag {
		flex-shrink: 0;
		padding: 2px 7px;
		border-radius: 999px;
		font-size: 10.5px;
		font-weight: 600;
		line-height: 1.2;
	}

	&__meta {
		display: flex;
		align-items: center;
		margin-top: 4px;
		font-size: 13px;
		color: #475569;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	&__side {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 3px;
		margin-left: 8px;
	}

	&__amount {
		font-family: 'DIN Alternate', 'Roboto Mono', ui-monospace, SFMono-Regular, monospace;
		font-variant-numeric: tabular-nums;
		letter-spacing: -0.02em;
		font-size: 16.5px;
		font-weight: 700;
		line-height: 1.1;

		&.is-income {
			color: #059669;
		}

		&.is-expense {
			color: #dc2626;
		}
	}

	&__account {
		font-size: 11px;
		color: #64748b;
		max-width: 100px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	&__delete {
		height: 100%;
		border: none;
	}
}
</style>
