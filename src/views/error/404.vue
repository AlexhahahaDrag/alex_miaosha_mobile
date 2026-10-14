<template>
	<div class="lost-space-container">
		<!-- 悬浮迷航星球与微雷达插画 -->
		<div class="lost-space-artwork">
			<div class="orbit-ring"></div>
			<div class="space-capsule">
				<svg
					viewBox="0 0 120 120"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
					class="space-illustration"
				>
					<!-- 幽灵小行星 -->
					<circle
						cx="60"
						cy="60"
						r="42"
						fill="url(#planetGlow)"
					/>
					<!-- 星球环带 -->
					<ellipse
						cx="60"
						cy="60"
						rx="56"
						ry="16"
						stroke="#60a5fa"
						stroke-width="3"
						stroke-dasharray="6 4"
						opacity="0.8"
						transform="rotate(-18 60 60)"
					/>
					<!-- 信号断开小雷达 -->
					<circle
						cx="60"
						cy="48"
						r="12"
						fill="#ffffff"
						opacity="0.9"
					/>
					<path
						d="M52 48a8 8 0 0 1 16 0"
						stroke="#2563eb"
						stroke-width="2.5"
						stroke-linecap="round"
					/>
					<circle
						cx="60"
						cy="54"
						r="2"
						fill="#2563eb"
					/>
					<!-- 迷航小流星 -->
					<circle
						cx="24"
						cy="26"
						r="2"
						fill="#93c5fd"
						opacity="0.7"
					/>
					<circle
						cx="98"
						cy="32"
						r="1.5"
						fill="#bfdbfe"
						opacity="0.6"
					/>
					<circle
						cx="88"
						cy="96"
						r="2.5"
						fill="#60a5fa"
						opacity="0.5"
					/>
					<defs>
						<radialGradient
							id="planetGlow"
							cx="0"
							cy="0"
							r="1"
							gradientUnits="userSpaceOnUse"
							gradientTransform="translate(48 48) rotate(45) scale(54)"
						>
							<stop stop-color="#93c5fd" />
							<stop
								offset="0.6"
								stop-color="#3b82f6"
							/>
							<stop
								offset="1"
								stop-color="#1d4ed8"
							/>
						</radialGradient>
					</defs>
				</svg>
			</div>
		</div>

		<!-- 状态码与个性文案 -->
		<div class="lost-space-content">
			<div class="status-code">404</div>
			<div class="status-tag">信号漂出银河系</div>
			<p class="status-desc">
				当前页面可能已被黑洞吞噬，<br />
				或正在折跃通道中迷航…
			</p>
		</div>

		<!-- 导航与交互闭环 -->
		<div class="lost-space-actions">
			<van-button
				round
				block
				type="primary"
				class="action-btn action-btn--primary"
				@click="handleGoHome"
			>
				返回安全基地 (首页)
			</van-button>
			<van-button
				round
				block
				class="action-btn action-btn--subtle"
				@click="handleGoBack"
			>
				折返上一站
			</van-button>
		</div>
	</div>
</template>

<script setup lang="ts">
const router = useRouter();

const triggerHaptic = () => {
	if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
		navigator.vibrate(40);
	}
};

const handleGoHome = () => {
	triggerHaptic();
	router.push('/dashboard');
};

const handleGoBack = () => {
	triggerHaptic();
	if (window.history.length > 1) {
		router.back();
	} else {
		router.push('/dashboard');
	}
};
</script>

<style lang="less" scoped>
.lost-space-container {
	min-height: 100vh;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 32px 24px;
	box-sizing: border-box;
	background: radial-gradient(circle at 50% 30%, #f0f7ff 0%, #ffffff 70%);
	text-align: center;
}

.lost-space-artwork {
	position: relative;
	width: 140px;
	height: 140px;
	margin-bottom: 24px;
	display: flex;
	align-items: center;
	justify-content: center;

	.space-capsule {
		width: 110px;
		height: 110px;
		animation: floating 3.2s ease-in-out infinite;
	}

	.space-illustration {
		width: 100%;
		height: 100%;
		filter: drop-shadow(0 12px 20px rgba(37, 99, 235, 0.22));
	}
}

.lost-space-content {
	margin-bottom: 36px;

	.status-code {
		font-family:
			system-ui,
			-apple-system,
			sans-serif;
		font-size: 56px;
		font-weight: 800;
		line-height: 1;
		letter-spacing: -2px;
		background: linear-gradient(135deg, #1d4ed8 0%, #3b82f6 50%, #60a5fa 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		margin-bottom: 8px;
	}

	.status-tag {
		display: inline-block;
		padding: 4px 12px;
		font-size: 13px;
		font-weight: 600;
		color: #2563eb;
		background: rgba(37, 99, 235, 0.08);
		border-radius: 999px;
		margin-bottom: 12px;
	}

	.status-desc {
		font-size: 14px;
		line-height: 1.6;
		color: #64748b;
		margin: 0;
	}
}

.lost-space-actions {
	width: 100%;
	max-width: 280px;
	display: flex;
	flex-direction: column;
	gap: 12px;

	.action-btn {
		height: 44px;
		font-size: 14px;
		font-weight: 600;
		border-radius: 22px;
		transition: all 0.2s ease;

		&--primary {
			background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
			border: none;
			box-shadow: 0 4px 12px rgba(37, 99, 235, 0.28);

			&:active {
				transform: scale(0.98);
				box-shadow: 0 2px 6px rgba(37, 99, 235, 0.2);
			}
		}

		&--subtle {
			background: #f1f5f9;
			border: 1px solid #e2e8f0;
			color: #475569;

			&:active {
				background: #e2e8f0;
				transform: scale(0.98);
			}
		}
	}
}

@keyframes floating {
	0%,
	100% {
		transform: translateY(0) rotate(0deg);
	}
	50% {
		transform: translateY(-8px) rotate(2deg);
	}
}
</style>
