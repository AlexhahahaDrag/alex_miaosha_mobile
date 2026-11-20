<template>
	<div
		class="login-container"
		:class="[`theme-${themeGender}`]"
		:data-theme-gender="themeGender"
		data-testid="mobile-login-theme"
	>
		<!-- 可爱风背景云朵 / 泡泡氛围层 -->
		<div
			class="cute-backdrop"
			aria-hidden="true"
		>
			<div class="float-bubble float-bubble--1"></div>
			<div class="float-bubble float-bubble--2"></div>
			<div class="float-bubble float-bubble--3"></div>
		</div>

		<!-- 顶部品牌栏 -->
		<header class="brand-bar">
			<div class="brand-left">
				<div class="logo-box">
					<img
						src="/logo.svg"
						alt="logo"
						class="logo-icon"
					/>
				</div>
				<span class="brand-name">Alex 管理平台</span>
			</div>
			<span class="date-pill">{{ todayText }}</span>
		</header>

		<!-- 中部：Q版萌宠交互舞台 + 软萌圆角登录卡 -->
		<main class="login-stage">
			<!-- 趴在卡片顶部的 Q 版小萝卜（卜卜）SVG（支持密码捂眼 / 明文偷看 + 性别专属配饰） -->
			<div
				class="mascot-stage"
				:class="{
					'is-covering': isPasswordFocused && !showPassword,
					'is-peeking': isPasswordFocused && showPassword,
				}"
				aria-hidden="true"
			>
				<svg
					class="mascot-svg"
					viewBox="0 0 160 132"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<defs>
						<radialGradient
							id="carrotBodyGrad"
							cx="45%"
							cy="35%"
							r="65%"
						>
							<stop
								offset="0%"
								stop-color="#FB923C"
							/>
							<stop
								offset="58%"
								stop-color="#F97316"
							/>
							<stop
								offset="100%"
								stop-color="#EA580C"
							/>
						</radialGradient>
						<linearGradient
							id="leafGradLeft"
							x1="0"
							y1="0"
							x2="1"
							y2="1"
						>
							<stop
								offset="0%"
								stop-color="#A3E635"
							/>
							<stop
								offset="100%"
								stop-color="#65A30D"
							/>
						</linearGradient>
						<linearGradient
							id="leafGradCenter"
							x1="0"
							y1="0"
							x2="0"
							y2="1"
						>
							<stop
								offset="0%"
								stop-color="#BEF264"
							/>
							<stop
								offset="100%"
								stop-color="#65A30D"
							/>
						</linearGradient>
					</defs>

					<!-- 顶部三片波浪嫩绿萝卜叶 -->
					<g class="carrot-leaves">
						<!-- 左叶 -->
						<path
							d="M74 42 C 66 31, 51 28, 48 18 C 46 11, 54 6, 61 10 C 68 14, 71 27, 77 40 Z"
							fill="url(#leafGradLeft)"
						/>
						<path
							d="M55 15 Q 64 25 74 38"
							stroke="#4D7C0F"
							stroke-width="1.6"
							stroke-linecap="round"
							stroke-opacity="0.55"
						/>
						<!-- 右叶 -->
						<path
							d="M86 42 C 94 31, 109 28, 112 18 C 114 11, 106 6, 99 10 C 92 14, 89 27, 83 40 Z"
							fill="url(#leafGradLeft)"
						/>
						<path
							d="M105 15 Q 96 25 86 38"
							stroke="#4D7C0F"
							stroke-width="1.6"
							stroke-linecap="round"
							stroke-opacity="0.55"
						/>
						<!-- 中叶（最高） -->
						<path
							d="M78 40 C 73 25, 68 12, 74 5 C 79 0, 86 2, 88 9 C 90 17, 84 28, 82 40 Z"
							fill="url(#leafGradCenter)"
						/>
						<path
							d="M80 9 Q 81 22 80 37"
							stroke="#4D7C0F"
							stroke-width="1.6"
							stroke-linecap="round"
							stroke-opacity="0.55"
						/>
					</g>

					<!-- 萝卜圆滚滚橙色身体（上窄下圆梨形） -->
					<path
						d="M80 37 C 102 37, 126 62, 126 92 C 126 114, 108 126, 80 126 C 52 126, 34 114, 34 92 C 34 62, 58 37, 80 37 Z"
						fill="url(#carrotBodyGrad)"
					/>
					<!-- 额头柔和高光 -->
					<ellipse
						cx="64"
						cy="56"
						rx="12"
						ry="6"
						transform="rotate(-24 64 56)"
						fill="#FFFFFF"
						fill-opacity="0.18"
					/>

					<!-- 女生专属：小花发卡 + 粉嫩腮红（颜色联动全局 --theme-mascot-* 变量） -->
					<g v-if="themeGender === 'female'">
						<ellipse
							cx="48"
							cy="86"
							rx="8"
							ry="4.5"
							fill="var(--theme-mascot-accent, #FDA4AF)"
							fill-opacity="0.55"
						/>
						<ellipse
							cx="112"
							cy="86"
							rx="8"
							ry="4.5"
							fill="var(--theme-mascot-accent, #FDA4AF)"
							fill-opacity="0.55"
						/>
						<!-- 蝴蝶结发卡在右耳/叶侧 -->
						<g transform="translate(103, 46) rotate(16)">
							<path
								d="M0 0 L-8 -5 L-8 5 Z"
								fill="var(--theme-mascot-accent, #FB7185)"
							/>
							<path
								d="M0 0 L8 -5 L8 5 Z"
								fill="var(--theme-mascot-accent, #FB7185)"
							/>
							<circle
								cx="0"
								cy="0"
								r="3"
								fill="var(--theme-mascot-light, #FFE4E6)"
							/>
						</g>
					</g>

					<!-- 男生或自定义专属：小领结（颜色联动全局 --theme-mascot-* 变量） -->
					<g
						v-else-if="themeGender === 'male' || isCustomLoginTheme"
						transform="translate(80, 114)"
					>
						<path
							d="M0 0 L-11 -6 L-11 6 Z"
							fill="var(--theme-mascot-accent, #3B82F6)"
						/>
						<path
							d="M0 0 L11 -6 L11 6 Z"
							fill="var(--theme-mascot-accent, #3B82F6)"
						/>
						<circle
							cx="0"
							cy="0"
							r="3.8"
							fill="var(--theme-mascot-light, #DBEAFE)"
						/>
					</g>

					<!-- 标志性大白椭圆眼眶 + 亮蓝瞳孔 -->
					<g class="carrot-eyes">
						<!-- 左眼 -->
						<ellipse
							cx="69"
							cy="72"
							rx="9.5"
							ry="13"
							fill="#FFFFFF"
						/>
						<ellipse
							cx="70"
							cy="73"
							rx="5.4"
							ry="8.6"
							fill="#0284C7"
						/>
						<circle
							cx="68.5"
							cy="69"
							r="2.1"
							fill="#FFFFFF"
						/>
						<!-- 右眼 -->
						<ellipse
							cx="91"
							cy="72"
							rx="9.5"
							ry="13"
							fill="#FFFFFF"
						/>
						<ellipse
							cx="90"
							cy="73"
							rx="5.4"
							ry="8.6"
							fill="#0284C7"
						/>
						<circle
							cx="88.5"
							cy="69"
							r="2.1"
							fill="#FFFFFF"
						/>
					</g>

					<!-- 标志性波浪 w 小黑嘴 -->
					<path
						d="M68 91 C 70 97, 77 97, 80 91 C 83 97, 90 97, 92 91"
						stroke="#111827"
						stroke-width="3.4"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>

					<!-- 互动橙色小短手（聚焦密码时抬起捂眼） -->
					<g class="paw paw--left">
						<ellipse
							cx="39"
							cy="113"
							rx="12.5"
							ry="10"
							fill="#FB923C"
							stroke="#FFFFFF"
							stroke-width="2.2"
						/>
					</g>
					<g class="paw paw--right">
						<ellipse
							cx="121"
							cy="113"
							rx="12.5"
							ry="10"
							fill="#FB923C"
							stroke="#FFFFFF"
							stroke-width="2.2"
						/>
					</g>
				</svg>
			</div>

			<!-- 糖果圆角主卡片 -->
			<section class="cute-card">
				<div
					v-if="isRememberedMode"
					class="remembered-hero"
					data-testid="mobile-login-remembered"
				>
					<div class="avatar-badge">
						<span class="avatar-letter">{{ avatarInitial }}</span>
					</div>
					<div class="hero-copy">
						<div class="hero-tag-row">
							<h1 class="hero-title">{{ timeGreeting }}，{{ displayRememberedName }}</h1>
							<span class="gender-pill">{{ genderThemeLabel }}</span>
						</div>
						<p class="hero-sub">输入密码继续进入个人空间</p>
					</div>
				</div>

				<div
					v-else
					class="standard-hero"
				>
					<h1 class="hero-title">{{ timeGreeting }}，欢迎回家</h1>
					<p class="hero-sub">使用您的 Alex 账号登录管理中心</p>
				</div>

				<van-form
					class="login-form"
					@submit="onSubmit"
				>
					<div class="form-fields">
						<div
							v-if="!isRememberedMode"
							class="field-group"
						>
							<label
								for="login-username"
								class="field-label"
							>
								用户名
							</label>
							<van-field
								id="login-username"
								v-model="loginForm.username"
								name="username"
								data-testid="mobile-login-username"
								placeholder="请输入用户名"
								left-icon="manager"
								clearable
								autocomplete="username"
								class="soft-field"
								:rules="[{ required: true, message: '请输入用户名' }]"
							/>
						</div>

						<div class="field-group">
							<label
								for="login-password"
								class="field-label"
							>
								密码
							</label>
							<van-field
								id="login-password"
								v-model="loginForm.password"
								:type="showPassword ? 'text' : 'password'"
								name="password"
								data-testid="mobile-login-password"
								placeholder="请输入密码"
								left-icon="lock"
								:right-icon="showPassword ? 'eye-o' : 'closed-eye'"
								class="soft-field"
								autocomplete="current-password"
								:rules="[{ required: true, message: '请输入密码' }]"
								@focus="isPasswordFocused = true"
								@blur="isPasswordFocused = false"
								@click-right-icon="showPassword = !showPassword"
							/>
						</div>
					</div>

					<div class="form-options">
						<van-checkbox
							v-model="rememberAccount"
							icon-size="16px"
							:checked-color="themeAccentColor"
							class="remember-checkbox"
						>
							记住登录账号
						</van-checkbox>
						<button
							v-if="isRememberedMode"
							type="button"
							class="switch-account-link"
							data-testid="mobile-login-switch-account"
							@click="handleSwitchAccount"
						>
							切换账号
						</button>
					</div>

					<div class="form-action">
						<van-button
							round
							block
							type="primary"
							native-type="submit"
							data-testid="mobile-login-submit"
							class="login-btn"
							:loading="submitLoading"
							loading-type="circular"
							loading-size="18px"
							loading-text="登录中..."
						>
							<span>登录</span>
							<van-icon
								v-if="!submitLoading"
								name="arrow"
								class="btn-arrow"
							/>
						</van-button>
					</div>
				</van-form>
			</section>
		</main>

		<footer class="login-footer">
			<p class="copyright">© 2026 Alex</p>
		</footer>
	</div>
