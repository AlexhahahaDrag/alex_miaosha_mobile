<template>
	<div class="modern-login-page">
		<!-- 动态背景 -->
		<div class="background-container">
			<div
				class="network-bg"
				ref="networkBg"
			>
				<canvas
					ref="canvas"
					class="network-canvas"
				></canvas>
			</div>
			<div class="gradient-overlay"></div>
		</div>

		<!-- 主要内容 -->
		<div class="content-wrapper">
			<!-- Logo 区域 -->
			<div class="logo-section">
				<div class="logo-icon">
					<div class="logo-circle">
						<div class="logo-inner"></div>
					</div>
				</div>
				<h1 class="app-title">智能平台</h1>
				<p class="app-subtitle">连接未来，智慧生活</p>
			</div>

			<!-- 登录表单 -->
			<div class="login-form">
				<div class="form-container">
					<div class="input-group">
						<div class="input-wrapper">
							<van-field
								v-model="loginForm.username"
								placeholder="请输入用户名"
								:border="false"
								class="custom-input"
							>
								<template #left-icon>
									<van-icon
										name="user-o"
										class="input-icon"
									/>
								</template>
							</van-field>
						</div>
					</div>

					<div class="input-group">
						<div class="input-wrapper">
							<van-field
								v-model="loginForm.password"
								type="password"
								placeholder="请输入密码"
								:border="false"
								class="custom-input"
							>
								<template #left-icon>
									<van-icon
										name="lock"
										class="input-icon"
									/>
								</template>
							</van-field>
						</div>
					</div>

					<!-- 登录按钮 -->
					<div class="login-btn-wrapper">
						<van-button
							type="primary"
							block
							round
							class="login-btn"
							:loading="loading"
							@click="handleLogin"
						>
							<span class="btn-text">登录</span>
						</van-button>
					</div>

					<!-- 快捷操作 -->
					<div class="quick-actions">
						<div
							class="action-item"
							@click="handleForgotPassword"
						>
							<span>忘记密码？</span>
						</div>
						<div
							class="action-item"
							@click="handleRegister"
						>
							<span>立即注册</span>
						</div>
					</div>
				</div>
			</div>

			<!-- 底部信息 -->
			<div class="footer-info">
				<div class="social-login">
					<p class="social-title">其他登录方式</p>
					<div class="social-icons">
						<div
							class="social-item"
							@click="handleWechatLogin"
						>
							<van-icon
								name="wechat"
								class="social-icon wechat"
							/>
						</div>
						<div
							class="social-item"
							@click="handleQQLogin"
						>
							<van-icon
								name="qq"
								class="social-icon qq"
							/>
						</div>
						<div
							class="social-item"
							@click="handlePhoneLogin"
						>
							<van-icon
								name="phone-o"
								class="social-icon phone"
							/>
						</div>
					</div>
				</div>

				<div class="copyright">
					<p>© 2024 智能平台 版权所有</p>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { showToast } from 'vant';

// 响应式数据
const loginForm = ref({
	username: '',
	password: '',
});

const loading = ref(false);
const canvas = ref<HTMLCanvasElement>();
const networkBg = ref<HTMLElement>();

// 网络动画相关
let animationId: number;
let particles: Array<{
	x: number;
	y: number;
	vx: number;
	vy: number;
}> = [];

