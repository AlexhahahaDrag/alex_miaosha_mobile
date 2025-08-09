<template>
	<div class="user-page">
		<div class="user-header">
			<van-skeleton :loading="loading" avatar :row="1" avatar-size="64">
				<div class="user-profile">
					<van-image
						round
						width="64"
						height="64"
						fit="cover"
						:src="avatarUrl"
					/>
					<div class="user-meta">
						<div class="user-name">{{ displayName }}</div>
						<div class="user-desc" v-if="orgName || roleName">
							{{ roleName }}<span v-if="roleName && orgName"> · </span
							>{{ orgName }}
						</div>
					</div>
				</div>
			</van-skeleton>
		</div>

		<van-cell-group inset title="账户">
			<van-cell icon="points" title="个人信息" is-link to="/myself/info" />
			<van-cell
				icon="gold-coin-o"
				title="账号与安全"
				is-link
				@click="goSecurity"
			/>
		</van-cell-group>

		<van-cell-group inset title="个性化" class="mt16">
			<van-cell icon="gift-o" title="主题设置" is-link @click="openTheme" />
		</van-cell-group>

		<van-cell-group inset title="信息" class="mt16">
			<van-cell title="组织" :value="orgName || '-'" />
			<van-cell title="角色" :value="roleName || '-'" />
		</van-cell-group>

		<van-cell-group inset class="mt16">
			<van-cell icon="warning-o" title="退出登录" is-link @click="showLogout" />
		</van-cell-group>
	</div>
	<Logout :visible="showLogoutFlag" @select="logout" />
</template>

<script lang="ts" setup>
import Logout from './logout/index.vue';
import { useUserStore } from '@/store/modules/user/user';
import { useNavBar } from '@/composables/useNavBar';
import { showToast } from 'vant';

// NavBar 设置
useNavBar({ title: '我的', noShowLeft: true });

const userStore = useUserStore();
const loading = computed(() => !userStore.getUserInfo);
const userInfo = computed<any>(() => userStore.getUserInfo || {});

const displayName = computed(
	() => userInfo.value?.nickName || userInfo.value?.username || '未登录',
);
const avatarUrl = computed(
	() =>
		userInfo.value?.avatarUrl ||
		userInfo.value?.avatar ||
		'https://img.yzcdn.cn/public_files/2017/10/23/8690bb321356070e0b8c4404d087f8fd.png',
);
const roleName = computed(() => userStore.getRoleInfo?.roleName || '');
const orgName = computed(
	() => userStore.getOrgInfo?.orgName || userStore.getOrgInfo?.orgAlias || '',
);

let showLogoutFlag = ref<boolean>(false);
const showLogout = () => {
	showLogoutFlag.value = true;
};
const logout = (v: boolean) => {
	showLogoutFlag.value = v;
};

const goSecurity = () => showToast('功能即将上线');
const openTheme = () => showToast('功能即将上线');
</script>

<style lang="scss">
.user-page {
	padding: 12px 12px 24px;
}

.user-header {
	background: linear-gradient(135deg, #f2f3f5 0%, #ffffff 100%);
	border-radius: 12px;
	padding: 16px;
}

.user-profile {
	display: flex;
	align-items: center;
}

.user-meta {
	margin-left: 12px;
}

.user-name {
	font-size: 16px;
	font-weight: 600;
	color: #323233;
}

.user-desc {
	margin-top: 4px;
	font-size: 12px;
	color: #969799;
}

.mt16 {
	margin-top: 16px;
}
</style>