</template>

<script setup lang="ts">
import { showFailToast, showSuccessToast } from 'vant';
import type { LoginForm } from '@/views/login/config';
import type { LoginParams } from '@/views/login/api';
import { useUserStore } from '@/store/modules/user/user';
import { useThemeStore, type ThemeMode } from '@/store/modules/theme';
import { useNavBar } from '@/composables/useNavBar';
import { formatDate } from '@/utils/dayjs';
import { decrypt, encrypt } from '@/utils/crypto';

const router = useRouter();
const userStore = useUserStore();
const themeStore = useThemeStore();
useNavBar({ visible: false });

const LAST_PROFILE_KEY = 'alex_mobile_last_profile';
const LAST_USERNAME_KEY = 'alex_mobile_last_username';

type GenderTheme = 'male' | 'female' | 'neutral';

interface SavedUserProfile {
	username: string;
	nickName?: string;
	gender?: string;
	password?: string;
	themeMode?: ThemeMode;
	customColor?: string;
}

const encodeSavedPassword = (raw?: string): string => {
	if (!raw) return '';
	try {
		return encrypt({ v: raw });
	} catch {
		return raw;
	}
};

const decodeSavedPassword = (stored?: string): string => {
	if (!stored) return '';
	try {
		const res = decrypt(stored) as { v?: string } | string | number | null;
		if (res && typeof res === 'object' && typeof res.v === 'string') {
			return res.v;
		}
		if (typeof res === 'string' || typeof res === 'number') {
			return String(res);
		}
		return stored;
	} catch {
		return stored;
	}
};