// 初始化网络背景动画
const initNetworkAnimation = () => {
	if (!canvas.value) return;

	const ctx = canvas.value.getContext('2d');
	if (!ctx) return;

	// 设置画布尺寸
	const resizeCanvas = () => {
		if (!canvas.value) return;
		canvas.value.width = window.innerWidth;
		canvas.value.height = window.innerHeight;
	};

	resizeCanvas();
	window.addEventListener('resize', resizeCanvas);

	// 初始化粒子
	const initParticles = () => {
		particles = [];
		const particleCount = 50;

		for (let i = 0; i < particleCount; i++) {
			particles.push({
				x: Math.random() * canvas.value!.width,
				y: Math.random() * canvas.value!.height,
				vx: (Math.random() - 0.5) * 0.5,
				vy: (Math.random() - 0.5) * 0.5,
			});
		}
	};

	// 动画循环
	const animate = () => {
		if (!ctx || !canvas.value) return;

		ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);

		// 更新粒子位置
		particles.forEach((particle) => {
			particle.x += particle.vx;
			particle.y += particle.vy;

			// 边界检测
			if (particle.x < 0 || particle.x > canvas.value!.width) particle.vx *= -1;
			if (particle.y < 0 || particle.y > canvas.value!.height) particle.vy *= -1;
		});

		// 绘制粒子和连线
		ctx.strokeStyle = 'rgba(64, 158, 255, 0.3)';
		ctx.fillStyle = 'rgba(64, 158, 255, 0.6)';
		ctx.lineWidth = 1;

		particles.forEach((particle, i) => {
			// 绘制粒子
			ctx.beginPath();
			ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
			ctx.fill();

			// 绘制连线
			particles.slice(i + 1).forEach((otherParticle) => {
				const distance = Math.sqrt(Math.pow(particle.x - otherParticle.x, 2) + Math.pow(particle.y - otherParticle.y, 2));

				if (distance < 100) {
					ctx.beginPath();
					ctx.moveTo(particle.x, particle.y);
					ctx.lineTo(otherParticle.x, otherParticle.y);
					ctx.globalAlpha = 1 - distance / 100;
					ctx.stroke();
					ctx.globalAlpha = 1;
				}
			});
		});

		animationId = requestAnimationFrame(animate);
	};

	initParticles();
	animate();
};

// 登录处理
const handleLogin = async () => {
	if (!loginForm.value.username || !loginForm.value.password) {
		showToast('请输入用户名和密码');
		return;
	}

	loading.value = true;

	try {
		// 模拟登录请求
		await new Promise((resolve) => setTimeout(resolve, 2000));
		showToast.success('登录成功');
	} catch (error) {
		showToast.fail('登录失败，请重试');
	} finally {
		loading.value = false;
	}
};

// 其他操作处理
const handleForgotPassword = () => {
	showToast('忘记密码功能');
};

const handleRegister = () => {
	showToast('注册功能');
};

const handleWechatLogin = () => {
	showToast('微信登录');
};

const handleQQLogin = () => {
	showToast('QQ登录');
};

const handlePhoneLogin = () => {
	showToast('手机号登录');
};

// 生命周期
onMounted(() => {
	initNetworkAnimation();
});

onUnmounted(() => {
	if (animationId) {
		cancelAnimationFrame(animationId);
	}
});
</script>

<style scoped>
.modern-login-page {
	position: relative;
	width: 100vw;
	height: 100vh;
	overflow: hidden;
	background: linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%);
}

/* 背景容器 */
.background-container {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	z-index: 1;
}

.network-bg {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
}

.network-canvas {
	width: 100%;
	height: 100%;
}

.gradient-overlay {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background: radial-gradient(circle at center, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.3) 50%, rgba(0, 0, 0, 0.6) 100%);
}

/* 内容容器 */
.content-wrapper {
	position: relative;
	z-index: 2;
	height: 100vh;
	display: flex;
	flex-direction: column;
	padding: 60px 32px 40px;
	box-sizing: border-box;
}

/* Logo 区域 */
.logo-section {
	text-align: center;
	margin-bottom: 60px;
}

.logo-icon {
	margin-bottom: 24px;
}

