<template>
	<navBar :info="info"></navBar>
	<van-form @submit="onSubmit" :rules="rulesRef" required="auto">
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
				@selectInfo="selectInfo"
				@cancelInfo="cancelInfo"
			></selectPop>
			<datePop
				:info="chooseDateInfo"
				@selectInfo="selectDateInfo"
				@cancelInfo="cancelDateInfo"
			></datePop>
		</van-cell-group>
		<div class="subButton">
			<van-button round block type="primary" native-type="submit">
				提交
			</van-button>
		</div>
	</van-form>
</template>

<script setup lang="ts">
import dayjs, { Dayjs } from 'dayjs';
import { showFailToast, showSuccessToast } from 'vant';
import {
	addOrEditAccountRecordInfo,
	getAccountRecordInfoDetail,
} from '@/api/finance/accountRecordInfo/accountRecordInfoTs';
import { getDictList } from '@/api/finance/dict/dictManager';

let route = useRoute();
let router = useRouter();
const info = ref<any>({
	title: route?.meta?.title || '',
	leftPath: '/selfFinance/accountRecordInfo',
});

let formInfo = ref<any>({});

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

let accountName = ref<string>('');

let accountInfo = ref<Info>({
	label: 'account',
	labelName: '账号',
	rule: rulesRef.account,
	customFieldName: {
		text: 'typeName',
		value: 'typeCode',
	},
	selectValue: formInfo.value.account,
});

let popInfo = ref<Info>({ showFlag: false });

const choose = (type: string) => {
	switch (type) {
		case 'account':
			popInfo.value = accountInfo.value;
			break;
	}
	popInfo.value.showFlag = true;
};

const selectInfo = (type: string, value: any, name: string) => {
	popInfo.value.showFlag = false;
	switch (type) {
		case 'account':
			formInfo.value.account = value;
			accountName.value = name;
			break;
	}
};

const cancelInfo = () => {
	popInfo.value.showFlag = false;
};

let avliDateName = ref<string>('');
let avliDateInfo = ref<any>({
	label: 'avliDate',
	labelName: 'field.comment',
	rule: rulesRef.avliDate,
	selectValue: dayjs(),
	showFlag: false,
	formatter: (type: string, option: any) => {
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

let chooseDateInfo = ref<Info>({ showFlag: false });

const chooseDate = (type: string) => {
	chooseDateInfo.value.showFlag = true;
	switch (type) {
		case 'avliDate':
			chooseDateInfo.value = avliDateInfo.value;
			break;
	}
};

const selectDateInfo = (date: Dayjs, dateName: string, type: string) => {
	switch (type) {
		case 'avliDate':
			formInfo.value.avliDate = date;
			avliDateName.value = dateName;
			break;
	}
	chooseDateInfo.value.showFlag = false;
};

const cancelDateInfo = () => {
	chooseDateInfo.value.showFlag = false;
};

const initInfoDate = (infoDate: Dayjs, type: string) => {
	if (infoDate) {
		switch (type) {
			case 'avliDate':
				avliDateName.value = dayjs(infoDate).format('YYYY-MM-DD');
				avliDateInfo.value.selectValue = infoDate;
				break;
		}
	}
};

const onSubmit = () => {
	let method = 'post';
	if (formInfo.value.id) {
		method = 'put';
	}
	addOrEditAccountRecordInfo(method, formInfo.value).then((res: any) => {
		if (res?.code == '200') {
			showSuccessToast(res?.message || '保存成功!');
			router.push({ path: '/selfFinance/accountRecordInfo' });
		} else {
			showFailToast(res?.message || '保存失败，请联系管理员!');
		}
	});
};

const getListName = (list: any[], value: any, code: string, name: string) => {
	if (!list?.length) {
		return '';
	}
	let listName = '';
	list.forEach((item) => {
		if (item[code] == value) {
			listName = item[name];
		}
	});
	return listName;
};

function getDictInfoList(res: any) {
	if (res.code == '200') {
		accountInfo.value.list = res.data.filter(
			(item: { belongTo: string }) => item.belongTo == 'account_type',
		);
		accountName.value = getListName(
			accountInfo.value.list || [],
			formInfo.value.account,
			'typeCode',
			'typeName',
		);
	} else {
		showFailToast(res?.message || '查询失败，请联系管理员!');
	}
}

function init() {
	let id: any = route?.query?.id;
	if (id) {
		Promise.all([
			getAccountRecordInfoDetail(id || '-1'),
			getDictList('account_type'),
		])
			.then((res: any) => {
				if (res[0].code == '200') {
					formInfo.value = res[0].data;
					initInfoDate(formInfo.value.avliDate, 'avliDate');
					accountName.value = getListName(
						accountInfo.value.list || [],
						formInfo.value.account,
						'typeCode',
						'typeName',
					);
				} else {
					showFailToast(res?.message || '查询详情失败，请联系管理员!');
				}
				getDictInfoList(res[1]);
			})
			.catch(() => {
				showFailToast('系统问题，请联系管理员！');
			});
	} else {
		getDictList('account_type').then((res: any) => {
			getDictInfoList(res);
		});
		formInfo.value = {
			avliDate: dayjs(),
		};
		initInfoDate(formInfo.value.avliDate, 'avliDate');
	}
}

init();
</script>
<style lang="scss" scoped>
.subButton {
	margin: 16px;
}
</style>
