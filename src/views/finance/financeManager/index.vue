<template>
	<form action="/">
		<van-search
			v-model="searchInfo.bigTypeCode"
			placeholder="搜索账单..."
			@search="onSearch"
			@clear="onCancel"
			class="search-bar"
		/>
	</form>
	<van-pull-refresh
		pulling-text="加载中。。。"
		class="refresh-info"
		v-model="isRefresh"
		@refresh="onRefreshData"
		ref="pullRefresh"
		:immediate-check="false"
	>
		<div
			class="list-container"
			id="finance-manager-list"
		>
			<van-empty
				v-if="!dataSource?.length"
				description="暂无数据"
			/>
			<!-- 有数据时显示列表 -->
			<van-list
				v-else
				v-model:loading="loading"
				:finished="finished"
				:immediate-check="false"
				finished-text="没有更多了"
				@load="onLoadMore"
			>
				<div class="card-list">
					<van-swipe-cell
						v-for="item in dataSource"
						:key="item.id"
						class="card-swipe-item"
					>
						<div
							class="finance-card"
							@click="router.push(getDetailRoute(item.id))"
						>
							<div class="card-left">
								<div class="title-row">
									<span class="title">{{ getCellTitle(item) }}</span>
									<span
										class="tag"
										v-if="item.incomeAndExpenses"
										:class="item.incomeAndExpenses"
									>
										{{ getIncomeExpenseText(item.incomeAndExpenses) }}
									</span>
								</div>
								<div class="date-text">
									{{ formatDate(item.infoDate, dataTimeFormat) }}
								</div>
							</div>

							<div class="card-right">
								<div
									class="amount-text"
									:class="getAmountClass(item.incomeAndExpenses)"
								>
									{{ formatAmount(item) }}
								</div>
								<div class="source-info">
									<div
										class="svg-wrapper"
										v-if="item?.fromSource"
									>
										<svg-icon
											:name="getSourceIconName(item)?.label || ''"
											class="source-icon"
										/>
									</div>
									<span class="source-text">{{ getSourceIconName(item)?.name || '未知' }}</span>
								</div>
							</div>
						</div>

						<template #right>
							<van-button
								class="right_info delete-btn"
								@click="onDeleteFinance(item.id)"
								square
								type="danger"
								text="删除"
							/>
						</template>
					</van-swipe-cell>
				</div>
			</van-list>
		</div>
	</van-pull-refresh>
	<van-back-top target="#finance-manager-list" />
</template>
<script lang="ts" setup>
import { showSuccessToast, showFailToast } from 'vant';
import { pagination, fromSourceTransferList, type FinanceManagerData, type FromSourceTransferItem } from './config';
import { getRoutePathByName } from '@/utils/router';
import { formatDate, dataTimeFormat } from '@/utils/dayjs';
import { getFinanceMangerPage, deleteFinanceManager } from '@/views/finance/financeManager/api';
import { useNavBar } from '@/composables/useNavBar';
import type { PageInfo } from '@/views/common/config';

const router = useRouter();
const route = useRoute();

// 通过路由解析获取详情页路径，使用公共工具方法
const getDetailRoutePath = (): string => {
	return getRoutePathByName(router, 'financeManagerDetail');
};

// 获取详情页路由配置
const getDetailRoute = (id?: string) => {
	const path = getDetailRoutePath();
	return {
		path,
		query: { id },
	};
};

// 导航栏配置
useNavBar({
	title: (route?.meta?.title as string) || '财务管理',
	rightIcon: 'plus',
	leftPath: '/',
	visible: true,
	onRightClick: () => {
		const path = getDetailRoutePath();
		router.push({ path });
	},
});

// 响应式数据
const loading = ref<boolean>(false);
const dataSource = ref<FinanceManagerData[]>([]);
const searchInfo = ref<FinanceManagerData>({});
const finished = ref<boolean>(false);
const isRefresh = ref<boolean>(false);

// 计算属性和工具函数
const getCellTitle = (item: FinanceManagerData) => {
	return item.name || '未命名';
};

// Helper for Tag Text
const getIncomeExpenseText = (type?: string) => {
	return type === 'income' ? '收入' : '支出';
};

const getSourceIconName = (item: FinanceManagerData): FromSourceTransferItem | null => {
	if (!item.fromSource) return null;
	const source = fromSourceTransferList.find((s) => item.fromSource?.includes(s.value));
	return source || null;
};

const getAmountClass = (incomeAndExpenses?: string) => {
	return incomeAndExpenses === 'income' ? 'amount-income' : 'amount-expense';
};

