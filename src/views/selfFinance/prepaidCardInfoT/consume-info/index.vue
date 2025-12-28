<template>
	<div class="consume-page">
		<!-- 消费金额输入区域 -->
		<div class="amount-section">
			<div class="amount-card">
				<div class="amount-display">
					<span
						class="currency"
						:class="formData.type"
					>
						¥
					</span>
					<van-field
						v-model="formData.amount"
						placeholder="0.00"
						type="number"
						class="amount-input"
						:class="formData.type"
						@input="validateAmount"
						@focus="onAmountFocus"
						@blur="onAmountBlur"
					/>
				</div>
				<div class="balance-after">
					<div class="balance-after-label"> {{ formData.type === 'recharge' ? '充值' : '消费' }}后余额 </div>
					<div
						class="balance-after-amount"
						:class="{ insufficient: balanceAfter < 0 }"
					>
						¥ {{ formatBalance(balanceAfter) }}
					</div>
				</div>
			</div>
		</div>

		<!-- 消费信息 -->
		<div class="info-section">
			<div class="section-title">消费信息</div>
			<div class="info-list">
				<div class="info-item">
					<span class="label">消费卡名称</span>
					<van-field
						v-model="formData.cardName"
						placeholder="请输入消费卡名称"
						class="field-input"
					/>
				</div>
				<div class="info-item">
					<span class="label">消费时间</span>
					<div
						class="time-display"
						@click="updateCurrentTime"
					>
						{{ consumeTimeDisplay }}
					</div>
				</div>
				<div class="info-item">
					<span class="label">备注</span>
					<van-field
						v-model="formData.remark"
						placeholder="请输入备注信息（可选）"
						type="textarea"
						rows="2"
						class="field-input"
					/>
				</div>
			</div>
		</div>

		<!-- 确认按钮 -->
		<div class="action-section">
			<van-button
				type="danger"
				size="large"
				round
				block
				@click="confirmConsume"
				:loading="loading"
				:disabled="!formData.amount || !formData.cardName || balanceAfter < 0"
				class="confirm-btn"
			>
				确认消费
			</van-button>
		</div>
	</div>
	<datePop
		:info="chooseDateInfo"
		@select-info="selectDateInfo"
		@cancel-info="cancelDateInfo"
	></datePop>
</template>

<script setup lang="ts">
import { showToast, showSuccessToast, showFailToast } from 'vant';
import dayjs, { type Dayjs } from 'dayjs';
import { getPrepaidCardInfoDetail, prepaidCardConsumeAndRecharge } from '../api/index';
import { useNavBar } from '@/composables/useNavBar';
import { useUserStore } from '@/store/modules/user/user';

const route = useRoute();
const router = useRouter();

const userInfo = useUserStore()?.getUserInfo;

const formData = reactive<any>({});

// 使用新的NavBar系统
useNavBar({
	title: formData.type === 'recharge' ? '充值' : '消费',
	leftPath: `/selfFinance/prepaidCardInfoT?cardId=${route.query.cardId}`,
	visible: true,
});

// 表单数据对象

const chooseDateInfo = ref<any>({
	label: 'infoDate',
	labelName: '消费时间',
	selectValue: dayjs(),
	showFlag: false,
	formatter: (type: string, option: any) => {
		if (type === 'year') {
			option.text += '年';
		}
		if (type === 'month') {
			option.text += '月';
		}
		if (type === 'day') {
			option.text += '日';
		}
		return option;
	},
});

// 计算属性：消费后余额
const balanceAfter = computed(() => {
	const amountValue = parseFloat(formData.amount) || 0;
	return formData.type === 'recharge' ? formData.balance + amountValue : formData.balance - amountValue;
});

// 显示的消费时间文本
const consumeTimeDisplay = computed(() => {
	return formatDateTime(formData.consumeTime);
});

// 加载状态
const loading = ref<boolean>(false);
// 金额输入聚焦状态
const isAmountFocused = ref<boolean>(false);

