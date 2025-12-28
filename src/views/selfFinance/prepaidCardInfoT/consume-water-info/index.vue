<template>
	<div class="transaction-history">
		<!-- Main Content -->
		<div class="main-content">
			<!-- Filter Section -->
			<div class="filter-section">
				<div class="filter-container">
					<div class="filter-buttons">
						<button
							class="filter-btn"
							:class="{ active: activeFilter === 'all' }"
							@click="handleFilterClick('all')"
						>
							全部
						</button>
						<button
							class="filter-btn"
							:class="{ active: activeFilter === 'income' }"
							@click="handleFilterClick('income')"
						>
							收入
						</button>
						<button
							class="filter-btn"
							:class="{ active: activeFilter === 'expense' }"
							@click="handleFilterClick('expense')"
						>
							支出
						</button>
					</div>
					<div
						class="filter-icon-btn"
						@click="openFilterPopup"
					>
						<van-image
							:src="filterIcon"
							width="18"
							height="18"
						/>
						<span>筛选</span>
					</div>
				</div>
			</div>

			<!-- Vant下拉刷新 + 触底加载 -->
			<van-pull-refresh
				v-model="refreshing"
				@refresh="onRefresh"
			>
				<van-list
					v-model:loading="loadingMore"
					:finished="finished"
					finished-text="没有更多了"
					@load="onLoad"
					:immediate-check="false"
				>
					<!-- Loading State -->
					<div
						v-if="loading"
						class="loading-container"
					>
						<div class="loading-text">加载中...</div>
					</div>

					<div
						v-else-if="transactionList?.length === 0"
						class="empty-container"
					>
						<div class="empty-text">暂无交易记录</div>
					</div>

					<div
						v-else
						class="transaction-list"
					>
						<div
							v-for="(transactions, dateGroup) in groupedTransactions"
							:key="dateGroup"
							class="date-section"
						>
							<h3 class="date-title">{{ dateGroup }}</h3>

							<div
								v-for="transaction in transactions"
								:key="transaction.id"
								class="transaction-item"
							>
								<div class="transaction-content">
									<div class="icon-container">
										<van-image
											:src="getCategoryIcon(transaction.cardName)"
											:alt="transaction.cardName"
											class="category-icon"
										/>
									</div>
									<div class="transaction-info">
										<h4 class="merchant-name">
											{{ transaction.cardName }}
										</h4>
										<div class="category-info">
											<i class="fas fa-circle"></i>
											<span>{{ transaction.type }}</span>
										</div>
									</div>
								</div>
								<div class="transaction-amount">
									<div
										class="amount"
										:class="getTransactionTypeClass(transaction.amount)"
									>
										{{ formatAmount(transaction.amount) }}
									</div>
									<div class="time">
										{{ formatTime(transaction.consumeTime) }}
									</div>
								</div>
							</div>
						</div>
					</div>
				</van-list>
			</van-pull-refresh>

			<!-- 筛选弹窗：卡片与日期范围 -->
			<van-popup
				v-model:show="filterVisible"
				position="bottom"
				round
			>
				<div class="filter-popup">
					<van-cell-group inset>
						<van-cell
							title="选择卡片"
							:value="selectedCardName || '全部卡片'"
							is-link
							@click="openCardPicker"
						/>
						<van-cell
							title="日期范围"
							:value="displayDateRange"
							is-link
							@click="calendarVisible = true"
						/>
					</van-cell-group>

					<div class="filter-actions">
						<van-button
							type="default"
							block
							class="mr8"
							@click="resetFilters"
						>
							重置
						</van-button>
						<van-button
							type="primary"
							block
							@click="applyFilters"
						>
							确定
						</van-button>
					</div>
				</div>
			</van-popup>

			<!-- 卡片选择器 -->
			<van-popup
				v-model:show="cardPickerVisible"
				position="bottom"
				round
			>
				<van-picker
					:columns="cardColumns"
					@confirm="onCardConfirm"
					@cancel="cardPickerVisible = false"
				/>
			</van-popup>

			<!-- 日历（日期范围） -->
			<van-calendar
				v-model:show="calendarVisible"
				type="range"
				@confirm="onCalendarConfirm"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
const router = useRouter();

// 响应式数据
const activeTimeFilter = ref('week');
const showCardPicker = ref(false);

// 消费卡选项
const cardOptions = [
	{ text: '工作餐卡', value: 'work' },
	{ text: '生活消费卡', value: 'life' },
	{ text: '交通卡', value: 'transport' },
];

