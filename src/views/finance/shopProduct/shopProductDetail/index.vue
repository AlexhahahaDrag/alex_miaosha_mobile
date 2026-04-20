<template>
	<div class="shop-product-detail-container">
		<!-- Header Card -->
		<div class="header-card">
			<div class="header-content">
				<div class="header-title">
					<span class="title-main">{{ formInfo.shopName || '商品详情' }}</span>
					<span class="title-sub">PRODUCT PREMIUM VIEW</span>
				</div>
				<div class="amount-display">
					<van-icon
						name="hot-o"
						class="amount-icon"
					/>
					<span class="currency">¥</span>
					<span class="amount-value">{{ formInfo.saleAmount || '0.00' }}</span>
				</div>
			</div>
		</div>

		<van-form
			required="auto"
			class="custom-form"
		>
			<!-- Section 1: Basic Info -->
			<div class="form-section-card">
				<div class="section-title">商品基本信息</div>
				<div class="field-item">
					<div class="field-label">商品名称</div>
					<van-field
						v-model="formInfo.shopName"
						name="shopName"
						readonly
						class="custom-input"
					/>
				</div>
				<div class="field-item">
					<div class="field-label">商品编码</div>
					<van-field
						v-model="formInfo.shopCode"
						name="shopCode"
						readonly
						class="custom-input"
					/>
				</div>
				<div class="field-item">
					<div class="field-label">商品类别</div>
					<van-field
						v-model="categoryName"
						name="category"
						readonly
						class="custom-input"
					/>
				</div>
			</div>

			<!-- Section 2: Product Specs -->
			<div class="form-section-card">
				<div class="section-title">规格与详情</div>
				<div class="field-item">
					<div class="field-label">数量</div>
					<van-field
						v-model="formInfo.saleNum"
						name="saleNum"
						type="digit"
						placeholder="请输入购买数量"
						class="custom-input"
					/>
				</div>
				<div class="field-item">
					<div class="field-label">状态</div>
					<van-field
						v-model="isValidName"
						name="isValid"
						readonly
						class="custom-input"
					/>
				</div>
				<div class="field-item">
					<div class="field-label">进货日期</div>
					<van-field
						v-model="saleDateName"
						name="saleDate"
						readonly
						class="custom-input"
					/>
				</div>
				<div class="field-item">
					<div class="field-label">进货地点</div>
					<van-field
						v-model="purchasePlaceName"
						name="purchasePlace"
						readonly
						class="custom-input"
					/>
				</div>
			</div>

			<div class="submit-btn-group">
				<van-button
					round
					block
					type="warning"
					class="gradient-btn-secondary"
					@click="onAddToCart"
				>
					<template #default>
						<div class="btn-content">
							<van-icon
								name="shopping-cart-o"
								class="btn-icon"
							/>
							<span>加入购物车</span>
						</div>
					</template>
				</van-button>
				<van-button
					round
					block
					type="primary"
					class="gradient-btn-primary"
					@click="onBuyNow"
				>
					<template #default>
						<div class="btn-content">
							<van-icon
								name="bag-o"
								class="btn-icon"
							/>
							<span>直接购买</span>
						</div>
					</template>
				</van-button>
			</div>
		</van-form>
	</div>
</template>

<script setup lang="ts">
import dayjs, { type Dayjs } from 'dayjs';
import { showFailToast, showSuccessToast } from 'vant';
import { type ShopStockData } from '@/views/finance/shopStock/config';
import type { DictInfo } from '@/views/common/config';
import { getListName } from '@/views/common/config';
import { getShopStockDetail } from '@/views/finance/shopStock/api';
import { getDictList } from '@/views/finance/dict/api';
import { useNavBar } from '@/composables/useNavBar';
import { useTabBar } from '@/composables/useTabBar';
import { getRoutePathByName } from '@/utils/router';

const route = useRoute();
const router = useRouter();

// 使用NavBar系统
useNavBar({
	title: (route?.meta?.title as string) || '商品详情',
	leftPath: getRoutePathByName(router, 'shopStock'),
	visible: true,
});

// TabBar配置
useTabBar({
	visible: false,
});

// --- Variables ---
const formInfo = ref<ShopStockData>({});
const isValidName = ref<string>('');
const categoryName = ref<string>('');
const purchasePlaceName = ref<string>('');
const saleDateName = ref<string>('');

