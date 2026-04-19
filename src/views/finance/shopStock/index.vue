<template>
	<form action="/">
		<van-search
			v-model="searchInfo.title"
			placeholder="请输入搜索关键词..."
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
			id="shop-stock-list"
			v-model="loading"
			:loading="loading"
			:refreshing="isRefresh"
			:finished="finished"
			:is-empty="!dataSource?.length"
			empty-text="暂无库存数据"
			empty-image="search"
			@load="onLoadMore"
		>
			<template #skeleton>
				<div
					v-for="i in 5"
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
			</template>

			<template #empty>
				<div class="empty-state-container">
					<van-empty
						image="search"
						description="暂无库存数据"
					>
						<van-button
							v-if="searchInfo.title"
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
					<shop-stock-card
						v-for="item in dataSource"
						:key="item.id || ''"
						:item="item"
						@click="handleCardClick"
						@copy="handleCopy"
						@delete="onDeleteStock"
					/>
				</transition-group>
			</div>
		</common-list>
	</common-pull-refresh>
	<van-back-top target="#shop-stock-list" />
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { showSuccessToast, showFailToast } from 'vant';
import ShopStockCard from './components/ShopStockCard.vue';
import type { SearchInfo, ShopStockInfo } from './shopStockTs';
import { usePagination } from '@/composables/usePagination';
import CommonPullRefresh from '@/views/components/CommonPullRefresh.vue';
import CommonList from '@/views/components/CommonList.vue';
import { getShopStockPage, deleteShopStock } from '@/views/finance/shopStock/api/index';
import { useNavBar } from '@/composables/useNavBar';
import type { PageInfo } from '@/views/common/config/index';

const router = useRouter();
const route = useRoute();

// 导航栏配置
useNavBar({
	title: (route?.meta?.title as string) || '库存管理',
	rightIcon: 'plus',
	leftPath: '/',
	visible: true,
	onRightClick: () => {
		addShopStock(null, 'add');
	},
});

// 响应式数据
const loading = ref<boolean>(true);
const dataSource = ref<ShopStockInfo[]>([]);
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
		title: '',
	};
	onRefreshData();
};

const addShopStock = (id: number | null, type: string) => {
	router.push({
		path: '/finance/shopStock/shopStockDetail',
		query: { id, type },
	});
};

// 交互辅助
const handleCardClick = (item: ShopStockInfo) => {
	addShopStock(item.id || null, 'update');
};

const handleCopy = (id: number) => {
	addShopStock(id, 'copy');
};

// 获取库存数据
const getStockPage = async (param: SearchInfo, cur: PageInfo) => {
	if (!isRefresh.value) {
		loading.value = true;
	}
	const { code, data, message } = await getShopStockPage(param, cur?.current || 1, cur?.pageSize || 10).finally(() => {
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
	getStockPage(searchInfo.value, pagination);
};

// 取消搜索
const onCancel = () => {
	searchInfo.value.title = '';
	resetData();
	getStockPage(searchInfo.value, pagination);
};

// 下拉刷新
const onRefreshData = () => {
	resetData();
	getStockPage(searchInfo.value, pagination);
};

// 加载更多
const onLoadMore = () => {
	nextPage();
	getStockPage(searchInfo.value, pagination);
};

// 删除库存记录
const onDeleteStock = async (id?: number) => {
	if (!id) return;
	const { code, message } = await deleteShopStock(`${id}`);
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
	getStockPage(searchInfo.value, pagination);
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
	padding: 0;
}
</style>
