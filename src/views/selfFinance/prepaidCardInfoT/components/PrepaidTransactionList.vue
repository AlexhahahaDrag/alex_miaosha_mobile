<template>
	<div class="transaction-section">
		<!-- 流水标题栏 -->
		<div class="transaction-header">
			<span class="transaction-title">流水</span>
			<div
				class="more-btn"
				@click="emit('viewMore')"
			>
				更多
			</div>
		</div>

		<!-- 交易记录列表 -->
		<div class="transaction-list">
			<template v-if="!loading && transactionList.length > 0">
				<div
					v-for="(transaction, index) in transactionList"
					:key="index"
					class="transaction-item"
					@click="emit('transactionDetail', transaction)"
				>
					<div class="transaction-left">
						<div
							class="card-indicator-dot"
							:style="{ backgroundColor: transaction.cardColor }"
						/>
						<div class="transaction-info">
							<div class="transaction-name">{{ transaction.name }}</div>
							<div class="transaction-time">{{ transaction.time }}</div>
						</div>
					</div>
					<div
						class="transaction-amount"
						:class="{
							'amount-positive': transaction.formattedAmount.startsWith('+'),
							'amount-negative': transaction.formattedAmount.startsWith('-'),
						}"
					>
						{{ transaction.formattedAmount }}
					</div>
				</div>
			</template>

			<!-- 交易记录加载中 -->
			<div
				v-if="loading"
				class="transaction-loading"
			>
				<van-loading
					type="spinner"
					color="#3399ff"
					size="20px"
				/>
				<span>加载交易记录中...</span>
			</div>

			<!-- 无交易记录状态 -->
			<div
				v-if="!loading && transactionList.length === 0"
				class="transaction-empty"
			>
				<div class="empty-icon">🧾</div>
				<div class="empty-text">暂无交易记录</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { TransactionItem } from '@/views/selfFinance/prepaidCardInfoT/config';

interface Props {
	transactionList: TransactionItem[];
	loading: boolean;
}

defineProps<Props>();

const emit = defineEmits<{
	(e: 'viewMore'): void;
	(e: 'transactionDetail', transaction: TransactionItem): void;
}>();
</script>

<style lang="less" scoped>
.transaction-section {
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 5px;
}

.transaction-header {
	width: 100%;
	height: 40px;
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 10px 15px;
	box-sizing: border-box;
	background-color: #fafcff;
	border-radius: 12px;

	.transaction-title {
		font-size: 18px;
		font-weight: 600;
		color: var(--text-color);
	}

	.more-btn {
		width: 60px;
		height: 30px;
		background-color: #f2f7ff;
		border-radius: 15px;
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 14px;
		font-weight: 500;
		color: var(--primary-color);
		padding: 6px 12px;
		box-sizing: border-box;
		cursor: pointer;
		transition: background-color 0.2s ease;

		&:active {
			background-color: #e8f1ff;
		}
	}
}

.transaction-list {
	width: 100%;
	background-color: #fcfcff;
	border-radius: 12px;
	padding: 15px;
	box-sizing: border-box;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 12px;

	@media screen and (max-width: 375px) {
		padding: 10px;
		gap: 8px;
		min-height: 180px;
	}

	@media screen and (min-width: 768px) {
		padding: 20px;
		max-width: 700px;
		margin: 0 auto;
		gap: 15px;
		min-height: 250px;
	}

	.transaction-loading {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		height: 150px;
		gap: 15px;

		span {
			font-size: 14px;
			color: var(--text-secondary-color);
		}
	}

	.transaction-empty {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		height: 150px;
		gap: 10px;

		.empty-icon {
			font-size: 40px;
			margin-bottom: 10px;
		}

		.empty-text {
			font-size: 14px;
			color: var(--text-secondary-color);
		}
	}

	.transaction-item {
		width: 100%;
		height: 70px;
		background-color: #ffffff;
		border-radius: 8px;
		padding: 15px 10px;
		box-sizing: border-box;
		display: flex;
		justify-content: space-between;
		align-items: center;
		cursor: pointer;
		transition: background-color 0.2s ease;
		border-bottom: 1px solid var(--border-color);

		&:hover {
			background-color: rgba(0, 0, 0, 0.02);
		}

		&:active {
			background-color: rgba(0, 0, 0, 0.05);
		}

		.transaction-left {
			display: flex;
			align-items: center;
			gap: 10px;
			padding: 10px;
			box-sizing: border-box;

			.card-indicator-dot {
				width: 8px;
				height: 8px;
				border-radius: 4px;
			}

			.transaction-info {
				display: flex;
				flex-direction: column;
				gap: 4px;

				.transaction-name {
					font-size: 14px;
					font-weight: 500;
					color: var(--text-color);
				}

				.transaction-time {
					font-size: 12px;
					font-weight: 400;
					color: var(--text-secondary-color);
				}
			}
		}

		.transaction-amount {
			font-size: 16px;
			font-weight: 600;
			color: var(--text-color);

			&.amount-positive {
				color: var(--success-color);
			}

			&.amount-negative {
				color: var(--danger-color);
			}
		}
	}
}
</style>
