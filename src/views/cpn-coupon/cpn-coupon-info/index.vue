<template>
	<form action="/">
		<van-search
			v-model="searchInfo.couponName"
			show-action
			placeholder="请输入消费券名称"
			@search="onSearch"
			@cancel="onCancel"
			action-text="清空"
		/>
	</form>
	<van-divider class="divider-style" />
	<van-pull-refresh
		pulling-text="加载中。。。"
		class="refresh-info"
		v-model="isRefresh"
		@refresh="onRefreshData"
		ref="pullRefresh"
		:immediate-check="false"
	>
		<div class="list-container">
			<van-empty
				v-if="!dataSource?.length"
				description="暂无数据"
			/>
			<van-list
				v-else
				v-model:loading="loading"
				:finished="finished"
				:immediate-check="false"
				finished-text="没有更多了"
				@load="onLoadMore"
			>
				<van-cell-group>
					<van-swipe-cell
						v-for="item in dataSource"
						:key="item.id"
					>
						<van-cell
							:title-class="getTitleClass(item.remainingQuantity)"
							is-link
							:to="getDetailRoute(item.id)"
						>
							<template #title>
								<div class="title-container">
									<span>{{ item.couponName || '未命名消费券' }}</span>
									<van-tag
										v-if="item.expireStatus"
										:style="{
											color: getExpireStatusColor(item.expireRangeStatus),
											borderColor: getExpireStatusColor(item.expireRangeStatus),
										}"
										plain
									>
										{{ item.expireStatus }}
									</van-tag>
									<van-tag :type="item.paymentStatus === 1 ? 'success' : 'default'">
										{{ item.paymentStatus === 1 ? '已支付' : '未支付' }}
									</van-tag>
								</div>
							</template>
							<template #label>
								<div class="coupon-info">
									<div class="info-item">
										<span class="label">面值：</span>
										<span class="value">{{ item.unitValue ? '￥' + item.unitValue : '--' }}</span>
									</div>
								</div>
							</template>
							<template #right-icon>
								<div class="text-right">
									<div class="date-text">
										{{ formatDate(item.endDate) }}
									</div>
									<div class="info-item">
										<span class="label">剩余数量：</span>
										<span class="value">{{ item.remainingQuantity ?? 0 }}</span>
									</div>
								</div>
							</template>
						</van-cell>
						<template #right>
							<div class="right-buttons">
								<van-button
									v-if="item.remainingQuantity && item.remainingQuantity > 0"
									class="right_info redeem-btn"
									@click="onRedeem(item.id)"
									square
									type="primary"
									text="核销"
								/>
								<van-button
									class="right_info"
									@click="onDeleteCpnCouponInfo(item.id)"
									square
									type="danger"
									text="删除"
								/>
							</div>
						</template>
						<van-divider class="item-divider-style" />
					</van-swipe-cell>
				</van-cell-group>
			</van-list>
		</div>
	</van-pull-refresh>
	<van-back-top />
</template>
<script lang="ts" setup>
import { showSuccessToast, showFailToast, showConfirmDialog } from 'vant';
import type { SearchInfo, CpnCouponInfoData } from './config';
import { pagination } from './config';
import type { PageInfo } from '@/views/common/config';
import { getRoutePathByName } from '@/utils/router';
import { formatDate } from '@/utils/dayjs';
import { getCpnCouponInfoPage, deleteCpnCouponInfo } from '@/views/cpn-coupon/cpn-coupon-info/api';
import { useNavBar } from '@/composables/useNavBar';

const router = useRouter();
const route = useRoute();

// 通过路由解析获取详情页路径，使用公共工具方法
const getDetailRoutePath = () => {
	return getRoutePathByName(router, 'cpnCouponInfoDetail', '/selfFinance/cpnCouponInfo/cpnCouponInfoDetail');
};

// 获取详情页路由配置
const getDetailRoute = (id?: number) => {
	const path = getDetailRoutePath();
	return {
		path,
		query: { id },
	};
};

// 获取核销页路径
const getRedeemRoutePath = () => {
	return getRoutePathByName(router, 'cpnCouponInfoRedeem', '/selfFinance/cpnCouponInfo/redeem');
};

