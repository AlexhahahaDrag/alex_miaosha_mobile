<template>
	<div class="consume-water-info">
		<!-- 顶部导航栏 -->
		<van-nav-bar
			title="流水记录"
			left-arrow
			@click-left="onBack"
			class="nav-bar"
		/>

		<!-- 主要内容区域 -->
		<div class="main-content">
			<!-- 筛选按钮区域 -->
			<div class="filter-section">
				<div class="filter-buttons">
					<van-button
						v-for="(filter, index) in filterOptions"
						:key="index"
						:type="activeFilter === filter.value ? 'primary' : 'default'"
						size="small"
						round
						@click="setActiveFilter(filter.value)"
						class="filter-btn"
					>
						{{ filter.label }}
					</van-button>
				</div>

				<van-button
					size="small"
					type="default"
					@click="showFilterPopup"
					class="filter-action-btn"
				>
					<van-icon name="filter-o" />
					筛选
				</van-button>
			</div>

			<!-- 交易记录列表 -->
			<div class="transaction-list">
				<!-- 空状态 -->
				<div
					v-if="!loading && allTransactions.length === 0"
					class="empty-state"
				>
					<van-empty description="暂无交易记录" />
				</div>

				<!-- 交易记录 -->
				<div v-else>
					<div
						v-for="(group, index) in transactionGroups"
						:key="index"
						class="transaction-group"
					>
						<div class="date-header">{{ group.date }}</div>

						<div
							v-for="transaction in group.transactions"
							:key="transaction.id"
							class="transaction-item"
						>
							<div class="transaction-info">
								<div class="icon-wrapper">
									<img
										:src="transaction.icon"
										:alt="transaction.category"
										class="category-icon"
									/>
								</div>

								<div class="transaction-details">
									<div class="merchant-name">{{ transaction.merchant }}</div>
									<div class="category-info">
										<van-icon name="location-o" />
										{{ transaction.category }}
									</div>
								</div>
							</div>

							<div class="transaction-amount">
								<div class="amount" :class="transaction.type">
									{{ transaction.amount }}
								</div>
								<div class="time">{{ transaction.time }}</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- 加载更多按钮 -->
			<div v-if="allTransactions.length > 0" class="load-more">
				<van-button
					type="default"
					size="small"
					:loading="loading"
					:disabled="!pagination.hasMore"
					@click="loadMore"
					class="load-more-btn"
				>
					{{ pagination.hasMore ? '加载更多' : '没有更多了' }}
					<van-icon v-if="!loading && pagination.hasMore" name="arrow-down" />
				</van-button>
			</div>
		</div>

		<!-- 底部操作按钮 -->
		<div class="bottom-actions">
			<van-button
				type="default"
				size="large"
				@click="exportBill"
				class="export-btn"
			>
				<van-icon name="down" />
				导出账单
			</van-button>

			<van-button
				type="primary"
				size="large"
				@click="addRecord"
				class="add-btn"
			>
				<van-icon name="plus" />
				记一笔
			</van-button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { showToast, showLoadingToast, closeToast, showFailToast } from 'vant';
import { useRoute, useRouter } from 'vue-router';
import { getPrepaidConsumeRecordPage } from '../api/index';
import { formatTime } from '@/views/common/config';

// 图标导入
import cateringIcon from '@/assets/icons/finance/catering-56586a.png';
import supermarketIcon from '@/assets/icons/finance/supermarket-56586a.png';
import salaryIcon from '@/assets/icons/finance/salary-56586a.png';
import transportIcon from '@/assets/icons/finance/transport-56586a.png';
import onlineShoppingIcon from '@/assets/icons/finance/online-shopping-56586a.png';
import movieIcon from '@/assets/icons/finance/movie-56586a.png';
import transferIcon from '@/assets/icons/finance/transfer-56586a.png';

// 路由实例
const router = useRouter();
const route = useRoute();

// 定义交易类型
interface Transaction {
	id: number;
	merchant: string;
	category: string;
	amount: string;
	time: string;
	type: 'income' | 'expense';
	icon: string;
	transactionType?: 'CONSUME' | 'RECHARGE';
	description?: string;
	createTime?: string;
	transactionTime?: string;
	cardId?: number;
	cardName?: string;
}

// interface TransactionGroup {
// 	date: string;
// 	transactions: Transaction[];
// }

// 分页相关状态
const loading = ref(false);
const pagination = reactive({
	pageNum: 1,
	pageSize: 10,
	total: 0,
	hasMore: true,
});

// 筛选选项
const filterOptions = ref([
	{ label: '全部', value: 'all' },
	{ label: '收入', value: 'RECHARGE' },
	{ label: '支出', value: 'CONSUME' },
]);

const activeFilter = ref('all');

// 原始交易记录数据
const allTransactions = ref<Transaction[]>([]);

