<template>
	<div class="shop-stock-attrs-page">
		<CommonPullRefresh
			v-model="isRefresh"
			@refresh="refresh"
			class="refresh-container"
		>
			<CommonList
				v-model="loading"
				:loading="loading"
				:refreshing="isRefresh"
				:finished="finished"
				:is-empty="dataSource.length === 0"
				@load="onRefresh"
			>
				<template #skeleton>
					<div class="skeleton-list">
						<div
							v-for="i in 5"
							:key="i"
							class="skeleton-card"
						>
							<van-skeleton
								title
								avatar
								:row="2"
							/>
						</div>
					</div>
				</template>

				<div class="card-list">
					<van-swipe-cell
						v-for="item in dataSource"
						:key="item.id"
						class="attr-swipe-cell"
					>
						<div
							class="attr-card"
							@click="handleCardClick(item)"
						>
							<div class="attr-card__header">
								<div class="attr-card__icon-box">
									<component
										:is="PackageIcon"
										:size="20"
										class="attr-card__icon"
									/>
								</div>
								<div class="attr-card__info">
									<div class="attr-card__title">{{ item.attrName || '未命名属性' }}</div>
									<div class="attr-card__subtitle">ID: {{ item.id }}</div>
								</div>
								<van-tag
									:type="item.isValid === '1' ? 'success' : 'danger'"
									plain
									round
									class="attr-card__tag"
								>
									{{ item.isValid === '1' ? '有效' : '无效' }}
								</van-tag>
							</div>

							<div class="attr-card__body">
								<div class="attr-item">
									<span class="attr-item__label">属性编码</span>
									<span class="attr-item__value">{{ item.attrCode }}</span>
								</div>
								<div class="attr-item">
									<span class="attr-item__label">属性值</span>
									<span class="attr-item__value highlight">{{ item.attrValue }}</span>
								</div>
								<div
									v-if="item.description"
									class="attr-item desc"
								>
									<span class="attr-item__label">备注</span>
									<span class="attr-item__value">{{ item.description }}</span>
								</div>
							</div>

							<div class="attr-card__footer">
								<div class="attr-card__stock">
									<van-icon name="points" />
									库存 ID: {{ item.stockId }}
								</div>
								<van-icon
									name="arrow"
									class="attr-card__arrow"
								/>
							</div>
						</div>

						<template #right>
							<div class="swipe-actions">
								<van-button
									square
									type="danger"
									text="删除"
									class="delete-btn"
									@click="delShopStockAttrs(item.id!)"
								/>
							</div>
						</template>
					</van-swipe-cell>
				</div>
			</CommonList>
		</CommonPullRefresh>
		<van-back-top />
	</div>
</template>

