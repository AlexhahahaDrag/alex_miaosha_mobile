<template>
	<div class="finance-detail-container">
		<!-- Header Card -->
		<div class="header-card">
			<div class="header-content">
				<div class="header-title">
					<span class="title-main">{{ formInfo.id ? '编辑财务记录' : '新增财务记录' }}</span>
					<span class="title-sub">FINANCIAL TRANSACTION ENTRY</span>
				</div>
				<div class="amount-display">
					<van-icon
						name="pending-payment"
						class="amount-icon"
					/>
					<span class="currency">¥</span>
					<span class="amount-value">{{ formInfo.amount || '0.00' }}</span>
				</div>
			</div>
		</div>

		<van-form
			@submit="onSubmit"
			:rules="rulesRef"
			required="auto"
			class="custom-form"
		>
			<!-- Section 1: Basic Info -->
			<div class="form-section-card">
				<div class="section-title">基本信息</div>
				<div class="field-item">
					<div class="field-label required">名称</div>
					<van-field
						v-model="formInfo.name"
						name="name"
						placeholder="输入记录名称"
						:rules="rulesRef.name"
						class="custom-input"
					/>
				</div>
				<div class="field-item">
					<div class="field-label required">类别</div>
					<van-field
						v-model="formInfo.typeCode"
						name="typeCode"
						placeholder="选择财务分类"
						readonly
						:rules="rulesRef.typeCode"
						@click="choose('typeCode')"
						class="custom-input"
					>
						<template #left-icon>
							<van-icon
								name="apps-o"
								class="input-icon"
							/>
						</template>
						<template #right-icon>
							<van-icon name="arrow-down" />
						</template>
					</van-field>
				</div>
			</div>

			<!-- Section 2: Transaction Details -->
			<div class="form-section-card">
				<div class="section-title">交易详情</div>
				<div class="field-item">
					<div class="field-label required">金额</div>
					<van-field
						v-model="formInfo.amount"
						name="amount"
						type="number"
						placeholder="0.00"
						:rules="rulesRef.amount"
						class="custom-input money-input"
					>
						<template #left-icon>
							<span class="currency-symbol">¥</span>
						</template>
					</van-field>
				</div>
				<div class="field-item">
					<div class="field-label required">支付方式</div>
					<van-field
						v-model="nameRefMap.fromSource.value"
						name="fromSource"
						placeholder="选择支付方式"
						readonly
						:rules="rulesRef.fromSource"
						@click="choose('fromSource')"
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
					<div class="field-label required">{{ formInfo.incomeAndExpenses === 'income' ? '收入时间' : '支出时间' }}</div>
					<van-field
						v-model="nameRefMap.infoDate.value"
						name="infoDate"
						placeholder="yyyy年mm月dd日"
						readonly
						:rules="rulesRef.infoDate"
						@click="chooseDate"
						class="custom-input"
					>
						<template #left-icon>
							<van-icon
								name="calendar-o"
								class="input-icon"
							/>
						</template>
						<template #right-icon>
							<van-icon name="calendar-o" />
						</template>
					</van-field>
				</div>
				<div class="field-item">
					<div class="field-label required">属于</div>
					<van-field
						v-model="nameRefMap.belongTo.value"
						name="belongTo"
						placeholder="选择归属"
						readonly
						:rules="rulesRef.belongTo"
						@click="choose('belongTo')"
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
import { getListName } from '@/views/common/config';
import { rulesRef, type FinanceManagerData, type DictFieldConfig } from '@/views/finance/financeManager/config';
import { getDictList } from '@/api/finance/dict/dictManager';
import { getUserManagerList } from '@/api/user/userManager';
import { useUserStore } from '@/store/modules/user/user';
import type { Info } from '@/views/common/pop/selectPop.vue';
import { datePickerFormatter } from '@/utils/dayjs';
import type { DatePickerInfo } from '@/utils/common';
import type { DictInfo } from '@/api/finance/dict/dictManager';
import type { UserManagerData } from '@/api/user/userManager';
import { addFinanceManger, editFinanceManger, getFinanceMangerDetail } from '@/views/finance/financeManager/api';
import { useNavBar } from '@/composables/useNavBar';
import { getRoutePathByName } from '@/utils/router';

const route = useRoute();
const router = useRouter();
const userInfo = useUserStore()?.getUserInfo;

// 获取左侧路径
const getLeftPath = computed(() => {
	return getRoutePathByName(router, 'financeManager');
});

// 使用新的NavBar系统
useNavBar({
	title: (route?.meta?.title as string) || '财务明细',
	leftPath: getLeftPath.value,
	visible: true,
});