// 根据图标名称获取对应的图标
const getIconByCategory = (
	category: string,
	transactionType?: string,
): string => {
	if (transactionType === 'RECHARGE') {
		return salaryIcon; // 充值统一使用收入图标
	}

	// 根据分类描述匹配图标
	if (category?.includes('餐饮') || category?.includes('快餐'))
		return cateringIcon;
	if (category?.includes('超市') || category?.includes('购物'))
		return supermarketIcon;
	if (category?.includes('工资') || category?.includes('收入'))
		return salaryIcon;
	if (category?.includes('交通') || category?.includes('打车'))
		return transportIcon;
	if (category?.includes('网购') || category?.includes('淘宝'))
		return onlineShoppingIcon;
	if (category?.includes('电影') || category?.includes('娱乐'))
		return movieIcon;
	if (category?.includes('转账')) return transferIcon;

	// 默认根据交易类型返回图标
	return transactionType === 'CONSUME' ? cateringIcon : salaryIcon;
};

// 格式化金额显示
const formatAmount = (
	amount: number | string,
	transactionType?: string,
): string => {
	const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
	return transactionType === 'CONSUME' ?
			`-￥${numAmount.toFixed(2)}`
		:	`+￥${numAmount.toFixed(2)}`;
};

// 按日期分组的交易记录
const transactionGroups = computed(() => {
	// 按日期分组
	const groups: { [key: string]: Transaction[] } = {};

	allTransactions.value.forEach((transaction) => {
		const date = transaction.time.split(' ')[0]; // 提取日期部分
		if (!groups[date]) {
			groups[date] = [];
		}
		groups[date].push(transaction);
	});

	// 转换为数组格式并按日期排序
	const groupArray = Object.entries(groups).map(([date, transactions]) => ({
		date: formatDateLabel(date),
		transactions: transactions.sort(
			(a, b) => new Date(b.time).getTime() - new Date(a.time).getTime(),
		),
	}));

	// 按日期倒序排列
	return groupArray.sort((a, b) => {
		const dateA = new Date(a.transactions[0]?.time || '');
		const dateB = new Date(b.transactions[0]?.time || '');
		return dateB.getTime() - dateA.getTime();
	});
});

// 格式化日期标签
const formatDateLabel = (dateStr: string): string => {
	const today = new Date();
	const yesterday = new Date(today);
	yesterday.setDate(yesterday.getDate() - 1);

	const targetDate = new Date(dateStr);

	if (targetDate.toDateString() === today.toDateString()) {
		return '今日';
	} else if (targetDate.toDateString() === yesterday.toDateString()) {
		return '昨日';
	} else {
		// 返回 MM月DD日 格式
		const month = targetDate.getMonth() + 1;
		const day = targetDate.getDate();
		return `${month.toString().padStart(2, '0')}月${day.toString().padStart(2, '0')}日`;
	}
};

// 获取交易记录数据
const fetchTransactions = async (isLoadMore = false) => {
	if (loading.value) return;

	if (!isLoadMore) {
		pagination.pageNum = 1;
		pagination.hasMore = true;
		showLoadingToast({
			message: '加载中...',
			forbidClick: true,
		});
	}

	loading.value = true;

	try {
		// 构建查询参数
		const params: any = {};

		// 从路由参数获取 cardId
		if (route.query.cardId) {
			params.cardId = route.query.cardId;
		}

		// 添加筛选条件
		if (activeFilter.value !== 'all') {
			params.transactionType = activeFilter.value;
		}

		const { code, data, message } = await getPrepaidConsumeRecordPage(
			params,
			pagination.pageNum,
			pagination.pageSize,
		);

		if (code === '200') {
			const records = data.records || [];

			// 处理交易记录数据
			const formattedRecords: Transaction[] = records.map((record: any) => ({
				id: record.id,
				merchant: record.cardName || record.description || '消费记录',
				category: getTransactionCategory(record),
				amount: formatAmount(record.amount, record.transactionType),
				time: formatTime(record.createTime || record.transactionTime),
				type: record.transactionType === 'CONSUME' ? 'expense' : 'income',
				icon: getIconByCategory(record.description, record.transactionType),
				transactionType: record.transactionType,
				description: record.description,
				createTime: record.createTime,
				transactionTime: record.transactionTime,
				cardId: record.cardId,
				cardName: record.cardName,
			}));

			if (isLoadMore) {
				allTransactions.value.push(...formattedRecords);
			} else {
				allTransactions.value = formattedRecords;
			}

			// 更新分页信息
			pagination.total = data.total || 0;
			pagination.hasMore =
				records.length === pagination.pageSize &&
				allTransactions.value.length < pagination.total;

			if (isLoadMore) {
				pagination.pageNum++;
			}
		} else {
			showFailToast(message || '查询失败，请联系管理员!');
		}
	} catch (error) {
		console.error('获取交易记录失败', error);
		showFailToast('获取数据失败，请重试');
	} finally {
		loading.value = false;
		closeToast();
	}
};

