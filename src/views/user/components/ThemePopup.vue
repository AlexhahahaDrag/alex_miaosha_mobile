<template>
	<van-popup
		v-model:show="visible"
		position="bottom"
		round
		closeable
		class="theme-popup"
		data-testid="mobile-theme-popup"
	>
		<div class="theme-popup-content">
			<div class="popup-header">
				<div class="popup-title">个性化主题</div>
				<span
					class="mode-badge"
					data-testid="theme-popup-mode-badge"
				>
					{{ themeStore.activeThemeStatusText }}
				</span>
			</div>

			<!-- 暗黑模式开关 -->
			<div class="setting-row">
				<div class="row-label">
					<van-icon
						:name="themeStore.isDark ? 'passed' : 'smile-o'"
						class="row-icon"
					/>
					<span>暗黑模式</span>
				</div>
				<van-switch
					:model-value="themeStore.isDark"
					size="24px"
					@update:model-value="onToggleDark"
				/>
			</div>

			<van-divider />

			<!-- 主题色选取 -->
			<div class="color-section">
				<div class="section-title">主题色盘（选择后优先按个人设置生效）</div>
				<div class="color-grid">
					<button
						v-for="color in presetColors"
						:key="color.value"
						type="button"
						class="color-card"
						:class="{ active: isColorActive(color.value) }"
						:data-testid="`theme-color-${color.key}`"
						@click="onSelectColor(color.value)"
					>
						<span
							class="color-swatch"
							:style="{ backgroundColor: color.value }"
						>
							<van-icon
								v-if="isColorActive(color.value)"
								name="success"
								class="check-icon"
							/>
						</span>
						<span class="color-name">{{ color.name }}</span>
						<span
							v-if="color.genderHint"
							class="color-hint"
						>
							{{ color.genderHint }}
						</span>
					</button>

					<!-- 原生自选调色盘 -->
					<div
						class="color-card custom-color-card"
						:class="{ active: isCustomColor }"
						title="自定义调色"
					>
						<span class="color-swatch custom-swatch">
							<input
								type="color"
								class="native-color-input"
								:value="themeStore.primaryColor"
								@input="onCustomColorInput"
							/>
							<van-icon
								name="plus"
								class="custom-icon"
							/>
						</span>
						<span class="color-name">自由取色</span>
					</div>
				</div>
			</div>

			<!-- 恢复跟随性别默认 -->
			<div class="reset-wrapper">
				<van-button
					plain
					block
					round
					size="small"
					class="reset-btn"
					data-testid="theme-btn-reset-gender"
					@click="onResetDefault"
				>
					恢复跟随性别默认
				</van-button>
			</div>
		</div>
	</van-popup>
</template>

<script setup lang="ts">
import { useThemeStore, THEME_PRESETS } from '@/store/modules/theme';
import { useUserStore } from '@/store/modules/user/user';

const props = defineProps<{
	show: boolean;
}>();

const emit = defineEmits<{
	(e: 'update:show', val: boolean): void;
}>();

const themeStore = useThemeStore();
const userStore = useUserStore();

const visible = computed({
	get: () => props.show,
	set: (val: boolean) => emit('update:show', val),
});

const presetColors = THEME_PRESETS;

const isColorActive = (val: string) => themeStore.primaryColor.toLowerCase() === val.toLowerCase();

const isCustomColor = computed(() => {
	const current = themeStore.primaryColor.toLowerCase();
	return !presetColors.some((c) => c.value.toLowerCase() === current);
});

const triggerHaptic = () => {
	if (typeof navigator !== 'undefined' && navigator.vibrate) {
		navigator.vibrate(40);
	}
};

const onToggleDark = (val: boolean) => {
	triggerHaptic();
	themeStore.toggleDark(val);
};

const onSelectColor = (color: string) => {
	triggerHaptic();
	themeStore.setCustomPrimaryColor(color);
};

const onCustomColorInput = (e: Event) => {
	const val = (e.target as HTMLInputElement).value;
	if (val) {
		themeStore.setCustomPrimaryColor(val);
	}
};

const onResetDefault = () => {
	triggerHaptic();
	const currentGender = (userStore.getUserInfo as { gender?: string } | null)?.gender;
	themeStore.resetToGenderDefault(currentGender);
	themeStore.toggleDark(false);
};
</script>

<style scoped lang="less">
.theme-popup {
	max-height: 75vh;
}

.theme-popup-content {
	padding: 22px 20px 28px;
}

.popup-header {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 6px;
	margin-bottom: 18px;
}

.popup-title {
	font-size: 17px;
	font-weight: 700;
	color: var(--text-primary, #0f172a);
}

.mode-badge {
	font-size: 11px;
	font-weight: 600;
	padding: 3px 10px;
	border-radius: 9999px;
	background: var(--theme-soft-bg, rgba(59, 130, 246, 0.12));
	color: var(--primary-color, #3b82f6);
}

.setting-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 4px 0;

	.row-label {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 15px;
		font-weight: 500;
		color: var(--text-primary, #0f172a);

		.row-icon {
			font-size: 18px;
			color: var(--primary-color, #3b82f6);
		}
	}
}

.color-section {
	margin-top: 8px;

	.section-title {
		font-size: 12.5px;
		font-weight: 500;
		color: var(--text-secondary, #64748b);
		margin-bottom: 12px;
	}

	.color-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 10px;
	}
}

.color-card {
	position: relative;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 4px;
	padding: 10px 4px 8px;
	border-radius: 14px;
	background: #f8fafc;
	border: 1.5px solid transparent;
	cursor: pointer;
	transition: all 0.2s ease;

	&.active {
		background: var(--theme-soft-bg, rgba(59, 130, 246, 0.12));
		border-color: var(--theme-border-color, rgba(59, 130, 246, 0.28));
	}

	&:active {
		transform: scale(0.96);
	}
}

.color-swatch {
	width: 34px;
	height: 34px;
	border-radius: 50%;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	position: relative;
	box-shadow: 0 4px 10px rgba(15, 23, 42, 0.1);

	.check-icon {
		color: #ffffff;
		font-size: 16px;
		font-weight: 700;
	}
}

.color-name {
	font-size: 11.5px;
	font-weight: 600;
	color: #334155;
}

.color-hint {
	font-size: 9.5px;
	color: #94a3b8;
	line-height: 1;
}

.custom-swatch {
	background: conic-gradient(#f43f5e, #f97316, #eab308, #10b981, #3b82f6, #8b5cf6, #f43f5e);
	overflow: hidden;

	.native-color-input {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		opacity: 0;
		cursor: pointer;
	}

	.custom-icon {
		color: #ffffff;
		font-size: 15px;
		font-weight: 700;
		pointer-events: none;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
	}
}

.reset-wrapper {
	margin-top: 22px;

	.reset-btn {
		height: 38px;
		font-weight: 600;
		color: var(--primary-color, #3b82f6);
		border-color: var(--theme-border-color, rgba(59, 130, 246, 0.28));
		background: var(--theme-soft-bg, rgba(59, 130, 246, 0.08));
	}
}
</style>
