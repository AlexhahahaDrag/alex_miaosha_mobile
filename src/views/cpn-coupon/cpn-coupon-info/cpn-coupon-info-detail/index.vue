<template>
	<div class="coupon-detail-page">
		<!-- 编辑模式 -->
		<template v-if="isEditMode">
			<!-- 优惠券图片区域 -->
			<div class="coupon-image-section">
				<img
					:src="couponImage"
					alt="coupon"
				/>
				<div class="image-overlay">
					<van-icon
						name="photograph"
						size="24"
					/>
				</div>
			</div>

			<!-- 编辑表单 -->
			<van-form
				@submit="onSubmit"
				class="edit-form"
			>
				<van-cell-group inset>
					<van-field
						v-model="formInfo.couponName"
						name="couponName"
						label="优惠券名称"
						placeholder="请输入优惠券名称"
						:rules="[{ required: true, message: '请输入优惠券名称' }]"
					/>

					<van-field
						v-model="formInfo.unitValue"
						name="unitValue"
						label="面值"
						placeholder="请输入面值"
						type="number"
						:rules="[{ required: true, message: '请输入面值' }]"
					/>

					<van-field
						v-model="formInfo.totalQuantity"
						name="totalQuantity"
						label="有效期至"
						placeholder="请输入数量"
						type="number"
						:rules="[{ required: true, message: '请输入总数量' }]"
					/>

					<van-field
						v-model="endDateDisplay"
						name="endDate"
						label="有效期至"
						placeholder="请选择有效期"
						readonly
						@click="showDatePicker = true"
						:rules="[{ required: true, message: '请选择有效期' }]"
					/>
				</van-cell-group>

				<!-- 最近活动 -->
				<div class="recent-activities-edit">
					<div class="activities-title">最近活动</div>
					<van-cell-group>
						<van-cell
							title="优惠券已领取"
							:label="`共 ${formInfo.totalQuantity || 0} 张 已兑换 ${consumedQuantity} 张`"
							icon="completed"
							class="activity-item success"
						>
							<template #right-icon>
								<span class="activity-text">查看</span>
							</template>
						</van-cell>
						<van-cell
							title="优惠券已核销"
							label="全部可核销"
							icon="stop-circle-o"
							class="activity-item info"
						>
							<template #right-icon>
								<span class="days-left">已启用14天</span>
							</template>
						</van-cell>
						<van-cell
							title="查看详情"
							label="扫码核销"
							icon="notes-o"
							class="activity-item"
						>
							<template #right-icon>
								<span class="activity-date">9月28日</span>
							</template>
						</van-cell>
					</van-cell-group>
				</div>

				<!-- 保存按钮 -->
				<div class="save-button-container">
					<van-button
						type="primary"
						block
						round
						size="large"
						native-type="submit"
					>
						<van-icon name="success" />
						保存修改
					</van-button>
				</div>
			</van-form>

			<!-- 日期选择器 -->
			<van-popup
				v-model:show="showDatePicker"
				position="bottom"
			>
				<van-date-picker
					v-model="selectedDate"
					title="选择日期"
					:min-date="new Date()"
					@confirm="onDateConfirm"
					@cancel="showDatePicker = false"
				/>
			</van-popup>
		</template>

		<!-- 展示模式 -->
		<template v-else>
			<!-- 优惠券卡片 -->
			<div class="coupon-card-display">
				<div class="coupon-image">
					<img
						:src="couponImage"
						alt="coupon"
					/>
					<div class="coupon-badge">优惠券</div>
				</div>

				<div class="coupon-info-section">
					<div class="coupon-amount">
						¥{{ formInfo.unitValue?.toFixed(0) || '0' }} <span class="coupon-label">优惠券</span>
					</div>
					<div class="coupon-description">{{ formInfo.couponName || '限定兑换咖啡' }}</div>
					<div class="coupon-validity">
						<van-icon name="clock-o" />
						有效期至 {{ formatDate(formInfo.endDate) }}
					</div>
				</div>
			</div>

			<!-- 最近活动 -->
			<div class="recent-activities">
				<div class="activities-title">最近活动</div>
				<van-cell-group>
					<van-cell
						title="优惠券已领取"
						:label="`共 ${formInfo.totalQuantity || 0} 张 已兑换 ${consumedQuantity} 张`"
						icon="completed"
						class="activity-item success"
					>
						<template #right-icon>
							<span class="activity-text">查看</span>
						</template>
					</van-cell>
					<van-cell
						title="优惠券已核销"
						label="全部可核销"
						icon="stop-circle-o"
						class="activity-item info"
					>
						<template #right-icon>
							<span class="days-left">已启用14天</span>
						</template>
					</van-cell>
					<van-cell
						title="查看详情"
						label="扫码核销"
						icon="notes-o"
						class="activity-item"
					>
						<template #right-icon>
							<span class="activity-date">9月28日</span>
						</template>
					</van-cell>
				</van-cell-group>
			</div>

			<!-- 立即兑换按钮 -->
			<div class="redeem-button-container">
				<van-button
					type="primary"
					block
					round
					size="large"
					@click="onRedeem"
				>
					<van-icon name="gift-o" />
					立即兑换
				</van-button>
			</div>
		</template>
	</div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs';
