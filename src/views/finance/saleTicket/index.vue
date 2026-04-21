<template>
	<div class="sale-ticket-container">
		<!-- Header Card -->
		<div class="header-card">
			<div class="header-content">
				<div class="header-title">
					<span class="title-main">订单结算</span>
					<span class="title-sub">ORDER CHECKOUT SYSTEM</span>
				</div>
				<div class="amount-display">
					<van-icon
						name="shopping-cart-o"
						class="amount-icon"
					/>
					<span class="currency">¥</span>
					<span class="amount-value">{{ saleOrderInfo.saleAmount || '0.00' }}</span>
				</div>
			</div>
		</div>

		<van-form
			@submit="submitOrderInfo"
			class="custom-form"
		>
			<!-- Section 1: Order Details -->
			<div
				class="form-section-card"
				v-if="saleOrderInfo.shopOrderDetailVoList?.length"
			>
				<div class="section-title">订单明细</div>
				<div class="order-item-list">
					<div
						v-for="item in saleOrderInfo.shopOrderDetailVoList"
						:key="item?.id || item?.shopStockId"
						class="order-item"
					>
						<div class="item-info">
							<div class="item-name">{{ item.shopName }}</div>
							<div class="item-code">
								<van-tag
									type="primary"
									plain
								>
									{{ item.oldShopCode }}</van-tag>
							</div>
							<div class="item-price">¥{{ item.saleAmount }}</div>
						</div>
						<div class="item-action">
							<van-stepper
								v-model="item.saleNum"
								min="1"
								theme="round"
								button-size="22px"
							/>
						</div>
					</div>
				</div>
			</div>

			<!-- Section 2: Payment Details -->
			<div class="form-section-card">
				<div class="section-title">结算详情</div>
				<div class="field-item">
					<div class="field-label required">实收金额</div>
					<van-field
						v-model="saleOrderInfo.saleAmount"
						name="saleAmount"
						type="number"
						placeholder="0.00"
						class="custom-input money-input"
					>
						<template #left-icon>
							<span class="currency-symbol">¥</span>
						</template>
						<template #extra>
							<div
								class="old-amount"
								v-if="showOldAmount"
							>
								原额: ¥{{ sumAmount }}
							</div>
						</template>
					</van-field>
				</div>
				<div class="field-item">
					<div class="field-label required">支付方式</div>
					<van-field
						v-model="payWayName"
						name="payWay"
						placeholder="选择支付方式"
						readonly
						@click="choose('payWay')"
						class="custom-input"
					>
						<template #right-icon>
							<van-icon name="arrow-down" />
						</template>
					</van-field>
				</div>
			</div>

			<div class="submit-btn-wrapper">
				<van-button
					round
					block
					type="primary"
					native-type="submit"
					class="gradient-submit-btn"
					:loading="submitLoading"
				>
					<template #default>
						<div class="btn-content">
							<span>确认提交订单</span>
							<van-icon
								name="passed"
								class="btn-icon"
							/>
						</div>
					</template>
				</van-button>
			</div>
		</van-form>

		<select-pop
			:info="popInfo"
			@select-info="selectInfo"
			@cancel-info="cancelInfo"
		/>
	</div>
</template>

<script setup lang="ts">
import { showFailToast, showSuccessToast } from 'vant';
import dayjs from 'dayjs';
import type { ShopCartData } from '../shopCart/config';
import commonUtils from '@/utils/common/index';
import { getShopList } from '@/views/finance/shopStock/api/index';
import { submitOrder } from '@/views/finance/shopOrder/api/index';
import { getShopCartList } from '@/views/finance/shopCart/api/index';
import { getDictList } from '@/views/finance/dict/api/index';
import { useNavBar } from '@/composables/useNavBar';
import { useTabBar } from '@/composables/useTabBar';
import { getListName } from '@/views/common/config';
import type { ShopStockData } from '@/views/finance/shopStock/config';
import type { SaleOrderInfo } from '@/views/finance/saleTicket/saleTicketTs';
import type { Info } from '@/views/common/pop/selectPop.vue';
import type { DictInfo } from '@/views/finance/dict/api/index';

const route = useRoute();
const router = useRouter();

// NavBar 系统
useNavBar({
	title: (route?.meta?.title as string) || '订单提交',
	visible: true,
});

