<template>
	<div class="coupon-page">
		<!-- 搜索栏 -->
		<van-search
			v-model="searchInfo.couponName"
			placeholder="搜索优惠券"
			@search="onSearch"
			@clear="onCancel"
		/>

		<!-- 下拉刷新容器 -->
		<van-pull-refresh
			v-model="isRefresh"
			@refresh="onRefreshData"
			class="refresh-container"
		>
			<div class="content-wrapper">
				<div class="section-header">
					<span class="section-title">可用优惠券</span>
					<span
						class="view-all"
						@click="onViewAll"
					>
						查看全部
					</span>
				</div>

				<!-- 空状态 -->
				<van-empty
					v-if="!dataSource?.length"
					description="暂无数据"
				/>

				<!-- 优惠券列表 -->
				<van-list
					v-else
					v-model:loading="loading"
					:finished="finished"
					:immediate-check="false"
					finished-text="没有更多了"
					@load="onLoadMore"
					class="coupon-list"
				>
					<van-swipe-cell
						v-for="(item, index) in dataSource"
						:key="item.id"
					>
						<div
							class="coupon-card"
							:class="getBorderColorClass(index)"
							@click="onCardClick(item.id)"
						>
							<!-- 左侧图标 -->
							<div class="coupon-icon">
								<img
									:src="getCouponImage(index)"
									alt="coupon"
								/>
							</div>

							<!-- 中间内容 -->
							<div class="coupon-content">
								<div class="coupon-name">{{ item.couponName || '未命名消费券' }}</div>
								<div class="coupon-validity">{{ getValidityText(item) }}</div>
								<div class="coupon-price">¥ {{ item.unitValue?.toFixed(2) || '0.00' }}</div>
							</div>

							<!-- 右侧进度 -->
							<div class="coupon-progress">
								<van-circle
									v-model:current-rate="item.currentRate"
									:rate="getProgressRate(item)"
									:speed="100"
									:text="getProgressText(item)"
									:color="getProgressColor(index)"
									:stroke-width="60"
									size="50px"
								/>
								<div class="remaining-text">剩余数量</div>
							</div>
						</div>
						<template #right>
							<van-button
								v-if="item.remainingQuantity && item.remainingQuantity > 0"
								class="redeem-button"
								@click="onRedeem(item.id)"
								square
								type="primary"
								text="核销"
							/>
							<van-button
								class="delete-button"
								@click="onDeleteCpnCouponInfo(item.id)"
								square
								type="danger"
								text="删除"
							/>
						</template>
					</van-swipe-cell>
				</van-list>
			</div>
		</van-pull-refresh>
		<van-back-top />
	</div>
</template>
<script lang="ts" setup>
import { showFailToast, showSuccessToast, showConfirmDialog } from 'vant';
import type { SearchInfo, CpnCouponInfoData } from './config';
import { pagination } from './config';
import type { PageInfo } from '@/views/common/config';
import { getRoutePathByName } from '@/utils/router';
import { formatDate } from '@/utils/dayjs';
import { getCpnCouponInfoPage, deleteCpnCouponInfo } from '@/views/cpn-coupon/cpn-coupon-info/api';
import { useNavBar } from '@/composables/useNavBar';
import { useTabBar } from '@/composables/useTabBar';

const router = useRouter();
const route = useRoute();

// 导航栏配置
useNavBar({
	title: (route?.meta?.title as string) || '消费券管理',
	rightButton: '新增',
	leftPath: '/',
	visible: true,
	onRightClick: () => {
		const path = getRoutePathByName(router, 'cpnCouponInfoDetail', '/selfFinance/cpnCouponInfo/cpnCouponInfoDetail');
		router.push({ path });
	},
});

// TabBar配置
useTabBar({
	visible: true,
	data: [
		{ name: 'dashboard', title: '首页', icon: 'homepage' },
		{ name: 'cpnCouponInfo', title: '消费券', icon: 'cpnCouponInfo' },
		{ name: 'cpnUserCouponInfo', title: '记录', icon: 'cpnUserCouponInfo' },
		{ name: 'myself', title: '个人', icon: 'user' },
	],
	active: 1,
});

// 响应式数据
const loading = ref<boolean>(false);
const dataSource = ref<CpnCouponInfoData[]>([]);
const searchInfo = ref<SearchInfo>({
	onlyValidAndNotFullyRedeemed: true,
});
const finished = ref<boolean>(false);
const isRefresh = ref<boolean>(false);

// 卡片边框颜色类（循环使用）
const getBorderColorClass = (index: number) => {
	const colors = ['border-green', 'border-orange', 'border-blue', 'border-red'];
	return colors[index % colors.length];
};

// 获取优惠券图片（使用占位图）
const getCouponImage = (index: number) => {
	const images = [
		'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjN2NiMzQyIiByeD0iOCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjI0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuKYlTwvdGV4dD48L3N2Zz4=',
		'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjZmY5ODAwIiByeD0iOCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjI0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuKYljwvdGV4dD48L3N2Zz4=',
		'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjNTY5ZGZmIiByeD0iOCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjI0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuKYhTwvdGV4dD48L3N2Zz4=',
		'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjZmY0NTU3IiByeD0iOCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjI0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuKYhjwvdGV4dD48L3N2Zz4=',
	];
	return images[index % images.length];
};