<script lang="ts" setup>
import { reactive, ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { showSuccessToast, showFailToast } from 'vant';
import { Package as PackageIcon } from 'lucide-vue-next';
import type { ShopStockAttrsData } from './config';
import type { UserManagerData } from '@/views/user/userManager/config';
import { getShopStockAttrsPage, deleteShopStockAttrs } from '@/views/finance/shopStockAttrs/api';
import { getUserManagerList } from '@/views/user/userManager/api';
import { usePagination } from '@/composables/usePagination';
import { useNavBar } from '@/composables/useNavBar';
import { useTabBar } from '@/composables/useTabBar';
import type { PageInfo } from '@/views/common/config/index';

const router = useRouter();
const route = useRoute();

// [Hooks]
const { pagination, resetPagination, setTotal, nextPage } = usePagination();

useNavBar({
	title: (route?.meta?.title as string) || '库存属性管理',
	rightIcon: 'plus',
	onRightClick: () => {
		navigator.vibrate?.(50);
		router.push({ path: '/finance/shopStockAttrs/shopStockAttrsDetail' });
	},
});

useTabBar({
	visible: true,
	active: 1, // 保持在“财务”页签
});

// [State]
const loading = ref<boolean>(false);
const dataSource = ref<ShopStockAttrsData[]>([]);
const searchInfo = ref<ShopStockAttrsData>({});
const finished = ref<boolean>(false);
const isRefresh = ref<boolean>(false);
const userMap = reactive<Record<string, string>>({});

// [Methods]
const query = async (param: ShopStockAttrsData, cur: PageInfo) => {
	if (!isRefresh.value) {
		loading.value = true;
	}

	try {
		const { code, data, message } = await getShopStockAttrsPage(param, cur?.current || 1, cur?.pageSize || 10);
		if (code === '200' && data) {
			const { records = [], total = 0 } = data;
			dataSource.value = cur.current === 1 ? records : [...dataSource.value, ...records];

			setTotal(total);
			nextPage();
			finished.value = dataSource.value.length >= total;
		} else {
			showFailToast(message || '查询列表失败');
		}
	} catch {
		showFailToast('网络请求异常');
	} finally {
		loading.value = false;
		isRefresh.value = false;
	}
};

const getUserInfoList = async () => {
	const res = await getUserManagerList({});
	if (res?.code === '200' && Array.isArray(res.data)) {
		res.data.forEach((user: UserManagerData) => {
			if (user.id && user.nickName) {
				userMap[user.id] = user.nickName;
			}
		});
	}
};

const refresh = () => {
	resetPagination();
	dataSource.value = [];
	finished.value = false;
	query(searchInfo.value, pagination);
};

const onRefresh = () => {
	query(searchInfo.value, pagination);
};

const handleCardClick = (item: ShopStockAttrsData) => {
	navigator.vibrate?.(50);
	router.push({
		path: '/finance/shopStockAttrs/shopStockAttrsDetail',
		query: { id: item.id },
	});
};

const delShopStockAttrs = (id: string) => {
	navigator.vibrate?.(50);
	deleteShopStockAttrs(id).then((res) => {
		if (res?.code === '200') {
			refresh();
			showSuccessToast('删除成功');
		} else {
			showFailToast(res?.message || '删除失败');
		}
	});
};

const init = () => {
	refresh();
	getUserInfoList();
};

onMounted(() => {
	init();
});
</script>

<style lang="less" scoped>
.shop-stock-attrs-page {
	background-color: #f5f7fb;
	height: 100vh;
	display: flex;
	flex-direction: column;
}

.refresh-container {
	flex: 1;
	overflow: hidden;
}

.card-list {
	padding-bottom: 24px;
}

.attr-swipe-cell {
	margin-bottom: 12px;
}

.attr-card {
	background: #ffffff;
	border-radius: 16px;
	padding: 16px;
	margin-bottom: 12px;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
	transition: transform 0.2s ease;

	&:active {
		transform: scale(0.98);
		background-color: #fcfcfc;
	}

	&__header {
		display: flex;
		align-items: center;
		margin-bottom: 16px;
	}

	&__icon-box {
		width: 40px;
		height: 40px;
		background: #fff9e6;
		border-radius: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 12px;
	}

	&__icon {
		color: #ffcc00;
	}

	&__info {
		flex: 1;
	}

	&__title {
		font-size: 16px;
		font-weight: 600;
		color: #2c3e50;
		margin-bottom: 2px;
	}

	&__subtitle {
		font-size: 12px;
		color: #94a3b8;
	}

	&__tag {
		font-size: 11px;
	}

	&__body {
		background: #f8fafc;
		border-radius: 12px;
		padding: 12px;
		margin-bottom: 12px;
	}

	&__footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 13px;
		color: #64748b;
	}

	&__stock {
		display: flex;
		align-items: center;
		gap: 4px;
	}

	&__arrow {
		color: #cbd5e1;
	}
}

.attr-item {
	display: flex;
	justify-content: space-between;
	margin-bottom: 8px;
	font-size: 13px;

	&:last-child {
		margin-bottom: 0;
	}

	&__label {
		color: #64748b;
	}

	&__value {
		color: #1e293b;
		font-weight: 500;

		&.highlight {
			color: #1677ff;
			font-weight: 600;
		}
	}

	&.desc {
		border-top: 1px dashed #e2e8f0;
		padding-top: 8px;
		margin-top: 8px;
	}
}

.swipe-actions {
	height: 100%;
	display: flex;
	padding-left: 8px;
}

.delete-btn {
	height: 100%;
	border-radius: 0 16px 16px 0;
}

.skeleton-list {
	padding: 16px;
}

.skeleton-card {
	background: #fff;
	border-radius: 16px;
	padding: 16px;
	margin-bottom: 12px;
}
</style>
