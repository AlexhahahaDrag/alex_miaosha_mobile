<template>
	<div class="user-page-container">
		<!-- 01 · 个人名片 Indigo Soft UI 卡片 -->
		<section class="profile-card">
			<!-- 加载骨架屏 -->
			<div
				v-if="loading"
				class="profile-skeleton"
				data-testid="user-profile-skeleton"
			>
				<div class="sk-top-row">
					<div class="shimmer-white sk-avatar"></div>
					<div class="sk-text-col">
						<div class="shimmer-white sk-w-120 sk-h-20"></div>
						<div class="shimmer-white sk-w-88 sk-h-12 sk-mt-8"></div>
					</div>
				</div>
				<div class="sk-meta-bar shimmer-white"></div>
			</div>

			<!-- 真实用户信息 -->
			<template v-else>
				<div class="user-main">
					<div class="avatar-box">
						<van-image
							v-if="hasValidAvatar"
							round
							width="60"
							height="60"
							fit="cover"
							:src="avatarUrl"
							class="avatar-img"
							@error="avatarError = true"
						/>
						<div
							v-else
							class="avatar-fallback"
							data-testid="user-avatar-fallback"
						>
							{{ avatarInitial }}
						</div>
					</div>
					<div class="user-text">
						<div class="name-row">
							<span
								class="username"
								data-testid="rbac-user-name"
							>{{ displayName }}</span>
							<span
								v-if="roleName"
								class="role-pill"
							>
								{{ roleName }}
							</span>
						</div>
						<div class="user-sub">{{ userSubtitle }}</div>
					</div>
				</div>

				<div class="quick-meta-row">
					<div class="meta-item">
						<span class="meta-label">所属组织</span>
						<span class="meta-value">{{ orgName || '未分配' }}</span>
					</div>
					<div class="meta-divider"></div>
					<div class="meta-item">
						<span class="meta-label">账号状态</span>
						<span class="meta-value meta-value--active">正常</span>
					</div>
				</div>
			</template>
		</section>

		<!-- 02 · 常用设置 -->
		<section class="settings-section">
			<div class="section-header">
				<span class="section-dot section-dot--indigo"></span>
				<span class="section-title">常用设置</span>
			</div>
			<div class="settings-card">
				<van-cell
					is-link
					to="/myself/info"
					center
					class="soft-cell"
					data-testid="rbac-user-entry-profile"
					@click="handleInteraction"
				>
					<template #icon>
						<div class="item-icon item-icon--indigo">
							<svg-icon name="user" />
						</div>
					</template>
					<template #title>
						<span class="item-title">个人信息</span>
					</template>
				</van-cell>

				<van-cell
					is-link
					center
					class="soft-cell"
					data-testid="rbac-user-btn-theme"
					@click="openTheme"
				>
					<template #icon>
						<div class="item-icon item-icon--theme">
							<svg-icon name="palette" />
						</div>
					</template>
					<template #title>
						<span class="item-title">主题设置</span>
					</template>
					<template #value>
						<span class="theme-value-wrap">
							<span class="theme-status-dot"></span>
							<span class="cell-value">{{ themeStore.activeThemeStatusText }}</span>
						</span>
					</template>
				</van-cell>

				<van-cell
					v-if="canManageMenu"
					is-link
					to="/user/menuInfo"
					center
					class="soft-cell"
					data-testid="rbac-user-entry-menu"
					@click="handleInteraction"
				>
					<template #icon>
						<div class="item-icon item-icon--indigo">
							<van-icon name="apps-o" />
						</div>
					</template>
					<template #title>
						<span class="item-title">个人菜单管理</span>
					</template>
				</van-cell>

				<van-cell
					is-link
					center
					class="soft-cell"
					data-testid="rbac-user-entry-notice-config"
					@click="openNoticeConfig"
				>
					<template #icon>
						<div class="item-icon item-icon--sky">
							<van-icon name="bell" />
						</div>
					</template>
					<template #title>
						<span class="item-title">消息提醒偏好</span>
					</template>
					<template #value>
						<span class="cell-value">站内信/微信</span>
					</template>
				</van-cell>
			</div>
		</section>

		<!-- 03 · 其他 -->
		<section class="settings-section">
			<div class="section-header">
				<span class="section-dot section-dot--slate"></span>
				<span class="section-title">其他</span>
			</div>
			<div class="settings-card">
				<van-cell
					center
					class="soft-cell"
				>
					<template #icon>
						<div class="item-icon item-icon--slate">
							<svg-icon name="shopStockBatch" />
						</div>
					</template>
					<template #title>
						<span class="item-title">版本信息</span>
					</template>
					<template #value>
						<span class="cell-value cell-value--mono">v1.2.0</span>
					</template>
				</van-cell>
			</div>
		</section>

		<!-- 04 · 退出当前账号 -->
		<div class="logout-container">
			<van-button
				block
				class="logout-btn"
				data-testid="rbac-user-btn-logout"
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

		<logout
			:visible="showLogoutFlag"
			@select="logoutInfo"
		/>

		<theme-popup v-model:show="showThemePopup" />
		<user-notice-config-popup v-model="showNoticeConfigPopup" />
	</div>
