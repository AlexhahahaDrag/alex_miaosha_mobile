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
					:style="{ color: currentCard?.bgColor || '#268CF2' }"
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

		<!-- 卡片轮播区域 -->
		<prepaid-card-swipe
			v-model:current-index="currentCardIndex"
			:card-list="cardList"
			:loading="cardsLoading"
			@change="handleCardChange"
			@add-card="handleAddCard"
		/>

		<!-- 快捷操作按钮 -->
		<div class="quick-actions">
			<van-button
				class="action-btn consume-btn"
				color="#ff6666"
				block
				@click="handleAmount('consume')"
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
				color="#4db280"
				block
				@click="handleAmount('recharge')"
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

		<!-- 流水交易记录列表 -->
		<prepaid-transaction-list
			:transaction-list="transactionList"
			:loading="transactionsLoading"
			@view-more="handleViewMore"
			@transaction-detail="handleTransactionDetail"
		/>
	</div>
</template>

<script setup lang="ts">
import { showToast, showLoadingToast, showFailToast, closeToast } from 'vant';
import { getPrepaidCardInfoList, getPrepaidConsumeRecordPage } from '@/views/selfFinance/prepaidCardInfoT/api';
import { type CardItem, type TransactionItem, getCardColor } from '@/views/selfFinance/prepaidCardInfoT/config';
import { formatTime, formatAmount } from '@/views/common/config';
import { useNavBar } from '@/composables/useNavBar';
import PrepaidCardSwipe from '@/views/selfFinance/prepaidCardInfoT/components/PrepaidCardSwipe.vue';
import PrepaidTransactionList from '@/views/selfFinance/prepaidCardInfoT/components/PrepaidTransactionList.vue';
import shopCardSvg from '@/assets/images/shop/shop-card.svg';
import shopCarSvg from '@/assets/images/shop/shop-car.svg';

const router = useRouter();
const route = useRoute();

useNavBar({
	title: (route?.meta?.title as string) || '预付卡',
	leftPath: '/',
	showRight: false,
	visible: true,
});

const loading = ref<boolean>(true);
const cardsLoading = ref<boolean>(true);
const transactionsLoading = ref<boolean>(true);

const currentCardIndex = ref<number>(0);
const cardList = ref<CardItem[]>([]);
const transactionList = ref<TransactionItem[]>([]);

const currentCard = computed(() => {
	return cardList.value[currentCardIndex.value] || null;
});

const setCurrentCardIndexByRouteCardId = () => {
	const { cardId } = route.query;
	if (cardId && cardList.value.length > 0) {
		const index = cardList.value.findIndex((card) => card.id === cardId);
		if (index !== -1) {
			currentCardIndex.value = index;
		}
	}
};

const getCardList = async () => {
	const { code, data, message } = await getPrepaidCardInfoList({});
	if (code === '200') {
		const cardData = (data || []) as Array<Record<string, unknown>>;
		cardList.value = cardData.map((card, index: number) => ({
			name: String(card.cardName || `消费卡${index + 1}`),
			balance: `¥${String(card.currentBalance || '0.00')}`,
			bgColor: getCardColor(index),
			id: String(card.id || ''),
			cardName: String(card.cardName || ''),
			cardType: String(card.cardType || ''),
			status: String(card.status || ''),
			currentBalance: card.currentBalance as number | string,
		}));

		setCurrentCardIndexByRouteCardId();
	} else {
		cardList.value = [];
		showFailToast(message || '查询失败，请联系管理员！');
	}
	cardsLoading.value = false;
};

const getCardDetail = async () => {
	const { code, data, message } = await getPrepaidConsumeRecordPage({ cardId: currentCard.value?.id }, 1, 10);
	if (code === '200') {
		const records = ((data?.records || []) as Array<Record<string, unknown>>) ?? [];
		transactionList.value = records.map((record, index: number) => ({
			name: String(record.cardName || record.description || '消费记录'),
			time: formatTime(String(record.createTime || record.transactionTime || '')),
			amount: String(record.amount || ''),
			formattedAmount: formatAmount(Number(record.amount || 0), String(record.transactionType || '')),
			cardColor: getCardColor(index),
			id: String(record.id || ''),
			transactionType: String(record.transactionType || ''),
			description: String(record.description || ''),
			createTime: String(record.createTime || ''),
		}));
	} else {
		transactionList.value = [];
		showFailToast(message || '查询详情失败，请联系管理员！');
	}
	transactionsLoading.value = false;
};

const fetchData = async () => {
	loading.value = true;
	showLoadingToast({
		message: '加载中...',
		forbidClick: true,
	});
	try {
		await getCardList();
		await getCardDetail();
	} catch (error: unknown) {
		showFailToast(`获取数据失败，请重试：${(error as Error).message || '未知错误'}`);
	}
	cardsLoading.value = false;
	transactionsLoading.value = false;
	loading.value = false;
	closeToast();
};

const handleCardChange = async (index: number) => {
	currentCardIndex.value = index;
	await getCardDetail();
};

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

const handleViewMore = () => {
	router.push({
		name: 'consumeWaterInfo',
		query: { cardId: currentCard.value?.id },
	});
};

const handleTransactionDetail = (transaction: TransactionItem) => {
	emit('transactionDetail', transaction);
};

const handleOverview = () => {
	if (cardList.value.length === 0) {
		showToast('暂无消费卡数据');
		return;
	}
	router.push({
		name: 'consumeOverviewInfo',
		query: { cardId: currentCard.value?.id },
	});
};

const handleAddCard = () => {
	showToast('添加卡片功能开发中');
};

const emit = defineEmits(['consume', 'recharge', 'viewMore', 'transactionDetail']);

onMounted(() => {
	fetchData();
});
</script>

<style lang="less" scoped>
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
			padding: 0 18px;
			font-size: 14px;
			font-weight: 600;
			border-radius: 15px;
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

.action-btn-content {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 100%;
	gap: 5px;
}
</style>
