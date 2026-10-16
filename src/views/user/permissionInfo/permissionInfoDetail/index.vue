<template>
	<van-form
		@submit="onSubmit"
		:rules="rulesRef"
		required="auto"
	>
		<van-cell-group>
			<van-field
				v-model="formInfo.permissionCode"
				name="permissionCode"
				:label="label.permissionCode + '：'"
				:placeholder="'请输入' + label.permissionCode"
				:rules="rulesRef.permissionCode"
				:maxlength="128"
			/>
			<van-field
				v-model="formInfo.permissionName"
				name="permissionName"
				:label="label.permissionName + '：'"
				:placeholder="'请输入' + label.permissionName"
				:rules="rulesRef.permissionName"
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
			<van-field
				v-model="formInfo.options"
				name="options"
				:label="label.options + '：'"
				:placeholder="'请输入' + label.options"
				:rules="rulesRef.options"
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
import { label, rulesRef } from '@/views/user/permissionInfo/permissionInfoDetail/permissionInfoDetailTs';
import { useNavBar } from '@/composables/useNavBar';
import { getListName } from '@/views/common/config';
import { addPermissionInfo, updatePermissionInfo, getPermissionInfoDetail } from '@/views/user/permissionInfo/api';
import type { Info } from '@/components/pop/selectPop.vue';
import { getDictList } from '@/views/finance/dict/api';

const route = useRoute();
const router = useRouter();
interface PermissionInfoForm {
	id?: string;
	permissionCode?: string;
	permissionName?: string;
	summary?: string;
	status?: string;
	options?: string;
}
useNavBar({
	title: (route?.meta?.title as string) || '权限信息',
	leftPath: '/user/permissionInfo',
	visible: true,
});

const formInfo = ref<PermissionInfoForm>({});

const popInfo = ref<Info>({ showFlag: false });

const statusName = ref<string>('');

const statusInfo = ref<Info>({
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

function getDictInfoList(res: { code?: string; data?: Array<{ belongTo: string }>; message?: string }) {
	if (res?.code == '200') {
		const dictList = (res.data || []).filter((item: { belongTo: string }) => item.belongTo == 'is_valid');
		statusInfo.value.list = dictList;
		statusName.value = getListName(statusInfo.value.list || [], formInfo.value.status, 'typeCode', 'typeName');
	} else {
		showFailToast(res?.message || '查询失败，请联系管理员');
	}
}

const onSubmit = () => {
	let method = 'post';
	if (formInfo.value.id) {
		method = 'put';
	}
	(method === 'put' ? updatePermissionInfo : addPermissionInfo)(formInfo.value).then((res) => {
		if (res?.code == '200') {
			showSuccessToast(res?.message || '保存成功');
			router.push({ path: '/user/permissionInfo' });
		} else {
			showFailToast(res?.message || '保存失败，请联系管理员');
		}
	});
};

async function init() {
	const id = route?.query?.id as string | undefined;

	try {
		// 1. 公共数据（字典）：统一提前加载并初始化
		const dictRes = await getDictList('is_valid');
		getDictInfoList(dictRes as { code?: string; data?: Array<{ belongTo: string }>; message?: string });

		// 2. 仅编辑模式按需拉取详情并回填
		if (id) {
			const { code, data, message } = await getPermissionInfoDetail(id);
			if (code == '200' && data) {
				formInfo.value = data;
				statusName.value = getListName(statusInfo.value.list || [], formInfo.value.status, 'typeCode', 'typeName');
			} else {
				showFailToast(message || '查询详情失败，请联系管理员');
			}
		} else {
			formInfo.value = {};
		}
	} catch {
		showFailToast('系统异常，请联系管理员');
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
