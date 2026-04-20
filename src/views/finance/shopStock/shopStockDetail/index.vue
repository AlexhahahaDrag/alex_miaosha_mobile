<template>
	<div class="shop-stock-detail-container">
		<!-- Header Card -->
		<div class="header-card">
			<div class="header-content">
				<div class="header-title">
					<span class="title-main">{{ formInfo.id ? '编辑库存记录' : '新增库存记录' }}</span>
					<span class="title-sub">SHOP STOCK INVENTORY ENTRY</span>
				</div>
			</div>
		</div>

		<van-form
			@submit="onSubmit"
			:rules="rulesRef"
			required="auto"
			class="custom-form"
		>
			<!-- Section 1: Product Info -->
			<div class="form-section-card">
				<div class="section-title">商品基本信息</div>
				<div class="field-item">
					<div class="field-label required">商品名称</div>
					<van-field
						v-model="formInfo.shopName"
						name="shopName"
						placeholder="请输入商品名称"
						:rules="rulesRef.shopName"
						class="custom-input"
						maxlength="255"
					/>
				</div>
				<div class="field-item">
					<div class="field-label required">商品编码</div>
					<van-field
						v-model="formInfo.shopCode"
						name="shopCode"
						placeholder="自动生成商品编码"
						readonly
						class="custom-input"
					/>
				</div>
				<div class="field-item">
					<div class="field-label">原编码</div>
					<van-field
						v-model="formInfo.oldShopCode"
						name="oldShopCode"
						placeholder="请输入原商品编码"
						class="custom-input"
						maxlength="255"
					/>
				</div>
				<div class="field-item">
					<div class="field-label required">商品类别</div>
					<van-field
						v-model="nameRefMap.category.value"
						name="category"
						placeholder="选择商品类别"
						readonly
						:rules="rulesRef.category"
						@click="choose('category')"
						class="custom-input"
					>
						<template #right-icon>
							<van-icon name="arrow-down" />
						</template>
					</van-field>
				</div>
			</div>

			<!-- Section 2: Price & Quantity -->
			<div class="form-section-card">
				<div class="section-title">库存与价格</div>
				<div class="field-item">
					<div class="field-label required">成本价</div>
					<van-field
						v-model="formInfo.costAmount"
						name="costAmount"
						type="number"
						placeholder="0.00"
						:rules="rulesRef.costAmount"
						class="custom-input money-input"
					>
						<template #left-icon>
							<span class="currency-symbol">¥</span>
						</template>
					</van-field>
				</div>
				<div class="field-item">
					<div class="field-label required">零售价</div>
					<van-field
						v-model="formInfo.saleAmount"
						name="saleAmount"
						type="number"
						placeholder="0.00"
						:rules="rulesRef.saleAmount"
						class="custom-input money-input"
					>
						<template #left-icon>
							<span class="currency-symbol">¥</span>
						</template>
					</van-field>
				</div>
				<div class="field-item">
					<div class="field-label required">进货数量</div>
					<van-field
						v-model="formInfo.saleNum"
						name="saleNum"
						type="digit"
						placeholder="请输入数量"
						:rules="rulesRef.saleNum"
						class="custom-input"
					/>
				</div>
			</div>

			<!-- Section 3: Specifications -->
			<div class="form-section-card">
				<div class="section-title">商品规格</div>
				<div class="field-item">
					<div class="field-label">尺码</div>
					<van-field
						v-model="formInfo.size"
						name="size"
						placeholder="如: XL, 42"
						class="custom-input"
					/>
				</div>
				<div class="field-item">
					<div class="field-label">颜色</div>
					<van-field
						v-model="formInfo.color"
						name="color"
						placeholder="如: 黑色, 藏青"
						class="custom-input"
					/>
				</div>
				<div class="field-item">
					<div class="field-label">款式</div>
					<van-field
						v-model="formInfo.style"
						name="style"
						placeholder="如: 圆领, 修身"
						class="custom-input"
					/>
				</div>
			</div>

			<!-- Section 4: System Info -->
			<div class="form-section-card">
				<div class="section-title">系统信息</div>
				<div class="field-item">
					<div class="field-label required">状态</div>
					<van-field
						v-model="nameRefMap.isValid.value"
						name="isValid"
						placeholder="选择状态"
						readonly
						:rules="rulesRef.isValid"
						@click="choose('isValid')"
						class="custom-input"
					>
						<template #right-icon>
							<van-icon name="arrow-down" />
						</template>
					</van-field>
				</div>
				<div class="field-item">
					<div class="field-label required">进货日期</div>
					<van-field
						v-model="nameRefMap.saleDate.value"
						name="saleDate"
						placeholder="yyyy年mm月dd日"
						readonly
						:rules="rulesRef.saleDate"
						@click="chooseDate"
						class="custom-input"
					>
						<template #right-icon>
							<van-icon name="calendar-o" />
						</template>
					</van-field>
				</div>
				<div class="field-item">
					<div class="field-label required">进货地点</div>
					<van-field
						v-model="nameRefMap.purchasePlace.value"
						name="purchasePlace"
						placeholder="选择进货地点"
						readonly
						:rules="rulesRef.purchasePlace"
						@click="choose('purchasePlace')"
						class="custom-input"
					>
						<template #right-icon>
							<van-icon name="arrow-down" />
						</template>
					</van-field>
				</div>
				<div class="field-item">
					<div class="field-label required">进货批次</div>
					<van-field
						v-model="nameRefMap.stockBatch.value"
						name="stockBatch"
						placeholder="选择批次"
						readonly
						:rules="rulesRef.stockBatch"
						@click="choose('stockBatch')"
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
					:loading="loading"
				>
					<template #default>
						<div class="btn-content">
							<span>提交记录</span>
							<van-icon
								name="paper-plane"
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
		>
		</select-pop>
		<date-pop
			:info="chooseDateInfo"
			@select-date-info="selectDateInfo"
			@cancel-date-info="cancelDateInfo"
		>
		</date-pop>
	</div>
