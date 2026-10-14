<template>
	<div class="card-item">
		<van-swipe-cell>
			<div
				class="coupon-card"
				@click="emit('click', item.id)"
			>
				<!-- 左侧大圆角图标 -->
				<div class="coupon-icon">
					<img
						:src="getCouponImage(index)"
						alt="coupon"
					/>
				</div>

				<!-- 中间内容 -->
				<div class="coupon-content">
					<div class="coupon-header">
						<span class="coupon-name">{{ item.couponName || '未命名消费券' }}</span>
						<van-tag
							:type="item.paymentStatus === 1 ? 'success' : 'warning'"
							plain
							size="medium"
							class="status-tag"
						>
							{{ item.paymentStatus === 1 ? '已支付' : '未支付' }}
						</van-tag>
					</div>
					<div class="coupon-price">¥ {{ item.unitValue?.toFixed(2) || '0.00' }}</div>
					<div class="coupon-footer">
						{{ getValidityText(item) }} <span class="divider">|</span> 剩余 {{ item.remainingQuantity || 0 }} /
						{{ item.totalQuantity || 0 }}
					</div>
				</div>

				<!-- 右侧箭头 -->
				<div class="coupon-arrow">
					<van-icon
						name="arrow"
						color="#c8c9cc"
						size="18"
					/>
				</div>
			</div>
			<template #right>
				<van-button
					v-if="item.remainingQuantity && item.remainingQuantity > 0"
					class="redeem-button"
					square
					type="primary"
					text="核销"
					@click="emit('redeem', item.id)"
				/>
				<van-button
					class="delete-button"
					square
					type="danger"
					text="删除"
					@click="emit('delete', item.id)"
				/>
			</template>
		</van-swipe-cell>
	</div>
</template>

<script setup lang="ts">
import type { CpnCouponInfoData } from '@/views/cpn-coupon/cpn-coupon-info/config';
import { formatDate } from '@/utils/dayjs';

interface Props {
	item: CpnCouponInfoData;
	index: number;
}

defineProps<Props>();

const emit = defineEmits<{
	(e: 'click', id?: string): void;
	(e: 'redeem', id?: string): void;
	(e: 'delete', id?: string): void;
}>();

const getCouponImage = (index: number) => {
	const images = [
		'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjN2NiMzQyIiByeD0iMTYiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7imJU8L3RleHQ+PC9zdmc+',
		'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjZmY5ODAwIiByeD0iMTYiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7imJY8L3RleHQ+PC9zdmc+',
		'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjNTY5ZGZmIiByeD0iMTYiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7imIU8L3RleHQ+PC9zdmc+',
		'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjZmY0NTU3IiByeD0iMTYiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7imIY8L3RleHQ+PC9zdmc+',
	];
	return images[index % images.length];
};

const getValidityText = (item: CpnCouponInfoData) => {
	if (!item.endDate) return '无限期';
	const endDate = formatDate(item.endDate);
	const today = new Date();
	const end = new Date(item.endDate.toString());
	const daysLeft = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

	if (daysLeft < 0) return '已过期';
	if (daysLeft === 0) return '今天到期';
	if (daysLeft <= 3) return `${daysLeft}天后到期`;
	return `有效期至 ${endDate}`;
};
</script>

<style lang="less" scoped>
.card-item {
	margin-bottom: 12px;

	&:last-child {
		margin-bottom: 0;
	}
}

.coupon-card {
	background: #fff;
	border-radius: 16px;
	padding: 16px;
	display: flex;
	align-items: center;
	gap: 16px;
	box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
	position: relative;
	cursor: pointer;
	transition:
		transform 0.2s,
		box-shadow 0.2s;

	&:active {
		transform: scale(0.98);
	}
}

.coupon-icon {
	flex-shrink: 0;
	width: 64px;
	height: 64px;
	border-radius: 16px;
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
	min-width: 0;

	.coupon-header {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 6px;

		.coupon-name {
			font-size: 16px;
			font-weight: 600;
			color: #323233;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
			flex: 0 1 auto;
			min-width: 0;
		}

		.status-tag {
			flex-shrink: 0;
			border-radius: 4px;
		}
	}

	.coupon-price {
		font-size: 20px;
		font-weight: 700;
		color: #1989fa;
		margin-bottom: 8px;
		letter-spacing: -0.5px;
	}

	.coupon-footer {
		font-size: 12px;
		color: #969799;
		display: flex;
		align-items: center;

		.divider {
			margin: 0 6px;
			color: #dcdee0;
		}
	}
}

.coupon-arrow {
	flex-shrink: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	padding-left: 4px;
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

.van-swipe-cell__right .delete-button:only-child {
	width: 65px;
}
</style>
