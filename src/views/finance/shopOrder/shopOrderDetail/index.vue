<template>
	<van-form required="auto">
		<van-cell-group>
			<van-field
				v-model="formInfo.saleOrderCode"
				name="saleOrderCode"
				:label="label.saleOrderCode + '：'"
				:placeholder="'请输入' + label.saleOrderCode"
				:maxlength="255"
				readonly
			/>
			<van-field
				v-model="formInfo.saleOrderName"
				name="saleOrderName"
				:label="label.saleOrderName + '：'"
				:placeholder="'请输入' + label.saleOrderName"
				:maxlength="255"
			/>
			<van-field
				v-model="formInfo.saleAmount"
				name="saleAmount"
				:label="label.saleAmount + '：'"
				:placeholder="'请输入' + label.saleAmount"
				:maxlength="10"
			/>
			<van-field
				v-model="isValidName"
				name="isValid"
				:label="label.isValid + '：'"
				:placeholder="'请输入' + label.isValid"
				readonly
			/>
			<van-field
				v-model="saleDateName"
				name="saleDate"
				:label="label.saleDate + '：'"
				:placeholder="'请输入' + label.saleDate"
				readonly
			/>
			<van-field
				v-model="formInfo.description"
				name="description"
				:label="label.description + '：'"
				:placeholder="'请输入' + label.description"
				:maxlength="65535"
			/>
			<van-field
				v-model="formInfo.payWay"
				name="payWay"
				:label="label.payWay + '：'"
				:placeholder="'请输入' + label.payWay"
				:maxlength="128"
			/>
			<van-field
				v-model="formInfo.saleCount"
				name="saleCount"
				:label="label.saleCount + '：'"
				:placeholder="'请输入' + label.saleCount"
				:maxlength="10"
			/>
		</van-cell-group>
	</van-form>
</template>

<script setup lang="ts">
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { showFailToast } from 'vant';
import { label } from './shopOrderDetailTs';
import { useNavBar } from '@/composables/useNavBar';
import { getListName } from '@/views/common/config';
import { getShopOrderDetail } from '@/views/finance/shopOrder/api';
import type { ShopOrderData } from '@/views/finance/shopOrder/config';
import { getDictList } from '@/views/finance/dict/api';
import type { DatePickerInfo } from '@/utils/common';
import type { DictInfo } from '@/views/common/config';

const route = useRoute();

useNavBar({
	title: (route?.meta?.title as string) || '商店订单表',
	leftPath: '/finance/shopOrder',
	visible: true,
});

const formInfo = ref<ShopOrderData>({});

const isValidName = ref<string>('');

const isValidInfo = ref<{
	label: string;
	labelName: string;
	customFieldName: { text: string; value: string };
	selectValue: unknown;
	list?: DictInfo[];
}>({
	label: 'isValid',
	labelName: label.isValid,
	customFieldName: {
		text: 'typeName',
		value: 'typeCode',
	},
	selectValue: formInfo.value.isValid,
});

const saleDateName = ref<string>('');
const saleDateInfo = ref<DatePickerInfo<Dayjs>>({
	label: 'saleDate',
	labelName: label.saleDate,
	selectValue: dayjs(),
	showFlag: false,
	formatter: (type: string, option: { text: string }) => {
		if (type === 'year') {
			option.text += '年';
		}
		if (type === 'month') {
			option.text += '月';
		}
		if (type === 'day') {
			option.text += '日';
		}
		return option;
	},
});

function getDictInfoList(code: string, data: DictInfo[] | undefined, message?: string): void {
	if (code === '200') {
		isValidInfo.value.list = (data || []).filter((item) => item.belongTo === 'is_valid');
		isValidName.value = getListName(isValidInfo.value.list || [], formInfo.value.isValid, 'typeCode', 'typeName');
	} else {
		showFailToast(message || '查询失败，请联系管理员！');
	}
}

function initInfoDate(infoDate: Dayjs | string | undefined, type: string): void {
	if (infoDate) {
		switch (type) {
			case 'saleDate':
				saleDateName.value = dayjs(infoDate).format('YYYY-MM-DD');
				saleDateInfo.value.selectValue = dayjs(infoDate);
				break;
		}
	}
}

async function init(): Promise<void> {
	const id = route?.query?.id as string | undefined;
	if (id) {
		try {
			const [detailRes, dictRes] = await Promise.all([getShopOrderDetail(id), getDictList('is_valid')]);
			const { code: detailCode, data: detailData, message: detailMessage } = detailRes;
			const { code: dictCode, data: dictData, message: dictMessage } = dictRes;

			if (detailCode === '200' && detailData) {
				formInfo.value = detailData;
				initInfoDate(formInfo.value.saleDate, 'saleDate');
			} else {
				showFailToast(detailMessage || '查询详情失败，请联系管理员！');
			}
			getDictInfoList(dictCode, dictData as DictInfo[] | undefined, dictMessage);
		} catch {
			showFailToast('系统问题，请联系管理员！');
		}
	} else {
		const { code, data, message } = await getDictList('is_valid');
		getDictInfoList(code, data as DictInfo[] | undefined, message);
		formInfo.value = {
			saleDate: dayjs(),
		};
		initInfoDate(formInfo.value.saleDate, 'saleDate');
	}
}

void init();
</script>
<style lang="less" scoped>
.subButton {
	margin: 16px;
}
</style>
