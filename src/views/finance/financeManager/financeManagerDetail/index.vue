<template>
	<div class="finance-detail-container">
		<!-- Header Section
		<div class="page-header">
			<div class="header-icon">
				<van-icon
					name="orders-o"
					size="32"
					color="#1989fa"
				/>
			</div>
			<div class="header-text">请填写下方的交易明细以完成记录</div>
		</div> -->

		<van-form
			@submit="onSubmit"
			:rules="rulesRef"
			required="auto"
			class="custom-form"
		>
			<template
				v-for="field in formFields"
				:key="field.name"
			>
				<div class="custom-field-container">
					<div
						class="field-label"
						:class="{ required: isRequired(field.name) }"
					>
						{{ field.label }}
					</div>

					<!-- INPUT Type -->
					<van-field
						v-if="field.type === 'input'"
						v-model="formInfo[field.name]"
						:name="field.name"
						:type="field.inputType || 'text'"
						:placeholder="'请输入' + field.label"
						:rules="rulesRef[field.name as keyof typeof rulesRef]"
						class="custom-input"
						:class="{ 'money-input': field.name === 'amount' }"
					>
						<template
							#left-icon
							v-if="field.name === 'amount'"
						>
							<span class="currency-symbol">¥</span>
						</template>
					</van-field>

					<!-- SELECT / DATE Type -->
					<van-field
						v-else
						v-model="nameRefMap[field.name as keyof typeof nameRefMap].value"
						:name="field.name"
						:placeholder="field.type === 'date' ? 'yyyy年mm月dd日' : '请选择' + field.label"
						readonly
						:rules="rulesRef[field.name as keyof typeof rulesRef]"
						@click="field.type === 'date' ? chooseDate() : choose(field.name)"
						class="custom-input"
					>
						<template #right-icon>
							<van-icon :name="field.type === 'date' ? 'calendar-o' : 'arrow-down'" />
						</template>
					</van-field>
				</div>
			</template>

			<div class="submit-btn-container">
				<van-button
					round
					block
					type="primary"
					native-type="submit"
					class="custom-submit-btn"
				>
					提交
				</van-button>
			</div>
		</van-form>

		<!-- Popups -->
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

const label = reactive({
	name: '名称',
	typeCode: '类别',
	amount: '金额',
	fromSource: '支付方式',
	incomeAndExpenses: '收支类型',
	isValid: '状态',
	infoDate: '业务时间',
	belongTo: '属于',
});

// 表单字段配置，用于循环渲染
const formFields = computed(() => {
	const infoDateLabel = formInfo.value.incomeAndExpenses === 'income' ? '收入时间' : '支出时间';
	return [
		{ name: 'name', label: label.name, type: 'input' },
		{ name: 'typeCode', label: label.typeCode, type: 'input' },
		{ name: 'amount', label: label.amount, type: 'input', inputType: 'number' },
		{ name: 'fromSource', label: label.fromSource, type: 'select' },
		{ name: 'incomeAndExpenses', label: label.incomeAndExpenses, type: 'select' },
		{ name: 'isValid', label: label.isValid, type: 'select' },
		{ name: 'infoDate', label: infoDateLabel, type: 'date' },
		{ name: 'belongTo', label: label.belongTo, type: 'select' },
	] as {
		name: string;
		label: string;
		type: 'input' | 'select' | 'date';
		inputType?: 'text' | 'number' | 'tel' | 'digit' | 'password';
	}[];
});

const isRequired = (name: string) => {
	const rule = rulesRef[name as keyof typeof rulesRef];
	return rule && rule.some((r: { required: boolean }) => r.required);
};

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

const onSubmit = async () => {
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
	padding: 16px 20px;
	height: 100%;
	overflow-y: auto;
	background-color: #fff;
}

.page-header {
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-bottom: 24px;

	.header-icon {
		width: 48px;
		height: 48px;
		background-color: #e8f3ff;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 12px;
	}

	.header-text {
		color: #969799;
		font-size: 12px;
	}
}

.custom-form {
	.custom-field-container {
		margin-bottom: 20px;

		.field-label {
			font-size: 14px;
			font-weight: bold;
			color: #323233;
			margin-bottom: 8px;

			&.required::after {
				content: '*';
				color: #ee0a24;
				margin-left: 2px;
			}

			.optional {
				font-size: 12px;
				color: #969799;
				font-weight: normal;
				margin-left: 4px;
			}
		}

		:deep(.van-cell) {
			padding: 0;
			overflow: visible;

			&::after {
				display: none;
			}
		}

		:deep(.custom-input) {
			background-color: #f7f8fa;
			border-radius: 8px;
			padding: 10px 12px;

			.van-field__control {
				height: 24px;
				line-height: 24px;
			}

			&.textarea-input {
				.van-field__control {
					height: auto;
				}
			}
		}

		:deep(.money-input) {
			.currency-symbol {
				color: #969799;
				margin-right: 4px;
				font-size: 16px;
			}
		}
	}
}

.submit-btn-container {
	margin-top: 32px;

	.custom-submit-btn {
		height: 44px;
		font-size: 16px;
		font-weight: 600;
	}
}
</style>