</template>

<script setup lang="ts">
import dayjs, { type Dayjs } from 'dayjs';
import { showFailToast, showSuccessToast } from 'vant';
import { type ShopStockData } from '../config';
import { label, rulesRef } from './shopStockDetailTs';
import { getListName, type DictFieldConfig } from '@/views/common/config';
import { addShopStock, updateShopStock, getShopStockDetail } from '@/views/finance/shopStock/api';
import type { Info } from '@/views/common/pop/selectPop.vue';
import { getDictList } from '@/views/finance/dict/api';
import { useNavBar } from '@/composables/useNavBar';
import { useTabBar } from '@/composables/useTabBar';
import { getRoutePathByName } from '@/utils/router';
import { datePickerFormatter } from '@/utils/dayjs';
import type { DatePickerInfo } from '@/utils/common';
import type { DictInfo } from '@/views/finance/dict/api';

const route = useRoute();
const router = useRouter();

// 使用NavBar系统
useNavBar({
	title: (route?.meta?.title as string) || '商店库存明细',
	leftPath: getRoutePathByName(router, 'shopStock'),
	visible: true,
});

// TabBar配置
useTabBar({
	visible: false,
});

// --- Variables ---
const formInfo = ref<ShopStockData>({});
// 提交按钮loading状态
const loading = ref<boolean>(false);

const popInfo = ref<Info>({ showFlag: false });

// 统一字典信息配置
const dictFieldConfig: DictFieldConfig<ShopStockData>[] = [
	{
		key: 'isValid',
		labelName: label.isValid,
		rule: rulesRef.isValid,
		belongTo: 'is_valid',
		formKey: 'isValid',
	},
	{
		key: 'category',
		labelName: label.category,
		rule: rulesRef.category,
		belongTo: 'shop_category',
		formKey: 'category',
	},
	{
		key: 'purchasePlace',
		labelName: label.purchasePlace,
		rule: rulesRef.purchasePlace,
		belongTo: 'stock_place',
		formKey: 'purchasePlace',
	},
	{
		key: 'stockBatch',
		labelName: label.stockBatch,
		rule: rulesRef.stockBatch,
		belongTo: 'stock_batch',
		formKey: 'stockBatch',
	},
];

// 动态创建字典信息 ref
const dictInfoMap = dictFieldConfig.reduce(
	(acc, config) => {
		acc[config.key] = ref<Info>({
			label: config.key,
			labelName: config.labelName,
			rule: config.rule,
			customFieldName: {
				text: 'typeName',
				value: 'typeCode',
			},
			selectValue: formInfo.value[config.formKey],
		});
		return acc;
	},
	{} as Record<string, Ref<Info>>,
);

