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
					@click="field.type === 'date' ? chooseDate(field.name) : choose(field.name)"
					readonly
				/>
			</template>
			<datePop
				v-for="(dateInfo, key) in dateInfoMap"
				:key="key"
				:info="dateInfo.value"
				@select-date-info="(date: Dayjs, dateName: string) => selectDateInfo(key, date, dateName)"
				@cancel-date-info="() => cancelDateInfo(key)"
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
import { rulesRef, type CpnCouponInfoData } from '@/views/cpn-coupon/cpn-coupon-info/config';
import { datePickerFormatter } from '@/utils/dayjs';
import type { DatePickerInfo } from '@/utils/common';
import { addCpnCouponInfo, editCpnCouponInfo, getCpnCouponInfoDetail } from '@/views/cpn-coupon/cpn-coupon-info/api';
import { useNavBar } from '@/composables/useNavBar';
import { getRoutePathByName } from '@/utils/router';

const route = useRoute();
const router = useRouter();

// 获取左侧路径
const getLeftPath = computed(() => {
	return getRoutePathByName(router, 'cpnCouponInfo');
});

// 使用新的NavBar系统
useNavBar({
	title: (route?.meta?.title as string) || '消费券明细',
	leftPath: getLeftPath.value,
	visible: true,
});

const formInfo = ref<CpnCouponInfoData>({});

const label = reactive({
	couponName: '消费券名称',
	totalQuantity: '总数量',
	unitValue: '面值',
	minSpend: '最低消费',
	startDate: '开始日期',
	endDate: '结束日期',
});

// 表单字段配置，用于循环渲染
const formFields: {
	name: string;
	label: string;
	type: 'input' | 'date';
	inputType?: 'text' | 'number' | 'tel' | 'digit' | 'password';
}[] = [
	{ name: 'couponName', label: label.couponName, type: 'input' },
	{ name: 'totalQuantity', label: label.totalQuantity, type: 'input', inputType: 'number' },
	{ name: 'unitValue', label: label.unitValue, type: 'input', inputType: 'number' },
	{ name: 'startDate', label: label.startDate, type: 'date' },
	{ name: 'endDate', label: label.endDate, type: 'date' },
];

// 创建名称 ref 映射，统一管理所有字段的显示名称
const nameRefMap = {
	startDate: ref<string>(''),
	endDate: ref<string>(''),
};

// 日期选择器配置映射
const dateFieldConfig = [
	{
		key: 'startDate',
		labelName: '开始日期',
		formKey: 'startDate' as keyof CpnCouponInfoData,
	},
	{
		key: 'endDate',
		labelName: '结束日期',
		rule: rulesRef.endDate,
		formKey: 'endDate' as keyof CpnCouponInfoData,
	},
];

// 动态创建日期信息 ref
const dateInfoMap = dateFieldConfig.reduce(
	(acc, config) => {
		acc[config.key] = ref<DatePickerInfo<Dayjs>>({
			label: config.key,
			labelName: config.labelName,
			rule: config.rule,
			selectValue: dayjs(),
			showFlag: false,
			formatter: datePickerFormatter,
		});
		return acc;
	},
	{} as Record<string, Ref<DatePickerInfo<Dayjs>>>,
);

// 选择日期
const chooseDate = (type: string) => {
	const dateInfo = dateInfoMap[type];
	if (dateInfo) {
		dateInfo.value.showFlag = true;
	}
};

// 选择日期信息
const selectDateInfo = (type: string, date: Dayjs, dateName: string) => {
	const config = dateFieldConfig.find((c) => c.key === type);
	if (config) {
		formInfo.value[config.formKey] = date as never;
		nameRefMap[config.key as keyof typeof nameRefMap].value = dateName;
	}
	const dateInfo = dateInfoMap[type];
	if (dateInfo) {
		dateInfo.value.showFlag = false;
	}
};

// 取消日期选择
const cancelDateInfo = (type: string) => {
	const dateInfo = dateInfoMap[type];
	if (dateInfo) {
		dateInfo.value.showFlag = false;
	}
};

// 占位函数，用于兼容 choose 方法
const choose = (_type: string) => {
	// 消费券明细页面没有下拉选择字段，此方法保留用于扩展
};

// 提交表单
const onSubmit = async () => {
	let api = addCpnCouponInfo;
	if (formInfo.value.id) {
		api = editCpnCouponInfo;
	}
	const { code, message } = await api(formInfo.value);
	if (code == '200') {
		showSuccessToast(message || '保存成功!');
		router.push({ path: getLeftPath.value });
	} else {
		showFailToast(message || '保存失败，请联系管理员!');
	}
};

// 初始化日期显示
const initDateInfo = (dateValue: Dayjs | string | null | undefined, type: string) => {
	if (dateValue) {
		const date = typeof dateValue === 'string' ? dayjs(dateValue) : dateValue;
		if (date && dayjs.isDayjs(date)) {
			nameRefMap[type as keyof typeof nameRefMap].value = date.format('YYYY-MM-DD');
			const dateInfo = dateInfoMap[type];
			if (dateInfo) {
				dateInfo.value.selectValue = date;
			}
		}
	}
};

// 统一数据获取逻辑
const init = async () => {
	const id: string = route?.query?.id as string;
	if (id) {
		const { code, data, message } = await getCpnCouponInfoDetail(id || '0');
		if (code == '200') {
			formInfo.value = data || {};
			formInfo.value.startDate = dayjs(formInfo.value.startDate);
			formInfo.value.endDate = dayjs(formInfo.value.endDate);
			initDateInfo(formInfo.value.startDate, 'startDate');
			initDateInfo(formInfo.value.endDate, 'endDate');
		} else {
			showFailToast(message || '查询详情失败，请联系管理员!');
		}
	} else {
		formInfo.value = {
			startDate: dayjs(),
			endDate: dayjs(),
		};
		initDateInfo(formInfo.value.startDate, 'startDate');
		initDateInfo(formInfo.value.endDate, 'endDate');
	}
};

init();
</script>
<style lang="less" scoped></style>
