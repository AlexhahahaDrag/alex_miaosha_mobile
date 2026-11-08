<template>
	<section
		v-show="show"
		class="common-filter-panel"
	>
		<div class="filter-sections-scroll">
			<div
				v-for="section in sections"
				:key="section.key"
				class="filter-section"
			>
				<div class="filter-label">
					<van-icon
						v-if="section.icon"
						:name="section.icon"
						class="label-icon"
					/>
					{{ section.label }}
				</div>
				<div class="chip-group">
					<button
						v-for="option in section.options"
						:key="`${section.key}-${option.value}`"
						type="button"
						:class="['chip', { 'chip--active': isSelected(section, option.value) }]"
						@click="onSelect(section, option.value)"
					>
						{{ option.text || option.label }}
					</button>
				</div>
			</div>
		</div>

		<div class="filter-actions">
			<slot name="actions">
				<van-button
					plain
					round
					class="action-btn action-btn--reset"
					@click="$emit('reset')"
				>
					重置
				</van-button>
				<van-button
					round
					type="primary"
					class="action-btn action-btn--submit"
					@click="$emit('submit')"
				>
					完成筛选
				</van-button>
			</slot>
		</div>
	</section>
</template>

<script setup lang="ts">
export interface FilterOption {
	text?: string;
	label?: string;
	value: unknown;
}

export interface FilterSection {
	label: string;
	icon?: string;
	key: string;
	options: FilterOption[];
}

const props = defineProps<{
	show: boolean;
	sections: FilterSection[];
	modelValue: Record<string, unknown>;
	activeMap?: Record<string, unknown>; // 专门用于处理类似 activeTimePreset 这种不直接在 modelValue 中的状态
}>();

const emit = defineEmits(['update:modelValue', 'select', 'reset', 'submit']);

// 判断选项是否处于激活状态
const isSelected = (section: FilterSection, value: unknown) => {
	// 1. 如果存在外部指定的 activeMap 映射，优先使用
	if (props.activeMap && section.key in props.activeMap) {
		return props.activeMap[section.key] === value;
	}

	// 2. 默认对比 modelValue 中的值
	const current = props.modelValue[section.key];

	// 处理类型不匹配的情况（例如外部的值是数字，但 option 的 value 是字符串）
	if (typeof current === 'number' && typeof value === 'string') {
		return String(current) === value;
	}

	return current === value;
};

// 选择操作，向外抛出自定义事件
const onSelect = (section: FilterSection, value: unknown) => {
	emit('select', { key: section.key, value });
};
</script>

<style scoped lang="less">
.common-filter-panel {
	display: flex;
	flex-direction: column;
	flex-shrink: 1;
	min-height: 0;
	max-height: min(54vh, calc(100vh - 230px));
	margin: 8px 12px 10px;
	padding: 14px 8px 14px 14px;
	background: #ffffff;
	border-radius: 18px;
	box-shadow: 0 8px 24px rgba(15, 56, 120, 0.06);
	overflow: hidden;

	@supports (height: 100dvh) {
		max-height: min(54dvh, calc(100dvh - 230px));
	}
}

.filter-sections-scroll {
	flex: 1;
	min-height: 0;
	overflow-y: auto;
	overflow-x: hidden;
	padding-right: 6px;
	-webkit-overflow-scrolling: touch;
	overscroll-behavior: contain;
	scrollbar-width: thin;
	scrollbar-color: #cbd5e1 #f8fafc;

	&::-webkit-scrollbar {
		width: 5px;
	}

	&::-webkit-scrollbar-track {
		background: #f8fafc;
		border-radius: 999px;
	}

	&::-webkit-scrollbar-thumb {
		background: #cbd5e1;
		border-radius: 999px;
	}

	&::-webkit-scrollbar-thumb:hover,
	&::-webkit-scrollbar-thumb:active {
		background: #94a3b8;
	}
}

.filter-section {
	& + .filter-section {
		margin-top: 14px;
	}
}

.filter-label {
	display: flex;
	align-items: center;
	gap: 6px;
	margin-bottom: 10px;
	font-size: 13px;
	font-weight: 600;
	color: #25324a;

	.label-icon {
		color: #1677ff;
		font-size: 15px;
	}
}

.chip-group {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
}

.chip {
	border: 1px solid #e7edf6;
	background: #f8fafc;
	border-radius: 10px;
	padding: 7px 12px;
	font-size: 12px;
	line-height: 1;
	color: #52617a;
	transition: all 0.2s ease;
	cursor: pointer;

	&--active {
		color: #ffffff;
		background: linear-gradient(135deg, #3e8cff 0%, #1677ff 100%);
		border-color: transparent;
		box-shadow: 0 6px 12px rgba(22, 119, 255, 0.2);
	}
}

.filter-actions {
	flex-shrink: 0;
	display: grid;
	grid-template-columns: 96px 1fr;
	gap: 10px;
	margin-top: 12px;
	padding-top: 12px;
	padding-right: 6px;
	border-top: 1px solid #f1f5f9;
}

.action-btn {
	height: 40px;
	border-radius: 12px;
}
</style>
