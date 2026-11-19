<template>
	<div
		class="profile-page"
		:class="[`theme-${themeGender}`]"
		:data-theme-gender="themeGender"
		data-testid="mobile-profile-theme"
	>
		<!-- 01 · 加载态骨架屏（防止接口返回前闪现空输入框或误触保存） -->
		<template v-if="detailLoading">
			<section
				class="identity-card"
				data-testid="profile-detail-skeleton"
			>
				<div class="sk-identity-row">
					<div class="shimmer-bar sk-avatar"></div>
					<div class="sk-identity-info">
						<div class="shimmer-bar sk-w-110 sk-h-18"></div>
						<div class="shimmer-bar sk-w-80 sk-h-12 sk-mt-6"></div>
						<div class="sk-pill-row sk-mt-8">
							<div class="shimmer-bar sk-w-60 sk-h-18 sk-rounded-pill"></div>
							<div class="shimmer-bar sk-w-72 sk-h-18 sk-rounded-pill"></div>
						</div>
					</div>
				</div>
			</section>

			<section class="form-card sk-form-card">
				<div
					v-for="idx in 4"
					:key="`profile-sk-${idx}`"
					class="sk-field-row"
				>
					<div class="shimmer-bar sk-w-56 sk-h-14"></div>
					<div class="shimmer-bar sk-w-140 sk-h-14"></div>
				</div>
			</section>
		</template>

		<!-- 02 · 真实内容 -->
		<template v-else>
			<!-- 身份名片卡：承载只读身份信息（头像、用户名、组织、角色） -->
			<section class="identity-card">
				<div class="identity-main">
					<div class="avatar-wrap">
						<van-image
							v-if="hasValidAvatar"
							round
							width="64"
							height="64"
							fit="cover"
							:src="avatarUrl"
							class="avatar-preview"
							@error="avatarError = true"
						/>
						<div
							v-else
							class="avatar-fallback"
							data-testid="profile-avatar-fallback"
						>
							{{ avatarInitial }}
						</div>
					</div>
					<div class="identity-text">
						<div class="identity-name-row">
							<span class="identity-name">
								{{ formInfo.nickName || formInfo.username || '未设置昵称' }}
							</span>
							<span
								v-if="genderBadgeText"
								class="gender-theme-pill"
							>
								{{ genderBadgeText }}
							</span>
						</div>
						<div
							v-if="formInfo.username"
							class="identity-username"
						>
							@{{ formInfo.username }}
						</div>
						<div class="identity-pills">
							<span
								v-if="orgName"
								class="meta-pill meta-pill--slate"
							>
								{{ orgName }}
							</span>
							<span
								v-if="roleName"
								class="meta-pill meta-pill--indigo"
							>
								{{ roleName }}
							</span>
						</div>
					</div>
				</div>
			</section>

			<!-- 可编辑资料表单卡 -->
			<van-form
				class="profile-form"
				:rules="rulesRef"
				required="auto"
				@submit="onSubmit"
			>
				<div class="section-header">
					<span class="section-dot"></span>
					<span class="section-title">基本资料</span>
				</div>

				<section class="form-card">
					<van-field
						v-model="formInfo.nickName"
						name="nickName"
						label="昵称"
						placeholder="请输入昵称"
						clearable
						:rules="rulesRef.nickName"
						:maxlength="50"
						class="soft-field"
						data-testid="rbac-profile-nickname"
					/>

					<!-- 性别 Segmented 一键切换（同步联动登录页卜卜主题） -->
					<div class="gender-row">
						<span class="gender-label">性别</span>
						<div class="gender-segment">
							<button
								type="button"
								:class="['seg-btn', { active: formInfo.gender === '1' }]"
								data-testid="rbac-profile-gender-male"
								@click="formInfo.gender = '1'"
							>
								男
							</button>
							<button
								type="button"
								:class="['seg-btn', { active: formInfo.gender === '2' }]"
								data-testid="rbac-profile-gender-female"
								@click="formInfo.gender = '2'"
							>
								女
							</button>
						</div>
					</div>

					<van-field
						v-model="formInfo.mobile"
						name="mobile"
						label="手机号"
						type="tel"
						placeholder="请输入手机号"
						clearable
						:rules="rulesRef.mobile"
						:maxlength="11"
						class="soft-field"
						data-testid="rbac-profile-mobile"
					/>

					<van-field
						v-model="formInfo.email"
						name="email"
						label="邮箱"
						placeholder="请输入邮箱"
						clearable
						:maxlength="100"
						class="soft-field"
						data-testid="rbac-profile-email"
					/>

					<van-field
						v-model="formInfo.summary"
						name="summary"
						label="个人简介"
						placeholder="介绍一下自己"
						type="textarea"
						rows="2"
						autosize
						show-word-limit
						:maxlength="150"
						class="soft-field soft-field--textarea"
					/>
				</section>

				<div class="submit-bar">
					<van-button
						round
						block
						type="primary"
						native-type="submit"
						class="save-btn"
						:loading="submitting"
						loading-text="保存中..."
						data-testid="rbac-profile-save"
					>
						保存修改
					</van-button>
				</div>
			</van-form>
		</template>
	</div>
