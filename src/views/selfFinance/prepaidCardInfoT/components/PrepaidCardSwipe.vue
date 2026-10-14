<template>
	<div class="card-scroll-area">
		<van-swipe
			v-if="!loading && cardList.length > 0"
			:loop="false"
			:show-indicators="true"
			:initial-swipe="currentIndex"
			@change="handleCardChange"
		>
			<van-swipe-item
				v-for="(card, index) in cardList"
				:key="index"
			>
				<div
					class="card-item"
					:style="{ backgroundColor: card.bgColor }"
				>
					<div class="card-content">
						<div class="card-left">
							<div class="card-name">
								{{ card.name }}<span class="status-badge">{{ getStatusLabel(card) }}</span>
							</div>
							<div class="card-label">可用余额</div>
							<div class="balance-box">
								<span class="balance-integer">¥{{ getBalanceParts(card.currentBalance || card.balance).integer }}</span>
								<span class="balance-fraction">{{ getBalanceParts(card.currentBalance || card.balance).fraction }}</span>
							</div>
						</div>
						<div class="card-right">
							<div class="image-placeholder">
								<van-image :src="getCategoryIcon(card.cardName || '')" />
							</div>
						</div>
					</div>
				</div>
			</van-swipe-item>
		</van-swipe>

		<!-- 卡片加载中 -->
		<div
			v-if="loading"
			class="card-loading"
		>
			<van-loading
				type="spinner"
				color="#3399ff"
				size="24px"
			/>
			<span>加载中...</span>
		</div>

		<!-- 无卡片状态 -->
		<div
			v-if="!loading && cardList.length === 0"
			class="card-empty"
		>
			<div class="empty-icon">💳</div>
			<div class="empty-text">暂无消费卡</div>
			<div
				class="add-card-btn"
				@click="emit('addCard')"
			>
				添加卡片
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { CardItem } from '@/views/selfFinance/prepaidCardInfoT/config';
import { getBalanceParts, getStatusLabel, getCategoryIcon } from '@/views/selfFinance/prepaidCardInfoT/config';

interface Props {
	cardList: CardItem[];
	loading: boolean;
	currentIndex: number;
}

defineProps<Props>();

const emit = defineEmits<{
	(e: 'update:currentIndex', index: number): void;
	(e: 'change', index: number): void;
	(e: 'addCard'): void;
}>();

const handleCardChange = (index: number) => {
	emit('update:currentIndex', index);
	emit('change', index);
};
</script>

<style lang="less" scoped>
.card-scroll-area {
	width: 100%;
	margin-bottom: 5px;
	position: relative;

	:deep(.van-swipe) {
		height: 100%;
	}

	:deep(.van-swipe-item) {
		height: 100%;
		padding: 0 10px;
		box-sizing: border-box;
	}

	.card-loading {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		height: 100%;
		gap: 15px;
		background-color: rgba(255, 255, 255, 0.7);
		border-radius: 16px;

		span {
			font-size: 14px;
			color: var(--text-secondary-color);
		}
	}

	.card-empty {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		height: 100%;
		gap: 15px;
		background-color: var(--card-bg);
		border-radius: 16px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

		.empty-icon {
			font-size: 40px;
			margin-bottom: 5px;
		}

		.empty-text {
			font-size: 16px;
			color: var(--text-secondary-color);
			margin-bottom: 10px;
		}

		.add-card-btn {
			padding: 8px 20px;
			background-color: var(--primary-color);
			color: #ffffff;
			border-radius: 20px;
			font-size: 14px;
			font-weight: 500;
			cursor: pointer;
			transition: opacity 0.2s ease;

			&:active {
				opacity: 0.8;
			}
		}
	}

	.card-item {
		width: 100%;
		border-radius: 16px;
		padding: 25px;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		gap: 12px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		transition:
			transform 0.3s ease,
			box-shadow 0.3s ease;

		&:hover {
			transform: translateY(-2px);
			box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
		}

		@media screen and (max-width: 375px) {
			height: 150px;
			padding: 20px;
			gap: 10px;
		}

		@media screen and (min-width: 768px) {
			height: 160px;
			padding: 30px;
		}

		.card-content {
			height: 100%;
			display: flex;
			align-items: stretch;
			justify-content: space-between;
			gap: 12px;
			flex: 1;
		}

		.card-left {
			display: flex;
			flex-direction: column;
			gap: 6px;
			flex: 1 1 auto;
			min-height: 0;
			overflow: visible;
		}

		.card-right {
			width: 40%;
			display: flex;
			align-items: flex-start;
			justify-content: flex-end;
			flex: 0 0 auto;
		}

		.image-placeholder {
			width: 90%;
			height: 90%;
			border-radius: 12px;
			backdrop-filter: blur(2px);
			flex-shrink: 0;
			padding: 2px;
			background-color: #ffffff;
		}

		.card-name {
			font-size: 18px;
			font-weight: 500;
			color: rgba(255, 255, 255, 0.8);
		}

		.balance-box {
			display: inline-flex;
			align-items: baseline;
			border-radius: 6px;
			margin-top: -2px;
		}

		.balance-integer {
			font-size: 34px;
			font-weight: 800;
			color: #ffffff;
			letter-spacing: 1px;
		}

		.balance-fraction {
			font-size: 18px;
			font-weight: 700;
			color: rgba(255, 255, 255, 0.9);
		}

		.card-label {
			margin-top: 10px;
			font-size: 14px;
			font-weight: 400;
			color: rgba(255, 255, 255, 0.7);
		}

		.status-badge {
			margin-left: 4px;
			font-size: 12px;
			padding: 4px 14px;
			border-radius: 9999px;
			color: #ffffff;
			background: rgba(255, 255, 255, 0.2);
			font-weight: 400;
		}
	}
}
</style>
