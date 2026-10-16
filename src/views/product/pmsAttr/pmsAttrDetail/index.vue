<template>
	<van-form
		@submit="onSubmit"
		:rules="rulesRef"
		required="auto"
	>
		<van-cell-group>
			<van-field
				v-model="formInfo.attrName"
				name="attrName"
				:label="label.attrName + '：'"
				:placeholder="'请输入' + label.attrName"
				:rules="rulesRef.attrName"
				maxlength="30"
			/>
			<van-field
				v-model="formInfo.searchType"
				name="searchType"
				:label="label.searchType + '：'"
				:placeholder="'请输入' + label.searchType"
				:rules="rulesRef.searchType"
				maxlength="3"
			/>
			<van-field
				v-model="formInfo.icon"
				name="icon"
				:label="label.icon + '：'"
				:placeholder="'请输入' + label.icon"
				:rules="rulesRef.icon"
				maxlength="255"
			/>
			<van-field
				v-model="formInfo.valueSelect"
				name="valueSelect"
				:label="label.valueSelect + '：'"
				:placeholder="'请输入' + label.valueSelect"
				:rules="rulesRef.valueSelect"
				maxlength="255"
			/>
			<van-field
				v-model="formInfo.attrType"
				name="attrType"
				:label="label.attrType + '：'"
				:placeholder="'请输入' + label.attrType"
				:rules="rulesRef.attrType"
				maxlength="3"
			/>
			<van-field
				v-model="formInfo.enable"
				name="enable"
				:label="label.enable + '：'"
				:placeholder="'请输入' + label.enable"
				:rules="rulesRef.enable"
				maxlength="19"
			/>
			<van-field
				v-model="formInfo.catelogId"
				name="catelogId"
				:label="label.catelogId + '：'"
				:placeholder="'请输入' + label.catelogId"
				:rules="rulesRef.catelogId"
				maxlength="19"
			/>
			<van-field
				v-model="formInfo.showDesc"
				name="showDesc"
				:label="label.showDesc + '：'"
				:placeholder="'请输入' + label.showDesc"
				:rules="rulesRef.showDesc"
				maxlength="3"
			/>
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
import { label, rulesRef } from '@/views/product/pmsAttr/pmsAttrDetail/pmsAttrDetailTs';
import { useNavBar } from '@/composables/useNavBar';
import { addPmsAttr, updatePmsAttr, getPmsAttrDetail } from '@/views/product/pmsAttr/api';

const route = useRoute();
const router = useRouter();
interface PmsAttrForm {
	id?: string;
	attrName?: string;
	searchType?: string | number;
	icon?: string;
	valueSelect?: string;
	attrType?: string | number;
	enable?: string | number;
	catelogId?: string | number;
	showDesc?: string | number;
}
useNavBar({
	title: (route?.meta?.title as string) || '商品属性',
	leftPath: '/product/pmsAttr',
	visible: true,
});

const formInfo = ref<PmsAttrForm>({});

const onSubmit = () => {
	let method = 'post';
	if (formInfo.value.id) {
		method = 'put';
	}
	(method === 'put' ? updatePmsAttr : addPmsAttr)(formInfo.value).then((res) => {
		if (res?.code == '200') {
			showSuccessToast(res?.message || '保存成功');
			router.push({ path: '/product/pmsAttr' });
		} else {
			showFailToast(res?.message || '保存失败，请联系管理员');
		}
	});
};

async function init() {
	const id = route?.query?.id as string | undefined;
	if (id) {
		try {
			const { code, data, message } = await getPmsAttrDetail(id);
			if (code === '200') {
				formInfo.value = (data || {}) as PmsAttrForm;
			} else {
				showFailToast(message || '查询详情失败，请联系管理员');
			}
		} catch {
			showFailToast('系统异常，请联系管理员');
		}
	} else {
		formInfo.value = {};
	}
}

onMounted(() => {
	void init();
});
</script>
<style lang="less" scoped>
.subButton {
	margin: 16px;
}
</style>
