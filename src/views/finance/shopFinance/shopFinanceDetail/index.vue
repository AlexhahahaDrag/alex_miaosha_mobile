<template>
	<NavBar :info="info"></NavBar>
	<van-form
		@submit="onSubmit"
		:rules="rulesRef"
		required="auto"
	>
		<van-cell-group>
			<van-field
				v-model="formInfo.shopName"
				name="shopName"
				:label="label.shopName + '：'"
				:placeholder="'请输入' + label.shopName"
				:rules="rulesRef.shopName"
				:maxlength="255"
			/>
			<van-field
				v-model="formInfo.shopCode"
				name="shopCode"
				:label="label.shopCode + '：'"
				:placeholder="'请输入' + label.shopCode"
				:maxlength="255"
			/>
			<van-field
				v-model="formInfo.saleAmount"
				name="saleAmount"
				:label="label.saleAmount + '：'"
				:placeholder="'请输入' + label.saleAmount"
				:rules="rulesRef.saleAmount"
				:maxlength="10"
			/>
			<van-field
				v-model="formInfo.saleNum"
				name="saleNum"
				:label="label.saleNum + '：'"
				:placeholder="'请输入' + label.saleNum"
				:rules="rulesRef.saleNum"
				:maxlength="10"
			/>
			<van-field
				v-model="payWayName"
				name="payWay"
				:label="label.payWay + '：'"
				:placeholder="'请输入' + label.payWay"
				:rules="rulesRef.payWay"
				@click="choose('payWay')"
				readonly
			/>
			<van-field
				v-model="incomeAndExpensesName"
				name="incomeAndExpenses"
				:label="label.incomeAndExpenses + '：'"
				:placeholder="'请输入' + label.incomeAndExpenses"
				:rules="rulesRef.incomeAndExpenses"
				@click="choose('incomeAndExpenses')"
				readonly
			/>
			<van-field
				v-model="isValidName"
				name="isValid"
				:label="label.isValid + '：'"
				:placeholder="'请输入' + label.isValid"
				:rules="rulesRef.isValid"
				@click="choose('isValid')"
				readonly
			/>
			<van-field
				v-model="saleDateName"
				name="saleDate"
				:label="label.saleDate + '：'"
				:placeholder="'请输入' + label.saleDate"
				:rules="rulesRef.saleDate"
				@click="chooseDate('saleDate')"
				readonly
			/>
			<datePop
				:info="chooseDateInfo"
				@select-info="selectDateInfo"
				@cancel-info="cancelDateInfo"
			></datePop>
			<selectPop
				:info="popInfo"
				@select-info="selectInfo"
				@cancel-info="cancelInfo"
			></selectPop>
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
import { label, rulesRef } from './shopFinanceDetailTs';
import { addOrEditShopFinance, getShopFinanceDetail } from '@/api/finance/shopFinance/shopFinanceTs';
import type { Info } from '@/views/common/pop/selectPop.vue';
import { getDictList } from '@/api/finance/dict/dictManager';

const route = useRoute();
const router = useRouter();
const info = ref<any>({
	title: route?.meta?.title || '商店财务表',
	leftPath: '/finance/shopFinance',
});

const formInfo = ref<any>({});

