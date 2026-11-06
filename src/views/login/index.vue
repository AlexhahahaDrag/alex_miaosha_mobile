<template>
	<div class="login-container">
		<!-- 顶部柔和 Indigo 环境微光球 (Taste-Skill Soft UI 氛围层) -->
		<div
			class="ambient-orb ambient-orb--indigo"
			aria-hidden="true"
		></div>
		<div
			class="ambient-orb ambient-orb--violet"
			aria-hidden="true"
		></div>

		<div class="login-content">
			<header class="login-header">
				<div class="logo-box">
					<img
						src="/logo.svg"
						alt="logo"
						class="logo-icon"
					/>
				</div>
				<h1 class="brand-title">alex系统管理平台</h1>
				<div class="brand-badge">
					<span class="brand-badge__dot"></span>
					<span class="brand-badge__text">企业级通用管理终端</span>
				</div>
			</header>

			<main class="login-card">
				<div class="card-inner">
					<van-form
						class="login-form"
						@submit="onSubmit"
					>
						<div class="form-fields">
							<div class="field-group">
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
									autocomplete="on"
									:rules="[{ required: true, message: '请输入密码' }]"
									@click-right-icon="showPassword = !showPassword"
								/>
							</div>
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
								loading-text="验证中..."
							>
								安全登录
							</van-button>
						</div>

						<div class="form-links">
							<button
								type="button"
								class="link-btn"
								data-testid="mobile-login-forgot"
							>
								忘记密码？
							</button>
							<span
								class="link-divider"
								aria-hidden="true"
							></span>
							<button
								type="button"
								class="link-btn link-btn--primary"
								data-testid="mobile-login-register"
							>
								注册账号
							</button>
						</div>
					</van-form>
				</div>
			</main>

			<footer class="login-footer">
				<div class="footer-links">
					<span>隐私政策</span>
					<span class="dot">·</span>
					<span>安全协议</span>
				</div>
				<p class="copyright">2026 Alex 系统架构 · 保留所有权利</p>
			</footer>
		</div>
	</div>
</template>

<script setup lang="ts">
import { showFailToast, showSuccessToast } from 'vant';
import type { LoginForm } from '@/views/login/config';
import type { LoginParams } from '@/views/login/api';
import { useUserStore } from '@/store/modules/user/user';
import { useNavBar } from '@/composables/useNavBar';

const router = useRouter();
const userStore = useUserStore();
useNavBar({ visible: false });

const loginForm = ref<LoginForm>({ username: '', password: '' });
const submitLoading = ref<boolean>(false);
const showPassword = ref<boolean>(false);