// 格式化日期时间显示
function formatDateTime(date: Dayjs) {
	date = dayjs(date);
	const now = dayjs().local();
	const today = now.startOf('day').local();
	const yesterday = today.subtract(1, 'day').local();
	const targetDate = date.startOf('day').local();
	// 今天
	if (targetDate.isSame(today, 'day')) {
		return '今天';
	}
	// 昨天
	else if (targetDate.isSame(yesterday, 'day')) {
		return '昨天';
	}
	// 昨天之前
	else {
		return date.format('YYYY-MM-DD');
	}
}

// 更新当前时间
const updateCurrentTime = () => {
	chooseDateInfo.value.showFlag = true;
};

// 金额输入聚焦
const onAmountFocus = () => {
	isAmountFocused.value = true;
};

// 金额输入失焦
const onAmountBlur = () => {
	isAmountFocused.value = false;
};

// 验证金额输入
const validateAmount = (value: string) => {
	if (value && parseFloat(value) < 0) {
		formData.amount = '';
		showToast('消费金额不能为负数');
	}
	if (value && parseFloat(value) > formData.balance) {
		showToast('消费金额不能超过余额');
	}
};

// 格式化余额显示
const formatBalance = (value: number) => {
	return value.toFixed(2);
};

// 选择日期
const selectDateInfo = (date: Dayjs, _dateName: string) => {
	formData.consumeTime = date;
	chooseDateInfo.value.showFlag = false;
};

// 取消日期
const cancelDateInfo = () => {
	chooseDateInfo.value.showFlag = false;
};

// 确认消费
const confirmConsume = async () => {
	// 验证必填字段
	if (!formData.amount || parseFloat(formData.amount) <= 0) {
		const actionText = formData.type === 'recharge' ? '充值' : '消费';
		showToast(`请输入有效的${actionText}金额`);
		return;
	}
	if (!formData.cardName.trim()) {
		showToast('请输入消费卡名称');
		return;
	}

	// 根据操作类型进行不同的校验
	if (formData.type === 'consume') {
		// 消费校验：余额不足
		if (parseFloat(formData.amount) > formData.balance) {
			showToast('余额不足，无法完成消费');
			return;
		}
	} else if (formData.type === 'recharge') {
		// 充值校验：可以添加充值相关的校验逻辑
		// 例如：充值金额上限等
	}
	try {
		const params = {
			id: formData.id,
			cardName: formData.cardName,
			userId: userInfo.id,
			consumeAmount: parseFloat(formData.amount),
			type: formData.type,
			consumeTime: formData.consumeTime,
			description: formData.remark,
		};
		const { code, message } = await prepaidCardConsumeAndRecharge(params);
		if (code === '200') {
			showSuccessToast(`${formData.type === 'recharge' ? '充值' : '消费'}成功!`);
			router.push({ name: 'prepaidCardInfoT', query: { cardId: formData.id } });
		} else {
			showFailToast(message || '失败，请联系管理员!');
		}
	} catch {
		// 用户取消消费
	}
};

// 获取预付卡信息
const getPrepaidCardInfoDetailInfo = async () => {
	try {
		const { code, data, message: messageInfo } = await getPrepaidCardInfoDetail(formData.id);
		if (code === '200') {
			// 取第一张卡片的信息
			const cardInfo = data;
			formData.cardName = cardInfo.cardName;
			formData.balance = cardInfo.currentBalance ?? 0;
			formData.cardId = cardInfo.id;
		} else {
			showToast(messageInfo?.description || '获取信息失败，请联系管理员！');
		}
	} catch (error) {
		console.error('获取预付卡信息失败:', error);
		showToast('获取信息失败，请稍后重试');
	}
};

// 初始化
const init = () => {
	// 获取路由参数
	const { cardId, type } = route.query;
	formData.id = cardId as string;
	formData.type = type as string;
	formData.consumeTime = dayjs();
	// 获取预付卡信息
	getPrepaidCardInfoDetailInfo();
};

init();
</script>

<style scoped lang="less">
.consume-page {
	background-color: #f5f5f5;
	min-height: 100vh;
}

.nav-bar {
	background: #ffffff;
}

