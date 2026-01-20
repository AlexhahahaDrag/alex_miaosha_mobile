<template>
	<div class="redeem-page">
		<div class="page-title">消费券信息</div>
		<div class="section-card coupon-display-card">
			<div class="card-row name-row">
				<div class="content-left">
					<div class="row-label">消费券名称</div>
					<div class="row-value name">{{ couponInfo?.couponName || '未命名消费券' }}</div>
				</div>
				<div class="coupon-icon-wrapper">
					<van-icon name="coupon-o" />
				</div>
			</div>

			<div class="card-row value-row">
				<div class="row-label">面值</div>
				<div class="row-value price">¥ {{ couponInfo?.unitValue || 0 }}</div>
			</div>

			<div class="display-divider"></div>

			<div class="card-row stats-row">
				<div class="stat-item">
					<div class="row-label highlight">剩余数量</div>
					<div class="row-value number highlight">
						{{ (couponInfo?.remainingQuantity ?? 0) - (redeemForm.redemptionQuantity ?? 0) }}
					</div>
				</div>
				<div class="stat-item align-right">
					<div class="row-label">总数量</div>
					<div class="row-value number">{{ couponInfo?.totalQuantity ?? 0 }}</div>
				</div>
			</div>
		</div>

		<!-- 核销表单分区 -->
		<van-form
			@submit="onSubmit"
			:rules="rulesRef"
			class="custom-form"
		>
			<div class="section-card form-body-card">
				<!-- 核销时间 -->
				<van-field
					readonly
					class="premium-input-field"
					@click="chooseDate"
				>
					<template #label>
						<div class="field-label-wrapper">
							<div class="icon-circle time-bg">
								<van-icon name="clock" />
							</div>
							<span class="label-main-text">核销时间 <span class="required-box">*</span></span>
						</div>
					</template>
					<template #input>
						<div class="field-value-text">{{ redeemTime.format('YYYY年MM月DD日') }}</div>
					</template>
					<template #right-icon>
						<van-icon
							name="calendar-o"
							class="calendar-icon"
						/>
					</template>
				</van-field>

				<!-- 核销用户 -->
				<van-field
					v-model="userName"
					name="userId"
					readonly
					:rules="rulesRef.userId"
					class="premium-input-field"
					@click="chooseUser"
				>
					<template #label>
						<div class="field-label-wrapper">
							<div class="icon-circle user-bg">
								<van-icon name="user-o" />
							</div>
							<span class="label-main-text">核销用户 <span class="required">*</span></span>
						</div>
					</template>
					<template #input>
						<div class="user-info-display">
							<van-image
								round
								width="28"
								height="28"
								src="https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg"
								class="avatar-img"
							/>
							<span class="name-text">{{ userName || '选择用户' }}</span>
						</div>
					</template>
					<template #right-icon>
						<van-icon name="arrow" />
					</template>
				</van-field>

				<!-- 核销数量 -->
				<van-field
					name="redemptionQuantity"
					:rules="rulesRef.redemptionQuantity"
					class="premium-input-field no-border"
				>
					<template #label>
						<div class="field-label-wrapper">
							<div class="icon-circle quantity-bg">
								<van-icon name="shopping-cart-o" />
							</div>
							<span class="label-main-text">核销数量 <span class="required">*</span></span>
						</div>
					</template>
					<template #input>
						<div class="stepper-container">
							<van-stepper
								v-model="redeemForm.redemptionQuantity"
								theme="round"
								button-size="22"
								disable-input
							/>
						</div>
					</template>
				</van-field>
			</div>

			<!-- 备注分区 (可选) -->
			<div class="section-card remarks-card">
				<van-field
					v-model="redeemForm.remarks"
					name="remarks"
					label="备注"
					placeholder="请输入备注（可选）"
					type="textarea"
					rows="2"
					autosize
					label-width="50px"
				/>
			</div>

			<div class="submit-action">
				<van-button
					round
					block
					type="primary"
					native-type="submit"
					class="premium-btn"
					:loading="submitLoading"
				>
					确认核销
				</van-button>
			</div>
		</van-form>

		<select-pop
			:info="userInfo"
			@select-info="selectUser"
			@cancel-info="cancelUser"
		>
		</select-pop>

		<date-pop
			:info="chooseDateInfo"
			@select-date-info="onDateSelect"
			@cancel-date-info="onDateCancel"
		>
		</date-pop>
	</div>
</template>

<script setup lang="ts">
import { showFailToast, showSuccessToast } from 'vant';
import dayjs from 'dayjs';
import { getCpnCouponInfoDetail } from '@/views/cpn-coupon/cpn-coupon-info/api';
import { redeemCpnUserCouponInfo } from '@/views/cpn-coupon/cpn-user-coupon-info/api';
import { getUserManagerList } from '@/api/user/userManager';
import type { Info } from '@/views/common/pop/selectPop.vue';
import { getRoutePathByName } from '@/utils/router';
import { datePickerFormatter } from '@/utils/dayjs';
import type { CpnCouponInfoData } from '@/views/cpn-coupon/cpn-coupon-info/config';
import { useUserStore } from '@/store/modules/user/user';
import { useNavBar } from '@/composables/useNavBar';
import { useTabBar } from '@/composables/useTabBar';
import type { DatePickerInfo } from '@/utils/common';