</template>

<script lang="ts" setup>
import logout from '@/views/user/logout/index.vue';
import ThemePopup from '@/views/user/components/ThemePopup.vue';
import UserNoticeConfigPopup from '@/views/message/components/UserNoticeConfigPopup.vue';
import type { UserManagerData } from '@/views/user/userManager/config';
import { useUserStore } from '@/store/modules/user/user';
import { useThemeStore } from '@/store/modules/theme';
import { usePermission } from '@/composables/usePermission';
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
const themeStore = useThemeStore();
const { hasPermission, isSuperAdmin } = usePermission();

const canManageMenu = computed(() => isSuperAdmin.value || hasPermission('user:menuInfo'));

onMounted(() => {
	if (userStore.getUserInfo) {
		themeStore.syncUserTheme(
			userStore.getUserInfo as { id?: string | number; username?: string; gender?: string | number | null },
		);
	}
});
const loading = computed(() => !userStore.getUserInfo);
const userInfo = computed<UserManagerData>(() => userStore.getUserInfo || {});

const displayName = computed(() => userInfo.value?.nickName || userInfo.value?.username || '未登录');
const avatarError = ref<boolean>(false);
const avatarUrl = computed(() => {
	const raw = userInfo.value?.avatarUrl || userInfo.value?.avatar || '';
	return typeof raw === 'string' ? raw.trim() : '';
});

watch(avatarUrl, () => {
	avatarError.value = false;
});

const hasValidAvatar = computed(() => Boolean(avatarUrl.value) && !avatarError.value);
const avatarInitial = computed(() => {
	const name = displayName.value.trim();
	return name ? name.slice(0, 1).toUpperCase() : 'A';
});

const roleName = computed(() => userStore.getRoleInfo?.roleName || '');
const orgName = computed(() => userStore.getOrgInfo?.orgName || userStore.getOrgInfo?.orgAlias || '');

const userSubtitle = computed(() => {
	const summary = typeof userInfo.value?.summary === 'string' ? userInfo.value.summary.trim() : '';
	if (summary) return summary;
	const uname = userInfo.value?.username || '';
	return uname ? `@${uname}` : 'Alex 账号';
});

const showLogoutFlag = ref<boolean>(false);
const showLogout = () => {
	handleInteraction();
	showLogoutFlag.value = true;
};
const logoutInfo = (v: boolean) => {
	showLogoutFlag.value = v;
};

const showThemePopup = ref<boolean>(false);
const showNoticeConfigPopup = ref<boolean>(false);

const openTheme = () => {
	handleInteraction();
	showThemePopup.value = true;
};
const openNoticeConfig = () => {
	handleInteraction();
	showNoticeConfigPopup.value = true;
};

const handleInteraction = () => {
	if (navigator.vibrate) {
		navigator.vibrate(40);
	}
};
</script>

<style lang="less" scoped>
.user-page-container {
	background-color: #f1f4fa;
	min-height: 100%;
	padding: 14px 16px 24px;
	box-sizing: border-box;
}

