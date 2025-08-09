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
					<div class="filter-icon-btn" @click="openFilterPopup">
						<van-image :src="filterIcon" width="18" height="18" />
						<span>筛选</span>
					</div>
				</div>
			</div>

			<!-- Vant下拉刷新 + 触底加载 -->
			<van-pull-refresh v-model="refreshing" @refresh="onRefresh">
				<van-list
					v-model:loading="loadingMore"
					:finished="finished"
					finished-text="没有更多了"
					@load="onLoad"
					:immediate-check="false"
				>
					<!-- Loading State -->
					<div v-if="loading" class="loading-container">
						<div class="loading-text">加载中...</div>
					</div>

					<div
						v-else-if="transactionList?.length === 0"
						class="empty-container"
					>
						<div class="empty-text">暂无交易记录</div>
					</div>

					<div v-else class="transaction-list">
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
			<van-popup v-model:show="filterVisible" position="bottom" round>
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
						<van-button type="default" block class="mr8" @click="resetFilters"
							>重置</van-button
						>
						<van-button type="primary" block @click="applyFilters"
							>确定</van-button
						>
					</div>
				</div>
			</van-popup>

			<!-- 卡片选择器 -->
			<van-popup v-model:show="cardPickerVisible" position="bottom" round>
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
import { useNavBar } from '@/composables/useNavBar';
import { Pagination } from '@/views/common/config';
import { typeIconMap } from '../config/index';
import {
	getConsumeCardRecordPage,
	type TransactionRecord,
	type TransactionQueryParams,
} from '@/api/finance/consumeCardRecord/index';
import { showFailToast } from 'vant';
import { getPrepaidCardInfoList } from '../api/index';
import filterIcon from '@/assets/icons/shop/filter.svg';

const route = useRoute();

// 使用新的NavBar系统
useNavBar({
	title: (route?.meta?.title as string) || '消费流水记录',
	leftPath: '/selfFinance/prepaidCardInfoT',
	showRight: false,
	visible: true,
});

// 响应式数据
const loading = ref<boolean>(false);
const loadingMore = ref<boolean>(false);
const refreshing = ref<boolean>(false); // 下拉刷新状态
const transactionList = ref<TransactionRecord[]>([]);
const pagination = ref<Pagination>({ pageNum: 1, pageSize: 10, total: 0 });
const hasMore = ref<boolean>(true);
const finished = ref(false); // List组件的完成状态

// 筛选参数
const filterParams = reactive<TransactionQueryParams>({
	type: 'all',
});

// 当前激活的筛选按钮
const activeFilter = ref('all');

// 按日期分组的交易记录
const groupedTransactions = computed(() => {
	const groups: Record<string, TransactionRecord[]> = {};
	transactionList.value.forEach((transaction) => {
		const date = formatDateGroup(transaction.consumeTime);
		if (!groups[date]) {
			groups[date] = [];
		}
		groups[date].push(transaction);
	});
	return groups;
});

// 格式化日期分组
function formatDateGroup(dateStr: string): string {
	const today = new Date();
	const yesterday = new Date(today);
	yesterday.setDate(yesterday.getDate() - 1);
	const transactionDate = new Date(dateStr);
	if (transactionDate.toDateString() === today.toDateString()) {
		return '今日';
	} else if (transactionDate.toDateString() === yesterday.toDateString()) {
		return '昨日';
	} else {
		return (
			transactionDate
				.toLocaleDateString('zh-CN', {
					month: '2-digit',
					day: '2-digit',
				})
				.replace('/', '月') + '日'
		);
	}
}

// 格式化金额显示
function formatAmount(amount: number): string {
	const prefix = amount >= 0 ? '+' : '-';
	return `${prefix}￥${Math.abs(amount).toFixed(2)}`;
}

// 获取交易类型样式类
function getTransactionTypeClass(amount: number): string {
	return amount >= 0 ? 'income' : 'expense';
}

// 格式化时间显示
function formatTime(dateTimeStr: string): string {
	const date = new Date(dateTimeStr);
	return date.toLocaleTimeString('zh-CN', {
		hour: '2-digit',
		minute: '2-digit',
		hour12: false,
	});
}

// 获取分类图标
function getCategoryIcon(type: string): string {
	return typeIconMap[type] || '';
}

// ========== 筛选弹窗（卡片与日期范围） ==========
const filterVisible = ref(false);
const cardPickerVisible = ref(false);
const calendarVisible = ref(false);

const cardColumns = ref<Array<{ text: string; value: string | number }>>([
	{ text: '全部卡片', value: '' },
]);
const selectedCardId = ref<string | number | ''>('');
const selectedCardName = ref<string>('');

const dateRange = ref<{ start?: Date; end?: Date }>({});
const displayDateRange = computed(() => {
	if (dateRange.value.start && dateRange.value.end) {
		return `${formatDate(dateRange.value.start)} 至 ${formatDate(dateRange.value.end)}`;
	}
	return '全部日期';
});

