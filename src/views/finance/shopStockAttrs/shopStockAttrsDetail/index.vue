<template>
	<navBar :info="info"></navBar>
	<van-form
		@submit="onSubmit"
		:rules="rulesRef"
		required="auto"
	>
		<van-cell-group>
			<van-field
				v-model="formInfo.stockId"
				name="stockId"
				:label="label.stockId + '：'"
				:placeholder="'请输入' + label.stockId"
				:rules="rulesRef.stockId"
				:maxlength="19"
			/>
			<van-field
				v-model="formInfo.attrCode"
				name="attrCode"
				:label="label.attrCode + '：'"
				:placeholder="'请输入' + label.attrCode"
				:rules="rulesRef.attrCode"
				:maxlength="255"
			/>
			<van-field
				v-model="formInfo.attrName"
				name="attrName"
				:label="label.attrName + '：'"
				:placeholder="'请输入' + label.attrName"
				:rules="rulesRef.attrName"
				:maxlength="255"
			/>
			<van-field
				v-model="formInfo.attrValue"
				name="attrValue"
				:label="label.attrValue + '：'"
				:placeholder="'请输入' + label.attrValue"
				:rules="rulesRef.attrValue"
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
import { label, rulesRef } from '@/views/finance/shopStockAttrs/config';
import type { ShopStockAttrsData } from '@/views/finance/shopStockAttrs/config';
import { addShopStockAttrs, updateShopStockAttrs, getShopStockAttrsDetail } from '@/views/finance/shopStockAttrs/api';
import type { Info } from '@/views/common/pop/selectPop.vue';
import type { DictInfo } from '@/views/common/config';
import { getListName } from '@/views/common/config';
import { getDictList } from '@/views/finance/dict/api';

const route = useRoute();
const router = useRouter();
const info = ref<Params>({
	title: route?.meta?.title || '商店库存属性表',
	leftPath: '/finance/shopStockAttrs',
});

const formInfo = ref<ShopStockAttrsData>({});

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

const selectInfo = (type: string, value: Params, name: string): void => {
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

const getDictInfoList = (data: DictInfo[]): void => {
	isValidInfo.value.list = data.filter((item: { belongTo: string }) => item.belongTo == 'is_valid');
	isValidName.value = getListName(isValidInfo.value.list || [], formInfo.value.isValid, 'typeCode', 'typeName');
};

const onSubmit = async (): Promise<void> => {
	const api = formInfo.value.id ? updateShopStockAttrs : addShopStockAttrs;

	try {
		const { code, message } = await api(formInfo.value);
		if (code === '200') {
			showSuccessToast(message || '保存成功!');
			router.push({ path: '/finance/shopStockAttrs' });
		} else {
			showFailToast(message || '保存失败，请联系管理员!');
		}
	} catch {
		showFailToast('网络请求异常');
	}
};

const init = (): void => {
	const id: Params = route?.query?.id;
	if (id) {
		Promise.all([getShopStockAttrsDetail(id || '-1'), getDictList('is_valid')])
			.then((res: Params) => {
				if (res[0].code == '200') {
					formInfo.value = res[0].data;
				} else {
					showFailToast(res?.message || '查询详情失败，请联系管理员!');
				}
				getDictInfoList(res[1]?.data || []);
			})
			.catch(() => {
				showFailToast('系统问题，请联系管理员！');
			});
	} else {
		getDictList('is_valid').then((res: Params) => {
			getDictInfoList(res);
		});
		formInfo.value = {};
	}
};

init();
</script>
<style lang="less" scoped>
.subButton {
	margin: 16px;
}
</style>
