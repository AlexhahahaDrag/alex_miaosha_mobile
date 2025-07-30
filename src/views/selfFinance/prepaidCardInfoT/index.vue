<template>
	<div class="prepaid-card-container">
		<!-- 标题栏 -->
		<div class="card-header">
			<span class="title">我的消费卡</span>
			<div class="header-actions">
				<van-button
					ype="primary"
					size="small"
					class="overview-btn"
					@click="handleOverview"
				>
					总览
				</van-button>
				<van-button
					type="default"
					size="small"
					class="add-btn"
					icon="plus"
					@click="handleAddCard"
				/>
			</div>
		</div>
		<!-- 卡片滚动区域 -->
		<div class="card-scroll-area">
			<van-swipe
				:loop="false"
				:show-indicators="true"
				:initial-swipe="currentCardIndex"
				@change="handleCardChange"
				v-if="!cardsLoading && cardList.length > 0"
			>
				<van-swipe-item v-for="(card, index) in cardList" :key="index">
					<div class="card-item" :style="{ backgroundColor: card.bgColor }">
						<div class="card-name">{{ card.name }}</div>
						<div class="card-balance">{{ card.balance }}</div>
						<div class="card-label">可用余额</div>
					</div>
				</van-swipe-item>
			</van-swipe>
			<!-- 卡片加载中 -->
			<div class="card-loading" v-if="cardsLoading">
				<van-loading type="spinner" color="#3399ff" size="24px" />
				<span>加载中...</span>
			</div>
			<!-- 无卡片状态 -->
			<div class="card-empty" v-if="!cardsLoading && cardList.length === 0">
				<div class="empty-icon">📇</div>
				<div class="empty-text">暂无消费卡</div>
				<div class="add-card-btn" @click="handleAddCard">添加卡片</div>
			</div>
		</div>
		<!-- 快捷操作按钮 -->
		<div class="quick-actions">
			<van-button
				class="action-btn consume-btn"
				@click="handleAmount('consume')"
				color="#ff6666"
				block
				round
			>
				消费
			</van-button>
			<van-button
				class="action-btn recharge-btn"
				@click="handleAmount('recharge')"
				color="#4db280"
				block
				round
			>
				充值
			</van-button>
		</div>
		<!-- 流水标题栏 -->
		<div class="transaction-header">
			<span class="transaction-title">流水</span>
			<div class="more-btn" @click="handleViewMore">更多</div>
		</div>
		<!-- 交易记录列表 -->
		<div class="transaction-list">
			<!-- 有交易记录时显示列表 -->
			<div
				class="transaction-item"
				v-for="(transaction, index) in transactionList"
				:key="index"
				@click="handleTransactionDetail(transaction)"
				v-if="!transactionsLoading && transactionList.length > 0"
			>
				<div class="transaction-left">
					<div
						class="card-indicator-dot"
						:style="{ backgroundColor: transaction.cardColor }"
					></div>
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
			<!-- 交易记录加载中 -->
			<div class="transaction-loading" v-if="transactionsLoading">
				<van-loading type="spinner" color="#3399ff" size="20px" />
				<span>加载交易记录中...</span>
			</div>
			<!-- 无交易记录状态 -->
			<div
				class="transaction-empty"
				v-if="!transactionsLoading && transactionList.length === 0"
			>
				<div class="empty-icon">📋</div>
				<div class="empty-text">暂无交易记录</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { showToast, showLoadingToast, showFailToast, closeToast } from 'vant';
import {
	getPrepaidCardInfoList,
	getPrepaidConsumeRecordPage,
} from './api/index';
import { type CardItem, type TransactionItem } from './config/index';
import { formatTime, formatAmount } from '@/views/common/config';
import { useNavBar } from '@/composables/useNavBar';

// 路由实例
const router = useRouter();
const route = useRoute();

// 使用新的NavBar系统
useNavBar({
	title: (route?.meta?.title as string) || '财务明细',
	leftPath: '/',
	showRight: false,
	visible: true,
});

// 加载状态
const loading = ref<boolean>(true);
const cardsLoading = ref<boolean>(true);
const transactionsLoading = ref<boolean>(true);

// 当前选中的卡片索引
const currentCardIndex = ref<number>(0);

