<template>
	<div class="shop-finance-detail-container">
		<!-- Header Card -->
		<div class="header-card">
			<div class="header-content">
				<div class="header-title">
					<span class="title-main">{{ formInfo.id ? '编辑销售记录' : '新增销售记录' }}</span>
					<span class="title-sub">SHOP FINANCE TRANSACTION ENTRY</span>
				</div>
				<div class="amount-display">
					<van-icon
						name="pending-payment"
						class="amount-icon"
					/>
					<span class="currency">¥</span>
					<span class="amount-value">{{ formInfo.saleAmount || '0.00' }}</span>
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
				<div class="section-title">商品信息</div>
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
						placeholder="请输入商品编码"
						:rules="rulesRef.shopCode"
						class="custom-input"
						maxlength="255"
					/>
				</div>
			</div>

			<!-- Section 2: Sales Details -->
			<div class="form-section-card">
				<div class="section-title">销售详情</div>
				<div class="field-item">
					<div class="field-label required">售价</div>
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
					<div class="field-label required">销售件数</div>
					<van-field
						v-model="formInfo.saleNum"
						name="saleNum"
						type="digit"
						placeholder="请输入销售件数"
						:rules="rulesRef.saleNum"
						class="custom-input"
					/>
				</div>
				<div class="field-item">
					<div class="field-label required">支付方式</div>
					<van-field
						v-model="nameRefMap.payWay.value"
						name="payWay"
						placeholder="选择支付方式"
						readonly
						:rules="rulesRef.payWay"
						@click="choose('payWay')"
						class="custom-input"
					>
						<template #right-icon>
							<van-icon name="arrow-down" />
						</template>
					</van-field>
				</div>
				<div class="field-item">
					<div class="field-label required">收支类型</div>
					<van-field
						v-model="nameRefMap.incomeAndExpenses.value"
						name="incomeAndExpenses"
						placeholder="选择收支类型"
						readonly
						:rules="rulesRef.incomeAndExpenses"
						@click="choose('incomeAndExpenses')"
						class="custom-input"
					>
						<template #right-icon>
							<van-icon name="arrow-down" />
						</template>
					</van-field>
				</div>
			</div>

			<!-- Section 3: System Info -->
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
					<div class="field-label required">销售日期</div>
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
import { rulesRef, type ShopFinanceData } from '@/views/finance/shopFinance/config';
import { getListName, type DictFieldConfig } from '@/views/common/config';
import { addShopFinance, updateShopFinance, getShopFinanceDetail } from '@/views/finance/shopFinance/api';
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
	title: (route?.meta?.title as string) || '商店财务明细',
	leftPath: getRoutePathByName(router, 'shopFinance'),
	visible: true,
});

// TabBar配置
useTabBar({
	visible: false,
});

// --- Variables ---
// 获取左侧路径
const getLeftPath = computed(() => {
	return getRoutePathByName(router, 'shopFinance');
});

const formInfo = ref<ShopFinanceData>({});
// 提交按钮loading状态
const loading = ref<boolean>(false);

const popInfo = ref<Info>({ showFlag: false });

// 统一字典信息配置
const dictFieldConfig: DictFieldConfig<ShopFinanceData>[] = [
	{
		key: 'payWay',
		labelName: '支付方式',
		rule: rulesRef.payWay,
		belongTo: 'shop_pay_way',
		formKey: 'payWay',
	},
	{
		key: 'incomeAndExpenses',
		labelName: '收支类型',
		rule: rulesRef.incomeAndExpenses,
		belongTo: 'income_expense_type',
		formKey: 'incomeAndExpenses',
	},
	{
		key: 'isValid',
		labelName: '状态',
		rule: rulesRef.isValid,
		belongTo: 'is_valid',
		formKey: 'isValid',
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
	payWay: ref<string>(''),
	incomeAndExpenses: ref<string>(''),
	isValid: ref<string>(''),
	saleDate: ref<string>(''),
};

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

const chooseDateInfo = ref<DatePickerInfo<Dayjs>>({
	label: 'saleDate',
	labelName: '销售日期',
	rule: rulesRef.saleDate,
	selectValue: dayjs(),
	showFlag: false,
	formatter: datePickerFormatter,
});

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
		let api = addShopFinance;
		if (formInfo.value.id) {
			api = updateShopFinance;
		}
		const { code, message } = await api(formInfo.value);
		if (code == '200') {
			showSuccessToast(message || '保存成功!');
			router.push({ path: getLeftPath.value });
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

const initSaleDate = (saleDate: Dayjs) => {
	if (saleDate) {
		nameRefMap.saleDate.value = saleDate.format('YYYY年MM月DD日');
		chooseDateInfo.value.selectValue = saleDate;
	}
};

const init = async () => {
	const id = route.query.id as string;

	try {
		const [detailRes, dictRes] = await Promise.all([
			id ? getShopFinanceDetail(id) : Promise.resolve({ code: '200', data: {} }),
			getDictList('shop_pay_way,income_expense_type,is_valid'),
		]);
		if (id) {
			if (detailRes.code === '200') {
				formInfo.value = detailRes.data || {};
				formInfo.value.saleDate = dayjs(formInfo.value.saleDate);
			} else {
				showFailToast((detailRes as { message?: string })?.message || '查询详情失败，请联系管理员!');
			}
		} else {
			formInfo.value = {
				saleDate: dayjs(),
				isValid: '1',
				incomeAndExpenses: 'income',
				payWay: 'wx',
				saleNum: 1,
			};
		}

		getDictInfoList(dictRes?.data || []);
		initSaleDate((formInfo.value.saleDate as Dayjs) || dayjs());
	} catch (error) {
		// eslint-disable-next-line no-console
		console.error('init error:', error);
		showFailToast('系统问题，请联系管理员！');
	}
};

init();
</script>

<style lang="less" scoped>
.shop-finance-detail-container {
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