/* ─── 01 · 个人名片卡 ─── */
.profile-card {
	background: var(--theme-hero-gradient, linear-gradient(135deg, #4f6af6 0%, #6366f1 58%, #4f46e5 100%));
	border-radius: 20px;
	padding: 20px 18px 16px;
	color: #ffffff;
	box-shadow: 0 12px 28px -6px var(--theme-shadow-color, rgba(79, 106, 246, 0.32));
	margin-bottom: 18px;
	transition:
		background 0.3s ease,
		box-shadow 0.3s ease;
}

.user-main {
	display: flex;
	align-items: center;
	gap: 14px;
	margin-bottom: 16px;
}

.avatar-box {
	width: 64px;
	height: 64px;
	padding: 2px;
	border-radius: 9999px;
	background: rgba(255, 255, 255, 0.24);
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}

.avatar-img {
	display: block;
}

.avatar-fallback {
	width: 60px;
	height: 60px;
	border-radius: 9999px;
	background: rgba(255, 255, 255, 0.22);
	border: 1.5px solid rgba(255, 255, 255, 0.55);
	color: #ffffff;
	font-size: 24px;
	font-weight: 800;
	display: flex;
	align-items: center;
	justify-content: center;
}

.user-text {
	min-width: 0;
	flex: 1;
}

.name-row {
	display: flex;
	align-items: center;
	gap: 8px;
	flex-wrap: wrap;
	margin-bottom: 4px;
}

.username {
	font-size: 21px;
	font-weight: 800;
	color: #ffffff;
	line-height: 1.2;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.role-pill {
	display: inline-flex;
	align-items: center;
	padding: 2px 9px;
	border-radius: 9999px;
	background: rgba(255, 255, 255, 0.2);
	color: #ffffff;
	font-size: 11px;
	font-weight: 600;
	white-space: nowrap;
}

.user-sub {
	font-size: 12px;
	color: rgba(255, 255, 255, 0.8);
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.quick-meta-row {
	display: flex;
	align-items: center;
	background: rgba(255, 255, 255, 0.14);
	border-radius: 14px;
	padding: 11px 14px;
}

.meta-item {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 2px;
	min-width: 0;
}

.meta-label {
	font-size: 11px;
	color: rgba(255, 255, 255, 0.72);
}

.meta-value {
	font-size: 14px;
	font-weight: 700;
	color: #ffffff;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;

	&--active {
		color: #6ee7b7;
	}
}

.meta-divider {
	width: 1px;
	height: 24px;
	background: rgba(255, 255, 255, 0.18);
	margin: 0 14px;
	flex-shrink: 0;
}

/* ─── 02 & 03 · 设置分组卡片 ─── */
.settings-section {
	margin-bottom: 16px;
}

.section-header {
	display: flex;
	align-items: center;
	gap: 7px;
	margin: 0 2px 10px;
}

.section-dot {
	width: 7px;
	height: 7px;
	border-radius: 9999px;

	&--indigo {
		background: var(--primary-color, #4f6af6);
	}

	&--slate {
		background: #94a3b8;
	}
}

.section-title {
	font-size: 14px;
	font-weight: 700;
	color: #0f172a;
}

.settings-card {
	background: #ffffff;
	border-radius: 18px;
	overflow: hidden;
	box-shadow: 0 4px 16px rgba(15, 23, 42, 0.04);
}

.soft-cell {
	padding: 14px 16px;
	background: #ffffff;

	&:not(:last-child)::after {
		left: 64px;
		right: 16px;
		border-bottom-color: #f1f5f9;
	}
}

.item-icon {
	width: 36px;
	height: 36px;
	border-radius: 11px;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 12px;
	font-size: 18px;
	flex-shrink: 0;

	svg {
		width: 19px;
		height: 19px;
	}

	&--indigo,
	&--theme {
		background: var(--theme-soft-bg, rgba(79, 106, 246, 0.12));
		color: var(--primary-color, #4f6af6);
	}

	&--amber {
		background: rgba(245, 158, 11, 0.12);
		color: #d97706;
	}

	&--sky {
		background: rgba(14, 165, 233, 0.12);
		color: #0284c7;
	}

	&--slate {
		background: #f1f5f9;
		color: #64748b;
	}
}

.item-title {
	font-size: 14px;
	font-weight: 600;
	color: #0f172a;
}

.theme-value-wrap {
	display: inline-flex;
	align-items: center;
	gap: 6px;
}

.theme-status-dot {
	width: 8px;
	height: 8px;
	border-radius: 50%;
	background: var(--primary-color, #4f6af6);
	box-shadow: 0 0 0 2px var(--theme-soft-bg, rgba(79, 106, 246, 0.12));
}

.cell-value {
	font-size: 12px;
	color: #94a3b8;
	font-weight: 500;

	&--mono {
		font-variant-numeric: tabular-nums;
	}
}

/* ─── 04 · 退出按钮 ─── */
.logout-container {
	margin-top: 20px;
}

.logout-btn {
	height: 48px;
	background: rgba(244, 63, 94, 0.08);
	border: none;
	border-radius: 16px;
	color: #e11d48;
	font-size: 14px;
	font-weight: 700;
	transition:
		transform 0.15s ease,
		background-color 0.15s ease;

	&:active {
		transform: scale(0.985);
		background: rgba(244, 63, 94, 0.14);
	}
}

.logout-icon {
	width: 18px;
	height: 18px;
	margin-right: 6px;
}

/* ─── 骨架屏 ─── */
.profile-skeleton {
	.sk-top-row {
		display: flex;
		align-items: center;
		gap: 14px;
		margin-bottom: 16px;
	}

	.sk-avatar {
		width: 64px;
		height: 64px;
		border-radius: 9999px;
		flex-shrink: 0;
	}

	.sk-text-col {
		display: flex;
		flex-direction: column;
	}

	.sk-meta-bar {
		width: 100%;
		height: 54px;
		border-radius: 14px;
	}
}

.shimmer-white {
	background: rgba(255, 255, 255, 0.24);
	border-radius: 8px;
	animation: userPulse 1.4s ease-in-out infinite;
}

.sk-w-88 {
	width: 88px;
}
.sk-w-120 {
	width: 120px;
}
.sk-h-12 {
	height: 12px;
}
.sk-h-20 {
	height: 20px;
}
.sk-mt-8 {
	margin-top: 8px;
}

@keyframes userPulse {
	0%,
	100% {
		opacity: 1;
	}
	50% {
		opacity: 0.45;
	}
}
</style>
