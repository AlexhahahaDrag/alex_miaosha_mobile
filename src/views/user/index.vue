<template>
	<div class="user-page-container">
		<!-- Hero Profile Section -->
		<div class="profile-hero">
			<div class="hero-content">
				<van-skeleton
					:loading="loading"
					avatar
					avatar-size="72"
					:row="1"
					class="hero-skeleton"
				>
					<div class="profile-main">
						<div class="avatar-wrapper">
							<van-image
								round
								width="72"
								height="72"
								fit="cover"
								:src="avatarUrl || ''"
								class="profile-avatar"
							/>
							<div class="role-badge">{{ roleName }}</div>
						</div>
						<div class="profile-info">
							<div class="display-name">{{ displayName }}</div>
							<div
								class="org-tag"
								v-if="orgName"
							>
								<svg-icon
									name="orgManager"
									class="tag-icon"
								/>
								{{ orgName }}
							</div>
						</div>
					</div>
				</van-skeleton>
			</div>
		</div>

		<!-- Action Cards -->
		<div class="action-sections">
			<div class="card-group">
				<div class="group-title">账户设置</div>
				<van-cell
					title="个人信息"
					is-link
					to="/myself/info"
					@click="handleInteraction"
				>
					<template #icon>
						<div class="cell-icon-box blue">
							<svg-icon name="user-circle" />
						</div>
					</template>
				</van-cell>
				<van-cell
					title="账号与安全"
					is-link
					@click="goSecurity"
				>
					<template #icon>
						<div class="cell-icon-box green">
							<svg-icon name="shield-check" />
						</div>
					</template>
				</van-cell>
			</div>

			<div class="card-group mt-4">
				<div class="group-title">个性化</div>
				<van-cell
					title="主题设置"
					is-link
					@click="openTheme"
				>
					<template #icon>
						<div class="cell-icon-box amber">
							<svg-icon name="palette" />
						</div>
					</template>
				</van-cell>
			</div>

			<div class="card-group mt-4">
				<div class="group-title">系统信息</div>
				<van-cell
					title="当前角色"
					:value="roleName || '-'"
				/>
				<van-cell
					title="所属组织"
					:value="orgName || '-'"
				/>
			</div>

			<div class="logout-box mt-6">
				<van-button
					block
					round
					class="logout-btn"
					@click="showLogout"
				>
					<template #icon>
						<svg-icon
							name="log-out"
							class="logout-icon"
						/>
					</template>
					退出当前账号
				</van-button>
			</div>
		</div>
	</div>
	<logout
		:visible="showLogoutFlag"
		@select="logoutInfo"
	></logout>
</template>

<script lang="ts" setup>
import { showToast } from 'vant';
import logout from './logout/index.vue';
import type { UserManagerData } from './userManager/config';
import { useUserStore } from '@/store/modules/user/user';
import { useNavBar } from '@/composables/useNavBar';
import { useTabBar } from '@/composables/useTabBar';

// NavBar 设置
useNavBar({ title: '我的', noShowLeft: true });

useTabBar({
	visible: true,
	data: [
		{ name: 'dashboard', title: '首页', icon: 'homepage' },
		{ name: 'message', title: '消息', icon: 'message' },
		{ name: 'myself', title: '我的', icon: 'user' },
	],
	active: 2,
});

const userStore = useUserStore();
const loading = computed(() => !userStore.getUserInfo);
const userInfo = computed<UserManagerData>(() => userStore.getUserInfo || {});

const displayName = computed(() => userInfo.value?.nickName || userInfo.value?.username || '未登录');
const avatarUrl = computed(
	() =>
		userInfo.value?.avatarUrl ||
		userInfo.value?.avatar ||
		'https://img.yzcdn.cn/public_files/2017/10/23/8690bb321356070e0b8c4404d087f8fd.png',
);
const roleName = computed(() => userStore.getRoleInfo?.roleName || '');
const orgName = computed(() => userStore.getOrgInfo?.orgName || userStore.getOrgInfo?.orgAlias || '');

const showLogoutFlag = ref<boolean>(false);
const showLogout = () => {
	showLogoutFlag.value = true;
};
const logoutInfo = (v: boolean) => {
	showLogoutFlag.value = v;
};

const goSecurity = () => {
	handleInteraction();
	showToast('功能即将上线');
};
const openTheme = () => {
	handleInteraction();
	showToast('功能即将上线');
};

const handleInteraction = () => {
	if (navigator.vibrate) {
		navigator.vibrate(50);
	}
};
</script>

<style lang="less" scoped>
.user-page-container {
	background-color: #f8fafc;
	padding-bottom: 50px;
}

.profile-hero {
	background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
	padding: 40px 20px 60px;
	border-radius: 0 0 32px 32px;
}

.profile-main {
	display: flex;
	align-items: center;
}

.avatar-wrapper {
	position: relative;
}

.profile-avatar {
	border: 3px solid rgba(255, 255, 255, 0.3);
	box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.role-badge {
	position: absolute;
	bottom: -4px;
	left: 50%;
	transform: translateX(-50%);
	background: #f59e0b;
	color: white;
	font-size: 10px;
	padding: 2px 8px;
	border-radius: 10px;
	white-space: nowrap;
	font-weight: 700;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.profile-info {
	margin-left: 20px;
}

.display-name {
	font-size: 24px;
	font-weight: 800;
	color: #ffffff;
	margin-bottom: 6px;
}

.org-tag {
	display: inline-flex;
	align-items: center;
	background: rgba(255, 255, 255, 0.15);
	color: rgba(255, 255, 255, 0.9);
	padding: 4px 10px;
	border-radius: 6px;
	font-size: 12px;
	backdrop-filter: blur(4px);
}

.tag-icon {
	width: 14px;
	height: 14px;
	margin-right: 4px;
}

.action-sections {
	margin-top: -30px;
	padding: 0 16px;
}

.card-group {
	background: #ffffff;
	border-radius: 20px;
	padding: 12px 4px;
	box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.group-title {
	font-size: 13px;
	font-weight: 700;
	color: #64748b;
	margin: 0 16px 12px;
	text-transform: uppercase;
	letter-spacing: 0.05em;
}

.cell-icon-box {
	width: 32px;
	height: 32px;
	border-radius: 8px;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 12px;
	svg {
		width: 18px;
		height: 18px;
	}
	&.blue {
		background: #eff6ff;
		color: #1e40af;
	}
	&.green {
		background: #f0fdf4;
		color: #16a34a;
	}
	&.amber {
		background: #fffbeb;
		color: #d97706;
	}
}

.logout-box {
	padding: 0 16px;
}

.logout-btn {
	height: 50px;
	background: #ffffff;
	border: 1px solid #fee2e2;
	color: #ef4444;
	font-weight: 700;
	font-size: 15px;
	box-shadow: 0 4px 6px -1px rgba(239, 68, 68, 0.05);
	&:active {
		transform: scale(0.98);
		background: #fef2f2;
	}
}

.logout-icon {
	width: 18px;
	height: 18px;
	margin-right: 6px;
}

.mt-4 {
	margin-top: 16px;
}
.mt-6 {
	margin-top: 24px;
}
</style>
