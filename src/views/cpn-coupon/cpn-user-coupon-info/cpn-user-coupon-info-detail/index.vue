<template>
	<div class="detail-page">
		<!-- 状态区域 -->
		<div class="status-section">
			<div
				class="status-icon"
				:class="statusIconClass"
			>
				<van-icon
					:name="statusIcon"
					size="32"
				/>
			</div>
			<div class="status-text">{{ statusText }}</div>
		</div>

		<!-- 商品卡片 -->
		<div class="product-card">
			<div class="product-image">
				<van-image
					round
					width="60"
					height="60"
					:src="detailInfo?.couponImage || defaultImage"
					fit="cover"
				/>
			</div>
			<div class="product-info">
				<div class="product-name">{{ detailInfo?.couponName || '未命名消费券' }}</div>
				<div class="product-price">
					<span class="price">¥{{ detailInfo?.unitValue || 0 }}</span>
					<van-tag type="primary">消费</van-tag>
				</div>
				<div class="product-id">ID: {{ detailInfo?.id || '--' }}</div>
			</div>
		</div>

		<!-- 核销详情 -->
		<div class="detail-card">
			<div class="card-title">核销详情</div>
			<div class="detail-item">
				<span class="label">核销时间</span>
				<span class="value">{{ formatTime(detailInfo?.operateTime, 'YYYY-MM-DD HH:mm') }}</span>
			</div>
			<div class="detail-item">
				<span class="label">核销用户</span>
				<span class="value">{{ detailInfo?.userName || '--' }}</span>
			</div>
			<div class="detail-item">
				<span class="label">核销数量</span>
				<span class="value">{{ detailInfo?.redemptionQuantity ?? 0 }}</span>
			</div>
			<div class="detail-item">
				<span class="label">支付状态</span>
				<van-tag
					:type="detailInfo?.paymentStatus === 1 ? 'primary' : 'default'"
					size="medium"
				>
					{{ detailInfo?.paymentStatus === 1 ? '已支付' : '未支付' }}
				</van-tag>
			</div>
			<div
				class="detail-item remarks"
				v-if="detailInfo?.remarks"
			>
				<span class="label">备注</span>
				<span class="value">{{ detailInfo.remarks }}</span>
			</div>
		</div>

		<!-- 操作记录 -->
		<div class="record-card">
			<div class="card-title">操作记录</div>
			<div class="timeline">
				<!-- 如果有操作记录列表，显示列表 -->
				<template v-if="detailInfo?.operationRecords?.length">
					<div
						v-for="(record, index) in detailInfo.operationRecords"
						:key="record.id || index"
						class="timeline-item"
					>
						<div
							class="timeline-dot"
							:class="getTimelineDotClass(record.action)"
						></div>
						<div class="timeline-content">
							<div class="timeline-title">
								{{ record.actionName || getActionName(record.action) }}
							</div>
							<div class="timeline-time">{{ formatTime(record.operateTime, 'YYYY-MM-DD HH:mm:ss') }}</div>
							<div
								class="timeline-operator"
								v-if="record.operatorName"
							>
								操作人：{{ record.operatorName }}
							</div>
						</div>
					</div>
				</template>
				<!-- 否则根据当前状态显示 -->
				<template v-else>
					<!-- 已取消状态：显示取消记录和核销记录 -->
					<template v-if="isCancelled">
						<div class="timeline-item">
							<div class="timeline-dot dot-cancelled"></div>
							<div class="timeline-content">
								<div class="timeline-title">已取消核销</div>
								<div class="timeline-time">{{
									formatTime(detailInfo?.cancelTime || detailInfo?.operateTime, 'YYYY-MM-DD HH:mm:ss')
								}}</div>
								<div
									class="timeline-operator"
									v-if="detailInfo?.cancelOperatorName"
								>
									操作人：{{ detailInfo.cancelOperatorName }}
								</div>
							</div>
						</div>
						<div class="timeline-item">
							<div class="timeline-dot dot-used"></div>
							<div class="timeline-content">
								<div class="timeline-title">已核销</div>
								<div class="timeline-time">{{ formatTime(detailInfo?.receiveTime, 'YYYY-MM-DD HH:mm:ss') }}</div>
							</div>
						</div>
					</template>
					<!-- 已核销状态：只显示核销记录 -->
					<template v-else>
						<div class="timeline-item">
							<div class="timeline-dot dot-used"></div>
							<div class="timeline-content">
								<div class="timeline-title">已核销</div>
								<div class="timeline-time">{{ formatTime(detailInfo?.operateTime, 'YYYY-MM-DD HH:mm:ss') }}</div>
							</div>
						</div>
					</template>
				</template>
			</div>
		</div>

		<!-- 底部按钮 - 仅已核销状态显示 -->
		<div
			class="bottom-action"
			v-if="detailInfo?.status === 'USED'"
		>
			<van-button
				round
				block
				plain
				type="primary"
				:loading="cancelLoading"
				@click="onCancelRedeem"
			>
				取消核销
			</van-button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { showSuccessToast, showFailToast, showConfirmDialog } from 'vant';
