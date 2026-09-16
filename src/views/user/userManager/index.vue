<template>
	<div class="profile-page">
		<van-divider>头像</van-divider>
		<div class="avatar-row">
			<van-image
				round
				width="72"
				height="72"
				fit="cover"
				:src="avatarUrl"
				class="avatar-preview"
			/>
			<uploadImage></uploadImage>
		</div>

		<van-divider>基本信息</van-divider>
		<van-form
			@submit="onSubmit"
			:rules="rulesRef"
			required="auto"
		>
			<van-cell-group inset>
				<van-field
					v-model="formInfo.username"
					name="username"
					label="用户名："
					disabled
				/>
				<van-field
					v-model="formInfo.nickName"
					name="nickName"
					label="昵称："
					placeholder="请输入昵称"
					:rules="rulesRef.nickName"
					:maxlength="50"
					data-testid="rbac-profile-nickname"
				/>
				<van-field
					v-model="formInfo.mobile"
					name="mobile"
					label="手机号："
					placeholder="请输入手机号"
					:rules="rulesRef.mobile"
					:maxlength="11"
					data-testid="rbac-profile-mobile"
				/>
				<van-field
					v-model="formInfo.email"
					name="email"
					label="邮箱："
					placeholder="请输入邮箱"
					:maxlength="100"
					data-testid="rbac-profile-email"
				/>
				<van-field
					v-model="formInfo.summary"
					name="summary"
					label="个人简介："
					placeholder="请输入个人简介"
					type="textarea"
					rows="2"
					autosize
					show-word-limit
					:maxlength="150"
				/>
				<van-field
					:model-value="orgName"
					label="所属机构："
					readonly
				/>
				<van-field
					:model-value="roleName"
					label="所属角色："
					readonly
				/>
			</van-cell-group>
			<div class="subButton">
				<van-button
					round
					block
					type="primary"
					native-type="submit"
					:loading="submitting"
					data-testid="rbac-profile-save"
				>
					保存
				</van-button>
			</div>
		</van-form>
	</div>
</template>

<script setup lang="ts">
import { showFailToast, showSuccessToast } from 'vant';
import uploadImage from '@/views/common/upload/uploadImage.vue';
import { useNavBar } from '@/composables/useNavBar';
import type { NavBarConfig } from '@/composables/useNavBar';
import { useUserStore } from '@/store/modules/user/user';
import { getUserManagerDetail, editUserManager } from '@/views/user/userManager/api';
import type { UserManagerData } from '@/views/user/userManager/config';

const route = useRoute();
const info = ref<Pick<NavBarConfig, 'title' | 'leftPath' | 'visible'>>({
	title: (route?.meta?.title as string) || '个人信息',
	leftPath: '/myself/about',
	visible: true,
});
useNavBar(info.value);

const userStore = useUserStore();

const rulesRef = reactive({
	nickName: [{ required: true, message: '昵称不能为空！' }],
	mobile: [{ pattern: /^$|^1[0-9]{10}$/, message: '手机号不合法！' }],
});

const formInfo = ref<UserManagerData>({});
const submitting = ref<boolean>(false);

const avatarUrl = computed(
	() =>
		formInfo.value.avatarUrl ||
		formInfo.value.avatar ||
		'https://img.yzcdn.cn/public_files/2017/10/23/8690bb321356070e0b8c4404d087f8fd.png',
);
const orgName = computed(() => userStore.getOrgInfo?.orgName || userStore.getOrgInfo?.orgAlias || '-');
const roleName = computed(() => userStore.getRoleInfo?.roleName || '-');

const onSubmit = async () => {
	if (!formInfo.value.id) {
		showFailToast('缺少用户 ID，无法保存');
		return;
	}
	submitting.value = true;
	try {
		const { code, data, message } = await editUserManager(formInfo.value);
		if (code === '200') {
			userStore.setUserInfo({ ...userStore.getUserInfo, ...formInfo.value, ...(data || {}) });
			showSuccessToast(message || '保存成功');
		} else {
			showFailToast(message || '保存失败，请联系管理员');
		}
	} finally {
		submitting.value = false;
	}
};

const init = async () => {
	const id = userStore.getUserInfo?.id;
	if (!id) {
		showFailToast('未获取到当前用户信息，请重新登录');
		return;
	}
	const { code, data, message } = await getUserManagerDetail(String(id));
	if (code === '200' && data) {
		formInfo.value = data;
	} else {
		showFailToast(message || '查询个人信息失败');
	}
};

void init();
</script>

<style lang="less" scoped>
.profile-page {
	padding-bottom: 24px;
}

.avatar-row {
	display: flex;
	align-items: center;
	gap: 16px;
	padding: 0 16px 16px;
}

.avatar-preview {
	border: 2px solid #fff;
	box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
	border-radius: 50%;
}

.subButton {
	margin: 16px;
}
</style>
