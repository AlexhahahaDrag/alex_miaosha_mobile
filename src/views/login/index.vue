<template>
	<div class="login-container">
		<vue-particles
			id="tsparticles"
			class="login-particles"
			:options="particlesOptions"
		/>

		<div class="login-content">
			<header class="login-header">
				<div class="logo-box">
					<div class="logo-inner">
						<van-icon
							name="points"
							class="logo-icon"
						/>
					</div>
				</div>
				<h1 class="brand-title">alex系统管理平台</h1>
				<p class="brand-subtitle">企业级通用管理终端</p>
			</header>

			<main class="login-card">
				<div class="card-inner">
					<div class="card-glow"></div>
					<van-form
						@submit="onSubmit"
						class="login-form"
					>
						<div class="form-fields">
							<div class="field-group">
								<label class="field-label">用户名</label>
								<van-field
									v-model="loginForm.username"
									name="username"
									placeholder="请输入用户名"
									left-icon="manager"
									class="glass-field"
									:rules="[{ required: true, message: '请输入用户名' }]"
								/>
							</div>
							<div class="field-group">
								<label class="field-label">密码</label>
								<van-field
									v-model="loginForm.password"
									:type="showPassword ? 'text' : 'password'"
									name="password"
									placeholder="请输入密码"
									left-icon="lock"
									:right-icon="showPassword ? 'eye-o' : 'closed-eye'"
									class="glass-field"
									@click-right-icon="showPassword = !showPassword"
									:rules="[{ required: true, message: '请输入密码' }]"
									autocomplete="on"
								/>
							</div>
						</div>

						<div class="form-action">
							<van-button
								round
								block
								type="primary"
								native-type="submit"
								class="login-btn"
								:loading="submitLoading"
								loading-text="验证中..."
							>
								安全登录
							</van-button>
						</div>

						<div class="form-links">
							<span class="link-item">忘记密码？</span>
							<div class="link-divider"></div>
							<span class="link-item">注册账号</span>
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
				<p class="copyright">2026 Alex 系统架构。保留所有权利。</p>
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

const particlesOptions = {
	background: { color: { value: 'transparent' } },
	fpsLimit: 120,
	interactivity: {
		events: {
			onClick: { enable: true, mode: 'push' },
			onHover: { enable: true, mode: 'grab' },
			resize: true,
		},
		modes: {
			grab: { distance: 140, links: { opacity: 0.2 } },
			push: { quantity: 4 },
		},
	},
	particles: {
		color: { value: '#2563eb' },
		links: {
			color: '#2563eb',
			distance: 150,
			enable: true,
			opacity: 0.1,
			width: 1,
		},
		move: {
			direction: 'none',
			enable: true,
			outMode: 'out',
			random: true,
			speed: 0.8,
			straight: false,
		},
		number: { density: { enable: true, area: 800 }, value: 40 },
		opacity: { value: 0.2 },
		shape: { type: 'circle' },
		size: { random: true, value: { min: 1, max: 4 } },
	},
	detectRetina: true,
};

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
	background: radial-gradient(circle at center, #f0f7ff 0%, #f8fafc 100%);
	display: flex;
	flex-direction: column;
	align-items: center;
	overflow: hidden;

	.login-particles {
		position: absolute;
		inset: 0;
		z-index: 1;
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
	padding: max(16px, env(safe-area-inset-top)) clamp(24px, 8vw, 40px) max(14px, env(safe-area-inset-bottom));
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	overflow: hidden;
}

.login-header {
	text-align: center;
	margin-bottom: clamp(18px, 4vh, 32px);
	flex-shrink: 0;

	.logo-box {
		width: 48px;
		height: 48px;
		background: rgba(255, 255, 255, 0.6);
		backdrop-filter: blur(10px);
		border-radius: 14px;
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0 auto 8px;
		border: 1px solid rgba(255, 255, 255, 0.8);

		.logo-icon {
			font-size: 24px;
			color: #2563eb;
		}
	}

	.brand-title {
		font-size: 20px;
		font-weight: 800;
		color: #1e293b;
		margin-bottom: 2px;
		letter-spacing: 0;
	}

	.brand-subtitle {
		font-size: 11px;
		color: #64748b;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 1.5px;
	}
}

.login-card {
	width: 100%;
	flex-shrink: 0;
	position: relative;
	background: rgba(255, 255, 255, 0.7);
	backdrop-filter: blur(24px);
	border-radius: 28px;
	border: 1px solid rgba(255, 255, 255, 0.6);
	box-shadow: 0 20px 50px -12px rgba(0, 0, 0, 0.05);
	padding: 4px;

	.card-inner {
		padding: 16px 20px;
		z-index: 2;
	}

	.card-glow {
		position: absolute;
		top: -50px;
		right: -50px;
		width: 100px;
		height: 100px;
		background: radial-gradient(circle, rgba(37, 99, 235, 0.05) 0%, transparent 70%);
		pointer-events: none;
	}
}

.form-fields {
	display: flex;
	flex-direction: column;
	gap: 12px;
}

.field-group {
	.field-label {
		display: block;
		font-size: 10px;
		font-weight: 700;
		color: #64748b;
		text-transform: uppercase;
		letter-spacing: 1px;
		margin-left: 8px;
		margin-bottom: 4px;
	}

	.glass-field {
		background: rgba(255, 255, 255, 0.5);
		border: 1px solid #e2e8f0;
		border-radius: 16px;
		padding: 10px 14px;

		:deep(.van-field__control) {
			font-size: 15px;
		}

		:deep(.van-field__left-icon) {
			font-size: 18px;
		}

		&::after {
			display: none;
		}
	}
}

.form-action {
	margin-top: 16px;

	.login-btn {
		height: 48px;
		font-size: 16px;
		font-weight: 700;
		background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
	}
}

.form-links {
	display: flex;
	justify-content: center;
	align-items: center;
	margin-top: 12px;

	.link-item {
		font-size: 12px;
		color: #2563eb;
	}

	.link-divider {
		width: 1px;
		height: 10px;
		background: #e2e8f0;
		margin: 0 8px;
	}
}

.login-footer {
	text-align: center;
	margin-top: clamp(14px, 4vh, 24px);
	flex-shrink: 0;

	.footer-links {
		display: flex;
		justify-content: center;
		gap: 8px;
		margin-bottom: 4px;
		color: #94a3b8;
		font-size: 10px;

		.dot {
			opacity: 0.5;
		}
	}

	.copyright {
		font-size: 9px;
		color: #cbd5e1;
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
			width: 42px;
			height: 42px;
			margin-bottom: 6px;
		}

		.brand-title {
			font-size: 18px;
		}

		.brand-subtitle {
			font-size: 10px;
		}
	}

	.login-card {
		border-radius: 22px;

		.card-inner {
			padding: 14px 18px;
		}
	}

	.form-fields {
		gap: 10px;
	}

	.field-group {
		.glass-field {
			padding: 8px 12px;
		}
	}

	.form-action {
		margin-top: 14px;

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
			width: 36px;
			height: 36px;
		}
	}
}
</style>
