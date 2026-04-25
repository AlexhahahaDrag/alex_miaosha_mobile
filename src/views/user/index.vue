<template>
	<div class="user-page-container">
		<!-- Hero Section with Premium Gradient -->
		<div class="profile-hero">
			<div class="hero-bg-shapes">
				<div class="shape shape-1"></div>
				<div class="shape shape-2"></div>
			</div>

			<div class="hero-header">
				<div class="header-title">我的</div>
				<div class="header-actions">
					<van-icon
						name="setting-o"
						class="settings-icon"
						@click="openTheme"
					/>
				</div>
			</div>

			<div class="hero-user-info">
				<van-skeleton
					:loading="loading"
					avatar
					avatar-size="80"
					:row="2"
				>
					<div class="user-main">
						<div class="avatar-container">
							<van-image
								round
								width="80"
								height="80"
								fit="cover"
								:src="avatarUrl"
								class="avatar-img"
							/>
						</div>
						<div class="user-text">
							<div class="name-row">
								<span class="username">{{ displayName }}</span>
								<div class="role-tag">
									<svg-icon
										name="shield-check"
										class="role-icon"
									/>
									{{ roleName }}
								</div>
							</div>
							<div class="user-desc">管理平台所有功能与数据</div>
						</div>
						<!-- Decorative Grid dots -->
						<div class="grid-dots"></div>
					</div>
				</van-skeleton>
			</div>

			<!-- Quick Info Cards -->
			<div class="quick-info-row">
				<div class="info-item">
					<div class="info-icon-box">
						<svg-icon name="orgManager" />
					</div>
					<div class="info-content">
						<div class="info-label">所属组织</div>
						<div class="info-value">{{ orgName || '演示组织' }}</div>
					</div>
				</div>
				<div class="info-divider"></div>
				<div class="info-item">
					<div class="info-icon-box">
						<svg-icon name="shield-check" />
					</div>
					<div class="info-content">
						<div class="info-label">账号状态</div>
						<div class="info-value status-active">正常</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Settings Sections -->
		<div class="settings-content">
			<!-- Account Group -->
			<div class="settings-group">
				<div class="group-header">
					<span class="header-bar"></span>
					<span class="header-text">账户设置</span>
				</div>
				<van-cell-group
					inset
					class="custom-group"
				>
					<van-cell
						is-link
						to="/myself/info"
						center
						@click="handleInteraction"
					>
						<template #icon>
							<div class="item-icon blue"><svg-icon name="user" /></div>
						</template>
						<template #title>
							<div class="item-title">个人信息</div>
							<div class="item-label">管理您的个人资料</div>
						</template>
					</van-cell>
					<van-cell
						is-link
						center
						@click="goSecurity"
					>
						<template #icon>
							<div class="item-icon green"><svg-icon name="shield-check" /></div>
						</template>
						<template #title>
							<div class="item-title">账户与安全</div>
							<div class="item-label">修改密码、绑定手机等</div>
						</template>
					</van-cell>
				</van-cell-group>
			</div>

			<!-- Personalization Group -->
			<div class="settings-group mt-4">
				<div class="group-header">
					<span class="header-bar"></span>
					<span class="header-text">个性化</span>
				</div>
				<van-cell-group
					inset
					class="custom-group"
				>
					<van-cell
						is-link
						center
						@click="openTheme"
					>
						<template #icon>
							<div class="item-icon amber"><svg-icon name="palette" /></div>
						</template>
						<template #title>
							<div class="item-title">主题设置</div>
							<div class="item-label">选择您喜欢的主题风格</div>
						</template>
					</van-cell>
				</van-cell-group>
			</div>

			<!-- System Info Group -->
			<div class="settings-group mt-4">
				<div class="group-header">
					<span class="header-bar"></span>
					<span class="header-text">系统信息</span>
				</div>
				<van-cell-group
					inset
					class="custom-group"
				>
					<van-cell center>
						<template #icon>
							<div class="item-icon light-blue"><svg-icon name="message" /></div>
						</template>
						<template #title>
							<div class="item-title">当前角色</div>
						</template>
						<template #value>
							<span class="value-text primary">{{ roleName }}</span>
						</template>
						<template #right-icon><van-icon
							name="arrow"
							class="val-arrow"
						/></template>
					</van-cell>
					<van-cell center>
						<template #icon>
							<div class="item-icon purple"><svg-icon name="userManager" /></div>
						</template>
						<template #title>
							<div class="item-title">所属组织</div>
						</template>
						<template #value>
							<span class="value-text">{{ orgName || '演示组织' }}</span>
						</template>
						<template #right-icon><van-icon
							name="arrow"
							class="val-arrow"
						/></template>
					</van-cell>
				</van-cell-group>
			</div>

			<!-- System Group -->
			<div class="settings-group mt-4">
				<div class="group-header">
					<span class="header-bar"></span>
					<span class="header-text">系统</span>
				</div>
				<van-cell-group
					inset
					class="custom-group"
				>
					<van-cell
						is-link
						center
						@click="handleInteraction"
					>
						<template #icon>
							<div class="item-icon sky"><svg-icon name="orderManager" /></div>
						</template>
						<template #title>
							<div class="item-title">关于系统</div>
							<div class="item-label">了解系统版本与信息</div>
						</template>
					</van-cell>
					<van-cell
						is-link
						center
						@click="handleInteraction"
					>
						<template #icon>
							<div class="item-icon emerald"><svg-icon name="message" /></div>
						</template>
						<template #title>
							<div class="item-title">帮助与反馈</div>
							<div class="item-label">常见问题与反馈建议</div>
						</template>
					</van-cell>
					<van-cell center>
						<template #icon>
							<div class="item-icon violet"><svg-icon name="shopStockBatch" /></div>
						</template>
						<template #title>
							<div class="item-title">版本信息</div>
						</template>
						<template #value>
							<span class="value-text">v1.2.0</span>
						</template>
						<template #right-icon><van-icon
							name="arrow"
							class="val-arrow"
						/></template>
					</van-cell>
				</van-cell-group>
			</div>

			<!-- Logout Action -->
			<div class="logout-container">
				<van-button
					block
					class="logout-btn-premium"
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

		<logout
			:visible="showLogoutFlag"
			@select="logoutInfo"
		/>
	</div>
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
	background-color: #f7f9fc;
	min-height: 100vh;
	padding-bottom: 80px;
}