</template>

<script setup lang="ts">
import { showFailToast, showSuccessToast } from 'vant';
import { useNavBar } from '@/composables/useNavBar';
import type { NavBarConfig } from '@/composables/useNavBar';
import { useTabBar } from '@/composables/useTabBar';
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
useTabBar({ visible: false });

const userStore = useUserStore();

const rulesRef = reactive({
	nickName: [{ required: true, message: '请输入昵称' }],
	mobile: [{ pattern: /^$|^1[0-9]{10}$/, message: '手机号格式不正确' }],
});

const formInfo = ref<UserManagerData & { gender?: string }>({});
const detailLoading = ref<boolean>(true);
const submitting = ref<boolean>(false);
const avatarError = ref<boolean>(false);

const themeGender = computed<'male' | 'female' | 'neutral'>(() => {
	const g = String(formInfo.value.gender || (userStore.getUserInfo as { gender?: string } | null)?.gender || '').trim();
	if (g === '1') return 'male';
	if (g === '2') return 'female';
	return 'neutral';
});

const genderBadgeText = computed(() => {
	if (themeGender.value === 'male') return '蓝调卜卜';
	if (themeGender.value === 'female') return '甜心卜卜';
	return '';
});

const avatarUrl = computed(() => {
	const raw = formInfo.value.avatarUrl || formInfo.value.avatar || '';
	return typeof raw === 'string' ? raw.trim() : '';
});

watch(avatarUrl, () => {
	avatarError.value = false;
});

const hasValidAvatar = computed(() => Boolean(avatarUrl.value) && !avatarError.value);
const avatarInitial = computed(() => {
	const name = (formInfo.value.nickName || formInfo.value.username || '').trim();
	return name ? name.slice(0, 1).toUpperCase() : 'A';
});

const orgName = computed(() => userStore.getOrgInfo?.orgName || userStore.getOrgInfo?.orgAlias || '');
const roleName = computed(() => userStore.getRoleInfo?.roleName || '');

const syncSavedLoginProfile = (updated: UserManagerData & { gender?: string }) => {
	try {
		const key = 'alex_mobile_last_profile';
		const raw = localStorage.getItem(key);
		if (!raw) return;
		const parsed = JSON.parse(raw) as { username?: string; nickName?: string; gender?: string };
		if (parsed?.username && parsed.username === updated.username) {
			localStorage.setItem(
				key,
				JSON.stringify({
					...parsed,
					nickName: updated.nickName || parsed.nickName,
					gender: updated.gender ?? parsed.gender,
				}),
			);
		}
	} catch {
		// 忽略隐私模式限制
	}
};

