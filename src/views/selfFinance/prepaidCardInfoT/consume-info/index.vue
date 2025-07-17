<template>
	<div class="consume-page">
		<!-- 消费页面标题栏 -->
		<van-nav-bar
			title="消费"
			left-text="返回"
			left-arrow
			right-text="确认"
			@click-left="goBack"
			@click-right="confirmConsume"
			class="nav-bar"
		/>

		<!-- 余额展示区域 -->
		<div class="balance-section">
			<div class="balance-card">
				<div class="balance-label">可用余额</div>
				<div class="balance-amount">
					¥ {{ formatBalance(formData.balance) }}
				</div>
			</div>
		</div>

		<!-- 消费金额输入区域 -->
		<div class="amount-section">
			<div class="amount-card">
				<div class="card-title">消费金额</div>
				<div class="amount-display">
					<span class="currency">¥</span>
					<van-field
						v-model="formData.amount"
						placeholder="0.00"
						type="number"
						class="amount-input"
						@input="validateAmount"
						@focus="onAmountFocus"
						@blur="onAmountBlur"
					/>
				</div>
				<div
					class="balance-after"
					v-if="formData.amount && parseFloat(formData.amount) > 0"
				>
					<div class="balance-after-label">消费后余额</div>
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
					<div class="time-display" @click="updateCurrentTime">
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
</template>

<script setup lang="ts">
import { showToast, showSuccessToast, showConfirmDialog } from 'vant';
import { getPrepaidCardInfoDetail } from '../api/index';

const route = useRoute();
const router = useRouter();

// 表单数据对象
const formData = reactive({
	amount: '', // 消费金额
	balance: 117.23, // 当前余额
	cardName: '', // 消费卡名称
	remark: '', // 备注信息
	consumeTime: new Date(), // 消费时间
	type: 'consume', // 消费类型
	cardId: '', // 消费卡ID
});

// 计算属性：消费后余额
const balanceAfter = computed(() => {
	const amountValue = parseFloat(formData.amount) || 0;
	return formData.balance - amountValue;
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
function formatDateTime(date: Date) {
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	const hours = String(date.getHours()).padStart(2, '0');
	const minutes = String(date.getMinutes()).padStart(2, '0');
	return `${month}月${day}日 ${hours}:${minutes}`;
}

// 更新当前时间
const updateCurrentTime = () => {
	formData.consumeTime = new Date();
	showToast('已更新为当前时间');
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

// 返回上一页
const goBack = () => {
	router.back();
};

// 确认消费
const confirmConsume = async () => {
	// 验证必填字段
	if (!formData.amount || parseFloat(formData.amount) <= 0) {
		showToast('请输入有效的消费金额');
		return;
	}
	if (!formData.cardName.trim()) {
		showToast('请输入消费卡名称');
		return;
	}
	if (parseFloat(formData.amount) > formData.balance) {
		showToast('余额不足，无法完成消费');
		return;
	}

	try {
		await showConfirmDialog({
			title: '确认消费',
			message: `确认消费 ¥${formData.amount}？`,
		});

		loading.value = true;

		// 模拟API调用
		setTimeout(() => {
			console.log('确认消费', {
				amount: formData.amount,
				cardName: formData.cardName,
				consumeTime: formData.consumeTime,
				remark: formData.remark,
				balanceAfter: balanceAfter.value,
			});

			loading.value = false;
			showSuccessToast('消费成功');
			router.back();
		}, 1500);
	} catch {
		// 用户取消消费
	}
};

// 获取预付卡信息
const getPrepaidCardInfoDetailInfo = async () => {
	console.log(`getPrepaidCardInfoList`);
	try {
		const {
			code,
			data,
			message: messageInfo,
		} = await getPrepaidCardInfoDetail(formData.cardId);

		if (code === '200') {
			// 取第一张卡片的信息
			const cardInfo = data;
			console.log(`data: ${JSON.stringify(data)}`, data);
			formData.cardName = cardInfo.cardName;
			formData.balance = cardInfo.currentBalance || cardInfo.balance;
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
	formData.cardId = cardId as string;
	formData.type = type as string;
	// 获取预付卡信息
	getPrepaidCardInfoDetailInfo();
};

init();
</script>

<style scoped lang="scss">
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
				color: #ff6b6b;
				margin-right: 8px;
			}

			.amount-input {
				flex: 1;

				:deep(.van-field__control) {
					background: transparent;
					border: none;
					color: #ff6b6b;
					font-size: 36px;
					font-weight: 700;
					padding: 0;
					text-align: left;

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