// 卡片列表数据
const cardList = ref<CardItem[]>([]);

// 计算属性：当前选中的卡片
const currentCard = computed(() => {
	return cardList.value[currentCardIndex.value] || null;
});

// 交易记录列表
const transactionList = ref<TransactionItem[]>([]);

// 根据路由的cardId设置当前选中的index
const setCurrentCardIndexByRouteCardId = () => {
	const { cardId } = route.query;
	if (cardId && cardList.value.length > 0) {
		const index = cardList.value.findIndex((card) => card.id === cardId);
		console.log('1111111111111111111111111111', index, cardList.value);
		if (index !== -1) {
			currentCardIndex.value = index;
		}
	}
};

// 获取消费卡列表
const getCardList = async () => {
	// 获取消费卡信息列表
	const { code, data, message } = await getPrepaidCardInfoList({});
	if (code === '200') {
		// 转换数据格式以匹配组件期望的结构
		cardList.value = data.map((card: any, index: number) => ({
			name: card.cardName || `消费卡 ${index + 1}`,
			balance: `￥ ${card.currentBalance || '0.00'}`,
			bgColor: getCardColor(index), // 根据索引分配颜色
			id: card.id,
			...card,
		}));

		// 根据路由的cardId设置当前选中的index
		setCurrentCardIndexByRouteCardId();
	} else {
		cardList.value = [];
		showFailToast(message || '查询失败，请联系管理员!');
	}
	cardsLoading.value = false;
};

const getCardDetail = async () => {
	const { code, data, message } = await getPrepaidConsumeRecordPage(
		{ cardId: currentCard.value?.id },
		1,
		10,
	);

	if (code === '200') {
		const records = data.records || [];
		// 转换数据格式以匹配组件期望的结构
		transactionList.value = records.map((record: any, index: number) => ({
			name: record.cardName || record.description || '消费记录',
			time: formatTime(record.createTime || record.transactionTime),
			formattedAmount: formatAmount(record.amount, record.transactionType),
			cardColor: getCardColor(index),
			id: record.id,
			...record,
		}));
	} else {
		transactionList.value = [];
		showFailToast(message || '查询详情失败，请联系管理员!');
	}
	transactionsLoading.value = false;
};

// 获取数据
const fetchData = async () => {
	loading.value = true;
	showLoadingToast({
		message: '加载中...',
		forbidClick: true,
	});

	try {
		await getCardList();
		// 获取交易记录分页数据
		await getCardDetail();
	} catch (error: any) {
		console.error('获取数据失败', error);
		showToast('获取数据失败，请重试');
		cardsLoading.value = false;
		transactionsLoading.value = false;
	} finally {
		loading.value = false;
		closeToast();
	}
};

// 根据索引获取卡片颜色
const getCardColor = (index: number) => {
	const colors = [
		'#268CF2',
		'#CC66E5',
		'#4DB280',
		'#FF6B6B',
		'#FFA726',
		'#66BB6A',
	];
	return colors[index % colors.length];
};

// 刷新数据
const refreshData = async () => {
	console.log('刷新数据中...');
	await fetchData();
};

// 卡片切换处理函数
const handleCardChange = async (index: number) => {
	currentCardIndex.value = index;
	// 获取交易记录分页数据
	await getCardDetail();
};

// 消费按钮点击处理函数
const handleAmount = (type: 'consume' | 'recharge') => {
	if (!currentCard.value) {
		showToast('请先选择一张卡片');
		return;
	}
	router.push({
		name: 'prepaidCardInfoTConsumeInfo',
		query: { type, cardId: currentCard.value.id },
	});
};

// 查看更多流水记录
const handleViewMore = () => {
	// 除了触发父组件事件，也提供刷新数据的功能
	refreshData();
	emit('viewMore');
};

// 查看交易详情
const handleTransactionDetail = (transaction: TransactionItem) => {
	emit('transactionDetail', transaction);
};

// 总览按钮点击处理函数
const handleOverview = () => {
	if (cardList.value.length === 0) {
		showToast('暂无消费卡数据');
		return;
	}

	// 计算总余额
	const totalBalance = cardList.value.reduce((sum, card) => {
		const balance = parseFloat(card.balance.replace(/[￥,]/g, '')) || 0;
		return sum + balance;
	}, 0);

	showToast({
		message: `共 ${cardList.value.length} 张卡片\n总余额: ￥${totalBalance.toFixed(2)}`,
		duration: 3000,
	});
};

