<template>
	<div class="shop-product-container">
		<!-- Search Header -->
		<div class="search-header">
			<form action="/">
				<van-search
					v-model="searchInfo.title"
					placeholder="搜索商品名称或编码..."
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
				finished-text="没有更多了"
				@load="onLoadMore"
				class="product-list"
			>
				<!-- Empty State -->
				<template v-if="!dataSource.length && !loading">
					<van-empty
						image="search"
						description="暂无相关商品"
					/>
				</template>

				<!-- Product Cards -->
				<div
					v-for="item in dataSource"
					:key="item.id ?? 0"
					class="product-card"
					@click="handleCardClick(item)"
				>
					<div class="card-body">
						<div class="card-left">
							<div class="product-header">
								<span class="product-name">{{ item.shopName }}</span>
								<van-tag
									type="primary"
									class="code-tag"
								>
									{{ item.oldShopCode }}
								</van-tag>
							</div>
							<div class="product-tags">
								<van-tag
									plain
									type="primary"
									v-if="item.style"
								>
									{{ item.style }}
								</van-tag>
								<van-tag
									plain
									type="success"
									v-if="item.color"
								>
									{{ item.color }}
								</van-tag>
								<van-tag
									plain
									type="warning"
									v-if="item.size"
								>
									{{ item.size }}
								</van-tag>
							</div>
							<div class="product-desc van-multi-ellipsis--l2">
								{{ item.description || '暂无描述信息' }}
							</div>
						</div>
						<div class="card-right">
							<div class="price-section">
								<span class="currency">¥</span>
								<span class="price-value">{{ commonUtils.formatAmount(Number(item.saleAmount || 0), 2, '') }}</span>
							</div>
							<div class="action-buttons">
								<div
									class="action-icon cart-btn"
									@click.stop="onAddToCart(item)"
								>
									<SvgIcon
										name="shoppingCart"
										class="svg-icon"
									/>
								</div>
								<div
									class="action-icon buy-btn"
									@click.stop="onBuyNow(item)"
								>
									<SvgIcon
										name="shoppingBuy"
										class="svg-icon"
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
			</van-list>
		</common-pull-refresh>

		<van-back-top />
	</div>
</template>

<script lang="ts" setup>
import { showFailToast, showSuccessToast } from 'vant';
import type { ShopStockInfo } from './config';
import type { ShopStockData } from '@/views/finance/shopStock/config';
import { getShopStockPage } from '@/views/finance/shopStock/api';
import { addShopCart } from '@/views/finance/shopCart/api';
import commonUtils from '@/utils/common';
import { useUserStore } from '@/store/modules/user/user';
import { useNavBar } from '@/composables/useNavBar';
import { usePagination } from '@/composables/usePagination';
import type { PageInfo } from '@/views/common/config';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

// --- useHooks ---
useNavBar({
	title: (route?.meta?.title as string) || '精选商品',
	leftPath: '/',
	visible: true,
});

const { pagination, resetPagination, setTotal, nextPage } = usePagination();

// --- Variables ---
const loading = ref<boolean>(false);
const dataSource = ref<ShopStockData[]>([]);
const searchInfo = ref<ShopStockInfo>({ isShopping: true });
const finished = ref<boolean>(false);
const isRefresh = ref<boolean>(false);

// --- Methods ---
const fetchProducts = async (param: ShopStockInfo, cur: PageInfo) => {
	if (!isRefresh.value) {
		loading.value = true;
	}
	try {
		const { code, data, message } = await getShopStockPage(param, cur?.current || 1, cur?.pageSize || 10);
		if (code == '200') {
			const records = data?.records || [];
			dataSource.value = cur.current === 1 ? records : [...dataSource.value, ...records];
			setTotal(data?.total || 0);
			finished.value = dataSource.value.length >= (data?.total || 0);
		} else {
			showFailToast(message || '查询商品失败！');
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

const onSearch = () => {
	resetPagination();
	dataSource.value = [];
	fetchProducts(searchInfo.value, pagination);
};

const onClear = () => {
	searchInfo.value.title = '';
	onSearch();
};

const onRefreshData = () => {
	resetPagination();
	fetchProducts(searchInfo.value, pagination);
};

const onLoadMore = () => {
	if (loading.value || finished.value) return;
	nextPage();
	fetchProducts(searchInfo.value, pagination);
};

const handleCardClick = (item: ShopStockData) => {
	router.push({
		path: '/finance/shopProduct/shopProductDetail',
		query: { id: item.id },
	});
};

const onAddToCart = async (item: ShopStockData) => {
	navigator.vibrate?.(50);
	const userInfo = userStore.getUserInfo;
	const cartInfo = {
		shopId: item.id,
		userId: userInfo.id,
		customerId: null,
		isValid: '1',
		saleNum: 1,
	};
	try {
		const { code, message } = await addShopCart(cartInfo);
		if (code === '200') {
			showSuccessToast('已加入购物车');
		} else {
			showFailToast(message || '加入购物车失败');
		}
	} catch {
		showFailToast('加入购物车失败');
	}
};

const onBuyNow = (item: ShopStockData) => {
	navigator.vibrate?.(50);
	router.push({
		name: 'saleTicket',
		query: { ids: item.id, type: 'shopProduct' },
	});
};

// --- Init ---
onMounted(() => {
	onRefreshData();
});
</script>

<style lang="less" scoped>
.shop-product-container {
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

.product-list {
	padding: 12px 16px 80px;
}

.product-card {
	background: #fff;
	border-radius: 16px;
	margin-bottom: 16px;
	overflow: hidden;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
	transition:
		transform 0.2s,
		box-shadow 0.2s;

	&:active {
		transform: scale(0.98);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
	}

	.card-body {
		padding: 16px;
		display: flex;
		justify-content: space-between;
		gap: 12px;
	}

	.card-left {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.product-header {
		display: flex;
		align-items: center;
		gap: 8px;

		.product-name {
			font-size: 16px;
			font-weight: 700;
			color: #323233;
		}

		.code-tag {
			padding: 0 6px;
			height: 16px;
			line-height: 16px;
			font-size: 10px;
			border-radius: 4px;
		}
	}

	.product-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;

		:deep(.van-tag) {
			border-radius: 4px;
			padding: 0 6px;
		}
	}

	.product-desc {
		font-size: 12px;
		color: #94a3b8;
		line-height: 1.5;
	}

	.card-right {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		justify-content: space-between;
		min-width: 100px;
	}

	.price-section {
		display: flex;
		align-items: baseline;
		color: #ef4444;

		.currency {
			font-size: 14px;
			font-weight: 600;
		}

		.price-value {
			font-size: 22px;
			font-weight: 700;
		}
	}

	.action-buttons {
		display: flex;
		gap: 16px;
		margin-top: 12px;

		.action-icon {
			width: 36px;
			height: 36px;
			border-radius: 50%;
			display: flex;
			align-items: center;
			justify-content: center;
			transition: background-color 0.2s;

			.svg-icon {
				font-size: 20px;
			}
		}

		.cart-btn {
			background-color: #f1f5f9;
			color: #64748b;

			&:active {
				background-color: #e2e8f0;
			}
		}

		.buy-btn {
			background-color: #3b82f6;
			color: #fff;
			box-shadow: 0 4px 10px rgba(59, 130, 246, 0.3);

			&:active {
				background-color: #2563eb;
			}
		}
	}
}
</style>