const resolveGenderTheme = (gender?: string): GenderTheme => {
	const g = String(gender || '').trim();
	if (g === '1') return 'male';
	if (g === '2') return 'female';
	return 'neutral';
};

const readSavedProfile = (): SavedUserProfile | null => {
	try {
		const raw = localStorage.getItem(LAST_PROFILE_KEY);
		if (raw) {
			const parsed = JSON.parse(raw) as SavedUserProfile;
			if (parsed?.username) {
				return {
					...parsed,
					password: decodeSavedPassword(parsed.password),
				};
			}
		}
		const legacyName = localStorage.getItem(LAST_USERNAME_KEY)?.trim();
		if (legacyName) {
			return { username: legacyName };
		}
		return null;
	} catch {
		return null;
	}
};

const saveLastProfile = (profile: SavedUserProfile) => {
	try {
		const username = profile.username.trim();
		if (!username) return;
		localStorage.setItem(LAST_USERNAME_KEY, username);
		localStorage.setItem(
			LAST_PROFILE_KEY,
			JSON.stringify({
				username,
				nickName: profile.nickName || username,
				gender: profile.gender || '',
				themeMode: profile.themeMode || themeStore.themeMode,
				customColor: profile.customColor ?? (themeStore.themeMode === 'custom' ? themeStore.primaryColor : ''),
				password: encodeSavedPassword(profile.password),
			}),
		);
	} catch {
		// 忽略隐私模式存储限制
	}
};

