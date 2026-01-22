<template>
	<div class="record-page">
		<!-- 搜索栏 -->
		<van-search
			v-model="searchInfo.couponName"
			placeholder="搜索卡券名称..."
			@search="onSearch"
			@clear="onCancel"
			class="search-bar"
		/>

		<!-- 状态筛选标签 -->
		<div class="filter-tabs">
			<div
				v-for="option in statusOptions"
				:key="option.value"
				class="filter-tab"
				:class="{ active: isFilterActive(option.value) }"
				@click="onFilterChange(option.value)"
			>
				{{ option.text }}
			</div>
		</div>

		<!-- 下拉刷新容器 -->
		<van-pull-refresh
			v-model="isRefresh"
			@refresh="onRefreshData"
			class="refresh-container"
		>
			<div class="list-container">
				<van-empty
					v-if="!loading && !dataSource?.length"
					description="暂无数据"
				/>
				<van-list
					v-else
					v-model:loading="loading"
					:finished="finished"
					:immediate-check="false"
					finished-text="没有更多了"
					@load="onLoadMore"
					class="record-list"
				>
					<van-swipe-cell
						v-for="item in dataSource"
						:key="item.id"
						class="record-item"
					>
						<div
							class="record-card"
							@click="onViewDetail(item.id)"
						>
							<!-- 右上角状态标签 -->
							<van-tag
								:type="getStatusType(item.status)"
								round
								class="status-tag"
							>
								{{ formatStatus(item.status) }}
							</van-tag>

							<!-- 左侧图标 -->
							<div class="card-icon">
								<div
									class="icon-wrapper"
									:class="getIconClass(item.status)"
								>
									<van-icon
										:name="getIconName(item.status)"
										size="24"
									/>
								</div>
							</div>

							<!-- 内容区域 -->
							<div class="card-content">
								<div class="card-title">{{ item.couponName || '未命名消费券' }}</div>
								<div class="card-time">{{ getFormatTimeInfo(item.operateTime) }}</div>
								<div class="card-id">ID: {{ item.id || '--' }}</div>
							</div>
						</div>

						<template #right>
							<div
								v-if="item.status === 'USED'"
								class="cancel-btn"
								@click="onCancelRedeem(item)"
							>
								<div class="cancel-icon">
									<van-icon
										name="cross"
										size="12"
										color="#ee0a24"
									/>
								</div>
								<span class="cancel-text">取消核销</span>
							</div>
						</template>
					</van-swipe-cell>
				</van-list>
			</div>
		</van-pull-refresh>
		<van-back-top />
	</div>
</template>

<script lang="ts" setup>
import { showSuccessToast, showFailToast, showConfirmDialog } from 'vant';
import type { CpnUserCouponInfoData } from './config';
import { pagination, statusOptions } from './config';
import type { PageInfo } from '@/views/common/config';
import { getFormatTimeInfo } from '@/utils/dayjs';
import { getCpnUserCouponInfoPage, cancelRedeemCpnUserCouponInfo } from '@/views/cpn-coupon/cpn-user-coupon-info/api';
import { getRoutePathByName } from '@/utils/router';
import { useNavBar } from '@/composables/useNavBar';
import { useTabBar } from '@/composables/useTabBar';

const route = useRoute();
const router = useRouter();

useNavBar({
	title: (route?.meta?.title as string) || '核销记录',
	leftPath: '/',
	visible: true,
});

// TabBar配置
useTabBar({
	visible: true,
	data: [
		{ name: 'dashboard', title: '首页', icon: 'homepage' },
		{ name: 'cpnCouponInfo', title: '消费券', icon: 'cpnCouponInfo' },
		{ name: 'cpnUserCouponInfo', title: '核销记录', icon: 'cpnUserCouponInfo' },
		{ name: 'myself', title: '个人', icon: 'user' },
	],
	active: 2,
});

const loading = ref<boolean>(false);
const dataSource = ref<CpnUserCouponInfoData[]>([]);
const searchInfo = ref<CpnUserCouponInfoData>({
	status: null,
});
const finished = ref<boolean>(false);
const isRefresh = ref<boolean>(false);

// 获取图标样式类
const getIconClass = (status?: string | null) => {
	if (status === 'USED') return 'icon-used';
	if (status === 'CANCELLED') return 'icon-cancelled';
	return 'icon-default';
};

// 获取图标名称
const getIconName = (status?: string | null) => {
	if (status === 'USED') return 'certificate';
	if (status === 'CANCELLED') return 'close';
	return 'coupon-o';
};

// 获取状态标签类型
const getStatusType = (status?: string | null) => {
	if (status === 'USED') return 'primary';
	if (status === 'CANCELLED') return 'default';
	return 'default';
};

// 格式化状态
const formatStatus = (status?: string | null) => {
	if (!status) return '未知';
	if (status === 'USED') return '已核销';
	if (status === 'CANCELLED') return '已取消';
	if (status === 'UNUSED') return '已取消';
	return status;
};

// 判断筛选选项是否选中
const isFilterActive = (value: string): boolean => {
	const currentStatus = searchInfo.value.status;
	// 当 status 为空/null 时，"全部"(ALL) 选中
	if (value === 'ALL') {
		return !currentStatus || currentStatus === 'ALL';
	}
	return currentStatus === value;
};

