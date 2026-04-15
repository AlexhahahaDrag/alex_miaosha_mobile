<template>
	<form action="/">
		<van-search
			v-model="searchInfo.bigTypeCode"
			placeholder="搜索账单..."
			shape="round"
			background="#f7f8fa"
			@search="onSearch"
			@clear="onCancel"
			class="search-bar"
		/>
	</form>
	<van-dropdown-menu :active-color="'#1989fa'">
		<van-dropdown-item
			v-model="searchInfo.fromSource"
			:options="sourceOptions"
			@change="onSearch"
		/>
		<van-dropdown-item
			v-model="searchInfo.typeCode"
			:options="categoryOptions"
			@change="onSearch"
		/>
	</van-dropdown-menu>
	<common-pull-refresh
		class="refresh-info"
		v-model="isRefresh"
		@refresh="onRefreshData"
		ref="pullRefresh"
	>
		<div
			class="list-container"
			id="finance-manager-list"
		>
			<template v-if="loading && !isRefresh && !dataSource?.length">
				<van-skeleton
					title
					:row="3"
					class="skeleton-card"
				/>
				<van-skeleton
					title
					:row="3"
					class="skeleton-card"
				/>
				<van-skeleton
					title
					:row="3"
					class="skeleton-card"
				/>
				<van-skeleton
					title
					:row="3"
					class="skeleton-card"
				/>
			</template>

			<van-empty
				v-else-if="!loading && !isRefresh && !dataSource?.length"
				description="没有找到相关的账单记录"
				image="search"
			/>
			<!-- 有数据时显示列表 -->
			<van-list
				v-else
				v-model:loading="loading"
				:finished="finished"
				:immediate-check="false"
				finished-text="- 已经到底啦 -"
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
							@click="handleCardClick(item)"
						>
							<div class="card-left">
								<div class="title-row">
									<span class="title">{{ getCellTitle(item) }}</span>
									<span
										class="tag"
										v-if="item.incomeAndExpenses"
										:class="item.incomeAndExpenses"
									>
										{{ item.typeCode || '未知类别' }}
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
	</common-pull-refresh>
	<van-back-top target="#finance-manager-list" />
</template>
<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { showSuccessToast, showFailToast } from 'vant';
import { pagination, fromSourceTransferList, type FinanceManagerData, type FromSourceTransferItem } from './config';
import CommonPullRefresh from '@/components/CommonPullRefresh.vue';
import { getRoutePathByName } from '@/utils/router';
import { formatDate, dataTimeFormat } from '@/utils/dayjs';
import { getFinanceMangerPage, deleteFinanceManager } from '@/views/finance/financeManager/api';
import { getDictList } from '@/api/finance/dict/dictManager';
import { useNavBar } from '@/composables/useNavBar';
import { useTabBar } from '@/composables/useTabBar';
import type { PageInfo } from '@/views/common/config';
import type { ResponseBody } from '@/types/api';

const router = useRouter();
const route = useRoute();

// Options for dropdowns
const sourceOptions = computed(() => {
	const options = fromSourceTransferList.map((item) => ({
		text: item.name,
		value: item.value,
	}));
	return [{ text: '支付方式 (全部)', value: '' }, ...options];
});

const categoryList = ref<any[]>([]);
const categoryOptions = computed(() => {
	const options = categoryList.value.map((item) => ({
		text: item.typeName,
		value: item.typeCode,
	}));
	return [{ text: '类别 (全部)', value: '' }, ...options];
});

const fetchCategories = async () => {
	const { code, data } = await getDictList('income_expense_type');
	if (code === '200' && Array.isArray(data)) {
		categoryList.value = data;
	}
};

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

// TabBar配置
useTabBar({
	visible: true,
	data: [
		{ name: 'dashboard', title: '首页', icon: 'homepage' },
		{ name: 'financeManager', title: '财务', icon: 'finance' },
		{ name: 'financeAnalysis', title: '分析', icon: 'financeAnalysis' },
		{ name: 'myself', title: '个人', icon: 'user' },
	],
	active: 1,
});

// 响应式数据
const loading = ref<boolean>(false);
const dataSource = ref<FinanceManagerData[]>([]);
const searchInfo = ref<FinanceManagerData>({});
const finished = ref<boolean>(false);
const isRefresh = ref<boolean>(false);

// 计算属性和工具函数
const getCellTitle = (item: FinanceManagerData) => {
	return (item.belongToName ? `${item.belongToName} - ` : '') + (item.name || '未命名');
};

// Helper for Source Icon Name
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
	finished.value = false;
	pagination.value.current = 1;
	pagination.value.pageSize = 10;
};

// 交互辅助：带有触觉反馈的点击事件
const handleCardClick = (item: FinanceManagerData) => {
	// 如果浏览器支持 Vibrate API，则提供轻微震动反馈以增强操作确定感
	if (typeof navigator !== 'undefined' && navigator.vibrate) {
		navigator.vibrate(50);
	}
	router.push(getDetailRoute(item.id));
};

// 获取财务数据
const getFinancePage = async (param: FinanceManagerData, cur: PageInfo) => {
	// 只有在非下拉刷新时才显示列表加载状态，避免出现两个加载动画
	if (!isRefresh.value) {
		loading.value = true;
	}
	const query = {
		...param,
	};
	if (!query.fromSource) {
		delete query.fromSource;
	}
	const { code, data, message } = await getFinanceMangerPage(query, cur?.current || 1, cur?.pageSize || 10)
		.catch((error: ResponseBody) => {
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
	resetData();
	getFinancePage(searchInfo.value, pagination.value);
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
	fetchCategories();
	// 如果有路由参数，则设置搜索条件
	if (route.query.fromSource) {
		searchInfo.value.fromSource = route.query.fromSource as string;
	}
	if (route.query.typeCode) {
		searchInfo.value.typeCode = route.query.typeCode as string;
	}
	getFinancePage(searchInfo.value, pagination.value);
});
</script>

<style lang="less" scoped>
.search-bar {
	--van-search-input-height: 44px;
	padding: 8px 16px;
	background-color: #fff;
}

:deep(.van-dropdown-menu__bar) {
	box-shadow: none;
	border-bottom: 1px solid rgba(0, 0, 0, 0.02);
}

.refresh-info {
	height: calc(100% - 104px);
	background-color: #f5f7fa; // 柔和宽容的背景色
}

.list-container {
	height: 100%;
	overflow-y: auto;
	padding-top: 12px;
}

.skeleton-card {
	padding: 20px;
	margin: 0 16px 16px;
	background: #fff;
	border-radius: 16px;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
}

.card-list {
	padding: 0 16px; // 增加两侧留白
}

.card-swipe-item {
	margin-bottom: 16px; // 增大间距
	border-radius: 16px; // 增大圆角
	overflow: hidden;
	// 更柔和的现代阴影设计
	box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
	background-color: #fff;
	transition: transform 0.2s ease-out;

	&:active {
		transform: scale(0.98); // 类原生点击弹跳动效
	}
}

.finance-card {
	background: #fff;
	padding: 18px 20px; // 加大卡片内边距
	display: flex;
	justify-content: space-between;
	align-items: center;
	position: relative;
	min-height: 60px;
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