const clearSavedProfile = () => {
	try {
		localStorage.removeItem(LAST_USERNAME_KEY);
		localStorage.removeItem(LAST_PROFILE_KEY);
	} catch {
		// 忽略隐私模式存储限制
	}
};

const savedProfile = ref<SavedUserProfile | null>(readSavedProfile());
const forceSwitchAccount = ref<boolean>(false);
const rememberAccount = ref<boolean>(true);
const isPasswordFocused = ref<boolean>(false);

const rememberedUsername = computed(() => savedProfile.value?.username || '');
const rememberedPassword = computed(() => savedProfile.value?.password || '');
const displayRememberedName = computed(() => savedProfile.value?.nickName || savedProfile.value?.username || '');

const isRememberedMode = computed(() => Boolean(rememberedUsername.value) && !forceSwitchAccount.value);

const loginForm = ref<LoginForm>({
	username: rememberedUsername.value || '',
	password: rememberedPassword.value || '',
});
const submitLoading = ref<boolean>(false);
const showPassword = ref<boolean>(false);

// 当前登录页正在匹配的目标用户名（记住模式取 rememberedUsername，普通模式取已输入的 username）
const activeTargetUsername = computed(() =>
	isRememberedMode.value ? rememberedUsername.value : loginForm.value.username.trim(),
);

// 实时解析登录页主题状态（个人自定义主题优先 -> 性别默认主题次之 -> 元气橙兜底）
const loginThemeState = computed(() => {
	const uname = activeTargetUsername.value;
	const isMatchedSaved = Boolean(uname && savedProfile.value?.username === uname);
	return themeStore.applyLoginPageTheme({
		username: uname,
		gender: isMatchedSaved ? savedProfile.value?.gender : undefined,
		themeMode: isMatchedSaved ? savedProfile.value?.themeMode : undefined,
		customColor: isMatchedSaved ? savedProfile.value?.customColor : undefined,
		isRemembered: isRememberedMode.value,
	});
});

const themeGender = computed<GenderTheme>(() => resolveGenderTheme(loginThemeState.value.gender));
const isCustomLoginTheme = computed(() => loginThemeState.value.mode === 'custom');
const genderThemeLabel = computed(() => loginThemeState.value.badgeText);
const themeAccentColor = computed(() => loginThemeState.value.color);