// 查看详情
const onViewDetail = (id?: string) => {
	if (!id) return;
	const path = getRoutePathByName(router, 'cpnUserCouponInfoDetail');
	router.push({
		path,
		query: { id },
	});
};

// 筛选变更
const onFilterChange = (value: string) => {
	searchInfo.value.status = value == 'ALL' ? null : value;
	resetData();
	getCpnUserCouponPageData(searchInfo.value, pagination.value);
};

// 重置数据
const resetData = () => {
	dataSource.value = [];
	pagination.value.current = 1;
	pagination.value.pageSize = 10;
};

// 获取数据
const getCpnUserCouponPageData = async (param: CpnUserCouponInfoData, cur: PageInfo) => {
	loading.value = true;
	const { code, data, message } = await getCpnUserCouponInfoPage(param, cur?.current || 1, cur?.pageSize || 10)
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
		finished.value = pagination.value.total <= (pagination.value.current || 1) * (pagination.value.pageSize || 10);
	} else {
		showFailToast(message || '查询列表失败！');
	}
};

// 搜索
const onSearch = () => {
	resetData();
	getCpnUserCouponPageData(searchInfo.value, pagination.value);
};

// 取消搜索
const onCancel = () => {
	searchInfo.value.couponName = '';
	resetData();
	getCpnUserCouponPageData(searchInfo.value, pagination.value);
};

// 下拉刷新
const onRefreshData = () => {
	resetData();
	getCpnUserCouponPageData(searchInfo.value, pagination.value);
};

// 加载更多
const onLoadMore = () => {
	pagination.value.current = (pagination.value.current || 0) + 1;
	getCpnUserCouponPageData(searchInfo.value, pagination.value);
};

// 取消核销
const onCancelRedeem = async (item: CpnUserCouponInfoData) => {
	if (!item.id || !item.userId || !item.couponId) {
		showFailToast('缺少必要参数，无法取消核销');
		return;
	}
	try {
		await showConfirmDialog({
			title: '确认取消核销',
			message: '确定要取消本次核销吗？',
		});
	} catch {
		return;
	}
	const { code, message } = await cancelRedeemCpnUserCouponInfo({
		userId: item.userId,
		couponId: item.couponId,
		userCouponId: item.id,
		redemptionQuantity: item.redemptionQuantity,
		remarks: '取消核销',
	});
	if (code === '200') {
		showSuccessToast(message || '取消核销成功！');
		onRefreshData();
	} else {
		showFailToast(message || '取消核销失败，请联系管理员！');
	}
};

onMounted(() => {
	resetData();
	getCpnUserCouponPageData(searchInfo.value, pagination.value);
});
</script>

<style lang="less" scoped>
.record-page {
	height: 100%;
	display: flex;
	flex-direction: column;
	background-color: #f5f6f7;
}

.search-bar {
	background: #fff;

	:deep(.van-search__content) {
		background-color: #f5f6f7;
		border-radius: 20px;
	}
}

.filter-tabs {
	display: flex;
	gap: 12px;
	padding: 12px 16px;
	background: #fff;
	border-bottom: 1px solid #f0f0f0;
}

.filter-tab {
	padding: 6px 16px;
	font-size: 14px;
	color: #666;
	background: #f5f6f7;
	border-radius: 20px;
	border: 1px solid transparent;
	transition: all 0.2s;

	&.active {
		color: #1989fa;
		background: #e8f4ff;
		border-color: #1989fa;
	}
}

.refresh-container {
	flex: 1;
	overflow-y: auto;
}

.list-container {
	padding: 12px 16px;
	min-height: 100%;
}

.record-list {
	display: flex;
	flex-direction: column;
	gap: 12px;
}

.record-item {
	margin-bottom: 12px;
}

.record-card {
	display: flex;
	align-items: center;
	padding: 16px;
	background: #fff;
	border-radius: 12px;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
	position: relative;

	.status-tag {
		position: absolute;
		top: 12px;
		right: 12px;
		padding: 4px 12px;
		font-size: 12px;
	}
}

.card-icon {
	flex-shrink: 0;
	margin-right: 12px;

	.icon-wrapper {
		width: 48px;
		height: 48px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 10px;
		color: #fff;

		&.icon-used {
			background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		}

		&.icon-cancelled {
			background: linear-gradient(135deg, #a8a8a8 0%, #888 100%);
		}

		&.icon-default {
			background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
		}
	}
}

.card-content {
	flex: 1;
	min-width: 0;

	.card-title {
		font-size: 16px;
		font-weight: 600;
		color: #333;
		margin-bottom: 4px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.card-time {
		font-size: 13px;
		color: #666;
		margin-bottom: 2px;
	}

	.card-id {
		font-size: 12px;
		color: #999;
	}
}

:deep(.van-swipe-cell__right) {
	display: flex;
	height: 100%;
}

.cancel-btn {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	width: 80px;
	height: 100%;
	background: #ee0a24;
	border: none;
	border-radius: 0 12px 12px 0;
	cursor: pointer;
	gap: 6px;

	.cancel-icon {
		width: 20px;
		height: 20px;
		background: #fff;
		border-radius: 50%;
		position: relative;

		:deep(.van-icon) {
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			line-height: 1;
		}
	}

	.cancel-text {
		font-size: 12px;
		color: #fff;
		white-space: nowrap;
	}
}

:deep(.van-empty) {
	padding-top: 100px;
}

:deep(.van-list__finished-text) {
	padding: 16px 0;
}
</style>
