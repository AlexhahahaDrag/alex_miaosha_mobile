<template>
	<div :class="['dialog-category-section', isHighlighted && 'category-highlight-pulse']">
		<div class="section-header">
			<div class="section-title">
				<span>统计分类</span>
				<span class="selected-count">已选 {{ categoryCodes.length }} 项</span>
			</div>
			<div
				v-if="canEditBudget"
				class="header-actions"
			>
				<span
					class="action-btn"
					data-testid="btn-select-all-categories"
					@click="selectAllCategories"
				>全选</span>
				<span class="action-sep">|</span>
				<span
					class="action-btn"
					data-testid="btn-clear-categories"
					@click="clearAllCategories"
				>清空</span>
			</div>
		</div>

		<div class="section-sub-label">统计方向</div>
		<div class="chip-group chip-group--direction">
			<div
				:class="[
					'chip-item',
					'chip-item--expense',
					isDirectionSelected('expense') && 'active',
					!canEditBudget && 'chip-item--disabled',
				]"
				data-testid="chip-direction-expense"
				@click="toggleDirection('expense')"
			>
				<van-icon
					v-if="isDirectionSelected('expense')"
					name="success"
					class="chip-check"
				/>
				<span>支出</span>
			</div>
			<div
				:class="[
					'chip-item',
					'chip-item--income',
					isDirectionSelected('income') && 'active',
					!canEditBudget && 'chip-item--disabled',
				]"
				data-testid="chip-direction-income"
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
			<span>账目分类</span>
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
				:data-testid="'chip-category-' + cat"
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
			近两月暂无分类账单
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
		margin-bottom: 10px;

		.section-title {
			display: flex;
			align-items: center;
			gap: 6px;
			font-size: 14px;
			font-weight: 600;
			color: #0f172a;

			.selected-count {
				font-size: 11px;
				color: #4f6af6;
				background: #eef2ff;
				font-weight: 600;
				padding: 2px 7px;
				border-radius: 999px;
			}
		}

		.header-actions {
			display: flex;
			align-items: center;
			gap: 8px;
			font-size: 12px;
			font-weight: 500;
			color: #4f6af6;

			.action-btn {
				cursor: pointer;
				padding: 2px 4px;
			}

			.action-sep {
				color: #cbd5e1;
			}
		}
	}

	.section-sub-label {
		font-size: 12px;
		color: #64748b;
		margin-bottom: 8px;
	}

	.category-sub-label {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 12px;

		.loading-hint {
			color: #94a3b8;
			font-size: 11px;
		}
	}

	.empty-category-hint {
		font-size: 12px;
		color: #94a3b8;
		padding: 10px 12px;
		background: #f8fafc;
		border-radius: 10px;
	}
}

.chip-group {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;

	&--direction {
		display: grid;
		grid-template-columns: repeat(2, 1fr);

		.chip-item {
			justify-content: center;
			padding: 8px 12px;
			border-radius: 10px;
		}
	}

	.chip-item {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		padding: 6px 12px;
		background: #f1f5f9;
		border-radius: 999px;
		font-size: 12px;
		color: #475569;
		cursor: pointer;
		border: 1px solid transparent;
		transition:
			background-color 0.2s ease,
			color 0.2s ease;

		.chip-check {
			font-size: 12px;
		}

		&.active {
			background: #eef2ff;
			color: #4f6af6;
			font-weight: 600;
		}

		&--expense.active {
			background: #fff1f2;
			color: #e11d48;
		}

		&--income.active {
			background: #ecfdf5;
			color: #059669;
		}

		&--disabled {
			cursor: default;
			opacity: 0.85;
		}
	}
}
</style>