const avatarInitial = computed(() => {
	const name = displayRememberedName.value.trim();
	return name ? name.slice(0, 1).toUpperCase() : 'A';
});

const handleSwitchAccount = () => {
	forceSwitchAccount.value = true;
	loginForm.value.username = '';
	loginForm.value.password = '';
};

const todayText = computed(() => formatDate(new Date(), 'MM月DD日'));
const timeGreeting = computed(() => {
	const hour = new Date().getHours();
	if (hour < 6) return '凌晨好';
	if (hour < 12) return '早上好';
	if (hour < 14) return '中午好';
	if (hour < 19) return '下午好';
	return '晚上好';
});

const onSubmit = async () => {
	if (submitLoading.value) return;

	if (navigator.vibrate) {
		navigator.vibrate(50);
	}

	const activeUsername = isRememberedMode.value ? rememberedUsername.value : loginForm.value.username.trim();

	submitLoading.value = true;
	try {
		const param: LoginParams = {
			type: 'account',
			username: activeUsername,
			password: loginForm.value.password,
			isRememberMe: rememberAccount.value,
		};
		const res = await userStore.login(param);
		if (res) {
			const loggedUser = userStore.getUserInfo as {
				id?: string | number;
				username?: string;
				nickName?: string;
				gender?: string;
			} | null;
			themeStore.syncUserTheme(loggedUser);

			if (rememberAccount.value) {
				const nextProfile: SavedUserProfile = {
					username: loggedUser?.username || activeUsername,
					nickName: loggedUser?.nickName || activeUsername,
					gender: loggedUser?.gender,
					themeMode: themeStore.themeMode,
					customColor: themeStore.themeMode === 'custom' ? themeStore.primaryColor : '',
					password: loginForm.value.password,
				};
				saveLastProfile(nextProfile);
				savedProfile.value = nextProfile;
			} else {
				clearSavedProfile();
				savedProfile.value = null;
			}
			showSuccessToast('登录成功');
			router.push('/');
		}
	} catch (error: unknown) {
		const errMsg = error instanceof Error ? error.message : '系统繁忙，请稍后再试';
		showFailToast(errMsg);
	} finally {
		submitLoading.value = false;
	}
};
</script>

<style lang="less" scoped>
:global(html),
:global(body),
:global(#app) {
	height: 100%;
	margin: 0;
}

