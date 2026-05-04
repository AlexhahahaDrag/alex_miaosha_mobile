<template>
	<div class="redeem-page">
		<!-- 顶部展示卡片 - 英雄区 -->
		<div class="section-card coupon-hero-card">
			<div class="hero-header">
				<div class="coupon-icon-box">
					<van-icon name="shop-collect" />
				</div>
				<div class="coupon-name-section">
					<div class="label">消费券名称</div>
					<h2 class="name">{{ couponInfo?.couponName || '加载中...' }}</h2>
				</div>
				<div class="ticket-watermark">
					<van-icon name="coupon-o" />
				</div>
			</div>

			<div class="hero-body">
				<div class="price-section">
					<div class="label">面值</div>
					<div class="price-value">
						<span class="symbol">¥</span>
						<span class="amount">{{ couponInfo?.unitValue || '0.00' }}</span>
					</div>
				</div>
				<div class="validity-tag">
					有效期至 {{ couponInfo?.endDate ? dayjs(couponInfo.endDate).format('YYYY-MM-DD') : '----' }}
				</div>
			</div>

			<div class="hero-divider"></div>

			<div class="hero-footer">
				<div class="stat-box">
					<div class="stat-label">剩余数量</div>
					<div class="stat-value highlight">{{ couponInfo?.remainingQuantity || 0 }}</div>
				</div>
				<div class="stat-box">
					<div class="stat-label">总数量</div>
					<div class="stat-value">{{ couponInfo?.totalQuantity || 0 }}</div>
				</div>
			</div>
		</div>

		<!-- 核销表单 -->
		<van-form
			@submit="onSubmit"
			:rules="rulesRef"
			class="custom-form"
		>
			<div class="section-card form-body-card">
				<!-- 核销时间 -->
				<van-field
					readonly
					is-link
					center
					class="premium-input-field"
					@click="chooseDate"
				>
					<template #label>
						<div class="field-label-wrapper">
							<div class="icon-circle time-bg">
								<van-icon name="clock" />
							</div>
							<span class="label-main-text">核销时间 <span class="required-mark">*</span></span>
						</div>
					</template>
					<template #input>
						<div class="field-value-content">
							<div class="main-value">{{ redeemTime.format('YYYY年MM月DD日') }}</div>
							<div class="sub-value">{{ redeemTime.format('HH:mm:ss') }}</div>
						</div>
					</template>
				</van-field>

				<!-- 核销用户 -->
				<van-field
					v-model="userName"
					name="userId"
					readonly
					is-link
					center
					:rules="rulesRef.userId"
					class="premium-input-field"
					@click="chooseUser"
				>
					<template #label>
						<div class="field-label-wrapper">
							<div class="icon-circle user-bg">
								<van-icon name="user-o" />
							</div>
							<span class="label-main-text">核销用户 <span class="required-mark">*</span></span>
						</div>
					</template>
					<template #input>
						<div class="user-info-display">
							<van-image
								round
								width="28"
								height="28"
								:src="
									selectedUser?.avatarUrl || selectedUser?.avatar || 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg'
								"
								class="avatar-img"
							/>
							<span class="name-text">{{ userName || '选择核销人' }}</span>
						</div>
					</template>
				</van-field>

				<!-- 核销数量 -->
				<van-field
					name="redemptionQuantity"
					center
					:rules="rulesRef.redemptionQuantity"
					class="premium-input-field no-border"
				>
					<template #label>
						<div class="field-label-wrapper">
							<div class="icon-circle quantity-bg">
								<van-icon name="shopping-cart-o" />
							</div>
							<span class="label-main-text">核销数量 <span class="required-mark">*</span></span>
						</div>
					</template>
					<template #input>
						<div class="stepper-container">
							<van-stepper
								v-model="redeemForm.redemptionQuantity"
								theme="round"
								button-size="24"
								disable-input
								:max="couponInfo?.remainingQuantity || 0"
							/>
						</div>
					</template>
				</van-field>

				<!-- 预期提示 -->
				<div class="redeem-notice-bar">
					<van-icon name="info-o" />
					<span>核销后剩余数量: {{ expectedRemaining }} / {{ couponInfo?.totalQuantity || 0 }}</span>
				</div>
			</div>

			<!-- 消费券详情列表 -->
			<div class="section-card details-section">
				<div class="section-title">
					<span class="title-bar"></span>
					消费券详情
				</div>
				<div class="detail-list">
					<div class="detail-item">
						<div class="item-left">
							<van-icon name="qr" />
							<span>券码</span>
						</div>
						<div class="item-right">
							<span class="code">{{ couponInfo?.id || '----' }}</span>
							<van-icon
								name="copy-o"
								class="copy-btn"
							/>
						</div>
					</div>

					<div class="detail-item">
						<div class="item-left">
							<van-icon name="contact-o" />
							<span>领取用户</span>
						</div>
						<div class="item-right">
							{{ userName || '----' }}
							<span v-if="selectedUser?.phonenumber">({{ selectedUser.phonenumber }})</span>
						</div>
					</div>
					<div class="detail-item">
						<div class="item-left">
							<van-icon name="underway-o" />
							<span>领取时间</span>
						</div>
						<div class="item-right">
							{{ couponInfo?.createTime ? dayjs(couponInfo.createTime).format('YYYY-MM-DD HH:mm:ss') : '----' }}
						</div>
					</div>
				</div>
			</div>

			<!-- 备注分区 -->
			<div class="section-card remarks-section">
				<div class="section-title-simple">备注 <span class="opt">(可选)</span></div>
				<van-field
					v-model="redeemForm.remarks"
					name="remarks"
					placeholder="请输入备注信息"
					type="textarea"
					rows="2"
					autosize
					maxlength="100"
					show-word-limit
					class="remarks-input"
				/>
			</div>

			<!-- 底部固定动作栏 -->
			<div class="submit-action-bar">
				<van-button
					round
					block
					type="primary"
					native-type="submit"
					class="premium-submit-btn"
					:loading="submitLoading"
				>
					<template #default>
						<div class="btn-inner">
							<van-icon
								name="expand-o"
								class="scan-icon"
							/>
							<span>确认核销</span>
						</div>
					</template>
				</van-button>
			</div>
		</van-form>

		<!-- 弹窗组件 -->
		<select-pop
			:info="userInfo"
			@select-info="selectUser"
			@cancel-info="cancelUser"
		/>

		<date-pop
			:info="chooseDateInfo"
			@select-date-info="onDateSelect"
			@cancel-date-info="onDateCancel"
		/>
	</div>