// 创建名称 ref 映射
const nameRefMap = {
	isValid: ref<string>(''),
	category: ref<string>(''),
	purchasePlace: ref<string>(''),
	stockBatch: ref<string>(''),
	saleDate: ref<string>(''),
};

const chooseDateInfo = ref<DatePickerInfo<Dayjs>>({
	label: 'saleDate',
	labelName: '进货日期',
	rule: rulesRef.saleDate,
	selectValue: dayjs(),
	showFlag: false,
	formatter: datePickerFormatter,
});

// --- Methods ---
const choose = (type: string) => {
	const info = dictInfoMap[type];
	if (info) {
		popInfo.value = info.value;
		popInfo.value.showFlag = true;
	}
};

const selectInfo = (type: string, value: string, name: string) => {
	popInfo.value.showFlag = false;
	const info = dictInfoMap[type];
	if (info) {
		const config = dictFieldConfig.find((c) => c.key === type);
		if (config) {
			formInfo.value[config.formKey] = value as never;
			nameRefMap[config.key as keyof typeof nameRefMap].value = name;
		}
	}
};

const cancelInfo = () => {
	popInfo.value.showFlag = false;
};

const chooseDate = () => {
	chooseDateInfo.value.showFlag = true;
};

const selectDateInfo = (date: Dayjs, dateName: string) => {
	formInfo.value.saleDate = date;
	nameRefMap.saleDate.value = dateName;
	chooseDateInfo.value.showFlag = false;
};

const cancelDateInfo = () => {
	chooseDateInfo.value.showFlag = false;
};

const onSubmit = async () => {
	navigator.vibrate?.(50);
	loading.value = true;
	try {
		const api = formInfo.value.id ? updateShopStock : addShopStock;
		const { code, message } = await api(formInfo.value);
		if (code == '200') {
			showSuccessToast(message || '保存成功!');
			router.push({ path: getRoutePathByName(router, 'shopStock') });
		} else {
			showFailToast(message || '保存失败，请联系管理员!');
		}
	} finally {
		loading.value = false;
	}
};

const getDictInfoList = async (data: DictInfo[]) => {
	dictFieldConfig.forEach((config) => {
		const info = dictInfoMap[config.key];
		if (info) {
			info.value.list = data.filter((item: DictInfo) => item.belongTo === config.belongTo);
			nameRefMap[config.key as keyof typeof nameRefMap].value = getListName<DictInfo>(
				info.value.list || [],
				formInfo.value[config.formKey] as string,
				'typeCode',
				'typeName',
			);
		}
	});
};

const initInfoDate = (saleDate: Dayjs) => {
	if (saleDate) {
		nameRefMap.saleDate.value = saleDate.format('YYYY年MM月DD日');
		chooseDateInfo.value.selectValue = saleDate;
	}
};

const init = async () => {
	const id = route.query.id as string;
	const type = route.query.type as string;

	try {
		const [detailRes, dictRes] = await Promise.all([
			id ? getShopStockDetail(id) : Promise.resolve({ code: '200', data: {} }),
			getDictList('is_valid,shop_category,stock_place,stock_batch'),
		]);

		if (id) {
			if (detailRes.code === '200') {
				formInfo.value = detailRes.data || {};
				formInfo.value.saleDate = dayjs(formInfo.value.saleDate);
				// 如果是复制，则删除id
				if (type === 'copy') {
					formInfo.value.id = null;
				}
			} else {
				showFailToast((detailRes as { message?: string })?.message || '查询详情失败，请联系管理员!');
			}
		} else {
			formInfo.value = {
				saleDate: dayjs(),
				isValid: '1',
				purchasePlace: 'sz',
			};
		}

		getDictInfoList(dictRes?.data || []);
		initInfoDate((formInfo.value.saleDate as Dayjs) || dayjs());
	} catch (error) {
		// eslint-disable-next-line no-console
		console.error('init error:', error);
		showFailToast('系统问题，请联系管理员！');
	}
};

init();
</script>

<style lang="less" scoped>
.shop-stock-detail-container {
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
			color: #3d7fff;
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

				.input-icon {
					color: #3d7fff;
					margin-right: 8px;
					font-size: 16px;
				}

				.van-icon-arrow-down,
				.van-icon-calendar-o {
					color: #94a3b8;
					margin-left: 4px;
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
	margin-top: 32px;
	padding: 0 4px;

	.gradient-submit-btn {
		height: 52px;
		background: linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%);
		border: none;
		border-radius: 14px;
		box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);

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