.login-container {
	--accent-start: var(--theme-primary-start, #fb923c);
	--accent-end: var(--theme-primary-end, #f97316);
	--accent-color: var(--primary-color, #f97316);
	--accent-soft: var(--theme-soft-bg, rgba(249, 115, 22, 0.14));
	--accent-shadow: var(--theme-shadow-color, rgba(249, 115, 22, 0.34));

	position: relative;
	height: 100vh;
	height: 100dvh;
	width: 100%;
	box-sizing: border-box;
	background: var(--theme-login-bg, linear-gradient(165deg, #ffedd5 0%, #fff7ed 46%, #fef3c7 100%));
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	overflow: hidden;
	transition: background 0.35s ease;

	&.theme-male,
	&.theme-female {
		background: var(--theme-login-bg);
	}
}

.cute-backdrop {
	position: absolute;
	inset: 0;
	pointer-events: none;
	overflow: hidden;
	z-index: 1;
}

.float-bubble {
	position: absolute;
	border-radius: 9999px;
	background: rgba(255, 255, 255, 0.55);

	&--1 {
		top: -36px;
		right: -28px;
		width: 150px;
		height: 150px;
	}
	&--2 {
		top: 18%;
		left: -44px;
		width: 120px;
		height: 120px;
	}
	&--3 {
		bottom: 12%;
		right: -24px;
		width: 96px;
		height: 96px;
	}
}

.brand-bar {
	position: relative;
	z-index: 5;
	width: 100%;
	max-width: 420px;
	margin: 0 auto;
	padding: max(18px, env(safe-area-inset-top)) clamp(20px, 5.5vw, 28px) 0;
	box-sizing: border-box;
	display: flex;
	align-items: center;
	justify-content: space-between;
	flex-shrink: 0;

	.brand-left {
		display: flex;
		align-items: center;
		gap: 9px;
	}

	.logo-box {
		width: 34px;
		height: 34px;
		background: #ffffff;
		border-radius: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 6px 14px -4px rgba(15, 23, 42, 0.1);

		.logo-icon {
			width: 21px;
			height: 21px;
			display: block;
		}
	}

	.brand-name {
		font-size: 15px;
		font-weight: 700;
		color: #0f172a;
		letter-spacing: -0.01em;
	}

	.date-pill {
		font-size: 11px;
		font-weight: 600;
		color: var(--accent-color);
		background: rgba(255, 255, 255, 0.88);
		padding: 4px 10px;
		border-radius: 9999px;
		font-variant-numeric: tabular-nums;
		box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
	}
}

.login-stage {
	position: relative;
	z-index: 10;
	width: 100%;
	max-width: 420px;
	margin: auto;
	padding: 0 clamp(20px, 5.5vw, 28px);
	box-sizing: border-box;
	display: flex;
	flex-direction: column;
	align-items: center;
}

.mascot-stage {
	position: relative;
	width: 160px;
	height: 118px;
	margin-bottom: -16px;
	z-index: 12;
	pointer-events: none;

	.mascot-svg {
		width: 100%;
		height: 132px;
		display: block;
		filter: drop-shadow(0 8px 14px rgba(15, 23, 42, 0.09));
	}

	.paw {
		transform-box: fill-box;
		transform-origin: center;
		transition: transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	&.is-covering {
		.paw--left {
			transform: translate(26px, -40px) rotate(14deg);
		}
		.paw--right {
			transform: translate(-26px, -40px) rotate(-14deg);
		}
	}

	&.is-peeking {
		.paw--left {
			transform: translate(26px, -40px) rotate(14deg);
		}
		.paw--right {
			transform: translate(-14px, -18px) rotate(-8deg);
		}
	}
}

.cute-card {
	position: relative;
	z-index: 11;
	width: 100%;
	background: rgba(255, 255, 255, 0.96);
	backdrop-filter: blur(12px);
	border-radius: 28px;
	padding: 28px 22px 24px;
	box-sizing: border-box;
	box-shadow:
		0 18px 40px -12px rgba(15, 23, 42, 0.1),
		0 2px 8px rgba(15, 23, 42, 0.04);
}

.remembered-hero {
	display: flex;
	align-items: center;
	gap: 13px;
	margin-bottom: 20px;

	.avatar-badge {
		width: 50px;
		height: 50px;
		border-radius: 17px;
		background: linear-gradient(135deg, var(--accent-start) 0%, var(--accent-end) 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		box-shadow: 0 10px 20px -6px var(--accent-shadow);

		.avatar-letter {
			font-size: 20px;
			font-weight: 800;
			color: #ffffff;
		}
	}

	.hero-copy {
		min-width: 0;
		flex: 1;
	}

	.hero-tag-row {
		display: flex;
		align-items: center;
		gap: 7px;
		margin-bottom: 3px;
	}

	.gender-pill {
		font-size: 10px;
		font-weight: 700;
		padding: 2px 8px;
		border-radius: 9999px;
		background: var(--accent-soft);
		color: var(--accent-color);
		white-space: nowrap;
		flex-shrink: 0;
	}
}

.standard-hero {
	margin-bottom: 20px;
	text-align: center;
}

.hero-title {
	font-size: 20px;
	font-weight: 800;
	color: #0f172a;
	margin: 0;
	letter-spacing: -0.02em;
	line-height: 1.25;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.hero-sub {
	margin: 4px 0 0;
	font-size: 12px;
	color: #64748b;
	line-height: 1.4;
}

.form-fields {
	display: flex;
	flex-direction: column;
	gap: 14px;
}

.field-group {
	.field-label {
		display: block;
		font-size: 12px;
		font-weight: 600;
		color: #475569;
		margin-left: 4px;
		margin-bottom: 6px;
	}

	.soft-field {
		background: #f8fafc;
		border: 1.5px solid transparent;
		border-radius: 15px;
		padding: 12px 14px;
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

		&:focus-within {
			background: #ffffff;
			border-color: var(--accent-color);
			box-shadow:
				0 6px 18px -6px var(--accent-soft),
				0 0 0 4px var(--accent-soft);

			:deep(.van-field__left-icon) {
				color: var(--accent-color);
			}
		}

		:deep(.van-field__left-icon) {
			margin-right: 10px;
			color: #94a3b8;
			font-size: 18px;
			display: flex;
			align-items: center;
			transition: color 0.2s ease;
		}

		:deep(.van-field__right-icon) {
			color: #94a3b8;
			font-size: 17px;
			display: flex;
			align-items: center;
		}

		:deep(.van-field__control) {
			font-size: 15px;
			font-weight: 500;
			color: #0f172a;
			background: transparent !important;

			&::placeholder {
				color: #94a3b8;
				font-weight: 400;
			}

			/* 彻底消除浏览器自动填充浅蓝矩形底色穿帮 */
			&:-webkit-autofill,
			&:-webkit-autofill:hover,
			&:-webkit-autofill:focus,
			&:-webkit-autofill:active {
				-webkit-text-fill-color: #0f172a !important;
				-webkit-box-shadow: 0 0 0 1000px transparent inset !important;
				box-shadow: 0 0 0 1000px transparent inset !important;
				background-color: transparent !important;
				background-clip: content-box !important;
				transition: background-color 99999s ease-in-out 0s;
			}
		}

		&::after {
			display: none;
		}
	}
}

.form-action {
	margin-top: 20px;

	.login-btn {
		position: relative;
		overflow: hidden;
		height: 48px;
		border-radius: 18px !important;
		border: none !important;
		font-size: 15px;
		font-weight: 700;
		letter-spacing: 0.6px;
		color: #ffffff !important;
		background: linear-gradient(135deg, var(--accent-start) 0%, var(--accent-end) 100%) !important;
		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.25),
			0 10px 24px -6px var(--accent-shadow);
		transition:
			transform 0.15s ease,
			box-shadow 0.2s ease;

		&::after {
			content: '';
			position: absolute;
			top: 0;
			left: -100%;
			width: 60%;
			height: 100%;
			background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.22) 50%, transparent 100%);
			transform: skewX(-20deg);
			animation: btnShimmer 4.2s ease-in-out infinite;
		}

		&:active {
			transform: scale(0.98);
		}

		.btn-arrow {
			font-size: 14px;
			transition: transform 0.2s ease;
		}

		&:active .btn-arrow {
			transform: translateX(3px);
		}

		:deep(.van-button__content) {
			display: inline-flex;
			align-items: center;
			justify-content: center;
			gap: 6px;
			line-height: 1;
		}

		:deep(.van-loading) {
			display: inline-flex;
			align-items: center;
			color: #ffffff !important;
		}

		:deep(.van-button__loading-text) {
			margin-left: 6px;
			font-size: 15px;
			font-weight: 600;
			color: #ffffff;
		}
	}
}

.form-options {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-top: 14px;
	padding: 0 2px;

	.remember-checkbox {
		:deep(.van-checkbox__label) {
			font-size: 12px;
			color: #64748b;
			font-weight: 500;
		}
	}

	.switch-account-link {
		border: none;
		background: transparent;
		padding: 2px 4px;
		font-size: 12px;
		font-weight: 600;
		color: var(--accent-color);
		cursor: pointer;

		&:active {
			opacity: 0.7;
		}
	}
}

.login-footer {
	width: 100%;
	padding-bottom: max(16px, env(safe-area-inset-bottom));
	text-align: center;
	flex-shrink: 0;

	.copyright {
		margin: 0;
		font-size: 11px;
		color: #94a3b8;
	}
}

@media (max-height: 640px) {
	.mascot-stage {
		transform: scale(0.88);
		transform-origin: bottom center;
		margin-bottom: -18px;
	}

	.cute-card {
		padding: 24px 18px 20px;
	}

	.remembered-hero,
	.standard-hero {
		margin-bottom: 14px;
	}

	.form-fields {
		gap: 10px;
	}

	.form-action {
		margin-top: 14px;

		.login-btn {
			height: 44px;
		}
	}
}

@keyframes btnShimmer {
	0%,
	55% {
		left: -100%;
	}
	100% {
		left: 160%;
	}
}

@media (max-height: 520px) {
	.mascot-stage {
		display: none;
	}

	.login-footer {
		display: none;
	}
}
</style>