</template>

<script setup lang="ts">
import { showFailToast, showSuccessToast } from 'vant';
import dayjs from 'dayjs';
import { getCpnCouponInfoDetail } from '@/views/cpn-coupon/cpn-coupon-info/api';
import { redeemCpnUserCouponInfo } from '@/views/cpn-coupon/cpn-user-coupon-info/api';
import { getUserManagerList } from '@/views/user/userManager/api';
import type { Info } from '@/views/common/pop/selectPop.vue';
import type { UserManagerData } from '@/views/user/userManager/config';
import { getRoutePathByName } from '@/utils/router';
import { datePickerFormatter } from '@/utils/dayjs';
import type { CpnCouponInfoData } from '@/views/cpn-coupon/cpn-coupon-info/config';
import { useUserStore } from '@/store/modules/user/user';
import { useNavBar } from '@/composables/useNavBar';
import { useTabBar } from '@/composables/useTabBar';
import type { DatePickerInfo } from '@/utils/common';

// 3. useHooks
const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const currentUser = computed(() => userStore?.getUserInfo);

// 4. Variables
const getLeftPath = computed(() => {
	return getRoutePathByName(router, 'cpnCouponInfo', '/selfFinance/cpnCouponInfo');
});

const couponInfo = ref<CpnCouponInfoData | null>(null);
const redeemTime = ref<dayjs.Dayjs>(dayjs());
const redeemForm = ref<{
	userId?: string;
	couponId?: string;
	redemptionQuantity?: number;
	remarks?: string;
}>({
	redemptionQuantity: 1,
	remarks: '',
});

const submitLoading = ref<boolean>(false);

const rulesRef = reactive({
	userId: [{ required: true, message: '请选择核销用户' }],
	redemptionQuantity: [
		{ required: true, message: '请输入核销数量' },
		{
			validator: (value: number) => {
				if (!value || value <= 0) return '核销数量必须大于0';
				if (couponInfo.value && value > (couponInfo.value.remainingQuantity || 0)) return '核销数量不能大于剩余数量';
				return true;
			},
		},
	],
});

const userName = ref<string>('');
const userInfo = ref<Info>({
	label: 'userId',
	labelName: '核销用户',
	rule: rulesRef.userId,
	customFieldName: { text: 'nickName', value: 'id' },
	selectValue: redeemForm.value.userId,
	showFlag: false,
	list: [],
});

