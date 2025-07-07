<template>
	<div class="consumption-card-page">
		<!-- 标题栏 -->
		<div class="title-bar">
			<span class="title">我的消费卡</span>
			<div class="add-button" @click="handleAddCard">+</div>
		</div>

		<!-- 消费卡余额卡片 -->
		<div class="card-balance">
			<div class="card-name">工作餐卡</div>
			<div class="balance-amount">￥ 1,246.80</div>
			<div class="balance-label">可用余额</div>
		</div>

		<!-- 操作按钮区域 -->
		<div class="action-buttons">
			<van-button class="consume-button" @click="handleConsume"
				>消费</van-button
			>
			<van-button class="recharge-button" @click="handleRecharge"
				>充值</van-button
			>
		</div>

		<!-- 消费记录标题 -->
		<div class="record-title">消费记录</div>

		<!-- 消费记录列表 -->
		<div class="record-list">
			<div
				class="record-item"
				v-for="(record, index) in consumptionRecords"
				:key="index"
			>
				<div class="record-left">
					<div class="record-merchant">{{ record.merchant }}</div>
					<div class="record-time">{{ record.time }}</div>
				</div>
				<div class="record-right">
					<div class="record-amount" :class="{ income: record.amount > 0 }">
						{{ record.amount > 0 ? '+' : '-' }}￥{{
							Math.abs(record.amount).toFixed(2)
						}}
					</div>
					<div class="record-balance">
						余额 ￥{{ record.balance.toFixed(2) }}
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { showToast } from 'vant';

interface ConsumptionRecord {
	merchant: string;
	time: string;
	amount: number; // 负数表示消费，正数表示充值
	balance: number;
}

// 消费记录数据
const consumptionRecords = ref<ConsumptionRecord[]>([
	{
		merchant: '公司食堂',
		time: '今天 12:30',
		amount: -18.5,
		balance: 1246.8,
	},
	{
		merchant: '便利店',
		time: '昨天 15:45',
		amount: -5.2,
		balance: 1265.3,
	},
	{
		merchant: '充值',
		time: '12月10日 10:20',
		amount: 300.0,
		balance: 1270.5,
	},
]);

// 添加消费卡
const handleAddCard = () => {
	showToast('添加消费卡功能开发中');
};

// 消费操作
const handleConsume = () => {
	showToast('消费功能开发中');
};

// 充值操作
const handleRecharge = () => {
	showToast('充值功能开发中');
};
</script>

<style lang="less" scoped>
.consumption-card-page {
	min-height: 100vh;
	background-color: #f7faff;
	padding: 40px 20px 20px;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 20px;
	box-sizing: border-box;
}

.title-bar {
	width: 100%;
	height: 60px;
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 15px 20px;
	background-color: #ffffff;
	border-radius: 8px;
	box-sizing: border-box;
}

.title {
	font-weight: 700;
	font-size: 20px;
	color: #333333;
}

.add-button {
	width: 30px;
	height: 30px;
	background-color: #3399ff;
	border-radius: 15px;
	display: flex;
	justify-content: center;
	align-items: center;
	color: #ffffff;
	font-weight: 700;
	font-size: 18px;
	cursor: pointer;
}

.card-balance {
	width: 100%;
	height: 180px;
	background-color: #268cf2;
	border-radius: 16px;
	padding: 25px;
	display: flex;
	flex-direction: column;
	gap: 15px;
	box-sizing: border-box;
}

.card-name {
	font-weight: 500;
	font-size: 16px;
	color: rgba(255, 255, 255, 0.8);
}

.balance-amount {
	font-weight: 700;
	font-size: 32px;
	color: #ffffff;
}

.balance-label {
	font-weight: 400;
	font-size: 14px;
	color: rgba(255, 255, 255, 0.7);
}

.action-buttons {
	width: 100%;
	height: 80px;
	display: flex;
	justify-content: center;
	align-items: center;
	gap: 15px;
	padding: 20px 0;
	background-color: #ffffff;
	border-radius: 8px;
	box-sizing: border-box;
}

.consume-button {
	width: 160px;
	height: 40px;
	background-color: #ff6666;
	border-radius: 20px;
	color: #ffffff;
	font-weight: 600;
	font-size: 16px;
	border: none;
}

.recharge-button {
	width: 160px;
	height: 40px;
	background-color: #4db280;
	border-radius: 20px;
	color: #ffffff;
	font-weight: 600;
	font-size: 16px;
	border: none;
}

.record-title {
	width: 100%;
	font-weight: 600;
	font-size: 18px;
	color: #333333;
	text-align: left;
	margin-top: 10px;
}

.record-list {
	width: 100%;
	background-color: #ffffff;
	border-radius: 12px;
	padding: 15px;
	display: flex;
	flex-direction: column;
	gap: 12px;
	box-sizing: border-box;
}

.record-item {
	width: 100%;
	height: 60px;
	background-color: #fafafa;
	border-radius: 8px;
	padding: 15px;
	display: flex;
	justify-content: space-between;
	align-items: center;
	box-sizing: border-box;
}

.record-left {
	display: flex;
	flex-direction: column;
	gap: 5px;
}

.record-merchant {
	font-weight: 500;
	font-size: 16px;
	color: #333333;
}

.record-time {
	font-weight: 400;
	font-size: 12px;
	color: #999999;
}

.record-right {
	display: flex;
	flex-direction: column;
	align-items: flex-end;
	gap: 5px;
}

.record-amount {
	font-weight: 600;
	font-size: 16px;
	color: #ff6666;
}

.record-amount.income {
	color: #4db280;
}

.record-balance {
	font-weight: 400;
	font-size: 11px;
	color: #999999;
}
</style>
