<template>
	<div :class="['dialog-category-section', isHighlighted && 'category-highlight-pulse']">
		<div class="section-header">
			<div class="section-title">
				<span>纳入统计分类</span>
				<span class="selected-count">(已选 {{ categoryCodes.length }} 项)</span>
			</div>
			<div
				v-if="canEditBudget"
				class="header-actions"
			>
				<span
					class="action-btn"
					@click="selectAllCategories"
				>全选</span>
				<span class="action-sep">|</span>
				<span
					class="action-btn"
					@click="clearAllCategories"
				>清空</span>
			</div>
		</div>

		<div class="section-sub-label">收支类型 (支持单选或同时勾选)</div>
		<div class="chip-group">
			<div
				:class="[
					'chip-item',
					'chip-item--expense',
					isDirectionSelected('expense') && 'active',
					!canEditBudget && 'chip-item--disabled',
				]"
				@click="toggleDirection('expense')"
			>
				<van-icon
					v-if="isDirectionSelected('expense')"
					name="success"
					class="chip-check"
				/>
				<span>支出 (消费)</span>
			</div>
			<div
				:class="[
					'chip-item',
					'chip-item--income',
					isDirectionSelected('income') && 'active',
					!canEditBudget && 'chip-item--disabled',
				]"
				@click="toggleDirection('income')"
			>
				<van-icon
					v-if="isDirectionSelected('income')"
					name="success"
					class="chip-check"
				/>
				<span>收入</span>
			</div>
		</div>

		<div class="section-sub-label category-sub-label">
			<span>账目类别 (提取自上月及本月)</span>
			<span
				v-if="categoriesLoading"
				class="loading-hint"
			>加载中...</span>
		</div>
		<div
			v-if="recentCategories.length"
			class="chip-group"
		>
			<div
				v-for="cat in recentCategories"
				:key="cat"
				:class="['chip-item', isCategorySelected(cat) && 'active', !canEditBudget && 'chip-item--disabled']"
				@click="toggleCategory(cat)"
			>
				<van-icon
					v-if="isCategorySelected(cat)"
					name="success"
					class="chip-check"
				/>
				<span>{{ cat }}</span>
			</div>
		</div>
		<div
			v-else-if="!categoriesLoading"
			class="empty-category-hint"
		>
			近两月暂无自定义分类流水
		</div>
	</div>
</template>

<script setup lang="ts">
interface Props {
	canEditBudget?: boolean;
	selectedDirections: string[];
	categoryCodes: string[];
	recentCategories: string[];
	categoriesLoading?: boolean;
	isHighlighted?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	canEditBudget: false,
	categoriesLoading: false,
	isHighlighted: false,
});

const emit = defineEmits<{
	(e: 'update:selectedDirections', dirs: string[]): void;
	(e: 'update:categoryCodes', codes: string[]): void;
	(e: 'change'): void;
}>();

const isDirectionSelected = (dir: string) => props.selectedDirections.includes(dir);

const toggleDirection = (dir: string) => {
	if (!props.canEditBudget) return;
	const set = new Set(props.selectedDirections);
	if (set.has(dir)) {
		if (set.size > 1) {
			set.delete(dir);
		}
	} else {
		set.add(dir);
	}
	const updated = Array.from(set);
	emit('update:selectedDirections', updated);
	navigator.vibrate?.(10);
	emit('change');
};

const isCategorySelected = (cat: string) => props.categoryCodes.includes(cat);

const toggleCategory = (cat: string) => {
	if (!props.canEditBudget) return;
	const set = new Set(props.categoryCodes);
	if (set.has(cat)) {
		set.delete(cat);
	} else {
		set.add(cat);
	}
	const updated = Array.from(set);
	emit('update:categoryCodes', updated);
	navigator.vibrate?.(10);
	emit('change');
};

const selectAllCategories = () => {
	if (!props.canEditBudget) return;
	emit('update:categoryCodes', [...props.recentCategories]);
	navigator.vibrate?.(10);
	emit('change');
};

const clearAllCategories = () => {
	if (!props.canEditBudget) return;
	emit('update:categoryCodes', []);
	navigator.vibrate?.(10);
	emit('change');
};
</script>

<style scoped lang="less">
.dialog-category-section {
	margin-bottom: 16px;

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 8px;

		.section-title {
			font-size: 13px;
			font-weight: 600;
			color: #1f2937;

			.selected-count {
				color: #1677ff;
				font-weight: normal;
				margin-left: 4px;
			}
		}

		.header-actions {
			display: flex;
			align-items: center;
			gap: 8px;
			font-size: 12px;
			color: #1677ff;

			.action-btn {
				cursor: pointer;
				padding: 2px 4px;
			}

			.action-sep {
				color: #d1d5db;
			}
		}
	}

	.section-sub-label {
		font-size: 12px;
		color: #6b7280;
		margin-bottom: 6px;
	}

	.category-sub-label {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 10px;

		.loading-hint {
			color: #9ca3af;
			font-size: 11px;
		}
	}

	.empty-category-hint {
		font-size: 12px;
		color: #9ca3af;
		padding: 8px;
		background: #f9fafb;
		border-radius: 6px;
	}
}

.chip-group {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;

	.chip-item {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		padding: 6px 12px;
		background: #f3f4f6;
		border-radius: 16px;
		font-size: 12px;
		color: #4b5563;
		cursor: pointer;
		border: 1px solid transparent;
		transition: all 0.2s ease;

		.chip-check {
			font-size: 12px;
		}

		&.active {
			background: #e6f4ff;
			color: #1677ff;
			border-color: #91caff;
			font-weight: 500;
		}

		&--expense.active {
			background: #fff1f0;
			color: #f5222d;
			border-color: #ffa39e;
		}

		&--income.active {
			background: #f6ffed;
			color: #52c41a;
			border-color: #b7eb8f;
		}

		&--disabled {
			cursor: default;
			opacity: 0.85;
		}
	}
}
</style>
