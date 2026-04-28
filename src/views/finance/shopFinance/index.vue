<template>
	<form action="/">
		<van-search
			v-model="searchInfo.shopName"
			placeholder="搜索商品名称..."
			shape="round"
			background="#ffffff"
			@search="onSearch"
			@clear="onCancel"
			class="search-bar"
		/>
	</form>
	<common-pull-refresh
		class="refresh-info"
		v-model="isRefresh"
		@refresh="onRefreshData"
		ref="pullRefresh"
	>
		<common-list
			id="shop-finance-list"
			v-model="loading"
			:loading="loading"
			:refreshing="isRefresh"
			:finished="finished"
			:is-empty="!dataSource?.length"
			empty-text="没有找到相关的账单记录"
			@load="onLoadMore"
		>
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

			<template #empty>
				<div class="empty-state-container">
					<van-empty description="没有找到相关的账单记录">
						<van-button
							v-if="searchInfo.shopName"
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
					<transition-group name="list">
						<shop-finance-card
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
	<van-back-top target="#shop-finance-list" />
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { showSuccessToast, showFailToast } from 'vant';
import dayjs from 'dayjs';
import type { ShopFinanceData } from './config';
import { usePagination } from '@/composables/usePagination';
import { formatHeaderDate } from '@/utils/dayjs';
import { getShopFinancePage, deleteShopFinance } from '@/views/finance/shopFinance/api';
import { useNavBar } from '@/composables/useNavBar';
import type { PageInfo } from '@/views/common/config';

const router = useRouter();
const route = useRoute();

// 导航栏配置
useNavBar({
	title: (route?.meta?.title as string) || '店财务管理',
	rightIcon: 'plus',
	leftPath: '/',
	visible: true,
	onRightClick: () => {
		router.push({ path: '/finance/shopFinance/shopFinanceDetail' });
	},
});

// 响应式数据
const loading = ref<boolean>(true);
const dataSource = ref<ShopFinanceData[]>([]);
const searchInfo = ref<ShopFinanceData>({});
const finished = ref<boolean>(false);
const isRefresh = ref<boolean>(false);
const { pagination, resetPagination, setTotal, nextPage } = usePagination();

// 分组逻辑
const groupedDataSource = computed(() => {
	const groups: { date: string; items: ShopFinanceData[] }[] = [];
	dataSource.value.forEach((item) => {
		if (!item.saleDate) return;
		const dateStr = dayjs(item.saleDate).format('YYYY-MM-DD');
		let group = groups.find((g) => g.date === dateStr);
		if (!group) {
			group = { date: dateStr, items: [] };
			groups.push(group);
		}
		group.items.push(item);
	});
	return groups;
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
		shopName: '',
	};
	onRefreshData();
};

// 交互辅助
const handleCardClick = (item: ShopFinanceData) => {
	router.push({
		path: '/finance/shopFinance/shopFinanceDetail',
		query: { id: item.id },
	});
};

// 获取财务数据
const getFinancePage = async (param: ShopFinanceData, cur: PageInfo) => {
	if (!isRefresh.value) {
		loading.value = true;
	}
	const { code, data, message } = await getShopFinancePage(param, cur?.current || 1, cur?.pageSize || 10).finally(() => {
		loading.value = false;
		isRefresh.value = false;
	});

	if (code === '200') {
		if (cur?.current === 1) {
			dataSource.value = data?.records || [];
		} else {
			dataSource.value = [...dataSource.value, ...(data?.records || [])];
		}
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
	searchInfo.value.shopName = '';
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
	if (dataSource.value.length > 0) {
		nextPage();
	}
	getFinancePage(searchInfo.value, pagination);
};

// 删除财务记录
const onDeleteFinance = async (id?: number) => {
	if (!id) return;
	const { code, message } = await deleteShopFinance(`${id}`);
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
	getFinancePage(searchInfo.value, pagination);
});
</script>

<style lang="less" scoped>
.search-bar {
	--van-search-padding: 10px 16px;
	--van-search-content-background: #f7f8fa;
	--van-search-input-height: 38px;
	background-color: #fff;
	transition: all 0.3s ease;

	:deep(.van-field__control) {
		font-weight: 500;
		color: #323233;
	}

	&:focus-within {
		--van-search-content-background: #f2f3f5;
	}
}

.refresh-info {
	height: calc(100% - 58px);
	background-color: #f7f8fa;
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
	margin: 12px 0;
	width: 100px;
	:deep(.van-skeleton__title) {
		margin: 0;
		height: 14px;
	}
}

.skeleton-card {
	padding: 16px 18px;
	margin-bottom: 12px;
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
		gap: 8px;

		:deep(.van-skeleton__title) {
			margin: 0;
			height: 15px;
			width: 60%;
		}
		:deep(.van-skeleton__row) {
			height: 11px;
			width: 40%;
		}
	}

	.skeleton-right {
		width: 60px;
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		:deep(.van-skeleton__row) {
			height: 17px;
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
	margin: 12px 0;
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