import { showFailToast, showSuccessToast } from 'vant';
import type { CpnCouponInfoData } from '@/views/cpn-coupon/cpn-coupon-info/config';
import { formatDate } from '@/utils/dayjs';
import { getCpnCouponInfoDetail, addCpnCouponInfo, editCpnCouponInfo } from '@/views/cpn-coupon/cpn-coupon-info/api';
import { useNavBar } from '@/composables/useNavBar';
import { getRoutePathByName } from '@/utils/router';

const route = useRoute();
const router = useRouter();

// 判断是否为编辑模式（通过 query 参数 mode=edit）
const isEditMode = computed(() => route.query.mode === 'edit');

// 获取左侧路径
const getLeftPath = computed(() => {
	return getRoutePathByName(router, 'cpnCouponInfo');
});

// 使用新的NavBar系统
useNavBar({
	title: isEditMode.value ? '编辑优惠券信息' : '优惠券详情',
	leftPath: getLeftPath.value,
	visible: true,
	rightButton: isEditMode.value ? '' : '编辑',
	onRightClick: () => {
		if (!isEditMode.value) {
			// 切换到编辑模式
			router.push({
				path: route.path,
				query: { ...route.query, mode: 'edit' },
			});
		}
	},
});

const formInfo = ref<CpnCouponInfoData>({});
const showDatePicker = ref(false);
const selectedDate = ref<Date>(new Date());

// 优惠券图片
const couponImage = ref(
	'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOnJnYigxODUsMzMsNDApO3N0b3Atb3BhY2l0eToxIiAvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6cmdiKDIyMCw1Myw2OSk7c3RvcC1vcGFjaXR5OjEiIC8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9InVybCgjZykiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1zaXplPSI0MCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7wnY6I4oC854OfPC90ZXh0Pjwvc3ZnPg==',
);

// 日期显示
const endDateDisplay = computed(() => {
	if (formInfo.value.endDate) {
		return formatDate(formInfo.value.endDate);
	}
	return '';
});

// 已使用数量
const consumedQuantity = computed(() => {
	return (formInfo.value.totalQuantity || 0) - (formInfo.value.remainingQuantity || 0);
});

// 日期确认
const onDateConfirm = ({ selectedValues }: any) => {
	const [year, month, day] = selectedValues;
	const date = dayjs(`${year}-${month}-${day}`).hour(23).minute(59).second(59);
	formInfo.value.endDate = date;
	selectedDate.value = date.toDate();
	showDatePicker.value = false;
};

