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
					:maxlength="field.maxlength"
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
			<date-pop
				:info="chooseDateInfo"
				@select-date-info="selectDateInfo"
				@cancel-date-info="cancelDateInfo"
			>
			</date-pop>
		</van-cell-group>
		<div style="margin: 16px">
			<van-button
				round
				block
				type="primary"
				native-type="submit"
				:loading="submitting"
			>
				提交
			</van-button>
		</div>
	</van-form>
</template>

<script setup lang="ts">
import dayjs, { type Dayjs } from 'dayjs';
import { showFailToast, showSuccessToast } from 'vant';
import { rulesRef, type PersonalGiftData, labelMap } from '../config';
import { getPersonalGiftDetail, addPersonalGift, editPersonalGift } from '../api/personalGiftTs';
import { getListName } from '@/views/common/config';
import type { Info } from '@/views/common/pop/selectPop.vue';
import { getRoutePathByName } from '@/utils/router';
import { datePickerFormatter } from '@/utils/dayjs';
import type { DatePickerInfo } from '@/utils/common';
import type { DictInfo } from '@/api/finance/dict/dictManager';
import { getDictList } from '@/api/finance/dict/dictManager';
import { useNavBar } from '@/composables/useNavBar';

const route = useRoute();
const router = useRouter();

// 获取左侧路径
const getLeftPath = computed(() => {
	return getRoutePathByName(router, 'personalGift');
});

// 使用新的NavBar系统
useNavBar({
	title: (route?.meta?.title as string) || '个人随礼信息表',
	leftPath: getLeftPath.value,
	visible: true,
});

const formInfo = ref<PersonalGiftData>({});
const submitting = ref<boolean>(false);

// 表单字段配置，用于循环渲染
const formFields: {
	name: string;
	label: string;
	type: 'input' | 'select' | 'date';
	inputType?: 'text' | 'number' | 'tel' | 'digit' | 'password';
	maxlength?: number;
}[] = [
	{ name: 'eventName', label: labelMap.eventName, type: 'input', maxlength: 255 },
	{ name: 'amount', label: labelMap.amount, type: 'input', inputType: 'number', maxlength: 10 },
	{ name: 'otherPerson', label: labelMap.otherPerson, type: 'input', maxlength: 255 },
	{ name: 'eventTime', label: labelMap.eventTime, type: 'date' },
	{ name: 'remarks', label: labelMap.remarks, type: 'input', maxlength: 65535 },
	{ name: 'action', label: labelMap.action, type: 'select' },
	{ name: 'noticeNum', label: labelMap.noticeNum, type: 'input', inputType: 'number', maxlength: 3 },
];

const popInfo = ref<Info>({ showFlag: false });

// 统一字典信息配置
const dictFieldConfig = [
	{
		key: 'action',
		labelName: labelMap.action,
		rule: rulesRef.action,
		belongTo: 'gift_action',
		formKey: 'action' as keyof PersonalGiftData,
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

// 创建名称 ref 映射，统一管理所有字段的显示名称
const nameRefMap = {
	action: ref<string>(''),
	eventTime: ref<string>(''),
};

// 使用映射替代 switch-case，简化代码
const choose = (type: string) => {
	const info = dictInfoMap[type];
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
			// action 字段需要转换为数字
			if (config.key === 'action') {
				formInfo.value[config.formKey] = Number(value) as never;
			} else {
				formInfo.value[config.formKey] = value as never;
			}
			nameRefMap[config.key as keyof typeof nameRefMap].value = name;
		}
	}
};

const cancelInfo = () => {
	popInfo.value.showFlag = false;
};

const chooseDateInfo = ref<DatePickerInfo<Dayjs>>({
	label: 'eventTime',
	labelName: labelMap.eventTime,
	rule: rulesRef.eventTime,
	selectValue: dayjs(),
	showFlag: false,
	formatter: datePickerFormatter,
});

const chooseDate = () => {
	chooseDateInfo.value.showFlag = true;
};

const selectDateInfo = (date: Dayjs, dateName: string) => {
	formInfo.value.eventTime = date;
	nameRefMap.eventTime.value = dateName;
	chooseDateInfo.value.showFlag = false;
};

const cancelDateInfo = () => {
	chooseDateInfo.value.showFlag = false;
};

const onSubmit = async () => {
	if (submitting.value) return;

	submitting.value = true;
	try {
		const api = formInfo.value.id ? editPersonalGift : addPersonalGift;
		const { code, message } = await api(formInfo.value);
		if (code == '200') {
			showSuccessToast(message || '保存成功!');
			router.push({ path: getLeftPath.value });
		} else {
			showFailToast(message || '保存失败，请联系管理员!');
		}
	} catch (error) {
		showFailToast('保存失败，请稍后重试!');
	} finally {
		submitting.value = false;
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

const initInfoDate = (infoDate: Dayjs) => {
	if (infoDate) {
		nameRefMap.eventTime.value = infoDate.format('YYYY年MM月DD日');
		chooseDateInfo.value.selectValue = infoDate;
	}
};

// 统一数据获取逻辑，减少重复代码
const init = async () => {
	const id: string = route?.query?.id as string;
	// 统一获取字典数据，无论是否有 id
	const [detailRes, dictRes] = await Promise.all([
		id ? getPersonalGiftDetail(id || '0') : Promise.resolve({ code: '200', data: {} }),
		getDictList('gift_action'),
	]);
	if (id) {
		if (detailRes.code == '200') {
			formInfo.value = detailRes?.data || {};
			formInfo.value.eventTime = dayjs(formInfo.value.eventTime);
		} else {
			showFailToast((detailRes as { message?: string })?.message || '查询详情失败，请联系管理员!');
		}
	} else {
		formInfo.value = {
			eventTime: dayjs(),
		};
	}
	getDictInfoList(dictRes?.data || []);
	initInfoDate((formInfo.value?.eventTime as Dayjs) || dayjs());
};

init();
</script>
<style lang="less" scoped></style>
