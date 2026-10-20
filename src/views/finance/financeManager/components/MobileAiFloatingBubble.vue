<template>
	<div
		ref="bubbleRef"
		class="mobile-ai-floating-bubble"
		:class="{ 'is-dragging': isDragging }"
		:style="bubbleStyle"
		data-testid="mobile-btn-ai-floating-bubble"
		@touchstart="onTouchStart"
		@touchmove.prevent="onTouchMove"
		@touchend="onTouchEnd"
		@click="handleClick"
	>
		<div class="bubble-glow-ring" />
		<div class="bubble-inner">
			<div class="bubble-icon-wrapper">
				<svg
					class="ai-sparkle-icon"
					viewBox="0 0 24 24"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M12 2L14.2 8.3L20.5 10.5L14.2 12.7L12 19L9.8 12.7L3.5 10.5L9.8 8.3L12 2Z"
						fill="url(#aiGradient)"
					/>
					<circle
						cx="18.5"
						cy="4.5"
						r="2"
						fill="#FBBF24"
					/>
					<circle
						cx="4.5"
						cy="18.5"
						r="1.5"
						fill="#60A5FA"
					/>
					<defs>
						<linearGradient
							id="aiGradient"
							x1="3.5"
							y1="2"
							x2="20.5"
							y2="19"
							gradientUnits="userSpaceOnUse"
						>
							<stop stop-color="#38BDF8" />
							<stop
								offset="0.5"
								stop-color="#818CF8"
							/>
							<stop
								offset="1"
								stop-color="#C084FC"
							/>
						</linearGradient>
					</defs>
				</svg>
			</div>
			<span class="bubble-text">AI记账</span>
		</div>
	</div>
</template>

<script setup lang="ts">
import { triggerHaptic } from '@/utils/haptics';

const emit = defineEmits<{
	(e: 'click'): void;
}>();

const bubbleRef = ref<HTMLElement | null>(null);
const isDragging = ref(false);
const hasMoved = ref(false);

// 默认定位在右下角（避开底部 TabBar 与安全区）
const topPos = ref<number>(540);
const rightPos = ref<number>(16);

let startY = 0;
let initialTop = 0;

onMounted(() => {
	// 初始化时若在浏览器环境，根据视口高度计算合适位置
	if (typeof window !== 'undefined') {
		const screenH = window.innerHeight;
		topPos.value = Math.max(120, screenH - 180);
	}
});

const bubbleStyle = computed(() => ({
	top: `${topPos.value}px`,
	right: `${rightPos.value}px`,
}));

const onTouchStart = (e: TouchEvent) => {
	if (e.touches.length !== 1) return;
	isDragging.value = true;
	hasMoved.value = false;
	startY = e.touches[0].clientY;
	initialTop = topPos.value;
};

const onTouchMove = (e: TouchEvent) => {
	if (!isDragging.value || e.touches.length !== 1) return;
	const currentY = e.touches[0].clientY;
	const deltaY = currentY - startY;

	if (Math.abs(deltaY) > 5) {
		hasMoved.value = true;
	}

	const screenH = typeof window !== 'undefined' ? window.innerHeight : 844;
	// 上下边界限制（保持在 60px 与 screenH - 120px 之间）
	const minTop = 60;
	const maxTop = Math.max(minTop, screenH - 120);
	const clampedTop = Math.min(Math.max(minTop, initialTop + deltaY), maxTop);

	topPos.value = clampedTop;
};

const onTouchEnd = () => {
	isDragging.value = false;
};

const handleClick = () => {
	// 拖拽位移大于 5px 时视为拖拽行为，不触发点击唤起
	if (hasMoved.value) {
		hasMoved.value = false;
		return;
	}
	triggerHaptic('light');
	emit('click');
};
</script>

<style scoped lang="less">
.mobile-ai-floating-bubble {
	position: fixed;
	z-index: 990;
	width: 58px;
	height: 58px;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	user-select: none;
	touch-action: none;
	transition:
		transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1),
		box-shadow 0.2s ease;

	&.is-dragging {
		transition: none;
		transform: scale(1.08);
	}

	&:active {
		transform: scale(0.92);
	}

	.bubble-glow-ring {
		position: absolute;
		inset: -3px;
		border-radius: 50%;
		background: linear-gradient(135deg, rgba(56, 189, 248, 0.5), rgba(192, 132, 252, 0.5));
		filter: blur(4px);
		animation: pulseGlow 3s infinite ease-in-out;
		z-index: 1;
	}

	.bubble-inner {
		position: relative;
		z-index: 2;
		width: 100%;
		height: 100%;
		border-radius: 50%;
		background: linear-gradient(145deg, #1e293b, #0f172a);
		border: 1px solid rgba(255, 255, 255, 0.15);
		box-shadow:
			0 8px 20px -4px rgba(15, 23, 42, 0.4),
			inset 0 1px 1px rgba(255, 255, 255, 0.2);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		color: #ffffff;
		overflow: hidden;

		.bubble-icon-wrapper {
			width: 22px;
			height: 22px;
			display: flex;
			align-items: center;
			justify-content: center;

			.ai-sparkle-icon {
				width: 100%;
				height: 100%;
			}
		}

		.bubble-text {
			font-size: 10px;
			font-weight: 600;
			letter-spacing: 0.5px;
			line-height: 1.2;
			margin-top: 1px;
			background: linear-gradient(135deg, #e0f2fe, #f3e8ff);
			-webkit-background-clip: text;
			-webkit-text-fill-color: transparent;
		}
	}
}

@keyframes pulseGlow {
	0%,
	100% {
		opacity: 0.6;
		transform: scale(1);
	}
	50% {
		opacity: 0.95;
		transform: scale(1.08);
	}
}
</style>
