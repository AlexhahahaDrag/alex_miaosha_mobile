<template>
	<van-form
		@submit="onSubmit"
		:rules="rulesRef"
		required="auto"
	>
		<van-cell-group>
			<van-field
				v-model="roleName"
				name="roleId"
				:label="label.roleId + '：'"
				:placeholder="'请选择' + label.roleId"
				:rules="rulesRef.roleId"
				@click="choose('role')"
				data-testid="rbac-role-user-field-role"
				readonly
			/>
			<van-field
				v-model="userName"
				name="userId"
				:label="label.userId + '：'"
				:placeholder="'请选择' + label.userId"
				:rules="rulesRef.userId"
				@click="choose('user')"
				data-testid="rbac-role-user-field-user"
				readonly
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
import { label, rulesRef } from './roleUserInfoDetailTs';
import { useNavBar } from '@/composables/useNavBar';
import { getListName } from '@/views/common/config';
import { addRoleUserInfo, updateRoleUserInfo, getRoleUserInfoDetail } from '@/views/user/roleUserInfo/api';
import type { Info } from '@/views/common/pop/selectPop.vue';
import { getDictList } from '@/views/finance/dict/api';
import { getRoleInfoList } from '@/views/user/roleInfo/api';
import { getUserManagerList } from '@/views/user/userManager/api';
import type { UserManagerData } from '@/views/user/userManager/config';

const route = useRoute();
const router = useRouter();
interface RoleUserInfoForm {
	id?: string;
	roleId?: string;
	userId?: string;
	summary?: string;
	status?: string;
}
useNavBar({
	title: (route?.meta?.title as string) || '用户角色信息',
	leftPath: '/user/roleUserInfo',
	visible: true,
});

const formInfo = ref<RoleUserInfoForm>({});

const popInfo = ref<Info>({ showFlag: false });

const roleName = ref<string>('');
const userName = ref<string>('');
const statusName = ref<string>('');

const roleInfo = ref<Info>({
	label: 'role',
	labelName: label.roleId,
	rule: rulesRef.roleId,
	customFieldName: {
		text: 'roleName',
		value: 'id',
	},
	selectValue: formInfo.value.roleId,
});

const userInfo = ref<Info>({
	label: 'user',
	labelName: label.userId,
	rule: rulesRef.userId,
	customFieldName: {
		text: 'nickName',
		value: 'id',
	},
	selectValue: formInfo.value.userId,
});

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
		case 'role':
			roleInfo.value.selectValue = formInfo.value.roleId;
			popInfo.value = roleInfo.value;
			break;
		case 'user':
			userInfo.value.selectValue = formInfo.value.userId;
			popInfo.value = userInfo.value;
			break;
		case 'status':
			popInfo.value = statusInfo.value;
			break;
	}
	popInfo.value.showFlag = true;
};

const selectInfo = (type: string, value: string, name: string) => {
	popInfo.value.showFlag = false;
	switch (type) {
		case 'role':
			formInfo.value.roleId = value;
			roleName.value = name;
			break;
		case 'user':
			formInfo.value.userId = value;
			userName.value = name;
			break;
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

async function loadRoleOptions() {
	const { code, data, message } = await getRoleInfoList();
	if (code === '200') {
		roleInfo.value.list = data?.records || [];
		roleName.value = getListName(roleInfo.value.list || [], formInfo.value.roleId, 'id', 'roleName');
	} else {
		showFailToast(message || '加载角色列表失败，请联系管理员');
	}
}

async function loadUserOptions() {
	const { code, data, message } = await getUserManagerList({});
	if (code === '200') {
		userInfo.value.list = data || [];
		userName.value = getListName<UserManagerData>(userInfo.value.list || [], formInfo.value.userId, 'id', 'nickName');
	} else {
		showFailToast(message || '加载用户列表失败，请联系管理员');
	}
}

const onSubmit = () => {
	if (!formInfo.value.roleId || !formInfo.value.userId) {
		showFailToast('请先选择角色和用户');
		return;
	}
	let method = 'post';
	if (formInfo.value.id) {
		method = 'put';
	}
	(method === 'put' ? updateRoleUserInfo : addRoleUserInfo)(formInfo.value).then((res) => {
		if (res?.code == '200') {
			showSuccessToast(res?.message || '保存成功');
			router.push({ path: '/user/roleUserInfo' });
		} else {
			showFailToast(res?.message || '保存失败，请联系管理员');
		}
	});
};

function init() {
	const id = route?.query?.id as string | undefined;
	const tasks: Promise<unknown>[] = [getDictList('is_valid'), loadRoleOptions(), loadUserOptions()];
	if (id) {
		Promise.all([getRoleUserInfoDetail(id || '-1'), ...tasks])
			.then((res) => {
				const detailRes = res[0] as { code?: string; data?: RoleUserInfoForm; message?: string };
				if (detailRes.code == '200') {
					formInfo.value = detailRes.data || {};
					roleName.value = getListName(roleInfo.value.list || [], formInfo.value.roleId, 'id', 'roleName');
					userName.value = getListName<UserManagerData>(
						userInfo.value.list || [],
						formInfo.value.userId,
						'id',
						'nickName',
					);
				} else {
					showFailToast(detailRes?.message || '查询详情失败，请联系管理员');
				}
				getDictInfoList(res[1] as { code?: string; data?: Array<{ belongTo: string }>; message?: string });
			})
			.catch(() => {
				showFailToast('系统异常，请联系管理员');
			});
	} else {
		Promise.all(tasks).then((res) => {
			getDictInfoList(res[0] as { code?: string; data?: Array<{ belongTo: string }>; message?: string });
		});
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
