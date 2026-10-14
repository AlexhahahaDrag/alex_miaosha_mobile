<template>
	<div class="category-grid-card">
		<div class="card-header-bar">
			<span class="header-title">选择记账分类</span>
			<span
				v-if="dynamicCategories && dynamicCategories.length"
				class="header-hint"
			>已融合常用历史分类</span>
		</div>

		<div class="category-grid">
			<div
				v-for="cat in activeCategoryList"
				:key="cat.name"
				:class="['category-cell', { active: modelValue === cat.name }]"
				@click="selectCategory(cat)"
			>
				<div
					class="cat-icon-bubble"
					:style="{
						backgroundColor: modelValue === cat.name ? cat.color : cat.bgColor,
						color: modelValue === cat.name ? '#ffffff' : cat.color,
					}"
				>
					<van-icon
						:name="cat.icon"
						class="cat-icon"
					/>
				</div>
				<span class="cat-label">{{ cat.name }}</span>
			</div>

			<!-- 自定义分类卡片 -->
			<div
				class="category-cell custom-cell"
				@click="openCustomCategoryDialog"
			>
				<div class="cat-icon-bubble custom-bubble">
					<van-icon
						name="plus"
						class="cat-icon"
					/>
				</div>
				<span class="cat-label">自定义</span>
			</div>
		</div>

		<!-- 自定义分类录入弹窗 -->
		<van-dialog
			v-model:show="showCustomCatDialog"
			title="新增自定义分类"
			show-cancel-button
			@confirm="confirmCustomCategory"
		>
			<div class="custom-cat-dialog-box">
				<van-field
					v-model="customCatInput"
					placeholder="例如: 宠物/外卖/健身"
					maxlength="10"
					clearable
				/>
			</div>
		</van-dialog>
	</div>
</template>

<script setup lang="ts">
import {
	expensePresets,
	incomePresets,
	type CategoryItem,
} from '@/views/finance/financeManager/financeManagerDetail/types';

const props = withDefaults(
	defineProps<{
		modelValue?: string;
		direction?: 'expense' | 'income';
		dynamicCategories?: string[];
	}>(),
	{
		modelValue: '',
		direction: 'expense',
		dynamicCategories: () => [],
	},
);

const emit = defineEmits<{
	(e: 'update:modelValue', val: string): void;
	(e: 'select', cat: CategoryItem): void;
}>();

const showCustomCatDialog = ref<boolean>(false);
const customCatInput = ref<string>('');
const localCustomCategories = ref<string[]>([]);

const activeCategoryList = computed<CategoryItem[]>(() => {
	const baseList = props.direction === 'income' ? incomePresets : expensePresets;
	const existingNames = new Set(baseList.map((item) => item.name));
	const extra: CategoryItem[] = [];

	const allDynamic = [...localCustomCategories.value, ...(props.dynamicCategories || [])];
	for (const cat of allDynamic) {
		if (cat && !existingNames.has(cat)) {
			extra.push({
				name: cat,
				icon: 'apps-o',
				color: '#1677ff',
				bgColor: '#eff6ff',
			});
			existingNames.add(cat);
		}
	}

	// 如果当前选择的分类不在列表中，也动态追加
	if (props.modelValue && !existingNames.has(props.modelValue)) {
		extra.unshift({
			name: props.modelValue,
			icon: 'apps-o',
			color: '#1677ff',
			bgColor: '#eff6ff',
		});
	}

	return [...extra, ...baseList];
});

const selectCategory = (cat: CategoryItem) => {
	navigator.vibrate?.(10);
	emit('update:modelValue', cat.name);
	emit('select', cat);
};

const openCustomCategoryDialog = () => {
	customCatInput.value = '';
	showCustomCatDialog.value = true;
};

const confirmCustomCategory = () => {
	const name = customCatInput.value.trim();
	if (name) {
		if (!localCustomCategories.value.includes(name)) {
			localCustomCategories.value.unshift(name);
		}
		selectCategory({
			name,
			icon: 'apps-o',
			color: '#1677ff',
			bgColor: '#eff6ff',
		});
	}
};
</script>

<style lang="less" scoped>
.category-grid-card {
	background: #ffffff;
	border-radius: 16px;
	padding: 12px 12px 14px;
	border: 1px solid #f1f5f9;
	box-shadow: 0 2px 6px rgba(15, 23, 42, 0.03);

	.card-header-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 10px;
		padding: 0 4px;

		.header-title {
			font-size: 13px;
			font-weight: 600;
			color: #334155;
		}

		.header-hint {
			font-size: 11px;
			color: #3b82f6;
		}
	}

	.category-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 12px 6px;

		.category-cell {
			display: flex;
			flex-direction: column;
			align-items: center;
			cursor: pointer;
			transition: transform 0.15s ease;

			&:active {
				transform: scale(0.92);
			}

			.cat-icon-bubble {
				width: 44px;
				height: 44px;
				border-radius: 50%;
				display: flex;
				align-items: center;
				justify-content: center;
				margin-bottom: 4px;
				transition: all 0.2s ease;

				.cat-icon {
					font-size: 22px;
				}
			}

			.cat-label {
				font-size: 12px;
				color: #475569;
				line-height: 1.2;
				text-align: center;
				max-width: 60px;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}

			&.active {
				.cat-icon-bubble {
					transform: scale(1.08);
					box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
				}

				.cat-label {
					color: #0f172a;
					font-weight: 600;
				}
			}

			&.custom-cell {
				.custom-bubble {
					background: #f1f5f9;
					color: #94a3b8;
					border: 1px dashed #cbd5e1;
				}
			}
		}
	}
}

.custom-cat-dialog-box {
	padding: 12px 16px;
}
</style>