const onSubmit = async () => {
	if (submitLoading.value) return;

	if (navigator.vibrate) {
		navigator.vibrate(50);
	}

	submitLoading.value = true;
	try {
		const param: LoginParams = {
			type: 'account',
			username: loginForm.value.username,
			password: loginForm.value.password,
			isRememberMe: true,
		};
		const res = await userStore.login(param);
		if (res) {
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
	position: relative;
	height: 100vh;
	height: 100dvh;
	width: 100%;
	box-sizing: border-box;
	background-color: #f8fafc;
	display: flex;
	flex-direction: column;
	align-items: center;
	overflow: hidden;
}

.ambient-orb {
	position: absolute;
	border-radius: 9999px;
	filter: blur(48px);
	pointer-events: none;
	z-index: 1;

	&--indigo {
		top: -60px;
		left: -40px;
		width: 240px;
		height: 240px;
		background: radial-gradient(circle, rgba(79, 106, 246, 0.14) 0%, rgba(79, 106, 246, 0) 70%);
	}

	&--violet {
		bottom: 10%;
		right: -50px;
		width: 220px;
		height: 220px;
		background: radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, rgba(139, 92, 246, 0) 70%);
	}
}

.login-content {
	position: relative;
	z-index: 10;
	width: 100%;
	max-width: 400px;
	height: 100%;
	min-height: 0;
	box-sizing: border-box;
	padding: max(18px, env(safe-area-inset-top)) clamp(22px, 6vw, 36px) max(16px, env(safe-area-inset-bottom));
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	overflow: hidden;
}

.login-header {
	text-align: center;
	margin-bottom: clamp(20px, 3.8vh, 30px);
	flex-shrink: 0;

	.logo-box {
		width: 56px;
		height: 56px;
		background: #ffffff;
		border-radius: 18px;
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0 auto 12px;
		box-shadow:
			0 10px 25px -5px rgba(79, 106, 246, 0.16),
			0 2px 6px rgba(15, 23, 42, 0.04);

		.logo-icon {
			width: 34px;
			height: 34px;
			display: block;
		}
	}

	.brand-title {
		font-size: 22px;
		font-weight: 800;
		color: #0f172a;
		margin: 0 0 8px;
		letter-spacing: -0.3px;
		line-height: 1.25;
	}

	.brand-badge {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 4px 12px;
		border-radius: 9999px;
		background: rgba(79, 106, 246, 0.1);
		color: #4f46e5;

		&__dot {
			width: 6px;
			height: 6px;
			border-radius: 9999px;
			background: #4f6af6;
		}

		&__text {
			font-size: 11px;
			font-weight: 600;
			letter-spacing: 0.5px;
		}
	}
}

.login-card {
	width: 100%;
	flex-shrink: 0;
	position: relative;
	background: #ffffff;
	border-radius: 24px;
	border: none;
	box-shadow:
		0 12px 32px -8px rgba(15, 23, 42, 0.06),
		0 2px 10px rgba(15, 23, 42, 0.03);

	.card-inner {
		padding: 22px 20px 18px;
	}
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
		border-radius: 16px;
		padding: 11px 14px;
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

		&:focus-within {
			background: #ffffff;
			border-color: rgba(79, 106, 246, 0.45);
			box-shadow: 0 0 0 4px rgba(79, 106, 246, 0.1);

			:deep(.van-field__left-icon) {
				color: #4f46e5;
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
		height: 48px;
		border-radius: 16px !important;
		border: none !important;
		font-size: 15px;
		font-weight: 600;
		letter-spacing: 0.5px;
		color: #ffffff !important;
		background: linear-gradient(135deg, #4f6af6 0%, #6366f1 100%) !important;
		box-shadow: 0 8px 20px -4px rgba(79, 106, 246, 0.35);
		transition:
			transform 0.15s ease,
			box-shadow 0.2s ease;

		&:active {
			transform: scale(0.985);
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

.form-links {
	display: flex;
	justify-content: center;
	align-items: center;
	margin-top: 14px;
	gap: 4px;

	.link-btn {
		border: none;
		background: transparent;
		font-size: 12px;
		font-weight: 500;
		color: #64748b;
		padding: 6px 10px;
		border-radius: 10px;
		cursor: pointer;
		transition:
			color 0.15s ease,
			background-color 0.15s ease;

		&:active {
			background-color: #f1f5f9;
			color: #0f172a;
		}

		&--primary {
			color: #4f46e5;
			font-weight: 600;

			&:active {
				background-color: rgba(79, 106, 246, 0.08);
				color: #4338ca;
			}
		}
	}

	.link-divider {
		width: 1px;
		height: 12px;
		background: #e2e8f0;
	}
}

.login-footer {
	text-align: center;
	margin-top: clamp(18px, 4vh, 28px);
	flex-shrink: 0;

	.footer-links {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 8px;
		margin-bottom: 4px;
		color: #64748b;
		font-size: 11px;
		font-weight: 500;

		.dot {
			color: #cbd5e1;
		}
	}

	.copyright {
		margin: 0;
		font-size: 10px;
		color: #94a3b8;
	}
}

@media (max-height: 620px) {
	.login-content {
		padding-top: 12px;
		padding-bottom: 10px;
	}

	.login-header {
		margin-bottom: 14px;

		.logo-box {
			width: 46px;
			height: 46px;
			margin-bottom: 8px;
		}

		.brand-title {
			font-size: 19px;
		}
	}

	.login-card {
		border-radius: 20px;

		.card-inner {
			padding: 16px 18px 14px;
		}
	}

	.form-fields {
		gap: 10px;
	}

	.field-group {
		.soft-field {
			padding: 9px 12px;
		}
	}

	.form-action {
		margin-top: 16px;

		.login-btn {
			height: 44px;
		}
	}

	.form-links {
		margin-top: 10px;
	}

	.login-footer {
		margin-top: 12px;
	}
}

@media (max-height: 540px) {
	.login-footer {
		display: none;
	}

	.login-header {
		margin-bottom: 10px;

		.logo-box {
			width: 40px;
			height: 40px;
		}
	}
}
</style>