// TabBar 配置
useTabBar({
	visible: false,
});

// --- Variables ---
const sumAmount = computed(() => {
	if (!saleOrderInfo.value?.shopOrderDetailVoList?.length) return 0;
	return saleOrderInfo.value.shopOrderDetailVoList.reduce((total, item) => {
		return commonUtils.plus(total, commonUtils.multiply(item.saleAmount || 0, item.saleNum || 0));
	}, 0);
});

const showOldAmount = computed(() => {
	return Number(saleOrderInfo.value.saleAmount || 0) < sumAmount.value;
});

const submitLoading = ref<boolean>(false);
const saleOrderInfo = ref<SaleOrderInfo>({
	saleAmount: 0,
	payWay: 'wx',
	shopOrderDetailVoList: [],
});

const payWayName = ref<string>('');
const popInfo = ref<Info>({ showFlag: false });

const payWayInfo = ref<Info>({
	label: 'payWay',
	labelName: '支付方式',
	customFieldName: {
		text: 'typeName',
		value: 'typeCode',
	},
	rule: [{ required: true, message: '支付方式不能为空！' }],
	selectValue: saleOrderInfo.value.payWay,
});

// --- Methods ---
const choose = (type: string) => {
	if (type === 'payWay') {
		popInfo.value = payWayInfo.value;
		popInfo.value.showFlag = true;
	}
};

const cancelInfo = () => {
	popInfo.value.showFlag = false;
};

const selectInfo = (type: string, value: string, name: string) => {
	popInfo.value.showFlag = false;
	if (type === 'payWay') {
		saleOrderInfo.value.payWay = value;
		payWayName.value = name;
	}
};

const submitOrderInfo = async () => {
	navigator.vibrate?.(50);
	submitLoading.value = true;
	try {
		const res = await submitOrder(saleOrderInfo.value);
		if (res?.code == '200') {
			showSuccessToast('订单提交成功！');
			router.push({ name: 'shopProduct' });
		} else {
			showFailToast(res?.message || '提交订单失败，请联系管理员！');
		}
	} catch (error) {
		showFailToast((error as Error)?.message || '系统异常，请联系管理员！');
	} finally {
		submitLoading.value = false;
	}
};

const getDictInfoList = (data: DictInfo[]) => {
	payWayInfo.value.list = data.filter((item: DictInfo) => item.belongTo == 'shop_pay_way');
	payWayName.value = getListName(payWayInfo.value.list || [], saleOrderInfo.value.payWay || '', 'typeCode', 'typeName');
};

const getShopListInfo = async (ids: string) => {
	try {
		const { code, data, message } = await getShopList(ids);
		if (code == '200' && Array.isArray(data)) {
			saleOrderInfo.value.shopOrderDetailVoList = (data as ShopStockData[]).map((item: ShopStockData) => ({
				shopName: item.shopName,
				shopCode: item.shopCode,
				oldShopCode: item.oldShopCode,
				saleAmount: item.saleAmount,
				saleDate: dayjs(),
				saleNum: 1,
				shopStockId: item.id,
			}));
		} else {
			showFailToast(message || '获取订单数据失败');
		}
	} catch (error) {
		showFailToast((error as Error)?.message || '网络异常');
	}
};

const getShopCartListInfo = async (ids: string) => {
	try {
		const { code, data, message } = await getShopCartList(ids);
		if (code == '200' && Array.isArray(data)) {
			saleOrderInfo.value.shopOrderDetailVoList = (data as ShopCartData[]).map((item: ShopCartData) => ({
				shopName: item.shopName,
				shopCode: item.shopCode,
				oldShopCode: item.oldShopCode,
				saleAmount: item.saleAmount,
				saleDate: dayjs(),
				saleNum: item.saleNum,
				shopStockId: item.shopId,
				shopCartId: item.id,
			}));
		} else {
			showFailToast(message || '获取购物车数据失败');
		}
	} catch (error) {
		showFailToast((error as Error)?.message || '网络异常');
	}
};

const init = async () => {
	const params = route.query;
	const dictRes = await getDictList('shop_pay_way');
	if (dictRes?.code === '200') {
		getDictInfoList(dictRes.data || []);
	}

	if (params.type === 'shopCart') {
		await getShopCartListInfo(params.ids as string);
	} else if (params.type === 'shopProduct') {
		await getShopListInfo(params.ids as string);
	}
};

