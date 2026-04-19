<template>
	<form action="/">
		<van-search
			v-model="searchInfo.bigTypeCode"
			placeholder="搜索账单..."
			shape="round"
			background="#ffffff"
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
		<common-list
			id="finance-manager-list"
			v-model="loading"
			:loading="loading"
			:refreshing="isRefresh"
			:finished="finished"
			:is-empty="!dataSource?.length"
			empty-text="没有找到相关的账单记录"
			empty-image="search"
			@load="onLoadMore"
		>
			<!-- [Premium Skeleton State] -->
			<template #skeleton>
				<div
					v-for="g in 2"
					:key="g"
				>
					<div class="skeleton-date-header">
						<van-skeleton
							title
							:row="0"
						/>
					</div>
					<div
						v-for="i in 3"
						:key="i"
						class="skeleton-card"
					>
						<div class="skeleton-left">
							<van-skeleton
								title
								:row="1"
							/>
						</div>
						<div class="skeleton-right">
							<van-skeleton :row="1" />
						</div>
					</div>
				</div>
			</template>

			<!-- [Enhanced Empty State] -->
			<template #empty>
				<div class="empty-state-container">
					<van-empty
						image="search"
						description="没有找到相关的账单记录"
					>
						<van-button
							v-if="hasFilters"
							round
							type="primary"
							class="clear-filters-btn"
							@click="onClearAllFilters"
						>
							清除所有筛选
						</van-button>
					</van-empty>
				</div>
			</template>

			<!-- [Main List Content] -->
			<div class="card-list">
				<div
					v-for="group in groupedDataSource"
					:key="group.date"
					class="date-group"
				>
					<div class="date-header">
						<span class="header-dot"></span>
						{{ formatHeaderDate(group.date) }}
					</div>
					<!-- Card Transitions -->
					<transition-group name="list">
						<finance-card
							v-for="item in group.items"
							:key="item.id"
							:item="item"
							@click="handleCardClick"
							@delete="onDeleteFinance"
						/>
					</transition-group>
				</div>
			</div>
		</common-list>
	</common-pull-refresh>
	<van-back-top target="#finance-manager-list" />
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { showSuccessToast, showFailToast } from 'vant';
import dayjs from 'dayjs';
import { fromSourceTransferList, type FinanceManagerData } from './config';
import FinanceCard from './components/FinanceCard.vue';
import { usePagination } from '@/composables/usePagination';
import CommonPullRefresh from '@/views/components/CommonPullRefresh.vue';
import CommonList from '@/views/components/CommonList.vue';
import { getRoutePathByName } from '@/utils/router';
import { formatHeaderDate } from '@/utils/dayjs';
import { getFinanceMangerPage, deleteFinanceManager } from '@/views/finance/financeManager/api';
import { getDictList } from '@/views/finance/dict/api/index';
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

// [Grouping Logic]
const groupedDataSource = computed(() => {
	const groups: { date: string; items: FinanceManagerData[] }[] = [];
	dataSource.value.forEach((item) => {
		if (!item.infoDate) return;
		const dateStr = dayjs(item.infoDate).format('YYYY-MM-DD');
		let group = groups.find((g) => g.date === dateStr);
		if (!group) {
			group = { date: dateStr, items: [] };
			groups.push(group);
		}
		group.items.push(item);
	});
	return groups;
});

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
const loading = ref<boolean>(true); // 初始设为 true，加速骨架屏展示
const dataSource = ref<FinanceManagerData[]>([]);
const searchInfo = ref<FinanceManagerData>({});
const finished = ref<boolean>(false);
const isRefresh = ref<boolean>(false);
const { pagination, resetPagination, setTotal, nextPage } = usePagination();

// [Computed: Multi-Filter Detection]
const hasFilters = computed(() => {
	const info = searchInfo.value;
	return !!(info.bigTypeCode || info.fromSource || info.typeCode);
});

// 统一重置数据函数
const resetData = () => {
	dataSource.value = [];
	finished.value = false;
	resetPagination();
};

// 一键清除所有筛选
const onClearAllFilters = () => {
	searchInfo.value = {
		bigTypeCode: '',
		fromSource: '',
		typeCode: '',
	};
	onRefreshData();
};

// 交互辅助
const handleCardClick = (item: FinanceManagerData) => {
	router.push(getDetailRoute(item.id));
};

// 获取财务数据
const getFinancePage = async (param: FinanceManagerData, cur: PageInfo) => {
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
		setTotal(data?.total || 0);
		finished.value = (pagination.total || 0) <= dataSource.value.length;
	} else {
		showFailToast(message || '查询列表失败！');
	}
};

// 搜索处理
const onSearch = () => {
	resetData();
	getFinancePage(searchInfo.value, pagination);
};

