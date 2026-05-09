<template>
	<van-form
		@submit="onSubmit"
		:rules="rulesRef"
		required="auto"
	>
		<van-cell-group>
			<van-field
				v-model="formInfo.roleCode"
				name="roleCode"
				:label="label.roleCode + '：'"
				:placeholder="'请输入' + label.roleCode"
				:rules="rulesRef.roleCode"
				:maxlength="128"
			/>
			<van-field
				v-model="formInfo.roleName"
				name="roleName"
				:label="label.roleName + '：'"
				:placeholder="'请输入' + label.roleName"
				:rules="rulesRef.roleName"
				:maxlength="128"
			/>
			<van-field
				v-model="formInfo.summary"
				name="summary"
				:label="label.summary + '：'"
				:placeholder="'请输入' + label.summary"
				:rules="rulesRef.summary"
				:maxlength="200"
			/>
			<van-field
				v-model="statusName"
				name="status"
				:label="label.status + '：'"
				:placeholder="'请输入' + label.status"
				:rules="rulesRef.status"
				@click="choose('status')"
				readonly
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
import { label, rulesRef } from './roleInfoDetailTs';
import { useNavBar } from '@/composables/useNavBar';
import { getListName } from '@/views/common/config';
import { addRoleInfo, updateRoleInfo, getRoleInfoDetail } from '@/views/user/roleInfo/api';
import type { RoleInfoData } from '@/views/user/roleInfo/config';
import type { Info } from '@/views/common/pop/selectPop.vue';
import { getDictList, type DictInfo } from '@/views/finance/dict/api';

interface RoleInfoDetailForm extends RoleInfoData {
	id?: string;
	roleCode?: string;
	roleName?: string;
	summary?: string;
	status?: string | number | null;
}

const route = useRoute();
const router = useRouter();
useNavBar({
	title: (route?.meta?.title as string) || '角色信息',
	leftPath: '/user/roleInfo',
	visible: true,
});

const formInfo = ref<RoleInfoDetailForm>({});

const popInfo = ref<Info<DictInfo>>({ showFlag: false });

const statusName = ref<string>('');

const statusInfo = ref<Info<DictInfo>>({
	label: 'status',
	labelName: label.status,
	rule: rulesRef.status,
	customFieldName: {
		text: 'typeName',
		value: 'typeCode',
	},
	selectValue: formInfo.value.status,
});

const choose = (type: string) => {
	switch (type) {
		case 'status':
			popInfo.value = statusInfo.value;
			break;
	}
	popInfo.value.showFlag = true;
};

const selectInfo = (type: string, value: string, name: string) => {
	popInfo.value.showFlag = false;
	switch (type) {
		case 'status':
			formInfo.value.status = value;
			statusName.value = name;
			break;
	}
};

const cancelInfo = () => {
	popInfo.value.showFlag = false;
};

function getDictInfoList(code: string, data: DictInfo[] | undefined, message?: string) {
	if (code === '200') {
		statusInfo.value.list = (data || []).filter((item) => item.belongTo == 'is_valid');
		statusName.value = getListName(statusInfo.value.list || [], formInfo.value.status, 'typeCode', 'typeName');
	} else {
		showFailToast(message || '查询失败，请联系管理员！');
	}
}

const onSubmit = async () => {
	let method = 'post';
	if (formInfo.value.id) {
		method = 'put';
	}
	const { code, message } = await (method === 'put' ? updateRoleInfo : addRoleInfo)(formInfo.value);
	if (code === '200') {
		showSuccessToast(message || '保存成功!');
		router.push({ path: '/user/roleInfo' });
	} else {
		showFailToast(message || '保存失败，请联系管理员！');
	}
};

async function init() {
	const id = route?.query?.id as string | undefined;
	if (id) {
		try {
			const [detailRes, dictRes] = await Promise.all([getRoleInfoDetail(id || '-1'), getDictList('is_valid')]);
			const { code: detailCode, data: detailData, message: detailMessage } = detailRes;
			const { code: dictCode, data: dictData, message: dictMessage } = dictRes;
			if (detailCode === '200') {
				formInfo.value = (detailData as RoleInfoDetailForm) || {};
			} else {
				showFailToast(detailMessage || '查询详情失败，请联系管理员！');
			}
			getDictInfoList(dictCode, dictData, dictMessage);
		} catch {
			showFailToast('系统问题，请联系管理员！');
		}
	} else {
		const { code, data, message } = await getDictList('is_valid');
		getDictInfoList(code, data, message);
		formInfo.value = {};
	}
}

void init();
</script>
<style lang="less" scoped>
.subButton {
	margin: 16px;
}
</style>
