<template>
	<div class="consume-water-page">
		<!-- 标题栏 -->
		<div class="header-section">
			<div class="back-button" @click="handleBack">←</div>
			<div class="page-title">流水详情</div>
		</div>

		<!-- 消费卡选择区域 -->
		<div class="card-selection-section">
			<div class="selection-label">选择消费卡</div>
			<div class="card-dropdown" @click="showCardPicker = true">
				<div class="selected-card">
					<div class="card-indicator"></div>
					<div class="card-name">工作餐卡</div>
				</div>
				<div class="dropdown-arrow">▼</div>
			</div>
		</div>

		<!-- 时间筛选区域 -->
		<div class="time-filter-section">
			<div
				class="filter-button active"
				:class="{ active: activeTimeFilter === 'week' }"
				@click="activeTimeFilter = 'week'"
			>
				<div class="button-text">本周</div>
			</div>
			<div
				class="filter-button"
				:class="{ active: activeTimeFilter === 'month' }"
				@click="activeTimeFilter = 'month'"
			>
				<div class="button-text">本月</div>
			</div>
			<div
				class="filter-button"
				:class="{ active: activeTimeFilter === 'all' }"
				@click="activeTimeFilter = 'all'"
			>
				<div class="button-text">全部</div>
			</div>
		</div>

		<!-- 流水记录列表 -->
		<div class="records-section">
			<!-- 今天分组 -->
			<div class="date-group">今天 · 12月10日</div>

			<!-- 流水记录1 -->
			<div class="record-item">
				<div class="record-left">
					<div class="merchant-name">公司食堂 · 午餐</div>
					<div class="transaction-details">
						12:30 · 订单号: 2024121012301001
					</div>
				</div>
				<div class="record-right">
					<div class="transaction-amount expense">-￥18.50</div>
					<div class="balance-info">余额￥1,246.80</div>
				</div>
			</div>

			<!-- 流水记录2 -->
			<div class="record-item">
				<div class="record-left">
					<div class="merchant-name">充值 · 银行卡转入</div>
					<div class="transaction-details">
						09:15 · 订单号: 2024121009151002
					</div>
				</div>
				<div class="record-right">
					<div class="transaction-amount income">+￥200.00</div>
					<div class="balance-info">余额￥1,265.30</div>
				</div>
			</div>

			<!-- 昨天分组 -->
			<div class="date-group">昨天 · 12月9日</div>

			<!-- 流水记录3 -->
			<div class="record-item">
				<div class="record-left">
					<div class="merchant-name">星巴克 · 咖啡</div>
					<div class="transaction-details">
						14:20 · 订单号: 2024120914201003
					</div>
				</div>
				<div class="record-right">
					<div class="transaction-amount expense">-￥35.00</div>
					<div class="balance-info">余额￥1,065.30</div>
				</div>
			</div>
		</div>

		<!-- 消费卡选择弹框 -->
		<van-popup
			v-model:show="showCardPicker"
			position="bottom"
			:style="{ height: '30%' }"
		>
			<van-picker
				:columns="cardOptions"
				@confirm="onCardConfirm"
				@cancel="showCardPicker = false"
			/>
		</van-popup>
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
