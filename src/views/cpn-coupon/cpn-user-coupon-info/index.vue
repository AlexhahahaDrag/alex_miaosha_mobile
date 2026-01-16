<template>
	<form action="/">
		<van-search
			v-model="searchInfo.couponName"
			show-action
			placeholder="请输入消费券或用户名称"
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
						<van-cell :title-class="getTitleClass(item.status)">
							<template #title>
								<div class="title-container">
									<span>{{ getCellTitle(item) }}</span>
									<van-tag :type="item.status === 'USED' ? 'success' : 'default'">
										{{ formatStatus(item.status) }}
									</van-tag>
								</div>
							</template>
							<template #label>
								<div class="coupon-info">
									<div class="info-item">
										<span class="label">核销用户：</span>
										<span class="value">{{ item.userName || '--' }}</span>
									</div>
									<div class="info-item">
										<span class="label">核销数量：</span>
										<span class="value">{{ item.redemptionQuantity ?? 0 }}</span>
									</div>
								</div>
							</template>
							<template #right-icon>
								<div class="text-right">
									<div class="date-text">
										{{ formatDate(item.receiveTime) }}
									</div>
								</div>
							</template>
						</van-cell>
						<template #right>
							<van-button
								v-if="item.status === 'USED'"
								class="right_info"
								@click="onCancelRedeem(item)"
								square
								type="primary"
								text="取消核销"
							/>
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
import type { Dayjs } from 'dayjs';
import type { SearchInfo, CpnUserCouponInfoData } from './config';
import { pagination } from './config';
import type { PageInfo } from '@/views/common/config';
import { getCpnUserCouponInfoPage, cancelRedeemCpnUserCouponInfo } from '@/views/cpn-coupon/cpn-user-coupon-info/api';
import { useNavBar } from '@/composables/useNavBar';

const route = useRoute();

useNavBar({
	title: (route?.meta?.title as string) || '用户消费券核销',
	leftPath: '/',
	visible: true,
});

const loading = ref<boolean>(false);
const dataSource = ref<CpnUserCouponInfoData[]>([]);
const searchInfo = ref<SearchInfo>({});
const finished = ref<boolean>(false);
const isRefresh = ref<boolean>(false);

const getTitleClass = (status?: string) => {
	return status === 'USED' ? 'validClass' : 'notValidClass';
};

const getCellTitle = (item: CpnUserCouponInfoData) => {
	return item.couponName || '未命名消费券';
};

const formatStatus = (status?: string) => {
	if (!status) return '未知状态';
	if (status === 'USED') return '已核销';
	if (status === 'UNUSED') return '未核销';
	return status;
};

const formatDate = (date?: string | Dayjs | null): string => {
	if (!date) {
		return '--';
	}
	const dateStr = typeof date === 'string' ? date : date.toString();
	return dateStr.substring(0, 16);
};

const resetData = () => {
	dataSource.value = [];
	pagination.value.current = 1;
	pagination.value.pageSize = 10;
};

const getCpnUserCouponPageData = async (param: SearchInfo, cur: PageInfo) => {
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
		finished.value = pagination.value.total < ((pagination.value.current || 0) + 1) * (pagination.value.pageSize || 10);
	} else {
		showFailToast(message || '查询列表失败！');
	}
};

const onSearch = () => {
	pagination.value.current = 1;
	dataSource.value = [];
	onLoadMore();
};

const onCancel = () => {
	searchInfo.value.couponName = '';
	searchInfo.value.userName = '';
	resetData();
	getCpnUserCouponPageData(searchInfo.value, pagination.value);
};

const onRefreshData = () => {
	resetData();
	getCpnUserCouponPageData(searchInfo.value, pagination.value);
};

const onLoadMore = () => {
	pagination.value.current = (pagination.value.current || 0) + 1;
	getCpnUserCouponPageData(searchInfo.value, pagination.value);
};

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

.right_info {
	height: 100%;
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

.title-container {
	display: flex;
	align-items: center;
	gap: 8px;
}

.validClass {
	font-weight: bolder;
}

.notValidClass {
	color: gray;
}
</style>