/* --- Hero Section --- */
.profile-hero {
	position: relative;
	background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
	padding: 20px 20px 80px;
	overflow: hidden;
}

.hero-bg-shapes {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 0;
	pointer-events: none;
}

.shape {
	position: absolute;
	border-radius: 50%;
	filter: blur(40px);
}

.shape-1 {
	width: 200px;
	height: 200px;
	background: rgba(255, 255, 255, 0.1);
	top: -50px;
	right: -50px;
}

.shape-2 {
	width: 150px;
	height: 150px;
	background: rgba(59, 130, 246, 0.3);
	bottom: -20px;
	left: -20px;
}

.hero-header {
	position: relative;
	z-index: 1;
	display: flex;
	justify-content: center;
	align-items: center;
	margin-bottom: 30px;
	padding-top: 10px;
}

.header-title {
	font-size: 18px;
	font-weight: 700;
	color: #ffffff;
}

.header-actions {
	position: absolute;
	right: 0;
}

.settings-icon {
	font-size: 22px;
	color: #ffffff;
	opacity: 0.9;
}

.hero-user-info {
	position: relative;
	z-index: 1;
	margin-bottom: 30px;
}

.user-main {
	display: flex;
	align-items: center;
	position: relative;
}

.avatar-container {
	padding: 4px;
	background: rgba(255, 255, 255, 0.2);
	border-radius: 50%;
	backdrop-filter: blur(10px);
}