// 获取有效期文本
const getValidityText = (item: CpnCouponInfoData) => {
	if (!item.endDate) return '无限期';
	const endDate = formatDate(item.endDate);
	const today = new Date();
	const end = new Date(item.endDate.toString());
	const daysLeft = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

	if (daysLeft < 0) return '已过期';
	if (daysLeft === 0) return '今天到期';
	if (daysLeft <= 3) return `${daysLeft}天后到期`;
	if (daysLeft <= 30) return `有效期至${endDate.slice(5)}`;
	return `有效期至${endDate.slice(5)}`;
};

// 获取进度百分比（剩余数量占总数的百分比）
const getProgressRate = (item: CpnCouponInfoData): number => {
	if (!item.totalQuantity) return 0;
	if (!item.remainingQuantity) return 0;
	return (item.remainingQuantity / item.totalQuantity) * 100;
};

// 获取进度文本
const getProgressText = (item: CpnCouponInfoData) => {
	return `${item.remainingQuantity || 0}/${item.totalQuantity || 0}`;
};

// 获取进度颜色
const getProgressColor = (index: number) => {
	const colors = ['#07c160', '#ff9800', '#1989fa', '#ff4557'];
	return colors[index % colors.length];
};

// 点击卡片 - 跳转到详情页
const onCardClick = (id?: string) => {
	if (!id) return;
	const path = getRoutePathByName(router, 'cpnCouponInfoDetail', '/selfFinance/cpnCouponInfo/cpnCouponInfoDetail');
	router.push({
		path,
		query: { id },
	});
};

// 查看全部
const onViewAll = () => {
	// 可以跳转到完整列表页或执行其他操作
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
		data?.records?.forEach((item: CpnCouponInfoData) => {
			item.currentRate = 0;
		});
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
const onRedeem = (id?: string) => {
	if (!id) {
		return;
	}
	const path = getRoutePathByName(router, 'cpnCouponInfoRedeem', '/selfFinance/cpnCouponInfo/redeem');
	router.push({
		path,
		query: { couponId: id },
	});
};

// 删除消费券
const onDeleteCpnCouponInfo = async (id?: string) => {
	if (!id) {
		return;
	}
	try {
		await showConfirmDialog({
			title: '确认删除',
			message: '确认要删除该优惠券吗？',
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
.coupon-page {
	height: 100%;
	display: flex;
	flex-direction: column;
	background-color: #f7f8fa;
}

.refresh-container {
	flex: 1;
	overflow-y: auto;
}

.content-wrapper {
	padding: 12px 16px;
}

.section-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 16px;
	padding: 0 4px;

	.section-title {
		font-size: 18px;
		font-weight: 600;
		color: #323233;
	}

	.view-all {
		font-size: 14px;
		color: #1989fa;
		cursor: pointer;
	}
}

.coupon-list {
	display: flex;
	flex-direction: column;
	gap: 12px;
}

.coupon-card {
	background: #fff;
	border-radius: 12px;
	padding: 16px;
	display: flex;
	align-items: center;
	gap: 12px;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
	position: relative;
	cursor: pointer;
	transition:
		transform 0.2s,
		box-shadow 0.2s;
	border-left: 4px solid;

	&:active {
		transform: scale(0.98);
	}

	&.border-green {
		border-left-color: #07c160;
	}

	&.border-orange {
		border-left-color: #ff9800;
	}

	&.border-blue {
		border-left-color: #1989fa;
	}

	&.border-red {
		border-left-color: #ff4557;
	}
}

.coupon-icon {
	flex-shrink: 0;
	width: 60px;
	height: 60px;
	border-radius: 8px;
	overflow: hidden;

	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
}

.coupon-content {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 4px;
	min-width: 0;

	.coupon-name {
		font-size: 16px;
		font-weight: 600;
		color: #323233;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.coupon-validity {
		font-size: 12px;
		color: #969799;
	}

	.coupon-price {
		font-size: 18px;
		font-weight: 600;
		color: #1989fa;
		margin-top: 2px;
	}
}

.coupon-progress {
	flex-shrink: 0;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 4px;

	.remaining-text {
		font-size: 10px;
		color: #969799;
		text-align: center;
	}
}

:deep(.van-circle__text) {
	font-size: 12px;
	font-weight: 600;
}

:deep(.van-swipe-cell__right) {
	display: flex;
	height: 100%;
}

.redeem-button {
	width: 65px;
	height: 100%;
	border: none;
}

.delete-button {
	width: 65px;
	height: 100%;
	border: none;
	border-top-right-radius: 12px;
	border-bottom-right-radius: 12px;
}

// 如果只有删除按钮时占满高度和位置
.van-swipe-cell__right .delete-button:only-child {
	width: 65px;
}
</style>
