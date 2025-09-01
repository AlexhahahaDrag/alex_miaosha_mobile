<template>
	<navBar :info="info"></navBar>
	<van-form
		@submit="onSubmit"
		:rules="rulesRef"
		required="auto"
	>
		<van-cell-group>
			<van-field
				v-model="formInfo.batchCode"
				name="batchCode"
				:label="label.batchCode + '：'"
				:placeholder="'请输入' + label.batchCode"
				:rules="rulesRef.batchCode"
				:maxlength="255"
			/>
			<van-field
				v-model="formInfo.batchName"
				name="batchName"
				:label="label.batchName + '：'"
				:placeholder="'请输入' + label.batchName"
				:rules="rulesRef.batchName"
				:maxlength="255"
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
				v-model="formInfo.description"
				name="description"
				:label="label.description + '：'"
				:placeholder="'请输入' + label.description"
				:rules="rulesRef.description"
				:maxlength="65535"
			/>
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
import { showFailToast, showSuccessToast } from 'vant';
import { label, rulesRef } from './shopStockBatchDetailTs';
import { addOrEditShopStockBatch, getShopStockBatchDetail } from '@/api/finance/shopStockBatch/shopStockBatchTs';
import type { Info } from '@/views/common/pop/selectPop.vue';
import { getDictList } from '@/api/finance/dict/dictManager';

const route = useRoute();
const router = useRouter();
const info = ref<any>({
	title: route?.meta?.title || '商店库存批次表',
	leftPath: '/finance/shopStockBatch',
});

const formInfo = ref<any>({});

const popInfo = ref<Info>({ showFlag: false });

const isValidName = ref<string>('');

const isValidInfo = ref<Info>({
	label: 'isValid',
	labelName: label.isValid,
	rule: rulesRef.isValid,
	customFieldName: {
		text: 'typeName',
		value: 'typeCode',
	},
	selectValue: formInfo.value.isValid,
});

const choose = (type: string): void => {
	switch (type) {
		case 'isValid':
			popInfo.value = isValidInfo.value;
			break;
	}
	popInfo.value.showFlag = true;
};

const selectInfo = (type: string, value: any, name: string): void => {
	popInfo.value.showFlag = false;
	switch (type) {
		case 'isValid':
			formInfo.value.isValid = value;
			isValidName.value = name;
			break;
	}
};

const cancelInfo = () => {
	popInfo.value.showFlag = false;
};

const getListName = (list: any[], value: any, code: string, name: string): void => {
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

const getDictInfoList = (res: any): void => {
	if (res?.code == '200') {
		isValidInfo.value.list = res.data.filter((item: { belongTo: string }) => item.belongTo == 'is_valid');
		isValidName.value = getListName(isValidInfo.value.list || [], formInfo.value.isValid, 'typeCode', 'typeName');
	} else {
		showFailToast(res?.message || '查询失败，请联系管理员!');
	}
};

const onSubmit = (): void => {
	let method = 'post';
	if (formInfo.value.id) {
		method = 'put';
	}
	addOrEditShopStockBatch(method, formInfo.value).then((res: any) => {
		if (res?.code == '200') {
			showSuccessToast(res?.message || '保存成功!');
			router.push({ path: '/finance/shopStockBatch' });
		} else {
			showFailToast(res?.message || '保存失败，请联系管理员!');
		}
	});
};

const init = (): void => {
	const id: any = route?.query?.id;
	if (id) {
		Promise.all([getShopStockBatchDetail(id || '-1'), getDictList('is_valid')])
			.then((res: any) => {
				if (res[0].code == '200') {
					formInfo.value = res[0].data;
				} else {
					showFailToast(res?.message || '查询详情失败，请联系管理员!');
				}
				getDictInfoList(res[1]);
			})
			.catch(() => {
				showFailToast('系统问题，请联系管理员！');
			});
	} else {
		getDictList('is_valid').then((res: any) => {
			getDictInfoList(res);
		});
		formInfo.value = {};
	}
};

init();
</script>
<style lang="scss" scoped>
.subButton {
	margin: 16px;
}
</style>
