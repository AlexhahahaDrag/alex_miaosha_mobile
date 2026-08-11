<template>
	<van-form
		@submit="onSubmit"
		:rules="rulesRef"
		required="auto"
	>
		<van-cell-group>
			<van-field
				v-model="orgName"
				name="orgId"
				:label="label.orgId + '：'"
				:placeholder="'请选择' + label.orgId"
				:rules="rulesRef.orgId"
				@click="choose('org')"
				data-testid="rbac-org-user-field-org"
				readonly
			/>
			<van-field
				v-model="userName"
				name="userId"
				:label="label.userId + '：'"
				:placeholder="'请选择' + label.userId"
				:rules="rulesRef.userId"
				@click="choose('user')"
				data-testid="rbac-org-user-field-user"
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
import { label, rulesRef } from './orgUserInfoDetailTs';
import { useNavBar } from '@/composables/useNavBar';
import { getListName } from '@/views/common/config';
import { addOrgUserInfo, updateOrgUserInfo, getOrgUserInfoDetail } from '@/views/user/orgUserInfo/api';
import type { Info } from '@/views/common/pop/selectPop.vue';
import { getDictList } from '@/views/finance/dict/api';
import { getOrgInfoTree } from '@/views/user/orgInfo/api';
import { flattenOrgTree, type OrgTreeOption } from '@/views/user/orgInfo/orgInfoTs';
import { getUserManagerList } from '@/views/user/userManager/api';
import type { UserManagerData } from '@/views/user/userManager/config';

const route = useRoute();
const router = useRouter();
interface OrgUserInfoForm {
	id?: string;
	orgId?: string;
	userId?: string;
	summary?: string;
	status?: string;
}
useNavBar({
	title: (route?.meta?.title as string) || '用户公司信息',
	leftPath: '/user/orgUserInfo',
	visible: true,
});

const formInfo = ref<OrgUserInfoForm>({});

const popInfo = ref<Info>({ showFlag: false });

const orgName = ref<string>('');
const userName = ref<string>('');
const statusName = ref<string>('');

const orgInfo = ref<Info>({
	label: 'org',
	labelName: label.orgId,
	rule: rulesRef.orgId,
	customFieldName: {
		text: 'orgName',
		value: 'id',
	},
	selectValue: formInfo.value.orgId,
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
		case 'org':
			orgInfo.value.selectValue = formInfo.value.orgId;
			popInfo.value = orgInfo.value;
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
		case 'org': {
			formInfo.value.orgId = value;
			const matched = (orgInfo.value.list as OrgTreeOption[] | undefined)?.find((item) => item.id === value);
			orgName.value = matched?.rawName || name;
			break;
		}
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
		statusInfo.value.list = (res.data || []).filter((item: { belongTo: string }) => item.belongTo == 'is_valid');
		statusName.value = getListName(statusInfo.value.list || [], formInfo.value.status, 'typeCode', 'typeName');
	} else {
		showFailToast(res?.message || '查询失败，请联系管理员');
	}
}

async function loadOrgOptions() {
	const { code, data, message } = await getOrgInfoTree();
	if (code === '200') {
		orgInfo.value.list = flattenOrgTree(data);
		orgName.value = getListName<OrgTreeOption>(
			(orgInfo.value.list as OrgTreeOption[]) || [],
			formInfo.value.orgId,
			'id',
			'rawName',
		);
	} else {
		showFailToast(message || '加载机构列表失败，请联系管理员');
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
	if (!formInfo.value.orgId || !formInfo.value.userId) {
		showFailToast('请先选择机构和用户');
		return;
	}
	let method = 'post';
	if (formInfo.value.id) {
		method = 'put';
	}
	(method === 'put' ? updateOrgUserInfo : addOrgUserInfo)(formInfo.value).then((res) => {
		if (res?.code == '200') {
			showSuccessToast(res?.message || '保存成功');
			router.push({ path: '/user/orgUserInfo' });
		} else {
			showFailToast(res?.message || '保存失败，请联系管理员');
		}
	});
};

function init() {
	const id = route?.query?.id as string | undefined;
	const tasks: Promise<unknown>[] = [getDictList('is_valid'), loadOrgOptions(), loadUserOptions()];
	if (id) {
		Promise.all([getOrgUserInfoDetail(id || '-1'), ...tasks])
			.then((res) => {
				const detailRes = res[0] as { code?: string; data?: OrgUserInfoForm; message?: string };
				if (detailRes.code == '200') {
					formInfo.value = detailRes.data || {};
					orgName.value = getListName<OrgTreeOption>(
						(orgInfo.value.list as OrgTreeOption[]) || [],
						formInfo.value.orgId,
						'id',
						'rawName',
					);
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
