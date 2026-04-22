<template>
	<div class="shop-stock-batch-container">
		<!-- Search Header -->
		<div class="search-header">
			<form action="/">
				<van-search
					v-model="searchInfo.title"
					placeholder="搜索批次名称或编码..."
					shape="round"
					background="transparent"
					@search="onSearch"
					@clear="onClear"
					class="custom-search"
				/>
			</form>
		</div>

		<!-- List Content -->
		<common-pull-refresh
			class="list-refresh"
			v-model="isRefresh"
			@refresh="onRefreshData"
			ref="pullRefresh"
		>
			<van-list
				v-model:loading="loading"
				:finished="finished"
				:finished-text="dataSource.length > 0 ? '没有更多了' : ''"
				@load="onLoadMore"
				class="batch-list"
			>
				<!-- Empty State -->
				<template v-if="!dataSource.length && !loading">
					<van-empty
						image="search"
						description="暂无相关批次记录"
					/>
				</template>

				<!-- Batch Cards -->
				<div
					v-for="item in dataSource"
					:key="item.id ?? 0"
					class="batch-card-wrapper"
				>
					<van-swipe-cell>
						<div
							class="batch-card"
							@click="handleCardClick(item)"
						>
							<div class="card-header">
								<div class="batch-code">
									<van-icon
										name="label-o"
										class="header-icon"
									/>
									<span>{{ item.batchCode }}</span>
								</div>
								<van-tag
									v-if="item.isValid === '1'"
									type="success"
									plain
								>
									生效中
								</van-tag>
								<van-tag
									v-else
									type="warning"
									plain
								>
									已失效
								</van-tag>
							</div>
							<div class="card-body">
								<div class="batch-name">{{ item.batchName }}</div>
								<div class="batch-desc van-multi-ellipsis--l2">
									{{ item.description || '暂无描述信息' }}
								</div>
							</div>
						</div>
						<template #right>
							<van-button
								square
								type="danger"
								text="删除"
								class="delete-btn"
								@click="onDelete(item.id ?? '')"
							/>
						</template>
					</van-swipe-cell>
				</div>
			</van-list>
		</common-pull-refresh>

		<van-back-top />
	</div>
</template>

<script lang="ts" setup>
import { showSuccessToast, showFailToast, showConfirmDialog } from 'vant';
import type { ShopStockBatchData } from './config';
import { getShopStockBatchPage, deleteShopStockBatch } from '@/views/finance/shopStockBatch/api';
import { getUserManagerList } from '@/views/user/userManager/api';
import { useNavBar } from '@/composables/useNavBar';
import { usePagination } from '@/composables/usePagination';
import type { PageInfo } from '@/views/common/config';

const router = useRouter();
const route = useRoute();

// --- useHooks ---
useNavBar({
	title: (route?.meta?.title as string) || '批次管理',
	rightIcon: 'plus',
	leftPath: '/',
	visible: true,
	onRightClick: () => {
		navigator.vibrate?.(50);
		router.push({ path: '/finance/shopStockBatch/shopStockBatchDetail' });
	},
});

const { pagination, resetPagination, setTotal, nextPage } = usePagination();

// --- Variables ---
const loading = ref<boolean>(false);
const dataSource = ref<ShopStockBatchData[]>([]);
const searchInfo = ref<ShopStockBatchData>({});
const finished = ref<boolean>(false);
const isRefresh = ref<boolean>(false);
const userMap = ref<Record<string, string>>({});

// --- Methods ---
const fetchBatchList = async (param: ShopStockBatchData, cur: PageInfo) => {
	if (!isRefresh.value) {
		loading.value = true;
	}
	try {
		const { code, data, message } = await getShopStockBatchPage(param, cur?.current || 1, cur?.pageSize || 10);
		if (code == '200') {
			const records = data?.records || [];
			dataSource.value = cur.current === 1 ? records : [...dataSource.value, ...records];
			setTotal(data?.total || 0);
			finished.value = dataSource.value.length >= (data?.total || 0);
		} else {
			showFailToast(message || '查询列表失败！');
			finished.value = true;
		}
	} catch {
		showFailToast('网络异常，请重试');
		finished.value = true;
	} finally {
		loading.value = false;
		isRefresh.value = false;
	}
};

const getUserInfoList = async () => {
	try {
		const { code, data } = await getUserManagerList({});
		if (code == '200' && data) {
			data.forEach((user: { id: string | number; nickName: string }) => {
				userMap.value[user.id] = user.nickName;
			});
		}
	} catch {
		// eslint-disable-next-line no-console
		console.error('Failed to load user list');
	}
};

const onSearch = () => {
	resetPagination();
	dataSource.value = [];
	fetchBatchList(searchInfo.value, pagination);
};

const onClear = () => {
	searchInfo.value.title = '';
	onSearch();
};

const onRefreshData = () => {
	resetPagination();
	fetchBatchList(searchInfo.value, pagination);
};

const onLoadMore = () => {
	if (loading.value || finished.value) return;
	nextPage();
	fetchBatchList(searchInfo.value, pagination);
};

const handleCardClick = (item: ShopStockBatchData) => {
	router.push({
		path: '/finance/shopStockBatch/shopStockBatchDetail',
		query: { id: item.id },
	});
};

const onDelete = async (id: string) => {
	navigator.vibrate?.(50);
	try {
		await showConfirmDialog({
			title: '确认删除',
			message: '确定要删除这条批次记录吗？',
			confirmButtonColor: '#ee0a24',
		});

		const { code, message } = await deleteShopStockBatch(id);
		if (code == '200') {
			showSuccessToast(message || '删除成功！');
			onRefreshData();
		} else {
			showFailToast(message || '删除失败，请联系管理员！');
		}
	} catch {
		// 取消删除
	}
};

// --- Init ---
onMounted(() => {
	getUserInfoList();
	onRefreshData();
});
</script>

<style lang="less" scoped>
.shop-stock-batch-container {
	height: 100%;
	display: flex;
	flex-direction: column;
	background-color: #f7f9fc;
}

.search-header {
	padding: 8px 4px;
	background-color: #fff;
	box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
	z-index: 10;

	.custom-search {
		padding: 0 12px;
	}
}

.list-refresh {
	flex: 1;
	overflow-y: auto;
}

.batch-list {
	padding: 12px 16px;
}

.batch-card-wrapper {
	margin-bottom: 12px;
	border-radius: 16px;
	overflow: hidden;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
}

.batch-card {
	background: #fff;
	padding: 16px;
	display: flex;
	flex-direction: column;
	gap: 12px;
	transition: background-color 0.2s;

	&:active {
		background-color: #f8fafc;
	}

	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;

		.batch-code {
			display: flex;
			align-items: center;
			gap: 6px;
			font-size: 13px;
			color: #64748b;
			font-weight: 500;

			.header-icon {
				font-size: 14px;
				color: #3b82f6;
			}
		}
	}

	.card-body {
		.batch-name {
			font-size: 16px;
			font-weight: 700;
			color: #323233;
			margin-bottom: 6px;
		}

		.batch-desc {
			font-size: 13px;
			color: #94a3b8;
			line-height: 1.5;
		}
	}

	.card-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-top: 12px;
		border-top: 1px solid #f1f5f9;

		.footer-info {
			display: flex;
			align-items: center;
			gap: 6px;
			font-size: 12px;
			color: #94a3b8;
		}

		.arrow-icon {
			font-size: 14px;
			color: #cbd5e1;
		}
	}
}

.delete-btn {
	height: 100%;
}
</style>