// 提交表单
const onSubmit = async () => {
	let api = addCpnCouponInfo;
	if (formInfo.value.id) {
		api = editCpnCouponInfo;
	}
	const { code, message } = await api(formInfo.value);
	if (code == '200') {
		showSuccessToast(message || '保存成功!');
		// 保存后切换回展示模式
		router.push({
			path: route.path,
			query: { id: formInfo.value.id },
		});
	} else {
		showFailToast(message || '保存失败，请联系管理员!');
	}
};

// 立即兑换
const onRedeem = () => {
	const path = getRoutePathByName(router, 'cpnCouponInfoRedeem', '/selfFinance/cpnCouponInfo/redeem');
	router.push({
		path,
		query: { couponId: formInfo.value.id },
	});
};

// 统一数据获取逻辑
const init = async () => {
	const id: string = route?.query?.id as string;
	if (id) {
		const { code, data, message } = await getCpnCouponInfoDetail(id || '0');
		if (code == '200') {
			formInfo.value = data || {};
			if (formInfo.value.endDate) {
				selectedDate.value = dayjs(formInfo.value.endDate).toDate();
			}
		} else {
			showFailToast(message || '查询详情失败，请联系管理员!');
		}
	} else {
		// 新增模式，默认为编辑模式
		formInfo.value = {
			endDate: dayjs().add(1, 'month'),
		};
	}
};

init();
</script>

<style lang="less" scoped>
.coupon-detail-page {
	min-height: 100vh;
	background-color: #f7f8fa;
	padding: 16px;
	animation: page-fade-in 0.4s ease;

	@keyframes page-fade-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
}

// ========== 编辑模式样式 ==========
.coupon-image-section {
	position: relative;
	width: 100%;
	height: 200px;
	border-radius: 16px;
	overflow: hidden;
	margin-bottom: 16px;
	cursor: pointer;

	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.image-overlay {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(0, 0, 0, 0.3);
		opacity: 0;
		transition: opacity 0.3s;

		&:hover {
			opacity: 1;
		}

		.van-icon {
			color: white;
		}
	}
}

.edit-form {
	:deep(.van-cell-group--inset) {
		margin: 0 0 16px 0;
		border-radius: 12px;
	}

	:deep(.van-field__label) {
		color: #646566;
		font-size: 14px;
	}

	:deep(.van-field__control) {
		color: #323233;
	}
}

.recent-activities-edit {
	background: #fff;
	border-radius: 12px;
	overflow: hidden;
	margin-bottom: 80px;

	.activities-title {
		padding: 16px;
		font-size: 16px;
		font-weight: 600;
		color: #323233;
		border-bottom: 1px solid #ebedf0;
	}
}

.save-button-container {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	padding: 12px 16px;
	background: #fff;
	box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.08);

	.van-button {
		background: linear-gradient(135deg, #1989fa 0%, #1677ff 100%);
		border: none;
		font-size: 16px;
		font-weight: 600;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

		&:active {
			transform: scale(0.98);
		}

		.van-icon {
			margin-right: 8px;
		}
	}
}