const chooseDateInfo = ref<DatePickerInfo<dayjs.Dayjs>>({
	label: 'redeemTime',
	labelName: '核销时间',
	selectValue: redeemTime.value,
	showFlag: false,
	formatter: datePickerFormatter,
});

const expectedRemaining = computed(() => {
	return (couponInfo.value?.remainingQuantity || 0) - (redeemForm.value.redemptionQuantity || 0);
});

const selectedUser = computed(() => {
	return userInfo.value?.list?.find((u: UserManagerData) => u.id === redeemForm.value.userId);
});

// 5. Methods
const setupNavBar = () => {
	useNavBar({
		title: '核销消费券',
		leftPath: getLeftPath.value,
		rightButton: '核销记录',
		visible: true,
		onRightClick: () => {
			showFailToast('核销记录功能开发中...');
		},
	});
};

const setupTabBar = () => {
	useTabBar({ visible: false });
};

const chooseUser = () => {
	userInfo.value.showFlag = true;
};

const selectUser = (type: string, value: string, name: string) => {
	userInfo.value.showFlag = false;
	if (type === 'userId') {
		redeemForm.value.userId = value;
		userName.value = name;
	}
};

const cancelUser = () => {
	userInfo.value.showFlag = false;
};

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

const onSubmit = async () => {
	if (!redeemForm.value.redemptionQuantity || redeemForm.value.redemptionQuantity <= 0) {
		showFailToast('请输入有效的核销数量');
		return;
	}
	navigator.vibrate?.(50);
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
			showFailToast(message || '核销失败!');
		}
	} catch {
		showFailToast('核销失败!');
	} finally {
		submitLoading.value = false;
	}
};

const initUserList = async () => {
	try {
		const { code, data } = await getUserManagerList({});
		if (code === '200') userInfo.value.list = data || [];
	} catch {
		showFailToast('获取用户列表失败');
	}
};

const initCouponInfo = async () => {
	const couponId = route?.query?.couponId as string;
	if (!couponId) {
		router.push({ path: getLeftPath.value });
		return;
	}
	try {
		const { code, data } = await getCpnCouponInfoDetail(couponId);
		if (code === '200') {
			couponInfo.value = data || null;
			redeemForm.value.couponId = couponId;
		}
	} catch {
		showFailToast('获取消费券信息失败');
	}
};

// 6. Lifecycle
onMounted(async () => {
	setupNavBar();
	setupTabBar();
	if (currentUser.value) {
		userName.value = currentUser.value.nickName || '';
		redeemForm.value.userId = currentUser.value.userId;
	}
	await Promise.all([initCouponInfo(), initUserList()]);
});
</script>

<style lang="less" scoped>
.redeem-page {
	min-height: 100vh;
	background-color: #f8fafc;
	padding: 16px 16px 100px;
}

.section-card {
	background: #fff;
	border-radius: 16px;
	padding: 20px;
	margin-bottom: 16px;
	box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
}

// ========== 英雄卡片样式 ==========
.coupon-hero-card {
	background: #fff;
	padding: 24px;
	position: relative;
	overflow: hidden;

	.hero-header {
		display: flex;
		align-items: center;
		margin-bottom: 24px;
		position: relative;
		z-index: 1;

		.coupon-icon-box {
			width: 50px;
			height: 50px;
			background: #3b82f6;
			border-radius: 14px;
			display: flex;
			align-items: center;
			justify-content: center;
			color: #fff;
			font-size: 26px;
			margin-right: 14px;
			box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
		}

		.coupon-name-section {
			.label {
				font-size: 13px;
				color: #94a3b8;
				margin-bottom: 4px;
			}
			.name {
				font-size: 24px;
				font-weight: 800;
				color: #1e293b;
				margin: 0;
			}
		}

		.ticket-watermark {
			position: absolute;
			right: -10px;
			top: -10px;
			font-size: 80px;
			color: #f1f5f9;
			transform: rotate(-15deg);
			z-index: -1;
		}
	}

	.hero-body {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		margin-bottom: 24px;

		.price-section {
			.label {
				font-size: 12px;
				color: #94a3b8;
				margin-bottom: 6px;
			}
			.price-value {
				display: flex;
				align-items: baseline;
				color: #3b82f6;

				.symbol {
					font-size: 20px;
					font-weight: 700;
					margin-right: 4px;
				}
				.amount {
					font-size: 34px;
					font-weight: 800;
					letter-spacing: -1px;
				}
			}
		}

		.validity-tag {
			background: #eff6ff;
			color: #3b82f6;
			padding: 4px 10px;
			border-radius: 8px;
			font-size: 12px;
			font-weight: 600;
		}
	}

	.hero-divider {
		height: 1px;
		background: #f1f5f9;
		margin: 0 -24px 24px;
	}

	.hero-footer {
		display: flex;

		.stat-box {
			flex: 1;
			text-align: center;

			&:first-child {
				border-right: 1px solid #f1f5f9;
			}

			.stat-label {
				font-size: 12px;
				color: #94a3b8;
				margin-bottom: 8px;
				display: block;
			}
			.stat-value {
				font-size: 22px;
				font-weight: 700;
				color: #475569;

				&.highlight {
					color: #3b82f6;
				}
			}
		}
	}
}