// 导航栏配置
useNavBar({
	title: (route?.meta?.title as string) || '消费券管理',
	rightButton: '新增',
	leftPath: '/',
	visible: true,
	onRightClick: () => {
		const path = getDetailRoutePath();
		router.push({ path });
	},
});

// 响应式数据
const loading = ref<boolean>(false);
const dataSource = ref<CpnCouponInfoData[]>([]);
const searchInfo = ref<SearchInfo>({
	onlyValidAndNotFullyRedeemed: true,
});
const finished = ref<boolean>(false);
const isRefresh = ref<boolean>(false);

// 计算属性和工具函数
const getTitleClass = (remainingQuantity?: number) => {
	return remainingQuantity && remainingQuantity > 0 ? 'validClass' : 'notValidClass';
};

// 获取过期状态颜色
const getExpireStatusColor = (status: number | undefined): string => {
	if (status === undefined) return '#333';
	switch (status) {
		case 0:
			return 'red';
		case 1:
			return 'green';
		case 2:
			return 'orange';
		default:
			return '#333';
	}
};

// 统一重置数据函数
const resetData = () => {
	dataSource.value = [];
	pagination.value.current = 1;
	pagination.value.pageSize = 10;
};

// 获取消费券数据
const getCpnCouponInfoPageData = async (param: SearchInfo, cur: PageInfo) => {
	loading.value = true;
	const { code, data, message } = await getCpnCouponInfoPage(param, cur?.current || 1, cur?.pageSize || 10)
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
	searchInfo.value.couponName = '';
	searchInfo.value.onlyValidAndNotFullyRedeemed = true;
	resetData();
	getCpnCouponInfoPageData(searchInfo.value, pagination.value);
};

// 下拉刷新
const onRefreshData = () => {
	resetData();
	getCpnCouponInfoPageData(searchInfo.value, pagination.value);
};

// 加载更多
const onLoadMore = () => {
	pagination.value.current = (pagination.value.current || 0) + 1;
	getCpnCouponInfoPageData(searchInfo.value, pagination.value);
};

// 核销消费券
const onRedeem = (id?: number) => {
	if (!id) {
		return;
	}
	const path = getRedeemRoutePath();
	router.push({
		path,
		query: { couponId: id },
	});
};

// 删除消费券
const onDeleteCpnCouponInfo = async (id?: number) => {
	if (!id) {
		return;
	}
	try {
		await showConfirmDialog({
			title: '确认删除',
			message: '确定要删除该消费券吗？',
		});
	} catch {
		return;
	}
	const { code, message } = await deleteCpnCouponInfo(String(id));
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
	getCpnCouponInfoPageData(searchInfo.value, pagination.value);
});
</script>

<style lang="less" scoped>
.refresh-info {
	height: calc(100% - 64px);
}

.list-container {
	height: 100%;
	overflow-y: auto;
}

.divider-style {
	color: #1989fa;
	border-color: grey;
	margin: 0 0 10px 0;
}

.item-divider-style {
	color: #1989fa;
	border-color: grey;
	padding: 0 16px;
	margin-top: 0;
	margin-bottom: 0;
}

.right-buttons {
	height: 100%;
	display: flex;
	flex-direction: column;
}

.right_info {
	flex: 1;
}

.redeem-btn {
	margin-bottom: 2px;
}

.text-right {
	display: flex;
	flex-direction: column;
	align-items: flex-end;
}

.date-text {
	width: 130px;
	text-align: right;
	font-size: 12px;
	color: #666;
}

.coupon-info {
	margin-top: 10px;
	.info-item {
		margin-bottom: 4px;
		.label {
			color: #666;
			font-size: 12px;
		}
		.value {
			color: #333;
			font-size: 12px;
			font-weight: 500;
		}
	}
}

.rightDiv {
	margin-top: 10px;
	text-align: right;
	font-size: 12px;
	color: #333;
}

.title-container {
	display: flex;
	align-items: center;
	gap: 8px;
	flex-wrap: wrap;
}

.validClass {
	font-weight: bolder;
}

.notValidClass {
	color: gray;
}
</style>