// ========== 展示模式样式 ==========
.coupon-card-display {
	background: #fff;
	border-radius: 16px;
	overflow: hidden;
	margin-bottom: 16px;
	animation: card-slide-up 0.5s cubic-bezier(0.4, 0, 0.2, 1);

	@keyframes card-slide-up {
		from {
			opacity: 0;
			transform: translateY(30px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.coupon-image {
		position: relative;
		width: 100%;
		height: 200px;
		background: linear-gradient(135deg, #b92128 0%, #dc3545 100%);
		overflow: hidden;

		&::after {
			content: '';
			position: absolute;
			inset: 0;
			background: linear-gradient(45deg, transparent 48%, rgba(255, 255, 255, 0.1) 50%, transparent 52%);
			background-size: 200% 200%;
			animation: shimmer 3s infinite;
		}

		@keyframes shimmer {
			0% {
				background-position: 200% 0;
			}
			100% {
				background-position: -200% 0;
			}
		}

		img {
			width: 100%;
			height: 100%;
			object-fit: cover;
		}

		.coupon-badge {
			position: absolute;
			bottom: 12px;
			left: 12px;
			background: rgba(255, 255, 255, 0.9);
			padding: 4px 12px;
			border-radius: 12px;
			font-size: 12px;
			color: #b92128;
			font-weight: 600;
			animation: badge-pop-in 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.3s backwards;

			@keyframes badge-pop-in {
				from {
					transform: scale(0);
				}
				to {
					transform: scale(1);
				}
			}
		}
	}

	.coupon-info-section {
		padding: 20px;
		text-align: center;

		.coupon-amount {
			font-size: 36px;
			font-weight: 700;
			color: #323233;
			margin-bottom: 8px;
			animation: amount-scale-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.4s backwards;

			@keyframes amount-scale-in {
				from {
					transform: scale(0.8);
					opacity: 0;
				}
				to {
					transform: scale(1);
					opacity: 1;
				}
			}

			.coupon-label {
				font-size: 16px;
				font-weight: 400;
				margin-left: 4px;
			}
		}

		.coupon-description {
			font-size: 14px;
			color: #646566;
			margin-bottom: 12px;
			animation: fade-in-up 0.5s ease 0.5s backwards;
		}

		.coupon-validity {
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 12px;
			color: #969799;
			animation: fade-in-up 0.5s ease 0.6s backwards;

			@keyframes fade-in-up {
				from {
					opacity: 0;
					transform: translateY(10px);
				}
				to {
					opacity: 1;
					transform: translateY(0);
				}
			}

			.van-icon {
				margin-right: 4px;
			}
		}
	}
}

.usage-note {
	background: #fff;
	border-radius: 12px;
	padding: 16px;
	margin-bottom: 16px;
	font-size: 12px;
	line-height: 20px;
	color: #646566;
	animation: fade-in-up 0.5s ease 0.2s backwards;
}

.recent-activities {
	background: #fff;
	border-radius: 12px;
	overflow: hidden;
	margin-bottom: 80px;
	animation: fade-in-up 0.5s ease 0.3s backwards;

	.activities-title {
		padding: 16px;
		font-size: 16px;
		font-weight: 600;
		color: #323233;
		border-bottom: 1px solid #ebedf0;
	}
}

.activity-item {
	transition: background-color 0.2s ease;

	&:active {
		background-color: #f7f8fa;
	}

	&.success {
		:deep(.van-icon) {
			color: #07c160;
		}
	}

	&.info {
		:deep(.van-icon) {
			color: #1989fa;
		}
	}

	.activity-text {
		color: #969799;
		font-size: 14px;
	}

	.days-left {
		color: #1989fa;
		font-size: 12px;
	}

	.activity-date {
		color: #969799;
		font-size: 12px;
	}
}

.redeem-button-container {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	padding: 12px 16px;
	background: #fff;
	box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.08);
	animation: slide-up 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.4s backwards;

	@keyframes slide-up {
		from {
			transform: translateY(100%);
		}
		to {
			transform: translateY(0);
		}
	}

	.van-button {
		background: linear-gradient(135deg, #1989fa 0%, #1677ff 100%);
		border: none;
		font-size: 16px;
		font-weight: 600;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

		&:hover {
			box-shadow: 0 4px 12px rgba(25, 137, 250, 0.4);
			transform: translateY(-2px);
		}

		&:active {
			transform: translateY(0) scale(0.98);
			box-shadow: 0 2px 6px rgba(25, 137, 250, 0.3);
		}

		.van-icon {
			margin-right: 8px;
			animation: gift-pulse 2s ease-in-out infinite;

			@keyframes gift-pulse {
				0%,
				100% {
					transform: scale(1);
				}
				50% {
					transform: scale(1.1);
				}
			}
		}
	}
}
</style>