.balance-section {
	padding: 16px;

	.balance-card {
		background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%);
		border-radius: 12px;
		padding: 20px;
		text-align: center;
		color: white;

		.balance-label {
			font-size: 14px;
			opacity: 0.9;
			margin-bottom: 8px;
		}

		.balance-amount {
			font-size: 28px;
			font-weight: 700;
			letter-spacing: 1px;
		}
	}
}

.amount-section {
	padding: 0 16px 16px;
	padding-top: 16px;

	.amount-card {
		background: white;
		border-radius: 12px;
		padding: 20px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

		.card-title {
			font-size: 16px;
			font-weight: 600;
			color: #333;
			margin-bottom: 16px;
			text-align: center;
		}

		.amount-display {
			display: flex;
			align-items: center;
			justify-content: center;
			margin-bottom: 16px;
			padding: 12px;
			border: 2px solid #f0f0f0;
			border-radius: 8px;
			transition: all 0.3s ease;

			&:focus-within {
				border-color: #4a90e2;
				box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
			}

			.currency {
				font-size: 36px;
				font-weight: 700;
				margin-right: 8px;
				transition: color 0.3s ease;

				&.recharge {
					color: #52c41a;
				}

				&.consume {
					color: #ff6b6b;
				}
			}

			.amount-input {
				flex: 1;

				:deep(.van-field__control) {
					background: transparent;
					border: none;
					font-size: 36px;
					font-weight: 700;
					padding: 0;
					text-align: left;
					transition: color 0.3s ease;
				}

				&.recharge :deep(.van-field__control) {
					color: #52c41a;

					&::placeholder {
						color: #b3e5b3;
						font-weight: 400;
					}
				}

				&.consume :deep(.van-field__control) {
					color: #ff6b6b;

					&::placeholder {
						color: #ffb3b3;
						font-weight: 400;
					}
				}
			}
		}

		.balance-after {
			background: #f8f9fa;
			border-radius: 8px;
			padding: 12px 16px;
			display: flex;
			justify-content: space-between;
			align-items: center;
			animation: slideIn 0.3s ease-out;

			.balance-after-label {
				font-size: 14px;
				color: #666;
			}

			.balance-after-amount {
				font-size: 16px;
				font-weight: 600;
				color: #52c41a;

				&.insufficient {
					color: #ff4d4f;
				}
			}
		}
	}
}

.info-section {
	margin: 0 16px 16px;
	background: white;
	border-radius: 12px;
	overflow: hidden;

	.section-title {
		padding: 16px 20px 8px;
		font-size: 16px;
		font-weight: 600;
		color: #333;
	}

	.info-list {
		.info-item {
			padding: 12px 20px;
			border-bottom: 1px solid #f0f0f0;

			&:last-child {
				border-bottom: none;
			}

			.label {
				display: block;
				font-size: 14px;
				color: #666;
				margin-bottom: 8px;
			}

			.field-input {
				:deep(.van-field__control) {
					background: transparent;
					border: none;
					padding: 0;
					font-size: 16px;
					color: #333;

					&::placeholder {
						color: #c0c0c0;
					}
				}
			}

			.time-display {
				font-size: 16px;
				color: #4a90e2;
				padding: 4px 0;
				cursor: pointer;

				&:active {
					opacity: 0.7;
				}
			}
		}
	}
}

.action-section {
	padding: 24px 16px;

	.confirm-btn {
		height: 48px;
		background: #ff6b6b;
		border: none;
		font-size: 16px;
		font-weight: 600;

		&:active {
			background: #ff5252;
		}

		&.van-button--disabled {
			background: #f0f0f0 !important;
			color: #c0c0c0 !important;
		}
	}
}

// 动画效果
@keyframes slideIn {
	from {
		opacity: 0;
		transform: translateY(-10px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

// vant组件样式覆盖
:deep(.van-nav-bar__title) {
	color: #333;
	font-weight: 600;
}

:deep(.van-nav-bar__text) {
	color: #4a90e2;
	font-weight: 500;
}

:deep(.van-field__body) {
	padding: 0;
}

:deep(.van-field__control) {
	line-height: 1.4;
}
</style>
