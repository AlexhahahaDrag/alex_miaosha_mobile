<template>
	<NavBar :info="info"></NavBar>
	<van-form
		@submit="onSubmit"
		:rules="rulesRef"
		required="auto"
	>
		<van-cell-group>
			<van-field
				v-model="formInfo.orgCode"
				name="orgCode"
				:label="label.orgCode + '：'"
				:placeholder="'请输入' + label.orgCode"
				:rules="rulesRef.orgCode"
				:maxlength="255"
			/>
			<van-field
				v-model="formInfo.orgName"
				name="orgName"
				:label="label.orgName + '：'"
				:placeholder="'请输入' + label.orgName"
				:rules="rulesRef.orgName"
				:maxlength="512"
			/>
			<van-field
				v-model="formInfo.orgShortName"
				name="orgShortName"
				:label="label.orgShortName + '：'"
				:placeholder="'请输入' + label.orgShortName"
				:rules="rulesRef.orgShortName"
				:maxlength="512"
			/>
			<van-field
				v-model="formInfo.parentName"
				name="parentId"
				:label="label.parentId + '：'"
				:placeholder="'请输入' + label.parentId"
				readonly
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
				v-model="formInfo.summary"
				name="summary"
				:label="label.summary + '：'"
				:placeholder="'请输入' + label.summary"
				:rules="rulesRef.summary"
				rows="2"
				type="textarea"
				:maxlength="2000"
				show-word-limit
				autosize
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
import type { OrgInfoData } from '../config';
import { addOrgInfo, updateOrgInfo, getOrgInfoDetail } from '@/views/user/orgInfo/api';
import type { Info } from '@/views/common/pop/selectPop.vue';
import { getListName } from '@/views/common/config';
import { getDictList } from '@/views/finance/dict/api';
import type { DictInfo } from '@/views/finance/dict/api';
import type { ResponseBody } from '@/types/api';

interface NavBarInfo {
	title?: string;
	leftPath?: string;
}

const route = useRoute();
const router = useRouter();
const info = ref<NavBarInfo>({
	title: route?.meta?.title || '机构表',
	leftPath: '/user/orgInfo',
});

const formInfo = ref<OrgInfoData>({});

const label = reactive({
	orgCode: '机构编码',
	orgName: '机构名称',
	orgShortName: '机构简称',
	parentId: '父级机构',
	summary: '简介',
	status: '状态',
});

const rulesRef = reactive({
	orgCode: [
		{
			required: true,
			message: `${label.orgCode}不能为空！`,
		},
	],
	orgName: [
		{
			required: true,
			message: `${label.orgName}不能为空！`,
		},
	],
	orgShortName: [
		{
			required: true,
			message: `${label.orgShortName}不能为空！`,
		},
	],
	summary: [
		{
			required: true,
			message: `${label.summary}不能为空！`,
		},
	],
	status: [
		{
			required: true,
			message: `${label.status}不能为空！`,
		},
	],
});

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

const selectInfo = (type: string, value: string | number, name: string) => {
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

function getDictInfoList(res: ResponseBody<DictInfo[]>) {
	if (res.code == '200') {
		statusInfo.value.list = res.data.filter((item: { belongTo: string }) => item.belongTo == 'is_valid');
		statusName.value = getListName(statusInfo.value.list || [], formInfo.value.status, 'typeCode', 'typeName');
	} else {
		showFailToast(res?.message || '查询失败，请联系管理员!');
	}
}

const onSubmit = () => {
	let method = 'post';
	if (formInfo.value.id) {
		method = 'put';
	}
	(method === 'put' ? updateOrgInfo : addOrgInfo)(formInfo.value).then((res: ResponseBody<OrgInfoData>) => {
		if (res?.code == '200') {
			showSuccessToast(res?.message || '保存成功!');
			router.push({ path: '/user/orgInfo' });
		} else {
			showFailToast(res?.message || '保存失败，请联系管理员!');
		}
	});
};

function init() {
	const id = route?.query?.id;
	if (id) {
		Promise.all([getOrgInfoDetail(id || '-1'), getDictList('is_valid')])
			.then(([detailRes, dictRes]) => {
				const res = detailRes;
				if (detailRes.code == '200' && detailRes.data) {
					formInfo.value = detailRes.data;
				} else {
					showFailToast(res?.message || '查询详情失败，请联系管理员!');
				}
				getDictInfoList(dictRes);
			})
			.catch(() => {
				showFailToast('系统问题，请联系管理员！');
			});
	} else {
		getDictList('is_valid').then((res: ResponseBody<DictInfo[]>) => {
			getDictInfoList(res);
		});
		formInfo.value = {
			status: 1,
		};
	}
}

init();
</script>
<style lang="less" scoped>
.subButton {
	margin: 16px;
}
</style>
