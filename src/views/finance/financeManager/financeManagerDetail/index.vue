<template>
	<van-form
		@submit="onSubmit"
		:rules="rulesRef"
		required="auto"
	>
		<van-cell-group inset>
			<template
				v-for="field in formFields"
				:key="field.name"
			>
				<van-field
					v-if="field.type === 'input'"
					v-model="formInfo[field.name]"
					:name="field.name"
					:label="field.label + '：'"
					:placeholder="'请输入' + field.label"
					:rules="rulesRef[field.name]"
					:type="field.inputType || 'text'"
				/>
				<van-field
					v-else
					v-model="nameRefMap[field.name as keyof typeof nameRefMap].value"
					:name="field.name"
					:label="field.label + '：'"
					:placeholder="'请选择' + field.label"
					:rules="rulesRef[field.name]"
					@click="field.type === 'date' ? chooseDate() : choose(field.name)"
					readonly
				/>
			</template>
			<select-pop
				:info="popInfo"
				@select-info="selectInfo"
				@cancel-info="cancelInfo"
			>
			</select-pop>
			<datePop
				:info="chooseDateInfo"
				@select-date-info="selectDateInfo"
				@cancel-date-info="cancelDateInfo"
			>
			</datePop>
		</van-cell-group>
		<div style="margin: 16px">
			<van-button
				round
				block
				type="primary"
				native-type="submit"
			>
				提交
			</van-button>
		</div>
	</van-form>
</template>

<script setup lang="ts">
import dayjs, { type Dayjs } from 'dayjs';
import { showFailToast, showSuccessToast } from 'vant';
import { getListName } from '@/views/common/config';
import { rulesRef, type FinanceManagerData } from '@/views/finance/financeManager/config';
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

const route = useRoute();
const router = useRouter();
const userInfo = useUserStore()?.getUserInfo;

// 使用新的NavBar系统
useNavBar({
	title: (route?.meta?.title as string) || '财务明细',
	leftPath: '/selfFinance/financeManager',
	visible: true,
});

const formInfo = ref<FinanceManagerData>({});

const label = reactive({
	name: '名称',
	amount: '金额',
	typeCode: '类别',
	fromSource: '支付方式',
	incomeAndExpenses: '收支类型',
	isValid: '状态',
	infoDate: '业务时间',
	belongTo: '属于',
});

// 表单字段配置，用于循环渲染
const formFields: {
	name: string;
	label: string;
	type: 'input' | 'select' | 'date';
	inputType?: 'text' | 'number' | 'tel' | 'digit' | 'password';
}[] = [
	{ name: 'name', label: label.name, type: 'input' },
	{ name: 'typeCode', label: label.typeCode, type: 'input' },
	{ name: 'amount', label: label.amount, type: 'input', inputType: 'number' },
	{ name: 'fromSource', label: label.fromSource, type: 'select' },
	{ name: 'incomeAndExpenses', label: label.incomeAndExpenses, type: 'select' },
	{ name: 'isValid', label: label.isValid, type: 'select' },
	{ name: 'infoDate', label: label.infoDate, type: 'date' },
	{ name: 'belongTo', label: label.belongTo, type: 'select' },
];

const popInfo = ref<Info>({ showFlag: false });

// 统一字典信息配置，使用映射创建，减少重复代码
const dictFieldConfig = [
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
] as const;

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

// 创建名称 ref 映射，统一管理所有字段的显示名称
const nameRefMap = {
	fromSource: ref<string>(''),
	incomeAndExpenses: ref<string>(''),
	isValid: ref<string>(''),
	belongTo: ref<string>(''),
	infoDate: ref<string>(''),
};

// 使用映射替代 switch-case，简化代码
const choose = (type: string) => {
	const info = dictInfoMap[type] || (type === 'belongTo' ? belongToInfo : null);
	if (info) {
		popInfo.value = info.value;
		popInfo.value.showFlag = true;
	}
};

// 使用映射替代 switch-case，统一处理逻辑
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
		router.push({ path: '/selfFinance/financeManager' });
	} else {
		showFailToast(message || '保存失败，请联系管理员!');
	}
};

// 合并过滤和名称获取逻辑，统一处理字典信息
const getDictInfoList = async (data: DictInfo[]) => {
	dictFieldConfig.forEach((config) => {
		const info = dictInfoMap[config.key];
		if (info) {
			// 过滤数据
			info.value.list = data.filter((item: DictInfo) => item.belongTo === config.belongTo);
			// 获取名称
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
		nameRefMap.infoDate.value = infoDate.format('YYYY-MM-DD');
		chooseDateInfo.value.selectValue = infoDate;
	}
};

// 统一数据获取逻辑，减少重复代码
const init = async () => {
	const id: string = route?.query?.id as string;
	// 统一获取用户和字典数据，无论是否有 id
	const [detailRes, userRes, dictRes] = await Promise.all([
		id ? getFinanceMangerDetail(Number(id) || -1) : Promise.resolve({ code: '200', data: {} }),
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
<style lang="less" scoped></style>