// ========== 表单区域样式 ==========
.form-body-card {
	padding: 8px 0;

	.premium-input-field {
		padding: 16px 20px;

		:deep(.van-field__label) {
			width: auto;
			margin-right: 16px;
		}

		.field-label-wrapper {
			display: flex;
			align-items: center;
			gap: 12px;

			.icon-circle {
				width: 32px;
				height: 32px;
				border-radius: 10px;
				display: flex;
				align-items: center;
				justify-content: center;
				font-size: 15px;

				&.time-bg {
					background: #eff6ff;
					color: #3b82f6;
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
				color: #64748b;
				font-weight: 500;
			}
			.required-mark {
				color: #ef4444;
			}
		}

		.field-value-content {
			text-align: right;
			.main-value {
				font-size: 15px;
				font-weight: 700;
				color: #1e293b;
			}
			.sub-value {
				font-size: 11px;
				color: #94a3b8;
			}
		}

		.user-info-display {
			display: flex;
			align-items: center;
			gap: 10px;
			justify-content: flex-end;

			.name-text {
				font-size: 15px;
				font-weight: 700;
				color: #1e293b;
			}
		}

		.stepper-container {
			display: flex;
			align-items: center;
			justify-content: flex-end;
		}
	}

	.redeem-notice-bar {
		margin: 12px 20px;
		background: #f0f9ff;
		color: #3b82f6;
		padding: 10px 14px;
		border-radius: 10px;
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 13px;
		font-weight: 500;
	}
}

// ========== 详情列表样式 ==========
.details-section {
	.section-title {
		display: flex;
		align-items: center;
		font-size: 16px;
		font-weight: 700;
		color: #1e293b;
		margin-bottom: 16px;

		.title-bar {
			width: 4px;
			height: 16px;
			background: #3b82f6;
			border-radius: 2px;
			margin-right: 8px;
		}
	}

	.detail-list {
		.detail-item {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 12px 0;
			font-size: 14px;

			&:not(:last-child) {
				border-bottom: 1px solid #f8fafc;
			}

			.item-left {
				display: flex;
				align-items: center;
				gap: 8px;
				color: #64748b;

				.van-icon {
					font-size: 16px;
				}
			}

			.item-right {
				color: #334155;
				font-weight: 500;

				.code {
					letter-spacing: 1px;
				}
				.copy-btn {
					margin-left: 6px;
					color: #3b82f6;
					cursor: pointer;
				}
			}
		}
	}
}

// ========== 备注样式 ==========
.remarks-section {
	.section-title-simple {
		font-size: 14px;
		font-weight: 600;
		color: #64748b;
		margin-bottom: 12px;

		.opt {
			font-weight: 400;
			color: #cbd5e1;
		}
	}

	.remarks-input {
		background: #f8fafc;
		border-radius: 12px;
		padding: 12px;
	}
}

// ========== 底部按钮样式 ==========
.submit-action-bar {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	padding: 16px 24px 32px;
	background: linear-gradient(180deg, rgba(255, 255, 255, 0.9) 0%, #fff 100%);
	backdrop-filter: blur(10px);
	z-index: 100;

	.premium-submit-btn {
		height: 54px;
		background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
		border: none;
		font-size: 17px;
		font-weight: 700;
		box-shadow: 0 8px 24px rgba(59, 130, 246, 0.3);

		.btn-inner {
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 10px;

			.scan-icon {
				font-size: 20px;
			}
		}

		&:active {
			transform: scale(0.98);
			opacity: 0.9;
		}
	}
}
</style>