const onSubmit = async () => {
	if (!formInfo.value.id) {
		showFailToast('缺少用户信息，无法保存');
		return;
	}
	submitting.value = true;
	try {
		const { code, data, message } = await editUserManager(formInfo.value);
		if (code === '200') {
			const merged = { ...userStore.getUserInfo, ...formInfo.value, ...(data || {}) };
			userStore.setUserInfo(merged);
			syncSavedLoginProfile(merged);
			showSuccessToast(message || '保存成功');
		} else {
			showFailToast(message || '保存失败，请稍后重试');
		}
	} finally {
		submitting.value = false;
	}
};

const init = async () => {
	const id = userStore.getUserInfo?.id;
	if (!id) {
		detailLoading.value = false;
		showFailToast('未获取到当前用户信息，请重新登录');
		return;
	}
	detailLoading.value = true;
	try {
		const { code, data, message } = await getUserManagerDetail(String(id));
		if (code === '200' && data) {
			formInfo.value = data;
		} else {
			showFailToast(message || '查询个人信息失败');
		}
	} finally {
		detailLoading.value = false;
	}
};

onMounted(() => {
	void init();
});
</script>

<style lang="less" scoped>
.profile-page {
	--accent-start: #4f6af6;
	--accent-end: #6366f1;
	--accent-color: #4f6af6;
	--accent-soft: rgba(79, 106, 246, 0.12);
	--accent-shadow: rgba(79, 106, 246, 0.34);
	--seg-track: #eef2f9;

	background: #f1f4fa;
	min-height: 100%;
	padding: 14px 16px 24px;
	box-sizing: border-box;
	transition: background 0.3s ease;

	&.theme-male {
		--accent-start: #3b82f6;
		--accent-end: #6366f1;
		--accent-color: #3b82f6;
		--accent-soft: rgba(59, 130, 246, 0.12);
		--accent-shadow: rgba(59, 130, 246, 0.34);
		--seg-track: #e0f2fe;
		background: linear-gradient(165deg, #e0f2fe 0%, #eff6ff 45%, #f8fafc 100%);
	}

	&.theme-female {
		--accent-start: #fb7185;
		--accent-end: #f43f5e;
		--accent-color: #f43f5e;
		--accent-soft: rgba(244, 63, 94, 0.12);
		--accent-shadow: rgba(244, 63, 94, 0.32);
		--seg-track: #ffe4e6;
		background: linear-gradient(165deg, #ffe4e6 0%, #fdf2f8 45%, #fff7ed 100%);
	}
}

/* ─── 01 · 身份名片卡 ─── */
.identity-card {
	background: #ffffff;
	border-radius: 18px;
	padding: 18px 16px;
	margin-bottom: 18px;
	box-shadow: 0 4px 16px rgba(15, 23, 42, 0.04);
}

.identity-main {
	display: flex;
	align-items: center;
	gap: 14px;
}

.avatar-wrap {
	width: 68px;
	height: 68px;
	border-radius: 9999px;
	padding: 2px;
	background: var(--accent-soft);
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}

.avatar-preview {
	display: block;
}

.avatar-fallback {
	width: 64px;
	height: 64px;
	border-radius: 9999px;
	background: linear-gradient(135deg, var(--accent-start) 0%, var(--accent-end) 100%);
	color: #ffffff;
	font-size: 24px;
	font-weight: 800;
	display: flex;
	align-items: center;
	justify-content: center;
}

.identity-text {
	min-width: 0;
	flex: 1;
}

.identity-name-row {
	display: flex;
	align-items: center;
	gap: 7px;
}

.identity-name {
	font-size: 18px;
	font-weight: 800;
	color: #0f172a;
	line-height: 1.25;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.gender-theme-pill {
	font-size: 10px;
	font-weight: 700;
	padding: 2px 8px;
	border-radius: 9999px;
	background: var(--accent-soft);
	color: var(--accent-color);
	white-space: nowrap;
	flex-shrink: 0;
}

.identity-username {
	font-size: 12px;
	color: #94a3b8;
	margin-top: 2px;
	font-variant-numeric: tabular-nums;
}

.identity-pills {
	display: flex;
	align-items: center;
	gap: 6px;
	flex-wrap: wrap;
	margin-top: 8px;
}

.meta-pill {
	font-size: 11px;
	font-weight: 600;
	padding: 2px 9px;
	border-radius: 9999px;

	&--indigo {
		background: var(--accent-soft);
		color: var(--accent-color);
	}

	&--slate {
		background: #f1f5f9;
		color: #64748b;
	}
}

/* ─── 02 · 资料编辑表单卡 ─── */
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
	background: var(--accent-color);
}

.section-title {
	font-size: 14px;
	font-weight: 700;
	color: #0f172a;
}

.form-card {
	background: #ffffff;
	border-radius: 18px;
	overflow: hidden;
	box-shadow: 0 4px 16px rgba(15, 23, 42, 0.04);
}

.soft-field {
	padding: 14px 16px;
	background: #ffffff;

	&:not(:last-child)::after {
		left: 16px;
		right: 16px;
		border-bottom-color: #f1f5f9;
	}

	:deep(.van-field__label) {
		width: 72px;
		font-size: 14px;
		font-weight: 600;
		color: #334155;
	}

	:deep(.van-field__control) {
		font-size: 14px;
		color: #0f172a;
	}
}

.gender-row {
	position: relative;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 12px 16px;
	background: #ffffff;

	&::after {
		content: '';
		position: absolute;
		left: 16px;
		right: 16px;
		bottom: 0;
		border-bottom: 1px solid #f1f5f9;
	}

	.gender-label {
		font-size: 14px;
		font-weight: 600;
		color: #334155;
	}

	.gender-segment {
		display: inline-flex;
		align-items: center;
		background: var(--seg-track);
		padding: 3px;
		border-radius: 10px;
		gap: 3px;

		.seg-btn {
			border: none;
			background: transparent;
			color: #64748b;
			font-size: 12px;
			font-weight: 600;
			padding: 4px 16px;
			border-radius: 8px;
			cursor: pointer;
			transition: all 0.15s ease;

			&.active {
				background: #ffffff;
				color: var(--accent-color);
				box-shadow: 0 1px 4px var(--accent-soft);
			}
		}
	}
}

.submit-bar {
	margin-top: 20px;

	.save-btn {
		height: 48px;
		border-radius: 16px !important;
		border: none !important;
		font-size: 15px;
		font-weight: 700;
		color: #ffffff !important;
		background: linear-gradient(135deg, var(--accent-start) 0%, var(--accent-end) 100%) !important;
		box-shadow: 0 8px 20px -4px var(--accent-shadow);

		&:active {
			transform: scale(0.985);
		}
	}
}

/* ─── 骨架屏 ─── */
.sk-identity-row {
	display: flex;
	align-items: center;
	gap: 14px;
}

.sk-avatar {
	width: 68px;
	height: 68px;
	border-radius: 9999px;
	flex-shrink: 0;
}

.sk-identity-info {
	display: flex;
	flex-direction: column;
}

.sk-pill-row {
	display: flex;
	gap: 8px;
}

.sk-form-card {
	padding: 8px 16px;
}

.sk-field-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 14px 0;

	&:not(:last-child) {
		border-bottom: 1px solid #f1f5f9;
	}
}

.shimmer-bar {
	border-radius: 6px;
	background: #e2e8f0;
	animation: profilePulse 1.4s ease-in-out infinite;
}

.sk-w-56 {
	width: 56px;
}
.sk-w-60 {
	width: 60px;
}
.sk-w-72 {
	width: 72px;
}
.sk-w-80 {
	width: 80px;
}
.sk-w-110 {
	width: 110px;
}
.sk-w-140 {
	width: 140px;
}
.sk-h-12 {
	height: 12px;
}
.sk-h-14 {
	height: 14px;
}
.sk-h-18 {
	height: 18px;
}
.sk-mt-6 {
	margin-top: 6px;
}
.sk-mt-8 {
	margin-top: 8px;
}
.sk-rounded-pill {
	border-radius: 9999px;
}

@keyframes profilePulse {
	0%,
	100% {
		opacity: 1;
	}
	50% {
		opacity: 0.45;
	}
}
</style>
