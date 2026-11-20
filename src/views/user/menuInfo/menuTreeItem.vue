<template>
	<div
		class="menu-tree-item"
		:class="[`depth-${depth}`]"
	>
		<van-swipe-cell>
			<van-cell
				:data-testid="`rbac-menu-tree-row-${node.id}`"
				center
				:is-link="false"
				class="menu-node-cell"
			>
				<template #icon>
					<button
						v-if="hasChildren"
						type="button"
						class="expand-btn"
						:class="{ 'is-expanded': expanded }"
						@click.stop="expanded = !expanded"
					>
						<van-icon
							:name="expanded ? 'arrow-down' : 'arrow'"
							class="expand-icon"
						/>
					</button>
					<span
						v-else
						class="leaf-dot"
					></span>
				</template>
				<template #title>
					<div
						class="node-title-wrap"
						@click="goDetail"
					>
						<div class="node-main-row">
							<span class="menu-name">
								{{ node.title || node.name }}
							</span>
							<span
								v-if="hasChildren"
								class="children-count-badge"
							>
								{{ node.children?.length }}
							</span>
						</div>
						<div
							v-if="node.path"
							class="menu-path"
						>
							{{ node.path }}
						</div>
					</div>
				</template>
				<template #right-icon>
					<van-switch
						:model-value="node.status == '1'"
						size="20"
						:loading="toggling"
						:active-color="themeStore.primaryColor"
						:data-testid="`rbac-menu-tree-switch-${node.id}`"
						@update:model-value="onToggleStatus"
					/>
				</template>
			</van-cell>
			<template #right>
				<van-button
					class="right_info"
					square
					type="danger"
					text="删除"
					@click="onDelete"
				/>
			</template>
		</van-swipe-cell>

		<div
			v-if="hasChildren && expanded"
			class="menu-tree-children"
		>
			<menu-tree-item
				v-for="child in node.children"
				:key="child.id"
				:node="child"
				:depth="depth + 1"
				:default-expanded="defaultExpanded"
				:expand-version="expandVersion"
				@changed="$emit('changed')"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
import { showFailToast, showSuccessToast } from 'vant';
import type { MenuInfoData } from '@/views/user/menuInfo/config';
import { updateMenuInfo, deleteMenuInfo } from '@/views/user/menuInfo/api';
import { useThemeStore } from '@/store/modules/theme';

interface Props {
	node: MenuInfoData;
	depth?: number;
	defaultExpanded?: boolean;
	expandVersion?: number;
}

defineOptions({ name: 'MenuTreeItem' });

const router = useRouter();
const themeStore = useThemeStore();

const props = withDefaults(defineProps<Props>(), {
	depth: 0,
	defaultExpanded: true,
	expandVersion: 0,
});

const expanded = ref<boolean>(props.defaultExpanded);
const toggling = ref<boolean>(false);
const hasChildren = computed(() => !!props.node.children?.length);

watch(
	() => props.expandVersion,
	() => {
		expanded.value = props.defaultExpanded;
	},
);

const goDetail = () => {
	router.push({ path: '/user/menuInfo/menuInfoDetail', query: { id: props.node.id } });
};

const onToggleStatus = async (checked: boolean) => {
	if (!props.node.id) {
		return;
	}
	toggling.value = true;
	try {
		const nextStatus = checked ? '1' : '0';
		const { code, message } = await updateMenuInfo({ ...props.node, children: undefined, status: nextStatus });
		if (code === '200') {
			showSuccessToast('状态已更新');
			emit('changed');
		} else {
			showFailToast(message || '状态更新失败，请联系管理员');
		}
	} finally {
		toggling.value = false;
	}
};

const onDelete = async () => {
	if (!props.node.id) {
		return;
	}
	const { code, message } = await deleteMenuInfo(String(props.node.id));
	if (code === '200') {
		showSuccessToast(message || '删除成功');
		emit('changed');
	} else {
		showFailToast(message || '删除失败，请联系管理员');
	}
};

const emit = defineEmits(['changed']);
</script>

<style lang="less" scoped>
.menu-tree-item {
	width: 100%;
}

.menu-node-cell {
	padding: 12px 14px;
	background: #ffffff;
}

.expand-btn {
	width: 24px;
	height: 24px;
	border-radius: 7px;
	border: none;
	background: #f1f5f9;
	color: #64748b;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	margin-right: 10px;
	padding: 0;
	cursor: pointer;
	transition: all 0.15s ease;
	flex-shrink: 0;

	&.is-expanded {
		background: var(--theme-soft-bg, rgba(59, 130, 246, 0.12));
		color: var(--primary-color, #3b82f6);
	}

	.expand-icon {
		font-size: 12px;
	}
}

.leaf-dot {
	display: inline-block;
	width: 6px;
	height: 6px;
	border-radius: 50%;
	background: var(--primary-color, #3b82f6);
	opacity: 0.55;
	margin: 0 13px 0 9px;
	flex-shrink: 0;
}

.node-title-wrap {
	display: flex;
	flex-direction: column;
	gap: 2px;
	min-width: 0;
	cursor: pointer;
}

.node-main-row {
	display: flex;
	align-items: center;
	gap: 6px;
}

.menu-name {
	font-size: 14px;
	font-weight: 600;
	color: #0f172a;
	word-break: break-all;
}

.children-count-badge {
	font-size: 10.5px;
	font-weight: 700;
	padding: 1px 6px;
	border-radius: 9999px;
	background: var(--theme-soft-bg, rgba(59, 130, 246, 0.12));
	color: var(--primary-color, #3b82f6);
	font-variant-numeric: tabular-nums;
}

.menu-path {
	font-size: 11.5px;
	color: #94a3b8;
	font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
	word-break: break-all;
}

.menu-tree-children {
	padding-left: 16px;
	border-left: 1.5px dashed var(--theme-border-color, #e2e8f0);
	margin-left: 24px;
}

.right_info {
	height: 100%;
}
</style>