const formInfo = ref<FinanceManagerData>({});
// 提交按钮loading状态
const loading = ref<boolean>(false);

const popInfo = ref<Info>({ showFlag: false });

// 统一字典信息配置
const dictFieldConfig: DictFieldConfig[] = [
	{
		key: 'fromSource',
		labelName: '支付方式',
		rule: rulesRef.fromSource,
		belongTo: 'pay_way',
		formKey: 'fromSource' as keyof FinanceManagerData,
	},
	{
		key: 'incomeAndExpenses',
		labelName: '收支类型',
		rule: rulesRef.incomeAndExpenses,
		belongTo: 'income_expense_type',
		formKey: 'incomeAndExpenses' as keyof FinanceManagerData,
	},
	{
		key: 'isValid',
		labelName: '状态',
		rule: rulesRef.isValid,
		belongTo: 'is_valid',
		formKey: 'isValid' as keyof FinanceManagerData,
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

const belongToInfo = ref<Info>({
	label: 'belongTo',
	labelName: '属于',
	rule: rulesRef.belongTo,
	customFieldName: {
		text: 'nickName',
		value: 'id',
	},
	selectValue: formInfo.value.belongTo,
});

// 创建名称 ref 映射
const nameRefMap = {
	fromSource: ref<string>(''),
	incomeAndExpenses: ref<string>(''),
	isValid: ref<string>(''),
	belongTo: ref<string>(''),
	infoDate: ref<string>(''),
};

const choose = (type: string) => {
	const info = dictInfoMap[type] || (type === 'belongTo' ? belongToInfo : null);
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
	} else if (type === 'belongTo') {
		formInfo.value.belongTo = Number(value);
		nameRefMap.belongTo.value = name;
	}
};

const cancelInfo = () => {
	popInfo.value.showFlag = false;
};

const chooseDateInfo = ref<DatePickerInfo<Dayjs>>({
	label: 'infoDate',
	labelName: '业务日期',
	rule: rulesRef.infoDate,
	selectValue: dayjs(),
	showFlag: false,
	formatter: datePickerFormatter,
});

const chooseDate = () => {
	chooseDateInfo.value.showFlag = true;
};

const selectDateInfo = (date: Dayjs, dateName: string) => {
	formInfo.value.infoDate = date;
	nameRefMap.infoDate.value = dateName;
	chooseDateInfo.value.showFlag = false;
};

const cancelDateInfo = () => {
	chooseDateInfo.value.showFlag = false;
};

// 提交表单
const onSubmit = async () => {
	loading.value = true;
	try {
		let api = addFinanceManger;
		if (formInfo.value.id) {
			api = editFinanceManger;
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

const getUserInfoList = async (data: UserManagerData[]) => {
	belongToInfo.value.list = data;
	nameRefMap.belongTo.value = getListName<UserManagerData>(data, formInfo.value.belongTo, 'id', 'nickName');
};

const initInfoDate = (infoDate: Dayjs) => {
	if (infoDate) {
		nameRefMap.infoDate.value = infoDate.format('YYYY年MM月DD日');
		chooseDateInfo.value.selectValue = infoDate;
	}
};

const init = async () => {
	const id: string = route?.query?.id as string;
	const [detailRes, userRes, dictRes] = await Promise.all([
		id ? getFinanceMangerDetail(id || '0') : Promise.resolve({ code: '200', data: {} }),
		getUserManagerList({}),
		getDictList('pay_way,income_expense_type,is_valid'),
	]);
	if (id) {
		if (detailRes.code == '200') {
			formInfo.value = detailRes?.data || {};
			formInfo.value.infoDate = dayjs(formInfo.value.infoDate);
		} else {
			showFailToast((detailRes as { message?: string })?.message || '查询详情失败，请联系管理员!');
		}
	} else {
		formInfo.value = {
			isValid: '1',
			incomeAndExpenses: 'expense',
			infoDate: dayjs(),
			belongTo: userInfo ? Number(userInfo.id) : 0,
			fromSource: 'wx',
		};
	}
	getUserInfoList(userRes?.data || []);
	getDictInfoList(dictRes?.data || []);
	initInfoDate((formInfo.value?.infoDate as Dayjs) || dayjs());
};

init();
</script>

<style lang="less" scoped>
.finance-detail-container {
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

	.footer-tips {
		text-align: center;
		font-size: 11px;
		color: #94a3b8;
		margin-top: 16px;
		padding: 0 40px;
		line-height: 1.5;
	}
}
</style>