.avatar-img {
	border: 3px solid #ffffff;
	box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.user-text {
	margin-left: 20px;
}

.username {
	font-size: 26px;
	font-weight: 800;
	color: #ffffff;
	margin-right: 12px;
}

.role-tag {
	display: inline-flex;
	align-items: center;
	background: #f59e0b;
	color: white;
	padding: 4px 12px;
	border-radius: 20px;
	font-size: 11px;
	font-weight: 700;
	box-shadow: 0 4px 10px rgba(245, 158, 11, 0.3);
}

.role-icon {
	width: 12px;
	height: 12px;
	margin-right: 4px;
}

.user-desc {
	font-size: 13px;
	color: rgba(255, 255, 255, 0.8);
	margin-top: 8px;
	font-weight: 500;
}

.grid-dots {
	position: absolute;
	right: 0;
	top: 50%;
	transform: translateY(-50%);
	width: 48px;
	height: 32px;
	background-image: radial-gradient(rgba(255, 255, 255, 0.3) 1.5px, transparent 1.5px);
	background-size: 8px 8px;
	opacity: 0.5;
}

/* --- Quick Info Row --- */
.quick-info-row {
	position: relative;
	z-index: 1;
	display: flex;
	align-items: center;
	background: rgba(255, 255, 255, 0.1);
	backdrop-filter: blur(12px);
	border: 1px solid rgba(255, 255, 255, 0.15);
	border-radius: 16px;
	padding: 16px;
}

.info-item {
	flex: 1;
	display: flex;
	align-items: center;
	padding: 0 8px;
}

.info-icon-box {
	width: 36px;
	height: 36px;
	background: rgba(255, 255, 255, 0.1);
	border-radius: 10px;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 12px;
	color: white;
	svg {
		width: 20px;
		height: 20px;
	}
}

.info-label {
	font-size: 11px;
	color: rgba(255, 255, 255, 0.7);
	margin-bottom: 2px;
}

.info-value {
	font-size: 14px;
	font-weight: 700;
	color: #ffffff;
}

.status-active {
	color: #4ade80;
}

.info-divider {
	width: 1px;
	height: 30px;
	background: rgba(255, 255, 255, 0.15);
}

/* --- Settings Content --- */
.settings-content {
	position: relative;
	margin-top: -30px;
	background: #f7f9fc;
	border-radius: 30px 30px 0 0;
	padding: 24px 0;
}

.settings-group {
	margin-bottom: 24px;
}

.group-header {
	display: flex;
	align-items: center;
	padding: 0 24px;
	margin-bottom: 12px;
}

.header-bar {
	width: 4px;
	height: 16px;
	background: #2563eb;
	border-radius: 2px;
	margin-right: 10px;
}

.header-text {
	font-size: 16px;
	font-weight: 800;
	color: #1e293b;
}

.custom-group {
	margin: 0 !important;
	border-radius: 20px !important;
	overflow: hidden;
}

.item-icon {
	width: 40px;
	height: 40px;
	border-radius: 12px;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 14px;
	svg {
		width: 22px;
		height: 22px;
	}

	&.blue {
		background: #eff6ff;
		color: #2563eb;
	}
	&.green {
		background: #f0fdf4;
		color: #16a34a;
	}
	&.amber {
		background: #fffbeb;
		color: #d97706;
	}
	&.light-blue {
		background: #f0f9ff;
		color: #0ea5e9;
	}
	&.purple {
		background: #f5f3ff;
		color: #8b5cf6;
	}
	&.sky {
		background: #f0f9ff;
		color: #0ea5e9;
	}
	&.emerald {
		background: #ecfdf5;
		color: #10b981;
	}
	&.violet {
		background: #f5f3ff;
		color: #7c3aed;
	}
}

.item-title {
	font-size: 15px;
	font-weight: 600;
	color: #334155;
}

.item-label {
	font-size: 12px;
	color: #94a3b8;
	margin-top: 2px;
}

.value-text {
	font-size: 14px;
	color: #64748b;
	font-weight: 500;
	&.primary {
		color: #2563eb;
		font-weight: 600;
	}
}

.val-arrow {
	font-size: 14px;
	color: #cbd5e1;
	margin-left: 4px;
}

.logout-container {
	padding: 24px 20px;
}

.logout-btn-premium {
	height: 54px;
	background: #ffffff;
	border: 1px solid #f1f5f9;
	border-radius: 16px;
	color: #ef4444;
	font-size: 16px;
	font-weight: 700;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);

	&:active {
		background: #fef2f2;
		transform: scale(0.98);
	}
}

.logout-icon {
	width: 20px;
	height: 20px;
	margin-right: 8px;
}

.mt-4 {
	margin-top: 16px;
}
</style>