// --- Lifecycle ---
onMounted(() => {
	init();
});

// --- Watchers ---
watch(
	() => saleOrderInfo.value.shopOrderDetailVoList,
	() => {
		saleOrderInfo.value.saleAmount = sumAmount.value;
	},
	{ deep: true },
);
</script>

<style lang="less" scoped>
.sale-ticket-container {
	padding: 0;
	height: 100%;
	overflow-y: auto;
	background-color: #f7f9fc;
}

.header-card {
	margin: 20px;
	padding: 24px;
	background: linear-gradient(135deg, #3d7fff 0%, #2b5cfd 100%);
	border-radius: 16px;
	box-shadow: 0 8px 20px rgba(43, 92, 253, 0.2);
	color: #fff;

	.header-title {
		margin-bottom: 20px;
		display: flex;
		flex-direction: column;

		.title-main {
			font-size: 20px;
			font-weight: 700;
			letter-spacing: 0.5px;
		}

		.title-sub {
			font-size: 10px;
			opacity: 0.7;
			margin-top: 4px;
			letter-spacing: 1px;
		}
	}

	.amount-display {
		display: flex;
		align-items: baseline;
		gap: 8px;

		.amount-icon {
			font-size: 24px;
			margin-right: 4px;
		}

		.currency {
			font-size: 20px;
			font-weight: 600;
		}

		.amount-value {
			font-size: 32px;
			font-weight: 700;
		}
	}
}

.custom-form {
	padding: 0 16px 20px;

	.form-section-card {
		background: #fff;
		border-radius: 16px;
		padding: 20px;
		margin-bottom: 16px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);

		.section-title {
			font-size: 13px;
			font-weight: 600;
			color: #3d7fff;
			margin-bottom: 20px;
		}

		.order-item-list {
			.order-item {
				display: flex;
				justify-content: space-between;
				align-items: center;
				padding: 12px 0;
				border-bottom: 1px solid #f1f5f9;

				&:last-child {
					border-bottom: none;
					padding-bottom: 0;
				}

				&:first-child {
					padding-top: 0;
				}

				.item-info {
					flex: 1;
					.item-name {
						font-size: 15px;
						font-weight: 600;
						color: #1e293b;
						margin-bottom: 4px;
					}
					.item-code {
						margin-bottom: 4px;
					}
					.item-price {
						font-size: 14px;
						color: #ef4444;
						font-weight: 600;
					}
				}

				.item-action {
					flex-shrink: 0;
				}
			}
		}

		.field-item {
			display: flex;
			align-items: center;
			margin-bottom: 16px;

			&:last-child {
				margin-bottom: 0;
			}

			.field-label {
				font-size: 14px;
				color: #64748b;
				font-weight: 500;
				width: 72px;
				flex-shrink: 0;

				&.required::after {
					content: '*';
					color: #ee0a24;
					margin-left: 2px;
				}
			}

			:deep(.custom-input) {
				flex: 1;
				background-color: #f8fafc;
				border-radius: 12px;
				padding: 8px 12px;

				&::after {
					display: none;
				}

				.van-field__control {
					font-size: 14px;
					color: #323233;
					font-weight: 500;
				}

				.old-amount {
					font-size: 11px;
					color: #94a3b8;
					text-decoration: line-through;
				}
			}
		}

		:deep(.money-input) {
			.currency-symbol {
				color: #3d7fff;
				font-weight: 700;
				font-size: 18px;
				margin-right: 8px;
			}

			.van-field__control {
				font-size: 20px;
				color: #3d7fff;
				font-weight: 700;
			}
		}
	}
}

.submit-btn-wrapper {
	margin-top: 10px;
	padding: 0 4px;

	.gradient-submit-btn {
		height: 52px;
		background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
		border: none;
		border-radius: 14px;
		box-shadow: 0 6px 16px rgba(239, 68, 68, 0.4);

		.btn-content {
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 10px;

			span {
				font-size: 17px;
				font-weight: 600;
				letter-spacing: 1px;
			}

			.btn-icon {
				font-size: 18px;
			}
		}
	}
}
</style>
