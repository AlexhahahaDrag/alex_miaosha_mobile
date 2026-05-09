<template>
	<van-form
		@submit="onSubmit"
		:rules="rulesRef"
		required="auto"
	>
		<van-cell-group>
			<van-field
				v-model="formInfo.name"
				name="name"
				:label="label.name + '：'"
				:placeholder="'请输入' + label.name"
				:rules="rulesRef.name"
			/>
			<van-field
				v-model="avliDateName"
				name="avliDate"
				:label="label.avliDate + '：'"
				:placeholder="'请输入' + label.avliDate"
				:rules="rulesRef.avliDate"
				@click="chooseDate('avliDate')"
				readonly
			/>
			<van-field
				v-model="formInfo.amount"
				name="amount"
				:label="label.amount + '：'"
				:placeholder="'请输入' + label.amount"
				:rules="rulesRef.amount"
			/>
			<van-field
				v-model="accountName"
				name="account"
				:label="label.account + '：'"
				:placeholder="'请输入' + label.account"
				:rules="rulesRef.account"
				@click="choose('account')"
				readonly
			/>
			<selectPop
				:info="popInfo"
				@select-info="selectInfo"
				@cancel-info="cancelInfo"
			></selectPop>
			<datePop
				:info="chooseDateInfo"
				@select-date-info="selectDateInfo"
				@cancel-date-info="cancelDateInfo"
			></datePop>
		</van-cell-group>
		<div class="subButton">
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
import { useNavBar } from '@/composables/useNavBar';
import { getListName } from '@/views/common/config';
import type { DictInfo } from '@/views/common/config';
import type { AccountRecordInfoData } from '@/views/finance/accountRecordInfo/config';
import {
	addAccountRecordInfo,
	updateAccountRecordInfo,
	getAccountRecordInfoDetail,
} from '@/views/finance/accountRecordInfo/api';
import { getDictList } from '@/views/finance/dict/api';
import type { Info } from '@/views/common/pop/selectPop.vue';
import type { DatePickerInfo } from '@/utils/common';

const route = useRoute();
const router = useRouter();

useNavBar({
	title: (route?.meta?.title as string) || '',
	leftPath: '/selfFinance/accountRecordInfo',
	visible: true,
});

const formInfo = ref<AccountRecordInfoData>({});

const label = reactive({
	name: '名称',
	avliDate: '有效期',
	amount: '金额',
	account: '账号',
	isSend: '是否发送提醒',
});

const rulesRef = reactive({
	name: [
		{
			required: true,
			message: '名称不能为空！',
		},
	],
	avliDate: [
		{
			required: true,
			message: '有效期不能为空！',
		},
	],
	amount: [
		{
			required: true,
			message: '金额不能为空！',
		},
	],
	account: [
		{
			required: true,
			message: '账号不能为空！',
		},
	],
});

const accountName = ref<string>('');

const accountInfo = ref<Info<DictInfo>>({
	label: 'account',
	labelName: label.account,
	rule: rulesRef.account,
	customFieldName: {
		text: 'typeName',
		value: 'typeCode',
	},
	selectValue: formInfo.value.account,
});

const popInfo = ref<Info<DictInfo>>({ showFlag: false });

function choose(type: string) {
	switch (type) {
		case 'account':
			popInfo.value = accountInfo.value;
			break;
	}
	popInfo.value.showFlag = true;
}

function selectInfo(type: string, value: string, name: string) {
	popInfo.value.showFlag = false;
	switch (type) {
		case 'account':
			formInfo.value.account = value;
			accountName.value = name;
			break;
	}
}

function cancelInfo() {
	popInfo.value.showFlag = false;
}

const avliDateName = ref<string>('');
const avliDateInfo = ref<DatePickerInfo<Dayjs>>({
	label: 'avliDate',
	labelName: label.avliDate,
	rule: rulesRef.avliDate,
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

const chooseDateInfo = ref<DatePickerInfo<Dayjs>>({
	...avliDateInfo.value,
});

function chooseDate(type: string) {
	chooseDateInfo.value.showFlag = true;
	switch (type) {
		case 'avliDate':
			chooseDateInfo.value = avliDateInfo.value;
			break;
	}
}

function selectDateInfo(date: Dayjs, dateName: string, type: string) {
	switch (type) {
		case 'avliDate':
			formInfo.value.avliDate = date;
			avliDateName.value = dateName;
			break;
	}
	chooseDateInfo.value.showFlag = false;
}

function cancelDateInfo() {
	chooseDateInfo.value.showFlag = false;
}

function initInfoDate(infoDate: Dayjs | string | undefined, type: string) {
	if (infoDate) {
		switch (type) {
			case 'avliDate':
				avliDateName.value = dayjs(infoDate).format('YYYY-MM-DD');
				avliDateInfo.value.selectValue = dayjs(infoDate);
				break;
		}
	}
}

async function onSubmit() {
	let method = 'post';
	if (formInfo.value.id) {
		method = 'put';
	}
	const { code, message } = await (method === 'put' ? updateAccountRecordInfo : addAccountRecordInfo)(formInfo.value);
	if (code == '200') {
		showSuccessToast(message || '保存成功！');
		router.push({ path: '/selfFinance/accountRecordInfo' });
	} else {
		showFailToast(message || '保存失败，请联系管理员！');
	}
}

function getDictInfoList(code: string, data: DictInfo[] | undefined, message?: string): void {
	if (code === '200') {
		accountInfo.value.list = (data || []).filter((item) => item.belongTo === 'account_type');
		accountName.value = getListName(accountInfo.value.list || [], formInfo.value.account, 'typeCode', 'typeName');
	} else {
		showFailToast(message || '查询失败，请联系管理员！');
	}
}

async function init() {
	const id = route?.query?.id as string | undefined;
	if (id) {
		try {
			const [detailRes, dictRes] = await Promise.all([getAccountRecordInfoDetail(id), getDictList('account_type')]);
			const { code: detailCode, data: detailData, message: detailMessage } = detailRes;
			const { code: dictCode, data: dictData, message: dictMessage } = dictRes;

			if (detailCode === '200' && detailData) {
				formInfo.value = detailData;
				initInfoDate(formInfo.value.avliDate, 'avliDate');
				accountName.value = getListName(accountInfo.value.list || [], formInfo.value.account, 'typeCode', 'typeName');
			} else {
				showFailToast(detailMessage || '查询详情失败，请联系管理员！');
			}
			getDictInfoList(dictCode, dictData as DictInfo[] | undefined, dictMessage);
		} catch {
			showFailToast('系统问题，请联系管理员！');
		}
	} else {
		const { code, data, message } = await getDictList('account_type');
		getDictInfoList(code, data as DictInfo[] | undefined, message);
		formInfo.value = {
			avliDate: dayjs(),
		};
		initInfoDate(formInfo.value.avliDate, 'avliDate');
	}
}

void init();
</script>
<style lang="less" scoped>
.subButton {
	margin: 16px;
}
</style>