// 取消搜索
const onCancel = () => {
	searchInfo.value.bigTypeCode = '';
	resetData();
	getFinancePage(searchInfo.value, pagination);
};

// 下拉刷新
const onRefreshData = () => {
	resetData();
	getFinancePage(searchInfo.value, pagination);
};

// 加载更多
const onLoadMore = () => {
	nextPage();
	getFinancePage(searchInfo.value, pagination);
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
	if (route.query.fromSource) {
		searchInfo.value.fromSource = route.query.fromSource as string;
	}
	if (route.query.typeCode) {
		searchInfo.value.typeCode = route.query.typeCode as string;
	}
	getFinancePage(searchInfo.value, pagination);
});
</script>

<style lang="less" scoped>
.search-bar {
	--van-search-padding: 10px 16px;
	--van-search-content-background: #f7f8fa; // 让输入框区域呈浅灰色，而外层是白色
	--van-search-input-height: 38px;
	background-color: #fff;
	transition: all 0.3s ease;

	:deep(.van-field__control) {
		font-weight: 500;
		color: #323233;
	}

	&:focus-within {
		--van-search-content-background: #f2f3f5; // 聚焦时颜色微变
	}
}

:deep(.van-dropdown-menu__bar) {
	height: 48px; // Slightly taller for better touch target/balance
	background-color: #fff;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02); // 统一的底部阴影
	border-bottom: 1px solid rgba(0, 0, 0, 0.01);

	.van-dropdown-menu__title {
		font-size: 14px;
		font-weight: 500;
		color: #323233;

		&::after {
			border-color: transparent transparent #969799 #969799; // Softer arrow
		}

		&--active {
			color: #1989fa;
			font-weight: 600;

			&::after {
				border-color: transparent transparent currentColor currentColor;
			}
		}
	}

	.van-dropdown-menu__item {
		// 移除中间的分隔线
		&::after {
			display: none;
		}
	}
}

// [Animation/Style: Dropdown Content]
:deep(.van-dropdown-item__content) {
	border-radius: 0 0 20px 20px;
	box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
	overflow: hidden;

	.van-dropdown-item__option {
		padding: 12px 16px;

		&--active {
			background-color: rgba(25, 137, 250, 0.03);
			color: #1989fa;
			font-weight: 600;
		}

		.van-dropdown-item__icon {
			font-size: 18px;
		}
	}
}

.refresh-info {
	height: calc(100% - 104px);
	background-color: #f7f8fa; // 列表底色采用浅灰色
}

// [Animation: List Transitions]
.list-enter-active,
.list-leave-active {
	transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.list-enter-from {
	opacity: 0;
	transform: translateX(-20px);
}

.list-leave-to {
	opacity: 0;
	transform: translateX(20px);
}

.list-move {
	transition: transform 0.4s ease;
}

// [Empty State Adjustments]
.empty-state-container {
	padding-bottom: 120px;

	.clear-filters-btn {
		margin-top: 16px;
		padding: 0 32px;
		height: 38px;
		font-size: 14px;
		box-shadow: 0 4px 12px rgba(25, 137, 250, 0.2);
	}
}

.skeleton-date-header {
	margin: 12px 0; // 与真实 header 边距对齐
	width: 100px;
	:deep(.van-skeleton__title) {
		margin: 0;
		height: 14px;
	}
}

.skeleton-card {
	padding: 16px 18px; // 与 FinanceCard 填充一致
	margin-bottom: 12px; // 与 FinanceCard 底部间距一致
	background: #fff;
	border-radius: 16px;
	display: flex;
	justify-content: space-between;
	align-items: center;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);

	.skeleton-left {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 8px; // 与 FinanceCard .card-left gap 一致

		:deep(.van-skeleton__title) {
			margin: 0;
			height: 15px; // 匹配 .title 字体大小
			width: 60%;
		}
		:deep(.van-skeleton__row) {
			height: 11px; // 匹配 .date-text 字体大小
			width: 40%;
		}
	}

	.skeleton-right {
		width: 60px;
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		:deep(.van-skeleton__row) {
			height: 17px; // 匹配 .amount-text 字体大小
			width: 100%;
		}
	}

	:deep(.van-skeleton) {
		padding: 0;
	}
}

.card-list {
	padding-top: 0;
}

.date-group {
	margin-bottom: 0;
}

.date-header {
	padding: 4px 0;
	margin: 12px 0; // 上下间距保持一致
	font-size: 13px;
	font-weight: 600;
	color: #323233;
	display: flex;
	align-items: center;
	gap: 6px;

	.header-dot {
		width: 6px;
		height: 6px;
		background-color: #1989fa;
		border-radius: 50%;
	}
}
</style>