// 获取交易分类描述
const getTransactionCategory = (record: any): string => {
	if (record.transactionType === 'RECHARGE') {
		return '收入 · 充值';
	}

	// 根据描述生成分类信息
	const description = record.description || '';
	if (description.includes('餐饮')) return '餐饮 · 快餐';
	if (description.includes('超市')) return '购物 · 超市';
	if (description.includes('交通')) return '交通 · 打车';
	if (description.includes('网购')) return '购物 · 网购';
	if (description.includes('电影')) return '娱乐 · 电影';
	if (description.includes('转账')) return '收入 · 转账';

	return record.transactionType === 'CONSUME' ? '支出 · 其他' : '收入 · 其他';
};

// 方法定义
const onBack = () => {
	router.back();
};

const setActiveFilter = (value: string) => {
	activeFilter.value = value;
	const label = filterOptions.value.find((f) => f.value === value)?.label;
	showToast(`切换到${label}`);

	// 重新加载数据
	fetchTransactions(false);
};

const showFilterPopup = () => {
	showToast('显示筛选弹窗');
};

const loadMore = () => {
	if (pagination.hasMore && !loading.value) {
		fetchTransactions(true);
	} else {
		showToast('没有更多数据了');
	}
};

const exportBill = () => {
	showToast('导出账单功能开发中');
};

const addRecord = () => {
	// 跳转到记录添加页面，传递 cardId
	router.push({
		name: 'prepaidCardInfoTConsumeInfo',
		query: {
			type: 'consume',
			cardId: route.query.cardId,
		},
	});
};

// 组件挂载时获取数据
onMounted(() => {
	fetchTransactions(false);
});
</script>

<style lang="scss" scoped>
.consume-water-info {
	background: #f2f3f5;
	min-height: 100vh;

	.nav-bar {
		background: #fff;
		box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.05);
	}

	.main-content {
		padding: 20px 16px 100px;

		.filter-section {
			background: #fff;
			border-radius: 12px;
			padding: 16px;
			margin-bottom: 24px;
			box-shadow: 0px 4px 12px 0px rgba(0, 0, 0, 0.05);
			display: flex;
			justify-content: space-between;
			align-items: center;
			gap: 84px;

			.filter-buttons {
				display: flex;
				gap: 8px;

				.filter-btn {
					&:deep(.van-button--primary) {
						background: #ff7d00;
						border-color: #ff7d00;
						color: #fff;
					}

					&:deep(.van-button--default) {
						background: #f2f3f5;
						border-color: #f2f3f5;
						color: #1d2129;
					}
				}
			}

			.filter-action-btn {
				&:deep(.van-button) {
					background: #f2f3f5;
					border-color: #f2f3f5;
					color: #1d2129;
				}

				.van-icon {
					margin-right: 4px;
				}
			}
		}

		.transaction-list {
			display: flex;
			flex-direction: column;
			gap: 16px;

			.empty-state {
				padding: 40px 0;
				text-align: center;
			}

			.transaction-group {
				.date-header {
					font-size: 14px;
					color: #86909c;
					margin-bottom: 8px;
				}

				.transaction-item {
					background: #fff;
					border-radius: 12px;
					padding: 16px;
					margin-bottom: 8px;
					box-shadow: 0px 4px 12px 0px rgba(0, 0, 0, 0.05);
					display: flex;
					justify-content: space-between;
					align-items: center;

					.transaction-info {
						display: flex;
						align-items: center;

						.icon-wrapper {
							margin-right: 12px;

							.category-icon {
								width: 40px;
								height: 40px;
								border-radius: 8px;
							}
						}

						.transaction-details {
							.merchant-name {
								font-size: 16px;
								color: #1d2129;
								font-weight: 400;
								line-height: 24px;
							}

							.category-info {
								display: flex;
								align-items: center;
								font-size: 14px;
								color: #86909c;
								margin-top: 4px;

								.van-icon {
									margin-right: 4px;
									font-size: 14px;
								}
							}
						}
					}

					.transaction-amount {
						text-align: right;

						.amount {
							font-size: 16px;
							font-weight: 400;
							line-height: 24px;

							&.income {
								color: #00b42a;
							}

							&.expense {
								color: #f53f3f;
							}
						}

						.time {
							font-size: 12px;
							color: #86909c;
							margin-top: 4px;
						}
					}
				}
			}
		}

		.load-more {
			display: flex;
			justify-content: center;
			padding-top: 8px;

			.load-more-btn {
				&:deep(.van-button) {
					border: 1px solid #e5e7eb;
					color: #1d2129;
					background: transparent;
				}

				.van-icon {
					margin-left: 4px;
				}
			}
		}
	}

	.bottom-actions {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background: #fff;
		border-top: 1px solid #f3f4f6;
		padding: 13px 16px 12px;
		display: flex;
		justify-content: space-between;
		gap: 136px;

		.export-btn {
			&:deep(.van-button) {
				background: #f2f3f5;
				border-color: #f2f3f5;
				color: #1d2129;
			}

			.van-icon {
				margin-right: 8px;
			}
		}

		.add-btn {
			&:deep(.van-button) {
				background: #ff7d00;
				border-color: #ff7d00;
				box-shadow: 0px 2px 8px 0px rgba(245, 63, 63, 0.2);
			}

			.van-icon {
				margin-right: 8px;
			}
		}
	}
}
</style>