const formatAmount = (item: FinanceManagerData) => {
	if (item.amount === undefined || item.amount === null) {
		return '--';
	}
	const prefix = item.incomeAndExpenses === 'income' ? '+' : '-';
	return `${prefix}¥${Number(item.amount).toFixed(2)}`;
};

// 统一重置数据函数
const resetData = () => {
	dataSource.value = [];
	pagination.value.current = 1;
	pagination.value.pageSize = 10;
};

// 获取财务数据
const getFinancePage = async (param: FinanceManagerData, cur: PageInfo) => {
	loading.value = true;
	const { code, data, message } = await getFinanceMangerPage(param, cur?.current || 1, cur?.pageSize || 10)
		.catch((error: unknown) => {
			throw error;
		})
		.finally(() => {
			loading.value = false;
			isRefresh.value = false;
		});
	if (code === '200') {
		dataSource.value = [...dataSource.value, ...(data?.records || [])];
		pagination.value.total = data?.total || 0;
		finished.value = pagination.value.total < ((pagination.value.current || 0) + 1) * (pagination.value.pageSize || 10);
	} else {
		showFailToast(message || '查询列表失败！');
	}
};

// 搜索处理
const onSearch = () => {
	pagination.value.current = 1;
	dataSource.value = [];
	onLoadMore();
};

// 取消搜索
const onCancel = () => {
	searchInfo.value.bigTypeCode = '';
	resetData();
	getFinancePage(searchInfo.value, pagination.value);
};

// 下拉刷新
const onRefreshData = () => {
	resetData();
	getFinancePage(searchInfo.value, pagination.value);
};

// 加载更多
const onLoadMore = () => {
	pagination.value.current = (pagination.value.current || 0) + 1;
	getFinancePage(searchInfo.value, pagination.value);
};

// 删除财务记录
const onDeleteFinance = async (id?: string) => {
	if (!id) {
		return;
	}
	const { code, message } = await deleteFinanceManager(`${id}`);
	if (code === '200') {
		onRefreshData();
		showSuccessToast(message || '删除成功！');
	} else {
		showFailToast(message || '删除失败，请联系管理员！');
	}
};

// 初始化
onMounted(() => {
	resetData();
	getFinancePage(searchInfo.value, pagination.value);
});
</script>

<style lang="less" scoped>
.search-bar {
	--van-search-input-height: 48px; // Increase height
}

.refresh-info {
	height: calc(100% - 64px);
	background-color: #f7f8fa; // Light background
}

.list-container {
	height: 100%;
	overflow-y: auto;
	padding-top: 10px;
}

.card-list {
	padding: 0 12px;
}

.card-swipe-item {
	margin-bottom: 12px;
	border-radius: 12px;
	overflow: hidden; // For radius on swipe
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
	background-color: #fff;
}

.finance-card {
	background: #fff;
	padding: 16px;
	display: flex;
	justify-content: space-between;
	align-items: center;
	position: relative;
	/* Ensure the card keeps its shape */
	min-height: 50px;
}

.card-left {
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	gap: 12px; // Space between title row and date
	flex: 1;
}

.title-row {
	display: flex;
	align-items: center;
	gap: 8px;

	.title {
		font-size: 16px;
		font-weight: bold;
		color: #323233;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		max-width: 140px;
	}

	.tag {
		font-size: 10px;
		padding: 2px 6px;
		border-radius: 4px;
		background-color: #f5f5f5;
		color: #969799;
		line-height: 1;

		&.income {
			background-color: #e8f5e9; // Light green bg
			color: #4caf50;
		}
		// Default (expense) style
		&:not(.income) {
			background-color: #ffebee; // Light red bg? Or just gray as image?
			// Image shows "Expense" tag with gray background but maybe red text?
			// Actually image expense tag looks like light gray bg, dark gray text.
			// Let's stick to gray for expense as default.
		}
	}
}

.date-text {
	font-size: 12px;
	color: #969799;
}

.card-right {
	display: flex;
	flex-direction: column;
	align-items: flex-end;
	justify-content: space-between;
	gap: 12px;
}

.amount-text {
	font-size: 16px;
	font-weight: 600;

	&.amount-income {
		color: #4caf50; // Green
	}

	&.amount-expense {
		color: #ee0a24; // Red
	}
}

.source-info {
	display: flex;
	align-items: center;
	gap: 4px;
	color: #969799;
	font-size: 12px;

	.svg-wrapper {
		display: flex;
		align-items: center;
	}

	.source-icon {
		width: 16px;
		height: 16px;
		vertical-align: middle;
	}

	.source-text {
		vertical-align: middle;
	}
}

.delete-btn {
	height: 100%;
	border: none;
}
</style>