import type { CpnUserCouponInfoData } from '../config';
import { getCpnUserCouponInfoDetail, cancelRedeemCpnUserCouponInfo } from '../api';
import { formatTime } from '@/utils/dayjs';
import { useNavBar } from '@/composables/useNavBar';
import { useTabBar } from '@/composables/useTabBar';
import { getRoutePathByName } from '@/utils/router';

const route = useRoute();
const router = useRouter();

// 获取返回路径
const getLeftPath = computed(() => {
	return getRoutePathByName(router, 'cpnUserCouponInfo', '/selfFinance/cpnUserCouponInfo');
});

// 导航栏配置
useNavBar({
	title: '核销记录详情',
	leftPath: getLeftPath.value,
	visible: true,
});

// TabBar配置
useTabBar({
	visible: false,
});

// 默认图片
const defaultImage =
	'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjNGE5MGQyIiByeD0iOCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjI0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuKYlTwvdGV4dD48L3N2Zz4=';

// 详情数据
const detailInfo = ref<CpnUserCouponInfoData | null>(null);
const loading = ref<boolean>(false);
const cancelLoading = ref<boolean>(false);

// 是否已取消状态
const isCancelled = computed(() => {
	return detailInfo.value?.status === 'CANCELLED' || detailInfo.value?.status === 'UNUSED';
});

// 状态图标
const statusIcon = computed(() => {
	if (detailInfo.value?.status === 'USED') return 'checked';
	if (isCancelled.value) return 'close';
	return 'info-o';
});

// 状态图标样式
const statusIconClass = computed(() => {
	if (detailInfo.value?.status === 'USED') return 'icon-success';
	if (isCancelled.value) return 'icon-cancelled';
	return 'icon-default';
});

// 状态文本
const statusText = computed(() => {
	if (detailInfo.value?.status === 'USED') return '已核销';
	if (isCancelled.value) return '已取消';
	return '未知状态';
});

// 获取操作名称
const getActionName = (action?: string): string => {
	const actionMap: Record<string, string> = {
		REDEEM: '已核销',
		CANCEL: '已取消核销',
		USED: '已核销',
		CANCELLED: '已取消核销',
		UNUSED: '已取消核销',
	};
	return actionMap[action || ''] || action || '未知操作';
};

// 获取时间线点样式
const getTimelineDotClass = (action?: string): string => {
	if (action === 'CANCEL' || action === 'CANCELLED' || action === 'UNUSED') {
		return 'dot-cancelled';
	}
	return 'dot-used';
};

// 获取详情
const getDetail = async () => {
	const id = route?.query?.id as string;
	if (!id) {
		showFailToast('缺少记录ID');
		router.push({ path: getLeftPath.value });
		return;
	}

	loading.value = true;
	try {
		const { code, data, message } = await getCpnUserCouponInfoDetail(id);
		if (code === '200') {
			detailInfo.value = data || null;
		} else {
			showFailToast(message || '获取详情失败');
		}
	} catch {
		showFailToast('获取详情失败');
	} finally {
		loading.value = false;
	}
};