// 方法
const handleBack = () => {
	router.back();
};

const onCardConfirm = (value: any) => {
	console.log('选择的消费卡:', value);
	showCardPicker.value = false;
};
</script>

<style lang="less" scoped>
.consume-water-page {
	background-color: #f7faff;
	min-height: 100vh;
	padding: 20px;
	display: flex;
	flex-direction: column;
	gap: 20px;
}

// 标题栏样式
.header-section {
	background-color: #ffffff;
	border-radius: 12px;
	padding: 15px 20px;
	display: flex;
	justify-content: space-between;
	align-items: center;
	height: 60px;

	.back-button {
		font-family: Inter;
		font-weight: 400;
		font-size: 20px;
		line-height: 1.21;
		color: #3399ff;
		cursor: pointer;
	}

	.page-title {
		font-family: Inter;
		font-weight: 600;
		font-size: 18px;
		line-height: 1.21;
		color: #333333;
		text-align: center;
		width: 275px;
	}
}

// 消费卡选择区域样式
.card-selection-section {
	background-color: #ffffff;
	border-radius: 12px;
	padding: 15px 20px;
	display: flex;
	flex-direction: column;
	gap: 10px;

	.selection-label {
		font-family: Inter;
		font-weight: 500;
		font-size: 14px;
		line-height: 1.21;
		color: #999999;
	}

	.card-dropdown {
		background-color: #fafcff;
		border: 1px solid #e6e6e6;
		border-radius: 8px;
		padding: 12px 15px 10px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 161px;
		height: 40px;
		cursor: pointer;

		.selected-card {
			display: flex;
			align-items: center;
			gap: 8px;

			.card-indicator {
				width: 8px;
				height: 8px;
				background-color: #268cf2;
				border-radius: 4px;
			}

			.card-name {
				font-family: Inter;
				font-weight: 500;
				font-size: 16px;
				line-height: 1.21;
				color: #333333;
			}
		}

		.dropdown-arrow {
			font-family: Inter;
			font-weight: 400;
			font-size: 12px;
			line-height: 1.21;
			color: #999999;
		}
	}
}

// 时间筛选区域样式
.time-filter-section {
	background-color: #ffffff;
	border-radius: 12px;
	padding: 15px 20px;
	display: flex;
	align-items: center;
	gap: 15px;
	height: 60px;

	.filter-button {
		width: 80px;
		height: 30px;
		border-radius: 15px;
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 10px;
		cursor: pointer;
		background-color: #f2f2f2;

		&.active {
			background-color: #3399ff;

			.button-text {
				color: #ffffff;
			}
		}

		.button-text {
			font-family: Inter;
			font-weight: 500;
			font-size: 14px;
			line-height: 1.21;
			color: #666666;
		}
	}
}

// 流水记录列表样式
.records-section {
	background-color: #ffffff;
	border-radius: 12px;
	padding: 20px;
	display: flex;
	flex-direction: column;
	gap: 15px;
	height: 450px;

	.date-group {
		font-family: Inter;
		font-weight: 600;
		font-size: 14px;
		line-height: 1.21;
		color: #666666;
	}

	.record-item {
		background-color: #fafcff;
		border-radius: 8px;
		padding: 15px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 295px;
		height: 80px;

		.record-left {
			display: flex;
			flex-direction: column;
			gap: 5px;
			padding: 10px;
			width: 180px;
			height: 50px;

			.merchant-name {
				font-family: Inter;
				font-weight: 600;
				font-size: 16px;
				line-height: 1.21;
				color: #333333;
			}

			.transaction-details {
				font-family: Inter;
				font-weight: 400;
				font-size: 12px;
				line-height: 1.21;
				color: #999999;
			}
		}

		.record-right {
			display: flex;
			flex-direction: column;
			justify-content: flex-end;
			align-items: flex-end;
			gap: 5px;
			padding: 10px;
			width: 70px;
			height: 50px;

			.transaction-amount {
				font-family: Inter;
				font-weight: 600;
				font-size: 16px;
				line-height: 1.21;

				&.expense {
					color: #ff6666;
				}

				&.income {
					color: #4db280;
				}
			}

			.balance-info {
				font-family: Inter;
				font-weight: 400;
				font-size: 12px;
				line-height: 1.21;
				color: #999999;
			}
		}
	}
}
</style>