const saleDateName = ref<string>('');
const saleDateInfo = ref<any>({
	label: 'saleDate',
	labelName: '销售日期',
	rule: rulesRef.saleDate,
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

const chooseDateInfo = ref<Info>({ showFlag: false });

const chooseDate = (type: string) => {
	chooseDateInfo.value.showFlag = true;
	switch (type) {
		case 'saleDate':
			chooseDateInfo.value = saleDateInfo.value;
			break;
	}
};

const selectDateInfo = (date: Dayjs, dateName: string, type: string) => {
	switch (type) {
		case 'saleDate':
			formInfo.value.saleDate = date;
			saleDateName.value = dateName;
			break;
	}
	chooseDateInfo.value.showFlag = false;
};

const cancelDateInfo = () => {
	chooseDateInfo.value.showFlag = false;
};

const initSaleDate = (saleDate: Dayjs, type: string) => {
	if (saleDate) {
		switch (type) {
			case 'saleDate':
				saleDateName.value = dayjs(saleDate).format('YYYY-MM-DD');
				saleDateInfo.value.selectValue = saleDate;
				break;
		}
	}
};

const popInfo = ref<Info>({ showFlag: false });

const payWayInfo = ref<Info>({
	label: 'payWay',
	labelName: '支付方式',
	rule: rulesRef.payWay,
	customFieldName: {
		text: 'typeName',
		value: 'typeCode',
	},
	selectValue: formInfo.value.payWay,
});

const incomeAndExpensesInfo = ref<Info>({
	label: 'incomeAndExpenses',
	labelName: '收支类型',
	rule: rulesRef.incomeAndExpenses,
	customFieldName: {
		text: 'typeName',
		value: 'typeCode',
	},
	selectValue: formInfo.value.incomeAndExpenses,
});

const isValidInfo = ref<Info>({
	label: 'isValid',
	labelName: '状态',
	rule: rulesRef.isValid,
	customFieldName: {
		text: 'typeName',
		value: 'typeCode',
	},
	selectValue: formInfo.value.isValid,
});

const payWayName = ref<string>('');
const incomeAndExpensesName = ref<string>('');
const isValidName = ref<string>('');

const choose = (type: string) => {
	switch (type) {
		case 'payWay':
			popInfo.value = payWayInfo.value;
			break;
		case 'incomeAndExpenses':
			popInfo.value = incomeAndExpensesInfo.value;
			break;
		case 'isValid':
			popInfo.value = isValidInfo.value;
			break;
	}
	popInfo.value.showFlag = true;
};

const selectInfo = (type: string, value: any, name: string) => {
	popInfo.value.showFlag = false;
	switch (type) {
		case 'payWay':
			formInfo.value.payWay = value;
			payWayName.value = name;
			break;
		case 'incomeAndExpenses':
			formInfo.value.incomeAndExpenses = value;
			incomeAndExpensesName.value = name;
			break;
		case 'isValid':
			formInfo.value.isValid = value;
			isValidName.value = name;
			break;
	}
};

const cancelInfo = () => {
	popInfo.value.showFlag = false;
};

const onSubmit = () => {
	let method = 'post';
	if (formInfo.value.id) {
		method = 'put';
	}
	addOrEditShopFinance(method, formInfo.value).then((res: any) => {
		if (res?.code == '200') {
			showSuccessToast(res?.message || '保存成功!');
			router.push({ path: '/finance/shopFinance' });
		} else {
			showFailToast(res?.message || '保存失败，请联系管理员!');
		}
	});
};

function getDictInfoList(res: any) {
	if (res?.code == '200') {
		payWayInfo.value.list = res.data.filter((item: { belongTo: string }) => item.belongTo == 'shop_pay_way');
		incomeAndExpensesInfo.value.list = res.data.filter(
			(item: { belongTo: string }) => item.belongTo == 'income_expense_type',
		);
		isValidInfo.value.list = res.data.filter((item: { belongTo: string }) => item.belongTo == 'is_valid');
		payWayName.value = getListName(payWayInfo.value.list || [], formInfo.value.payWay, 'typeCode', 'typeName');
		incomeAndExpensesName.value = getListName(
			incomeAndExpensesInfo.value.list || [],
			formInfo.value.incomeAndExpenses,
			'typeCode',
			'typeName',
		);
		isValidName.value = getListName(isValidInfo.value.list || [], formInfo.value.isValid, 'typeCode', 'typeName');
	} else {
		showFailToast(res?.message || '查询失败，请联系管理员!');
	}
}

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

function init() {
	const id: any = route?.query?.id;
	if (id) {
		Promise.all([getShopFinanceDetail(id || '-1'), getDictList('shop_pay_way,income_expense_type,is_valid')])
			.then((res: any) => {
				if (res[0].code == '200') {
					formInfo.value = res[0].data;
					formInfo.value.saleDate = dayjs(formInfo.value.saleDate);
					initSaleDate(formInfo.value.saleDate, 'saleDate');
				} else {
					showFailToast(res?.message || '查询详情失败，请联系管理员!');
				}
				getDictInfoList(res[1]);
			})
			.catch((_error: any) => {
				console.log('error:', _error);
				showFailToast('系统问题，请联系管理员！');
			});
	} else {
		getDictList('shop_pay_way,income_expense_type,is_valid').then((res: any) => {
			getDictInfoList(res);
		});
		formInfo.value = {
			saleDate: dayjs(),
			isValid: '1',
			incomeAndExpenses: 'income',
			payWay: 'wx',
			saleNum: 1,
		};
		initSaleDate(formInfo.value.saleDate, 'saleDate');
	}
}

init();
</script>
<style lang="scss" scoped>
.subButton {
	margin: 16px;
}
</style>