const route = useRoute();
const router = useRouter();
const currentUser = useUserStore()?.getUserInfo;

// 获取左侧路径
const getLeftPath = computed(() => {
	return getRoutePathByName(router, 'cpnCouponInfo', '/selfFinance/cpnCouponInfo');
});

// 使用新的NavBar系统
useNavBar({
	title: '核销消费券',
	leftPath: getLeftPath.value,
	visible: true,
});

// TabBar配置
useTabBar({
	visible: false,
});

// 消费券信息
const couponInfo = ref<CpnCouponInfoData | null>(null);

// 核销时间，默认为当前时间
const redeemTime = ref<dayjs.Dayjs>(dayjs());

// 核销表单数据
const redeemForm = ref<{
	userId?: string;
	couponId?: string;
	redemptionQuantity?: number;
	remarks?: string;
}>({
	redemptionQuantity: 1,
	remarks: '',
});

// 提交加载状态
const submitLoading = ref<boolean>(false);

// 表单验证规则
const rulesRef = reactive({
	userId: [
		{
			required: true,
			message: '请选择核销用户',
		},
	],
	redemptionQuantity: [
		{
			required: true,
			message: '请输入核销数量',
		},
		{
			validator: (value: number) => {
				if (!value || value <= 0) {
					return '核销数量必须大于0';
				}
				if (couponInfo.value && value > (couponInfo.value.remainingQuantity || 0)) {
					return '核销数量不能大于剩余数量';
				}
				return true;
			},
		},
	],
});

// 用户选择相关
const userName = ref<string>('');
const userInfo = ref<Info>({
	label: 'userId',
	labelName: '核销用户',
	rule: rulesRef.userId,
	customFieldName: {
		text: 'nickName',
		value: 'id',
	},
	selectValue: redeemForm.value.userId,
	showFlag: false,
	list: [],
});

// 选择用户
const chooseUser = () => {
	userInfo.value.showFlag = true;
};

// 选择用户信息
const selectUser = (type: string, value: string, name: string) => {
	userInfo.value.showFlag = false;
	if (type === 'userId') {
		redeemForm.value.userId = value;
		userName.value = name;
	}
};

// 取消选择用户
const cancelUser = () => {
	userInfo.value.showFlag = false;
};

// 日期选择相关
const chooseDateInfo = ref<DatePickerInfo<dayjs.Dayjs>>({
	label: 'redeemTime',
	labelName: '核销时间',
	selectValue: redeemTime.value,
	showFlag: false,
	formatter: datePickerFormatter,
});

const chooseDate = () => {
	chooseDateInfo.value.showFlag = true;
};

const onDateSelect = (date: dayjs.Dayjs) => {
	redeemTime.value = date;
	chooseDateInfo.value.showFlag = false;
};

const onDateCancel = () => {
	chooseDateInfo.value.showFlag = false;
};

// 提交核销
const onSubmit = async () => {
	if (!redeemForm.value.redemptionQuantity || redeemForm.value.redemptionQuantity <= 0) {
		showFailToast('请输入有效的核销数量');
		return;
	}
	if (couponInfo.value && redeemForm.value.redemptionQuantity > (couponInfo.value.remainingQuantity || 0)) {
		showFailToast('核销数量不能大于剩余数量');
		return;
	}
	submitLoading.value = true;
	try {
		const { code, message } = await redeemCpnUserCouponInfo({
			userId: redeemForm.value.userId,
			couponId: redeemForm.value.couponId,
			redemptionQuantity: redeemForm.value.redemptionQuantity,
			remarks: redeemForm.value.remarks || '核销消费券',
		});
		if (code === '200') {
			showSuccessToast(message || '核销成功！');
			router.push({ path: getLeftPath.value });
		} else {
			showFailToast(message || '核销失败，请联系管理员！');
		}
	} catch (error) {
		showFailToast('核销失败，请稍后重试！');
	} finally {
		submitLoading.value = false;
	}
};

// 初始化用户列表
const initUserList = async () => {
	try {
		const { code, data } = await getUserManagerList({});
		if (code === '200') {
			userInfo.value.list = data || [];
		} else {
			userInfo.value.list = [];
		}
	} catch (error) {
		showFailToast('获取用户列表失败！');
	}
};

// 初始化消费券信息
const initCouponInfo = async () => {
	const couponId = route?.query?.couponId as string;
	if (!couponId) {
		showFailToast('缺少消费券ID');
		router.push({ path: getLeftPath.value });
		return;
	}
	try {
		const { code, data, message } = await getCpnCouponInfoDetail(couponId);
		if (code === '200') {
			couponInfo.value = data || null;
			redeemForm.value.couponId = couponId;
			if (couponInfo.value && (!couponInfo.value.remainingQuantity || couponInfo.value.remainingQuantity <= 0)) {
				showFailToast('该消费券已无剩余数量，无法核销！');
				router.push({ path: getLeftPath.value });
			}
		} else {
			showFailToast(message || '获取消费券信息失败！');
			router.push({ path: getLeftPath.value });
		}
	} catch (error) {
		showFailToast('获取消费券信息失败！');
		router.push({ path: getLeftPath.value });
	}
};

