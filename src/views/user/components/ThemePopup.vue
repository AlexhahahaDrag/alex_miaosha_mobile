<template>
	<van-popup
		v-model:show="visible"
		position="bottom"
		round
		closeable
		class="theme-popup"
	>
		<div class="theme-popup-content">
			<div class="popup-title">个性化主题</div>

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
				<div class="section-title">系统主题色</div>
				<div class="color-grid">
					<div
						v-for="color in presetColors"
						:key="color.value"
						class="color-item"
						:class="{ active: themeStore.primaryColor.toLowerCase() === color.value.toLowerCase() }"
						:style="{ backgroundColor: color.value }"
						:title="color.name"
						@click="onSelectColor(color.value)"
					>
						<van-icon
							v-if="themeStore.primaryColor.toLowerCase() === color.value.toLowerCase()"
							name="success"
							class="check-icon"
						/>
					</div>

					<!-- 原生自选调色盘 -->
					<div
						class="color-item custom-color-item"
						:class="{ active: isCustomColor }"
						title="自定义调色"
					>
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
					</div>
				</div>
			</div>

			<!-- 恢复默认 -->
			<div class="reset-wrapper">
				<van-button
					plain
					block
					round
					size="small"
					class="reset-btn"
					@click="onResetDefault"
				>
					恢复默认主题
				</van-button>
			</div>
		</div>
	</van-popup>
</template>

<script setup lang="ts">
import { useThemeStore, DEFAULT_PRIMARY_COLOR } from '@/store/modules/theme';

const props = defineProps<{
	show: boolean;
}>();

const emit = defineEmits<{
	(e: 'update:show', val: boolean): void;
}>();

const themeStore = useThemeStore();

const visible = computed({
	get: () => props.show,
	set: (val: boolean) => emit('update:show', val),
});

const presetColors = [
	{ name: '拂晓蓝', value: '#1989fa' },
	{ name: '极光绿', value: '#07c160' },
	{ name: '活力橙', value: '#ff976a' },
	{ name: '珊瑚红', value: '#ee0a24' },
	{ name: '极客紫', value: '#7232dd' },
	{ name: '炫酷青', value: '#13c2c2' },
];

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
	themeStore.setPrimaryColor(color);
};

const onCustomColorInput = (e: Event) => {
	const val = (e.target as HTMLInputElement).value;
	if (val) {
		themeStore.setPrimaryColor(val);
	}
};

const onResetDefault = () => {
	triggerHaptic();
	themeStore.setPrimaryColor(DEFAULT_PRIMARY_COLOR);
	themeStore.toggleDark(false);
};
</script>

<style scoped lang="less">
.theme-popup {
	max-height: 70vh;
}

.theme-popup-content {
	padding: 24px 20px 32px;
}

.popup-title {
	font-size: 17px;
	font-weight: 600;
	text-align: center;
	margin-bottom: 20px;
	color: var(--text-primary, #323233);
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
		color: var(--text-primary, #323233);

		.row-icon {
			font-size: 18px;
			color: var(--primary-color, #1989fa);
		}
	}
}

.color-section {
	margin-top: 10px;

	.section-title {
		font-size: 14px;
		color: var(--text-secondary, #646566);
		margin-bottom: 14px;
	}

	.color-grid {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 16px;
	}

	.color-item {
		position: relative;
		width: 38px;
		height: 38px;
		border-radius: 50%;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
		transition: transform 0.2s ease;

		&:active {
			transform: scale(0.92);
		}

		&.active {
			outline: 2.5px solid var(--primary-color, #1989fa);
			outline-offset: 2.5px;
		}

		.check-icon {
			color: #ffffff;
			font-size: 18px;
			font-weight: bold;
		}
	}

	.custom-color-item {
		background: conic-gradient(from 90deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000);
		position: relative;
		overflow: hidden;

		.native-color-input {
			position: absolute;
			top: -10px;
			left: -10px;
			width: 60px;
			height: 60px;
			opacity: 0;
			cursor: pointer;
		}

		.custom-icon {
			color: #ffffff;
			font-size: 16px;
			text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
			pointer-events: none;
		}
	}
}

.reset-wrapper {
	margin-top: 28px;

	.reset-btn {
		color: var(--text-secondary, #646566);
		border-color: var(--border-color, #ebedf0);
	}
}
</style>