// 添加卡片按钮点击处理函数
const handleAddCard = () => {
	showToast('添加卡片功能开发中');
};

// 定义事件
const emit = defineEmits<{
	(e: 'consume', cardIndex: number): void;
	(e: 'recharge', cardIndex: number): void;
	(e: 'viewMore'): void;
	(e: 'transactionDetail', transaction: TransactionItem): void;
}>();

// 生命周期钩子
onMounted(() => {
	fetchData();
});
</script>

<style lang="less" scoped>
// 主题颜色现在使用全局CSS变量（在 @/assets/styles/variables.css 中定义）
.prepaid-card-container {
	width: 100%;
	min-height: 100vh;
	background-color: var(--bg-color);
	box-sizing: border-box;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 20px;

	@media screen and (max-width: 375px) {
		padding: 30px 15px 15px;
		gap: 15px;
	}

	@media screen and (min-width: 768px) {
		padding: 50px 30px 30px;
		max-width: 768px;
		margin: 0 auto;
	}
}

// 标题栏样式
.card-header {
	width: 100%;
	height: 60px;
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 15px 20px;
	box-sizing: border-box;
	background-color: #ffffff;
	border-radius: 12px;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

	.title {
		font-size: 20px;
		font-weight: 700;
		color: var(--text-color);
	}

	.header-actions {
		display: flex;
		align-items: center;
		gap: 15px;

		.overview-btn {
			height: 30px;
			padding: 0 10px;
			font-size: 14px;
			font-weight: 600;
			border-radius: 15px;
			transition: opacity 0.2s ease;

			:deep(.van-button__content) {
				display: flex;
				align-items: center;
				justify-content: center;
			}

			&:active {
				opacity: 0.8;
			}
		}

		.add-btn {
			width: 30px;
			height: 30px;
			padding: 0;
			border-radius: 50%;
			transition: transform 0.2s ease;

			:deep(.van-button__content) {
				display: flex;
				align-items: center;
				justify-content: center;
			}

			:deep(.van-icon) {
				font-size: 18px;
			}

			&:active {
				transform: scale(0.95);
			}
		}
	}
}

// 卡片滚动区域样式
.card-scroll-area {
	width: 100%;
	height: 150px;
	overflow: hidden;
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

	// 卡片加载中状态
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

	// 无卡片状态
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
		height: 100%;
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

		.card-name {
			font-size: 16px;
			font-weight: 500;
			color: rgba(255, 255, 255, 0.8);
		}

		.card-balance {
			font-size: 28px;
			font-weight: 700;
			color: #ffffff;
			margin-top: 5px;
		}

		.card-label {
			font-size: 14px;
			font-weight: 400;
			color: rgba(255, 255, 255, 0.7);
		}
	}
}

// 快捷操作按钮样式
.quick-actions {
	width: 100%;
	height: 60px;
	display: flex;
	justify-content: center;
	align-items: center;
	gap: 15px;
	padding: 20px 15px;
	box-sizing: border-box;

	.action-btn {
		flex: 1;
		max-width: 120px;
		height: 40px;
		font-size: 14px;
		font-weight: 600;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);

		:deep(.van-button__content) {
			display: flex;
			justify-content: center;
			align-items: center;
		}

		&:active {
			transform: scale(0.95);
			opacity: 0.9;
		}

		@media screen and (max-width: 375px) {
			max-width: 100px;
			height: 36px;
			font-size: 13px;
		}

		@media screen and (min-width: 768px) {
			max-width: 140px;
			height: 44px;
			font-size: 15px;
		}
	}
}

// 流水标题栏样式
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
	margin-top: 5px;

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

// 交易记录列表样式
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
	min-height: 200px;

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

	// 加载中状态
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

	// 空状态
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
		border-radius: 8px;

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
				color: var(--success-color); // 绿色 - 充值/收入
			}

			&.amount-negative {
				color: var(--danger-color); // 红色 - 消费/支出
			}
		}
	}
}
</style>
