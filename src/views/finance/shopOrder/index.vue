<template>
	<form action="/">
		<van-search
			v-model="searchInfo.saleOrderCode"
			placeholder="请输入订单号进行搜索..."
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
			id="shop-order-list"
			v-model="loading"
			:loading="loading"
			:refreshing="isRefresh"
			:finished="finished"
			:is-empty="!dataSource?.length"
			empty-text="暂无订单数据"
			empty-image="search"
			@load="onLoadMore"
		>
			<template #skeleton>
				<div
					v-for="i in 5"
					:key="i"
					class="skeleton-card"
				>
					<div class="skeleton-header">
						<van-skeleton
							title
							:row="0"
						/>
						<van-skeleton
							title
							:row="0"
							style="width: 80px"
						/>
					</div>
					<div class="skeleton-body">
						<van-skeleton
							:row="1"
							style="width: 40%"
						/>
						<van-skeleton
							:row="1"
							style="width: 30%"
						/>
					</div>
				</div>
			</template>

			<template #empty>
				<div class="empty-state-container">
					<van-empty
						image="search"
						description="暂无订单数据"
					>
						<van-button
							v-if="searchInfo.saleOrderCode"
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
				<transition-group name="list">
					<shop-order-card
						v-for="item in dataSource"
						:key="item.id || ''"
						:item="item"
						@click="handleCardClick"
					/>
				</transition-group>
			</div>
		</common-list>
	</common-pull-refresh>
	<van-back-top target="#shop-order-list" />
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { showFailToast } from 'vant';
import ShopOrderCard from './components/ShopOrderCard.vue';
import type { SearchInfo, DataItem } from './shopOrderTs';
import { usePagination } from '@/composables/usePagination';
import CommonPullRefresh from '@/views/components/CommonPullRefresh.vue';
import CommonList from '@/views/components/CommonList.vue';
import { getShopOrderPage } from '@/api/finance/shopOrder/shopOrderTs';
import { useNavBar } from '@/composables/useNavBar';
import type { PageInfo } from '@/views/common/config/index';

const router = useRouter();
const route = useRoute();

// 导航栏配置
useNavBar({
	title: (route?.meta?.title as string) || '商品订单',
	rightIcon: 'plus',
	leftPath: '/',
	visible: true,
	onRightClick: () => {
		addShopOrder();
	},
});

// 响应式数据
const loading = ref<boolean>(true);
const dataSource = ref<DataItem[]>([]);
const searchInfo = ref<SearchInfo>({});
const finished = ref<boolean>(false);
const isRefresh = ref<boolean>(false);
const { pagination, resetPagination, setTotal, nextPage } = usePagination();

// 统一重置数据函数
const resetData = () => {
	dataSource.value = [];
	finished.value = false;
	resetPagination();
};

// 一键清除所有筛选
const onClearAllFilters = () => {
	searchInfo.value = {
		saleOrderCode: undefined,
	};
	onRefreshData();
};

const addShopOrder = () => {
	router.push({ path: '/finance/shopOrder/shopOrderDetail' });
};

// 交互辅助
const handleCardClick = (item: DataItem) => {
	router.push({
		path: '/finance/shopOrder/shopOrderDetail',
		query: { id: item.id },
	});
};

// 获取订单数据
const getOrderPage = async (param: SearchInfo, cur: PageInfo) => {
	if (!isRefresh.value) {
		loading.value = true;
	}
	const { code, data, message } = await getShopOrderPage(param, cur?.current || 1, cur?.pageSize || 10).finally(() => {
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
	getOrderPage(searchInfo.value, pagination);
};

// 取消搜索
const onCancel = () => {
	searchInfo.value.saleOrderCode = undefined;
	resetData();
	getOrderPage(searchInfo.value, pagination);
};

// 下拉刷新
const onRefreshData = () => {
	resetData();
	getOrderPage(searchInfo.value, pagination);
};

// 加载更多
const onLoadMore = () => {
	nextPage();
	getOrderPage(searchInfo.value, pagination);
};

// 初始化
onMounted(() => {
	resetData();
	getOrderPage(searchInfo.value, pagination);
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

.skeleton-card {
	padding: 16px 18px;
	margin-top: 12px;
	background: #fff;
	border-radius: 16px;
	display: flex;
	flex-direction: column;
	gap: 16px;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);

	.skeleton-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-bottom: 12px;
		border-bottom: 1px dashed #f2f3f5;

		:deep(.van-skeleton__title) {
			margin: 0;
			height: 15px;
			width: 120px;
		}
	}

	.skeleton-body {
		display: flex;
		justify-content: space-between;
		align-items: center;

		:deep(.van-skeleton__row) {
			height: 24px;
			margin-top: 0;
		}
	}

	:deep(.van-skeleton) {
		padding: 0;
	}
}

.card-list {
	padding: 12px 16px;
}
</style>