function formatDate(d: Date): string {
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, '0');
	const day = String(d.getDate()).padStart(2, '0');
	return `${y}-${m}-${day}`;
}

function openFilterPopup() {
	filterVisible.value = true;
}

async function openCardPicker() {
	// 懒加载卡片列表
	if (cardColumns.value.length === 1) {
		const { code, data, message } = await getPrepaidCardInfoList({});
		if (code === '200') {
			const options = (data || []).map((card: any) => ({
				text: card.cardName || `卡片 ${card.id}`,
				value: card.id,
			}));
			cardColumns.value = [{ text: '全部卡片', value: '' }, ...options];
		} else {
			showFailToast(message || '获取卡片列表失败');
		}
	}
	cardPickerVisible.value = true;
}

function onCardConfirm(payload: any) {
	const op = payload?.selectedOptions?.[0] || payload;
	if (op) {
		selectedCardId.value = op.value ?? '';
		selectedCardName.value = op.text ?? '';
	}
	cardPickerVisible.value = false;
}

function onCalendarConfirm(values: Date[]) {
	if (Array.isArray(values) && values.length === 2) {
		dateRange.value = { start: values[0], end: values[1] };
	}
	calendarVisible.value = false;
}

function resetFilters() {
	selectedCardId.value = '';
	selectedCardName.value = '';
	dateRange.value = {};
}

function applyFilters() {
	// 应用筛选条件到查询参数
	if (selectedCardId.value) {
		filterParams.cardId = selectedCardId.value as any;
	} else {
		delete filterParams.cardId;
	}

	if (dateRange.value.start && dateRange.value.end) {
		filterParams.startDate = formatDate(dateRange.value.start);
		filterParams.endDate = formatDate(dateRange.value.end);
	} else {
		delete filterParams.startDate;
		delete filterParams.endDate;
	}

	// 重置分页并刷新
	pagination.value.pageNum = 1;
	transactionList.value = [];
	finished.value = false;
	hasMore.value = true;
	filterVisible.value = false;
	fetchTransactionData();
}

// 获取交易记录数据
async function fetchTransactionData(isLoadMore = false) {
	try {
		if (isLoadMore) {
			loadingMore.value = true;
		} else {
			loading.value = true;
			pagination.value.pageNum = 1;
			finished.value = false; // 重置列表完成态，避免阻止后续加载
		}
		if (filterParams.type === 'all') {
			delete filterParams.type;
		}
		const { code, data, message } = await getConsumeCardRecordPage(
			filterParams,
			pagination.value.pageNum,
			pagination.value.pageSize,
		);
		if (code === '200') {
			if (isLoadMore) {
				transactionList.value.push(...data.records);
			} else {
				transactionList.value = data.records;
			}
			pagination.value.total = data.total || 0;
			hasMore.value =
				transactionList.value.length < (pagination.value.total || 0);
			finished.value = !hasMore.value; // 同步finished，防止List误判一直加载
		} else {
			pagination.value.total = 0;
			hasMore.value = false;
			finished.value = true;
			showFailToast(message || '查询失败，请联系管理员');
		}
	} catch (error) {
		pagination.value.total = 0;
		hasMore.value = false;
		finished.value = true;
		console.error('获取交易记录失败:', error);
	} finally {
		loading.value = false;
		loadingMore.value = false;
	}
}

// 筛选按钮点击
function handleFilterClick(type: 'all' | 'income' | 'expense') {
	activeFilter.value = type;
	filterParams.type = type;
	// 重置状态
	pagination.value.pageNum = 1;
	finished.value = false;
	transactionList.value = [];
	// 重新加载数据
	fetchTransactionData();
}

// 下拉刷新
async function onRefresh() {
	refreshing.value = true;
	pagination.value.pageNum = 1;
	finished.value = false;
	try {
		await fetchTransactionData(false);
	} catch (error) {
		console.error('刷新失败:', error);
		showFailToast('刷新失败，请稍后重试');
	} finally {
		refreshing.value = false;
	}
}

// 触底加载更多
async function onLoad() {
	// 标记开始加载更多
	loadingMore.value = true;
	if (!hasMore.value) {
		finished.value = true;
		loadingMore.value = false;
		return;
	}
	pagination.value?.pageNum ? pagination.value.pageNum++ : 0;
	try {
		await fetchTransactionData(true);
	} catch (error) {
		console.error('加载更多失败:', error);
		showFailToast('加载失败，请稍后重试');
		pagination.value?.pageNum ? pagination.value.pageNum-- : 0; // 回退页码
	} finally {
		// 结束加载更多
		loadingMore.value = false;
	}
}

// 初始化
const init = () => {
	filterParams.cardId = route.query.cardId as string;
};

init();

// 组件挂载时获取数据
onMounted(() => {
	fetchTransactionData();
});
</script>

<style lang="less" scoped>
.transaction-history {
	width: 100%;
	min-height: 100vh;
	position: relative;
}