// 取消核销
const onCancelRedeem = async () => {
	if (!detailInfo.value?.id || !detailInfo.value?.userId || !detailInfo.value?.couponId) {
		showFailToast('缺少必要参数');
		return;
	}

	try {
		await showConfirmDialog({
			title: '确认取消核销',
			message: '确定要取消本次核销吗？取消后将恢复消费券数量。',
		});
	} catch {
		return;
	}

	cancelLoading.value = true;
	try {
		const { code, message } = await cancelRedeemCpnUserCouponInfo({
			userId: detailInfo.value.userId,
			couponId: detailInfo.value.couponId,
			userCouponId: detailInfo.value.id,
			redemptionQuantity: detailInfo.value.redemptionQuantity,
			remarks: '取消核销',
		});
		if (code === '200') {
			showSuccessToast(message || '取消核销成功');
			router.push({ path: getLeftPath.value });
		} else {
			showFailToast(message || '取消核销失败');
		}
	} catch {
		showFailToast('取消核销失败');
	} finally {
		cancelLoading.value = false;
	}
};

onMounted(() => {
	getDetail();
});
</script>

<style lang="less" scoped>
.detail-page {
	min-height: 100vh;
	background: #f5f6f7;
	padding: 16px;
	padding-bottom: 100px;
}

.status-section {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 32px 0;
	background: #fff;
	border-radius: 12px;
	margin-bottom: 12px;

	.status-icon {
		width: 64px;
		height: 64px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 12px;

		&.icon-success {
			background: #e8f8ef;
			color: #07c160;
		}

		&.icon-cancelled {
			background: #f5f5f5;
			color: #999;
		}

		&.icon-default {
			background: #e8f4ff;
			color: #1989fa;
		}
	}

	.status-text {
		font-size: 18px;
		font-weight: 600;
		color: #333;
	}
}

.product-card {
	display: flex;
	align-items: center;
	padding: 16px;
	background: #fff;
	border-radius: 12px;
	margin-bottom: 12px;

	.product-image {
		flex-shrink: 0;
		margin-right: 12px;
	}

	.product-info {
		flex: 1;
		min-width: 0;

		.product-name {
			font-size: 16px;
			font-weight: 600;
			color: #333;
			margin-bottom: 6px;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}

		.product-price {
			display: flex;
			align-items: center;
			gap: 8px;
			margin-bottom: 4px;

			.price {
				font-size: 18px;
				font-weight: 600;
				color: #1989fa;
			}
		}

		.product-id {
			font-size: 12px;
			color: #999;
		}
	}
}

.detail-card,
.record-card {
	background: #fff;
	border-radius: 12px;
	padding: 16px;
	margin-bottom: 12px;

	.card-title {
		font-size: 16px;
		font-weight: 600;
		color: #333;
		margin-bottom: 16px;
		padding-bottom: 12px;
		border-bottom: 1px solid #f0f0f0;
	}
}

.detail-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 12px 0;
	border-bottom: 1px solid #f8f8f8;

	&:last-child {
		border-bottom: none;
	}

	&.remarks {
		flex-direction: column;
		align-items: flex-start;

		.label {
			margin-bottom: 8px;
		}

		.value {
			color: #666;
			line-height: 1.6;
		}
	}

	.label {
		font-size: 14px;
		color: #999;
	}

	.value {
		font-size: 14px;
		color: #333;
		font-weight: 500;
	}
}

.timeline {
	.timeline-item {
		display: flex;
		position: relative;
		padding-left: 20px;
		padding-bottom: 16px;

		&::before {
			content: '';
			position: absolute;
			left: 5px;
			top: 16px;
			bottom: 0;
			width: 1px;
			background: #e8e8e8;
		}

		&:last-child {
			padding-bottom: 0;

			&::before {
				display: none;
			}
		}
	}

	.timeline-dot {
		position: absolute;
		left: 0;
		top: 4px;
		width: 12px;
		height: 12px;
		border-radius: 50%;

		&.dot-used {
			background: #1989fa;
		}

		&.dot-cancelled {
			background: #ee0a24;
		}
	}

	.timeline-content {
		.timeline-title {
			font-size: 14px;
			color: #333;
			font-weight: 500;
			margin-bottom: 4px;
		}

		.timeline-time {
			font-size: 12px;
			color: #999;
			margin-bottom: 2px;
		}

		.timeline-operator {
			font-size: 12px;
			color: #666;
		}
	}
}

.bottom-action {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	padding: 16px;
	background: #fff;
	box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);

	:deep(.van-button) {
		height: 48px;
		font-size: 16px;
	}
}
</style>
