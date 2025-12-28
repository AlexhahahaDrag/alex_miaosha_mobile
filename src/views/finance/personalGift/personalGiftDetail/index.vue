<template>
	<navBar :info="info"></navBar>
	<van-form
		@submit="onSubmit"
		:rules="rulesRef"
		required="auto"
	>
		<van-cell-group>
			<van-field
				v-model="formInfo.eventName"
				name="eventName"
				:label="label.eventName + '：'"
				:placeholder="'请输入' + label.eventName"
				:rules="rulesRef.eventName"
				:maxlength="255"
			/>
			<van-field
				v-model="formInfo.amount"
				name="amount"
				:label="label.amount + '：'"
				:placeholder="'请输入' + label.amount"
				:rules="rulesRef.amount"
				:maxlength="10"
			/>
			<van-field
				v-model="formInfo.otherPerson"
				name="otherPerson"
				:label="label.otherPerson + '：'"
				:placeholder="'请输入' + label.otherPerson"
				:rules="rulesRef.otherPerson"
				:maxlength="255"
			/>
			<van-field
				v-model="eventTimeName"
				name="eventTime"
				:label="label.eventTime + '：'"
				:placeholder="'请输入' + label.eventTime"
				:rules="rulesRef.eventTime"
				@click="chooseDate('eventTime')"
				readonly
			/>
			<van-field
				v-model="formInfo.remarks"
				name="remarks"
				:label="label.remarks + '：'"
				:placeholder="'请输入' + label.remarks"
				:maxlength="65535"
			/>
			<van-field
				v-model="actionName"
				name="action"
				:label="label.action + '：'"
				:placeholder="'请输入' + label.action"
				:rules="rulesRef.action"
				@click="choose('action')"
				readonly
			/>
			<van-field
				v-model="formInfo.noticeNum"
				name="noticeNum"
				:label="label.noticeNum + '：'"
				:placeholder="'请输入' + label.noticeNum"
				:maxlength="3"
			/>
			<selectPop
				:info="popInfo"
				@select-info="selectInfo"
				@cancel-info="cancelInfo"
			></selectPop>
			<datePop
				:info="chooseDateInfo"
				@select-info="selectDateInfo"
				@cancel-info="cancelDateInfo"
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
import { label, rulesRef } from './personalGiftDetailTs';
import { getListName } from '@/views/common/config';
import { addOrEditPersonalGift, getPersonalGiftDetail } from '@/api/finance/personalGift/personalGiftTs';
import type { Info } from '@/views/common/pop/selectPop.vue';
import { getDictList } from '@/api/finance/dict/dictManager';

const route = useRoute();
const router = useRouter();
const info = ref<any>({
	title: route?.meta?.title || '个人随礼信息表',
	leftPath: '/selfFinance/personalGift',
});

const formInfo = ref<any>({});

const popInfo = ref<Info>({ showFlag: false });

const actionName = ref<string>('');

const actionInfo = ref<Info>({
	label: 'action',
	labelName: label.action,
	rule: rulesRef.action,
	customFieldName: {
		text: 'typeName',
		value: 'typeCode',
	},
	selectValue: formInfo.value.action,
});

const choose = (type: string): void => {
	switch (type) {
		case 'action':
			popInfo.value = actionInfo.value;
			break;
	}
	popInfo.value.showFlag = true;
};

const selectInfo = (type: string, value: any, name: string): void => {
	popInfo.value.showFlag = false;
	switch (type) {
		case 'action':
			formInfo.value.action = value;
			actionName.value = name;
			break;
	}
};

const cancelInfo = () => {
	popInfo.value.showFlag = false;
};

const getDictInfoList = (res: any): void => {
	if (res?.code == '200') {
		actionInfo.value.list = res.data.filter((item: { belongTo: string }) => item.belongTo == 'gift_action');
		actionName.value = getListName(actionInfo.value.list || [], formInfo.value.action, 'typeCode', 'typeName');
	} else {
		showFailToast(res?.message || '查询失败，请联系管理员!');
	}
};

const eventTimeName = ref<string>('');
const eventTimeInfo = ref<any>({
	label: 'eventTime',
	labelName: '随礼时间',
	rule: rulesRef.eventTime,
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

const chooseDate = (type: string): void => {
	chooseDateInfo.value.showFlag = true;
	switch (type) {
		case 'eventTime':
			chooseDateInfo.value = eventTimeInfo.value;
			break;
	}
};

const selectDateInfo = (date: Dayjs, dateName: string, type: string): void => {
	switch (type) {
		case 'eventTime':
			formInfo.value.eventTime = date;
			eventTimeName.value = dateName;
			break;
	}
	chooseDateInfo.value.showFlag = false;
};

const cancelDateInfo = (): void => {
	chooseDateInfo.value.showFlag = false;
};

const initInfoDate = (infoDate: Dayjs, type: string): void => {
	if (infoDate) {
		switch (type) {
			case 'eventTime':
				eventTimeName.value = dayjs(infoDate).format('YYYY-MM-DD');
				eventTimeInfo.value.selectValue = infoDate;
				break;
		}
	}
};

const onSubmit = (): void => {
	let method = 'post';
	if (formInfo.value.id) {
		method = 'put';
	}
	addOrEditPersonalGift(method, formInfo.value).then((res: any) => {
		if (res?.code == '200') {
			showSuccessToast(res?.message || '保存成功!');
			router.push({ path: '/selfFinance/personalGift' });
		} else {
			showFailToast(res?.message || '保存失败，请联系管理员!');
		}
	});
};

const init = (): void => {
	const id: any = route?.query?.id;
	if (id) {
		Promise.all([getPersonalGiftDetail(id || '-1'), getDictList('gift_action')])
			.then((res: any) => {
				if (res[0].code == '200') {
					formInfo.value = res[0].data;
					formInfo.value.eventTime = dayjs(formInfo.value.eventTime);
					initInfoDate(formInfo.value.eventTime, 'eventTime');
				} else {
					showFailToast(res?.message || '查询详情失败，请联系管理员!');
				}
				getDictInfoList(res[1]);
			})
			.catch(() => {
				showFailToast('系统问题，请联系管理员！');
			});
	} else {
		getDictList('gift_action').then((res: any) => {
			getDictInfoList(res);
		});
		formInfo.value = {
			eventTime: dayjs(),
		};
		initInfoDate(formInfo.value.eventTime, 'eventTime');
	}
};

init();
</script>
<style lang="less" scoped>
.subButton {
	margin: 16px;
}
</style>