// --- Methods ---
const onAddToCart = () => {
	navigator.vibrate?.(50);
	showSuccessToast('已加入购物车');
};

const onBuyNow = () => {
	navigator.vibrate?.(50);
	showSuccessToast('正在跳转支付...');
};

const getDictInfoList = (data: DictInfo[]) => {
	if (data?.length > 0) {
		isValidName.value = getListName(
			data.filter((item: { belongTo: string }) => item.belongTo == 'is_valid') || [],
			formInfo.value.isValid,
			'typeCode',
			'typeName',
		);
		categoryName.value = getListName(
			data.filter((item: { belongTo: string }) => item.belongTo == 'shop_category') || [],
			formInfo.value.category,
			'typeCode',
			'typeName',
		);
		purchasePlaceName.value = getListName(
			data.filter((item: { belongTo: string }) => item.belongTo == 'stock_place') || [],
			formInfo.value.purchasePlace,
			'typeCode',
			'typeName',
		);
	} else {
		showFailToast('查询失败，请联系管理员!');
	}
};

const initInfoDate = (infoDate: string | Dayjs | undefined) => {
	if (infoDate) {
		saleDateName.value = dayjs(infoDate).format('YYYY年MM月DD');
	}
};

const init = async () => {
	const id = route.query.id as string;
	try {
		const [detailRes, dictRes] = await Promise.all([
			id ? getShopStockDetail(id) : Promise.resolve({ code: '200', data: {} }),
			getDictList('is_valid,shop_category,stock_place'),
		]);

		if (id) {
			if (detailRes.code == '200') {
				formInfo.value = detailRes.data || {};
				initInfoDate(formInfo.value.saleDate);
			} else {
				showFailToast((detailRes as { message?: string })?.message || '查询详情失败，请联系管理员!');
			}
		} else {
			formInfo.value = {
				saleDate: dayjs(),
				purchasePlace: 'sz',
			};
			initInfoDate(formInfo.value.saleDate);
		}
		if (dictRes.code === '200') {
			getDictInfoList(dictRes.data);
		}
	} catch (error) {
		// eslint-disable-next-line no-console
		console.error('init error:', error);
		showFailToast('系统问题，请联系管理员！');
	}
};

init();
</script>

<style lang="less" scoped>
.shop-product-detail-container {
	padding: 0;
	height: 100%;
	overflow-y: auto;
	background-color: #f7f9fc;
}

.header-card {
	margin: 20px;
	padding: 24px;
	background: linear-gradient(135deg, #ff9d42 0%, #ff6b3d 100%);
	border-radius: 16px;
	box-shadow: 0 8px 20px rgba(255, 107, 61, 0.2);
	color: #fff;

	.header-title {
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
		margin-top: 20px;
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
	padding: 0 16px 10px;

	.form-section-card {
		background: #fff;
		border-radius: 16px;
		padding: 20px;
		margin-bottom: 16px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);

		.section-title {
			font-size: 13px;
			font-weight: 600;
			color: #ff6b3d;
			margin-bottom: 20px;
			padding-left: 0;
			display: flex;
			align-items: center;

			&::before {
				display: none;
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
				margin-bottom: 0;
			}

			:deep(.custom-input) {
				flex: 1;
				background-color: #f8fafc;
				border-radius: 12px;
				padding: 8px 12px;
				border: 1px solid transparent;
				transition: all 0.3s;

				&::after {
					display: none;
				}

				.van-field__control {
					font-size: 14px;
					color: #323233;
					font-weight: 500;
					text-align: left;

					&::placeholder {
						color: #c8c9cc;
						font-weight: 400;
					}
				}
			}
		}
	}
}

.submit-btn-group {
	margin-top: 32px;
	padding: 0 4px;
	display: flex;
	gap: 12px;

	.gradient-btn-primary {
		height: 52px;
		background: linear-gradient(135deg, #ff6b3d 0%, #ff8c3d 100%);
		border: none;
		border-radius: 14px;
		box-shadow: 0 6px 16px rgba(255, 107, 61, 0.3);
	}

	.gradient-btn-secondary {
		height: 52px;
		background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
		border: none;
		border-radius: 14px;
		box-shadow: 0 6px 16px rgba(245, 158, 11, 0.2);
	}

	.btn-content {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;

		span {
			font-size: 15px;
			font-weight: 600;
			letter-spacing: 0.5px;
		}

		.btn-icon {
			font-size: 18px;
		}
	}
}
</style>
