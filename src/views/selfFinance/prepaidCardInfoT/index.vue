<template>
	<div class="prepaid-card-container">
		<!-- 标题栏 -->
		<div class="card-header">
			<span class="title">我的消费卡</span>
			<div class="header-actions">
				<van-button
					type="primary"
					size="small"
					class="overview-btn"
					:style="{ color: currentCard.bgColor }"
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
				class="card-loading"
				v-if="cardsLoading"
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
				class="card-empty"
				v-if="!cardsLoading && cardList.length === 0"
			>
				<div class="empty-icon">📇</div>
				<div class="empty-text">暂无消费卡</div>
				<div
					class="add-card-btn"
					@click="handleAddCard"
				>
					添加卡片
				</div>
			</div>
		</div>
		<!-- 快捷操作按钮 -->
		<div class="quick-actions">
			<van-button
				class="action-btn consume-btn"
				@click="handleAmount('consume')"
				color="#ff6666"
				block
			>
				<div class="action-btn-content">
					<van-image
						:src="shopCarSvg"
						width="20"
						height="20"
					/>
					消费
				</div>
			</van-button>
			<van-button
				class="action-btn recharge-btn"
				@click="handleAmount('recharge')"
				color="#4db280"
				block
			>
				<div class="action-btn-content">
					<van-image
						:src="shopCardSvg"
						width="20"
						height="20"
					/>
					充值
				</div>
			</van-button>
		</div>
		<!-- 流水标题栏 -->
		<div class="transaction-header">
			<span class="transaction-title">流水</span>
			<div
				class="more-btn"
				@click="handleViewMore"
			>
				更多
			</div>
		</div>
		<!-- 交易记录列表 -->
		<div class="transaction-list">
			<!-- 有交易记录时显示列表 -->
			<template v-if="!transactionsLoading && transactionList.length > 0">
				<div
					class="transaction-item"
					v-for="(transaction, index) in transactionList"
					:key="index"
					@click="handleTransactionDetail(transaction)"
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
				<div
					class="transaction-loading"
					v-if="transactionsLoading"
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
					class="transaction-empty"
					v-if="!transactionsLoading && transactionList.length === 0"
				>
					<div class="empty-icon">📋</div>
					<div class="empty-text">暂无交易记录</div>
				</div>
			</template>
		</div>
	</div>
</template>

<script setup lang="ts">
import { showToast, showLoadingToast, showFailToast, closeToast } from 'vant';
import { getPrepaidCardInfoList, getPrepaidConsumeRecordPage } from './api/index';
import { type CardItem, type TransactionItem, getCardColor, typeIconMap } from './config/index';
import { formatTime, formatAmount } from '@/views/common/config';
import { useNavBar } from '@/composables/useNavBar';
import shopCardSvg from '@/assets/icons/shop/shop-card.svg';
import shopCarSvg from '@/assets/icons/shop/shop-car.svg';

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
		cardList.value = data.map((card: Params, index: number) => ({
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
	const { code, data, message } = await getPrepaidConsumeRecordPage({ cardId: currentCard.value?.id }, 1, 10);
	if (code === '200') {
		const records = data.records || [];
		// 转换数据格式以匹配组件期望的结构
		transactionList.value = records.map((record: Params, index: number) => ({
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
	} catch (error: unknown) {
		// console.log('错误信息：', error);
		showFailToast(`获取数据失败，请重试！${(error as Error).message}` || '未知错误');
	}
	cardsLoading.value = false;
	transactionsLoading.value = false;
	loading.value = false;
	closeToast();
};

// 金额格式拆分（整数与小数）
const getBalanceParts = (value: string | number) => {
	const numeric = typeof value === 'number' ? value : Number(String(value).replace(/[^\d.-]/g, ''));
	if (Number.isNaN(numeric)) {
		return { integer: '0', fraction: '.00' };
	}
	const fixed = numeric.toFixed(2);
	const [intPart, fracPart] = fixed.split('.');
	return { integer: intPart, fraction: `.${fracPart}` };
};

// 状态映射（颜色与标签）
const getStatusLabel = (card: CardItem) => {
	const status = (card?.status || '1').toString();
	if (status === '1' || status === '正常' || status === 'normal') return '正常';
	if (status === '0' || status === '禁用' || status === 'disabled') return '禁用';
	return '未知';
};

// 获取分类图标
function getCategoryIcon(type: string): string {
	return typeIconMap[type] || '';
}

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
	router.push({
		name: 'consumeWaterInfo',
		query: { cardId: currentCard.value.id },
	});
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
	router.push({
		name: 'consumeOverviewInfo',
		query: { cardId: currentCard.value.id },
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
	height: 100%;
	background-color: #f2f3f5;
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
	padding: 0 20px;
	box-sizing: border-box;
	border-radius: 12px;
	margin-top: 10px;
	margin-bottom: 0;

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
			padding: 0 18px;
			transition: opacity 0.2s ease;
			background: #faede2;
			border: none;

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
			background-color: #f3f4f6;

			:deep(.van-button__content) {
				display: flex;
				align-items: center;
				justify-content: center;
			}

			:deep(.van-icon) {
				font-size: 14px;
				font-weight: 700;
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
			height: calc(100% - 0px);
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

		.currency {
			font-size: 18px;
			font-weight: 700;
			color: #ffffff;
			opacity: 0.95;
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

		.status-box {
			display: inline-flex;
			align-items: center;
			gap: 6px;
			border-radius: 12px;
			backdrop-filter: blur(2px);
			margin-top: 6px;
		}

		.status-dot {
			width: 10px;
			height: 10px;
			border-radius: 50%;
			background: #00b42a;
		}

		.status-text {
			font-size: 14px;
			color: rgba(255, 255, 255, 0.9);
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

// 快捷操作按钮样式
.quick-actions {
	width: 100%;
	height: 60px;
	display: flex;
	justify-content: center;
	align-items: center;
	gap: 15px;
	box-sizing: border-box;
	margin: 10px 0 0;
	padding: 10px 10px 0;

	.action-btn {
		flex: 1;
		width: 40%;
		height: 48px;
		font-size: 15px;
		font-weight: 600;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
		border-radius: 12px;

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

.action-btn-content {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 100%;
	gap: 5px;
}
</style>