// 初始化
onMounted(async () => {
	if (currentUser) {
		userName.value = currentUser.nickName;
		redeemForm.value.userId = currentUser.id;
	}
	await Promise.all([initCouponInfo(), initUserList()]);
});
</script>

<style lang="less" scoped>
.redeem-page {
	min-height: 100vh;
	background-color: #f8fafc;
	padding: 20px 18px;
}

.section-card {
	background: #fff;
	border-radius: 28px;
	padding: 24px;
	margin-bottom: 20px;
	box-shadow: 0 10px 25px rgba(0, 0, 0, 0.03);
}

.page-title {
	font-size: 14px;
	color: #94a3b8;
	margin-bottom: 14px;
	padding-left: 8px;
	letter-spacing: 0.5px;
	text-transform: uppercase;
	font-weight: 600;
}

.coupon-display-card {
	padding: 28px 24px;
	position: relative;
	overflow: hidden;

	&::before {
		content: '';
		position: absolute;
		top: -40px;
		right: -40px;
		width: 160px;
		height: 160px;
		background: radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, rgba(255, 255, 255, 0) 70%);
		pointer-events: none;
	}

	.card-row {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		margin-bottom: 30px;

		&:last-child {
			margin-bottom: 0;
		}
	}

	.row-label {
		font-size: 13px;
		color: #94a3b8;
		margin-bottom: 12px;
		font-weight: 400;

		&.highlight {
			color: #64748b;
			font-weight: 500;
		}
	}

	.row-value {
		color: #1e293b;
		line-height: 1.1;

		&.name {
			font-size: 30px;
			font-weight: 800;
			letter-spacing: -0.5px;
		}

		&.price {
			font-size: 38px;
			font-weight: 800;
			color: #3b82f6;
		}

		&.number {
			font-size: 22px;
			font-weight: 700;

			&.highlight {
				color: #2563eb;
				font-size: 26px;
			}
		}
	}

	.coupon-icon-wrapper {
		width: 48px;
		height: 48px;
		background: #eff6ff;
		color: #3b82f6;
		border-radius: 16px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 24px;
		box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
	}

	.display-divider {
		height: 1px;
		background: #f1f5f9;
		margin: 28px 0;
	}

	.stats-row {
		.stat-item {
			flex: 1;

			&.align-right {
				text-align: right;
			}
		}
	}
}

.form-body-card {
	padding: 8px 0;
	overflow: hidden;

	.premium-input-field {
		padding: 22px 24px;
		background: transparent;
		align-items: center;

		&::after {
			left: 24px;
			right: 24px;
			border-bottom: 1px solid #f8fafc;
		}

		&.no-border::after {
			display: none;
		}

		:deep(.van-field__label) {
			width: auto;
			margin-right: 0;
		}

		:deep(.van-field__value) {
			display: flex;
			justify-content: flex-end;
		}

		.field-label-wrapper {
			display: flex;
			align-items: center;
			gap: 14px;

			.icon-circle {
				width: 38px;
				height: 38px;
				border-radius: 12px;
				display: flex;
				align-items: center;
				justify-content: center;
				font-size: 16px;

				&.time-bg {
					background: #f0f9ff;
					color: #0ea5e9;
				}
				&.user-bg {
					background: #f5f3ff;
					color: #8b5cf6;
				}
				&.quantity-bg {
					background: #f0fdf4;
					color: #22c55e;
				}
			}

			.label-main-text {
				font-size: 14px;
				color: #94a3b8;
				font-weight: 400;
			}

			.required-box {
				color: #f43f5e;
				font-size: 14px;
				margin-left: 2px;
			}
		}

		.field-value-text {
			font-size: 15px;
			color: #1e293b;
			font-weight: 600;
			text-align: right;
		}

		.user-info-display {
			display: flex;
			align-items: center;
			gap: 10px;

			.name-text {
				font-size: 15px;
				color: #1e293b;
				font-weight: 600;
			}
		}

		.calendar-icon,
		.arrow-icon {
			color: #cbd5e1;
			font-size: 18px;
			margin-left: 4px;
		}
	}
}

.remarks-card {
	padding: 12px 24px;
	border-radius: 20px;

	:deep(.van-field__label) {
		color: #94a3b8;
		font-weight: 400;
		font-size: 14px;
	}

	:deep(.van-field__control) {
		font-size: 14px;
		color: #1e293b;
	}
}

.submit-action {
	padding: 20px 8px 48px;

	.premium-btn {
		height: 56px;
		background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
		border: none;
		border-radius: 18px;
		font-size: 18px;
		font-weight: 700;
		box-shadow: 0 12px 28px rgba(37, 99, 235, 0.25);
		transition: all 0.2s ease;

		&:active {
			transform: scale(0.97);
			box-shadow: 0 4px 10px rgba(37, 99, 235, 0.2);
		}
	}
}
</style>
