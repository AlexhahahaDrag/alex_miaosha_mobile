<template>
	<div class="org-tree-item">
		<van-cell
			:data-testid="`rbac-org-tree-row-${node.id}`"
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
					class="org-name"
					@click="goDetail"
				>
					{{ node.orgName }}
				</span>
			</template>
			<template #right-icon>
				<van-switch
					:model-value="node.status == '1'"
					size="20"
					:loading="toggling"
					:data-testid="`rbac-org-tree-switch-${node.id}`"
					@update:model-value="onToggleStatus"
				/>
			</template>
		</van-cell>
		<div
			v-if="hasChildren && expanded"
			class="org-tree-children"
		>
			<org-tree-item
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
import type { OrgInfoData } from './config';
import { updateOrgInfo } from '@/views/user/orgInfo/api';

interface Props {
	node: OrgInfoData;
	depth?: number;
}

defineOptions({ name: 'OrgTreeItem' });

const router = useRouter();

const props = withDefaults(defineProps<Props>(), { depth: 0 });
const expanded = ref<boolean>(true);
const toggling = ref<boolean>(false);
const hasChildren = computed(() => !!props.node.children?.length);

const goDetail = () => {
	router.push({ path: '/user/orgInfo/orgInfoDetail', query: { id: props.node.id } });
};

const onToggleStatus = async (checked: boolean) => {
	if (!props.node.id) {
		return;
	}
	toggling.value = true;
	try {
		const nextStatus = checked ? '1' : '0';
		const { code, message } = await updateOrgInfo({ ...props.node, children: undefined, status: nextStatus });
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

const emit = defineEmits(['changed']);
</script>

<style lang="less" scoped>
.org-tree-item {
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

.org-name {
	word-break: break-all;
}

.org-tree-children {
	padding-left: 20px;
	border-left: 1px dashed #ebedf0;
	margin-left: 12px;
}
</style>