.logo-circle {
	width: 80px;
	height: 80px;
	margin: 0 auto;
	border-radius: 50%;
	background: linear-gradient(135deg, #409eff 0%, #36cfc9 100%);
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 8px 32px rgba(64, 158, 255, 0.3);
	animation: logoFloat 3s ease-in-out infinite;
}

.logo-inner {
	width: 40px;
	height: 40px;
	border-radius: 50%;
	background: rgba(255, 255, 255, 0.9);
	position: relative;
}

.logo-inner::before {
	content: '';
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	width: 20px;
	height: 20px;
	border-radius: 50%;
	background: linear-gradient(135deg, #409eff 0%, #36cfc9 100%);
}

.app-title {
	font-size: 32px;
	font-weight: 700;
	color: #ffffff;
	margin: 0 0 8px 0;
	text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.app-subtitle {
	font-size: 16px;
	color: rgba(255, 255, 255, 0.7);
	margin: 0;
	font-weight: 300;
}

/* 登录表单 */
.login-form {
	flex: 1;
	display: flex;
	align-items: center;
}

.form-container {
	width: 100%;
}

.input-group {
	margin-bottom: 24px;
}

.input-wrapper {
	background: rgba(255, 255, 255, 0.1);
	border-radius: 16px;
	backdrop-filter: blur(10px);
	border: 1px solid rgba(255, 255, 255, 0.2);
	overflow: hidden;
	transition: all 0.3s ease;
}

.input-wrapper:focus-within {
	background: rgba(255, 255, 255, 0.15);
	border-color: #409eff;
	box-shadow: 0 0 20px rgba(64, 158, 255, 0.3);
}

.custom-input {
	background: transparent !important;
}

.custom-input :deep(.van-field__control) {
	color: #ffffff;
	font-size: 16px;
	padding: 16px 20px;
}

.custom-input :deep(.van-field__control::placeholder) {
	color: rgba(255, 255, 255, 0.6);
}

.input-icon {
	color: rgba(255, 255, 255, 0.7);
	font-size: 20px;
	margin-left: 20px;
}

/* 登录按钮 */
.login-btn-wrapper {
	margin: 40px 0 32px;
}

.login-btn {
	height: 56px;
	background: linear-gradient(135deg, #409eff 0%, #36cfc9 100%);
	border: none;
	box-shadow: 0 8px 32px rgba(64, 158, 255, 0.4);
	transition: all 0.3s ease;
}

.login-btn:active {
	transform: translateY(2px);
	box-shadow: 0 4px 16px rgba(64, 158, 255, 0.4);
}

.btn-text {
	font-size: 18px;
	font-weight: 600;
	color: #ffffff;
}

/* 快捷操作 */
.quick-actions {
	display: flex;
	justify-content: space-between;
	margin-bottom: 40px;
}

.action-item {
	color: rgba(255, 255, 255, 0.7);
	font-size: 14px;
	cursor: pointer;
	transition: color 0.3s ease;
}

.action-item:active {
	color: #409eff;
}

/* 底部信息 */
.footer-info {
	margin-top: auto;
}

.social-login {
	text-align: center;
	margin-bottom: 32px;
}

.social-title {
	color: rgba(255, 255, 255, 0.6);
	font-size: 14px;
	margin: 0 0 20px 0;
}

.social-icons {
	display: flex;
	justify-content: center;
	gap: 24px;
}

.social-item {
	width: 48px;
	height: 48px;
	border-radius: 50%;
	background: rgba(255, 255, 255, 0.1);
	backdrop-filter: blur(10px);
	border: 1px solid rgba(255, 255, 255, 0.2);
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	transition: all 0.3s ease;
}

.social-item:active {
	transform: scale(0.95);
	background: rgba(255, 255, 255, 0.2);
}

.social-icon {
	font-size: 24px;
}

.social-icon.wechat {
	color: #07c160;
}

.social-icon.qq {
	color: #12b7f5;
}

.social-icon.phone {
	color: #ff6b35;
}

.copyright {
	text-align: center;
}

.copyright p {
	color: rgba(255, 255, 255, 0.4);
	font-size: 12px;
	margin: 0;
}

/* 动画 */
@keyframes logoFloat {
	0%,
	100% {
		transform: translateY(0);
	}
	50% {
		transform: translateY(-10px);
	}
}

/* 响应式适配 */
@media (max-width: 375px) {
	.content-wrapper {
		padding: 40px 24px 32px;
	}

	.app-title {
		font-size: 28px;
	}

	.logo-circle {
		width: 70px;
		height: 70px;
	}
}
</style>
