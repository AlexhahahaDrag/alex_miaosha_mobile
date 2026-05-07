<template>
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
import type { OrgInfoData } from '@/views/user/orgInfo/config';
import { useNavBar } from '@/composables/useNavBar';
import { addOrgInfo, updateOrgInfo, getOrgInfoDetail } from '@/views/user/orgInfo/api';
import type { Info } from '@/views/common/pop/selectPop.vue';
import { getListName } from '@/views/common/config';
import { getDictList } from '@/views/finance/dict/api';
import type { DictInfo } from '@/views/finance/dict/api';

const route = useRoute();
const router = useRouter();
useNavBar({
	title: (route?.meta?.title as string) || '机构表',
	leftPath: '/user/orgInfo',
	visible: true,
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

function getDictInfoList(code: string, data: DictInfo[] | undefined, message?: string) {
	if (code === '200') {
		statusInfo.value.list = (data || []).filter((item) => item.belongTo === 'is_valid');
		statusName.value = getListName(statusInfo.value.list || [], formInfo.value.status, 'typeCode', 'typeName');
	} else {
		showFailToast(message || '查询失败，请联系管理员!');
	}
}

const onSubmit = async () => {
	let method = 'post';
	if (formInfo.value.id) {
		method = 'put';
	}
	const { code, message } = await (method === 'put' ? updateOrgInfo : addOrgInfo)(formInfo.value);
	if (code === '200') {
		showSuccessToast(message || '保存成功!');
		router.push({ path: '/user/orgInfo' });
	} else {
		showFailToast(message || '保存失败，请联系管理员!');
	}
};

const init = async () => {
	const id = route?.query?.id as string | string[] | undefined;
	if (id) {
		try {
			const safeId = Array.isArray(id) ? id[0] : id;
			const [detailRes, dictRes] = await Promise.all([getOrgInfoDetail(safeId || '-1'), getDictList('is_valid')]);
			const { code: detailCode, data: detailData, message: detailMessage } = detailRes;
			const { code: dictCode, data: dictData, message: dictMessage } = dictRes;
			if (detailCode === '200' && detailData) {
				formInfo.value = detailData;
			} else {
				showFailToast(detailMessage || '查询详情失败，请联系管理员!');
			}
			getDictInfoList(dictCode, dictData, dictMessage);
		} catch {
			showFailToast('系统问题，请联系管理员！');
		}
	} else {
		const { code, data, message } = await getDictList('is_valid');
		getDictInfoList(code, data, message);
		formInfo.value = {
			status: 1,
		};
	}
};

onMounted(() => {
	init();
});
</script>
<style lang="less" scoped>
.subButton {
	margin: 16px;
}
</style>