.header {
	background: #ffffff;
	box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.05);

	.header-container {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 12px 16px;
		gap: 122px;

		.back-button {
			i {
				font-size: 20px;
				color: #1d2129;
			}
		}

		.title {
			h1 {
				font-family: Arial;
				font-size: 18px;
				font-weight: 400;
				line-height: 1.56;
				color: #1d2129;
				margin: 0;
			}
		}
	}
}

.main-content {
	padding: 10px;
	display: flex;
	flex-direction: column;
	gap: 24px;
	background: linear-gradient(to bottom, #f2f3f5, #f2f3f5);
}

.filter-section {
	background: #ffffff;
	border-radius: 12px;
	padding: 16px;
	box-shadow: 0px 4px 12px 0px rgba(0, 0, 0, 0.05);

	.filter-container {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 4px;

		.filter-buttons {
			display: flex;
			gap: 8px;

			.filter-btn {
				padding: 8px 16px;
				border-radius: 8px;
				border: none;
				font-family: Arial;
				font-size: 14px;
				font-weight: 400;
				line-height: 1.43;
				text-align: center;
				cursor: pointer;

				&.active {
					background: #ff7d00;
					color: #ffffff;
				}

				&:not(.active) {
					background: #f2f3f5;
					color: #1d2129;
				}
			}
		}

		.filter-icon-btn {
			display: flex;
			align-items: center;
			gap: 4px;
			cursor: pointer;

			i {
				font-size: 14px;
				color: #1d2129;
			}

			span {
				font-family: Arial;
				font-size: 14px;
				font-weight: 400;
				line-height: 1.43;
				color: #1d2129;
			}
		}
	}
}

.transaction-list {
	display: flex;
	flex-direction: column;
	gap: 16px;
}

.date-section {
	.date-title {
		font-family: Arial;
		font-size: 14px;
		font-weight: 400;
		line-height: 1.43;
		color: #86909c;
		margin: 0 0 16px 0;
	}

	.transaction-item {
		background: #ffffff;
		border-radius: 12px;
		padding: 16px;
		margin-bottom: 6px;
		box-shadow: 0px 4px 12px 0px rgba(0, 0, 0, 0.05);
		display: flex;
		justify-content: space-between;
		align-items: center;

		.transaction-content {
			display: flex;
			align-items: center;

			.icon-container {
				margin-right: 12px;

				.category-icon {
					width: 40px;
					height: 40px;
					border-radius: 8px;
				}
			}

			.transaction-info {
				.merchant-name {
					font-family: Arial;
					font-size: 16px;
					font-weight: 400;
					line-height: 1.5;
					color: #1d2129;
					margin: 0 0 4px 0;
				}

				.category-info {
					display: flex;
					align-items: center;
					gap: 4px;

					i {
						font-size: 14px;
						color: #86909c;
					}

					span {
						font-family: Arial;
						font-size: 14px;
						font-weight: 400;
						line-height: 1.43;
						color: #86909c;
					}
				}
			}
		}

		.transaction-amount {
			text-align: right;

			.amount {
				font-family: Arial;
				font-size: 16px;
				font-weight: 400;
				line-height: 1.5;
				margin-bottom: 4px;

				&.expense {
					color: #f53f3f;
				}

				&.income {
					color: #00b42a;
				}
			}

			.time {
				font-family: Arial;
				font-size: 12px;
				font-weight: 400;
				line-height: 1.33;
				color: #86909c;
			}
		}
	}
}

.load-more-container {
	display: flex;
	justify-content: center;
	padding-top: 8px;

	.load-more-btn {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 9px 25px;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		background: transparent;
		cursor: pointer;

		span {
			font-family: Arial;
			font-size: 14px;
			font-weight: 400;
			line-height: 1.43;
			color: #1d2129;
		}

		i {
			font-size: 12px;
			color: #1d2129;
		}
	}
}

.loading-container {
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 40px 0;

	.loading-text {
		font-family: Arial;
		font-size: 14px;
		color: #86909c;
	}
}

.empty-container {
	display: flex;
	justify-content: center;
	align-items: center;
	min-height: calc(100vh - 200px);
	padding: 60px 0;

	.empty-text {
		font-family: Arial;
		font-size: 14px;
		color: #86909c;
	}
}

.load-more-btn {
	&:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
}

.bottom-actions {
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
	background: #ffffff;
	border-top: 1px solid #f3f4f6;
	padding: 13px 16px 12px;

	.action-container {
		display: flex;
		justify-content: space-between;
		gap: 136px;

		.action-btn {
			display: flex;
			align-items: center;
			gap: 8px;
			padding: 8px 16px;
			border-radius: 8px;
			border: none;
			cursor: pointer;

			&.secondary {
				background: #f2f3f5;
				color: #1d2129;
				padding: 8px 16px;
			}

			&.primary {
				background: #ff7d00;
				color: #ffffff;
				padding: 8px 24px;
				box-shadow: 0px 2px 8px 0px rgba(245, 63, 63, 0.2);
			}

			i {
				font-size: 14px;
			}

			span {
				font-family: Arial;
				font-size: 14px;
				font-weight: 400;
				line-height: 1.43;
			}
		}
	}
}
</style>
