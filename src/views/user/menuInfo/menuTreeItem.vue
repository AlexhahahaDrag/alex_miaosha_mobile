<template>
	<div class="menu-tree-item">
		<van-swipe-cell>
			<van-cell
				:data-testid="`rbac-menu-tree-row-${node.id}`"
				center
				:is-link="false"
			>
				<template #icon>
					<van-icon
						v-if="hasChildren"
						:name="expanded ? 'arrow-down' : 'arrow'"
						class="expand-icon"
						@click.stop="expanded = !expanded"
					/>
					<span
						v-else
						class="expand-placeholder"
					></span>
				</template>
				<template #title>
					<span
						class="menu-name"
						@click="goDetail"
					>
						{{ node.title || node.name }}
					</span>
					<span class="menu-path">{{ node.path }}</span>
				</template>
				<template #right-icon>
					<van-switch
						:model-value="node.status == '1'"
						size="20"
						:loading="toggling"
						:data-testid="`rbac-menu-tree-switch-${node.id}`"
						@update:model-value="onToggleStatus"
					/>
				</template>
			</van-cell>
			<template #right>
				<van-button
					class="right_info"
					@click="onDelete"
					square
					type="danger"
					text="删除"
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
				@changed="$emit('changed')"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
import { showFailToast, showSuccessToast } from 'vant';
import type { MenuInfoData } from './config';
import { updateMenuInfo, deleteMenuInfo } from '@/views/user/menuInfo/api';

interface Props {
	node: MenuInfoData;
	depth?: number;
}

defineOptions({ name: 'MenuTreeItem' });

const router = useRouter();

const props = withDefaults(defineProps<Props>(), { depth: 0 });
const expanded = ref<boolean>(true);
const toggling = ref<boolean>(false);
const hasChildren = computed(() => !!props.node.children?.length);

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

.expand-icon {
	margin-right: 4px;
	font-size: 14px;
	color: #969799;
}

.expand-placeholder {
	display: inline-block;
	width: 18px;
}

.menu-name {
	word-break: break-all;
}

.menu-path {
	margin-left: 8px;
	font-size: 12px;
	color: #969799;
}

.menu-tree-children {
	padding-left: 20px;
	border-left: 1px dashed #ebedf0;
	margin-left: 12px;
}

.right_info {
	height: 100%;
}
</style>
