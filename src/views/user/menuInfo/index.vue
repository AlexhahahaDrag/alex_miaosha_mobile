<template>
	<div class="menu-page">
		<!-- 顶部概览与检索控制卡（主题色 --xxx 驱动） -->
		<section class="menu-toolbar-card">
			<div class="toolbar-meta-row">
				<div class="meta-badges">
					<span class="meta-pill">一级目录 {{ rootCount }}</span>
					<span class="meta-pill">总节点 {{ totalNodeCount }}</span>
				</div>
				<button
					type="button"
					class="toggle-all-btn"
					data-testid="rbac-menu-btn-toggle-all"
					@click="toggleExpandAll"
				>
					<van-icon :name="expandAll ? 'arrow-up' : 'arrow-down'" />
					<span>{{ expandAll ? '全部折叠' : '全部展开' }}</span>
				</button>
			</div>

			<van-search
				v-model="searchKeyword"
				placeholder="搜索菜单名称或路由路径"
				shape="round"
				clearable
				class="menu-search"
				data-testid="rbac-menu-search"
			/>
		</section>

		<!-- 加载态骨架屏 -->
		<section
			v-if="loading"
			class="menu-skeleton-list"
			data-testid="menu-tree-skeleton"
		>
			<div
				v-for="idx in 4"
				:key="`menu-sk-${idx}`"
				class="sk-group-card"
			>
				<div class="sk-row">
					<div class="shimmer-bar sk-icon"></div>
					<div class="sk-text">
						<div class="shimmer-bar sk-w-110 sk-h-15"></div>
						<div class="shimmer-bar sk-w-150 sk-h-11 sk-mt-6"></div>
					</div>
					<div class="shimmer-bar sk-switch"></div>
				</div>
			</div>
		</section>

		<!-- 空状态 -->
		<div
			v-else-if="filteredTreeData.length === 0"
			class="empty-card"
		>
			<van-empty :description="searchKeyword ? '未找到匹配的菜单项' : '暂无菜单数据'" />
		</div>

		<!-- 树形菜单卡片流 -->
		<div
			v-else
			class="menu-tree-list"
			data-testid="rbac-menu-tree"
		>
			<div
				v-for="node in filteredTreeData"
				:key="node.id"
				class="menu-root-card"
			>
				<menu-tree-item
					:node="node"
					:default-expanded="expandAll"
					:expand-version="expandVersion"
					@changed="refresh"
				/>
			</div>
		</div>

		<van-back-top />
	</div>
</template>

<script lang="ts" setup>
import { showFailToast } from 'vant';
import { useNavBar } from '@/composables/useNavBar';
import { useTabBar } from '@/composables/useTabBar';
import { getMenuInfoTree } from '@/views/user/menuInfo/api';
import type { MenuInfoData } from '@/views/user/menuInfo/config';
import MenuTreeItem from '@/views/user/menuInfo/menuTreeItem.vue';

const router = useRouter();
const route = useRoute();

useNavBar({
	title: (route?.meta?.title as string) || '个人菜单管理',
	rightIcon: 'plus',
	leftPath: '/',
	visible: true,
	onRightClick: () => {
		router.push({ path: '/user/menuInfo/menuInfoDetail' });
	},
});

useTabBar({ visible: false });

const loading = ref<boolean>(false);
const treeData = ref<MenuInfoData[]>([]);
const searchKeyword = ref<string>('');
const expandAll = ref<boolean>(true);
const expandVersion = ref<number>(0);

const toggleExpandAll = () => {
	expandAll.value = !expandAll.value;
	expandVersion.value += 1;
};

const countNodes = (nodes: MenuInfoData[]): number => {
	let count = 0;
	for (const n of nodes) {
		count += 1;
		if (n.children?.length) {
			count += countNodes(n.children);
		}
	}
	return count;
};

const rootCount = computed(() => treeData.value.length);
const totalNodeCount = computed(() => countNodes(treeData.value));

// 非破坏性树过滤（不污染原始 children 引用）
const filterMenuTree = (nodes: MenuInfoData[], kw: string): MenuInfoData[] => {
	if (!kw) return nodes;
	const lower = kw.toLowerCase();
	const result: MenuInfoData[] = [];
	for (const node of nodes) {
		const titleMatch = String(node.title || node.name || '')
			.toLowerCase()
			.includes(lower);
		const pathMatch = String(node.path || '')
			.toLowerCase()
			.includes(lower);
		const matchedChildren = node.children?.length ? filterMenuTree(node.children, kw) : [];
		if (titleMatch || pathMatch || matchedChildren.length > 0) {
			result.push({
				...node,
				children: matchedChildren.length > 0 ? matchedChildren : node.children,
			});
		}
	}
	return result;
};

const filteredTreeData = computed(() => filterMenuTree(treeData.value, searchKeyword.value.trim()));

// RBAC-MB-MENU-001：消费后端 /menu-info/tree 做层级展示/下钻，与登录态 menu_all_tree 隔离
async function refresh() {
	loading.value = true;
	try {
		const { code, data, message } = await getMenuInfoTree();
		if (code === '200') {
			treeData.value = data || [];
		} else {
			showFailToast(message || '查询菜单层级失败，请联系管理员！');
		}
	} finally {
		loading.value = false;
	}
}

onMounted(() => {
	void refresh();
});
</script>

<style lang="less" scoped>
.menu-page {
	min-height: 100%;
	background: var(--theme-login-bg, #f6f8fb);
	padding: 12px 14px calc(24px + env(safe-area-inset-bottom));
	box-sizing: border-box;
	transition: background 0.3s ease;
}

.menu-toolbar-card {
	background: #ffffff;
	border-radius: 16px;
	padding: 12px 14px 10px;
	margin-bottom: 12px;
	box-shadow: 0 2px 10px rgba(15, 23, 42, 0.04);

	.toolbar-meta-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 10px;
	}

	.meta-badges {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.meta-pill {
		font-size: 11.5px;
		font-weight: 600;
		padding: 3px 10px;
		border-radius: 9999px;
		background: var(--theme-soft-bg, rgba(59, 130, 246, 0.12));
		color: var(--primary-color, #3b82f6);
		font-variant-numeric: tabular-nums;
	}

	.toggle-all-btn {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		border: 1px solid var(--theme-border-color, rgba(59, 130, 246, 0.28));
		background: #ffffff;
		color: var(--primary-color, #3b82f6);
		font-size: 12px;
		font-weight: 600;
		padding: 4px 10px;
		border-radius: 9999px;
		cursor: pointer;
		transition: all 0.15s ease;

		&:active {
			background: var(--theme-soft-bg, rgba(59, 130, 246, 0.12));
			transform: scale(0.96);
		}
	}

	.menu-search {
		padding: 0;

		:deep(.van-search__content) {
			background: #f8fafc;
			border-radius: 12px;
		}
	}
}

.menu-tree-list {
	display: flex;
	flex-direction: column;
	gap: 10px;
}

.menu-root-card {
	background: #ffffff;
	border-radius: 16px;
	overflow: hidden;
	box-shadow: 0 2px 10px rgba(15, 23, 42, 0.04);
}

.empty-card {
	background: #ffffff;
	border-radius: 16px;
	padding: 24px 12px;
	box-shadow: 0 2px 10px rgba(15, 23, 42, 0.03);
}

.menu-skeleton-list {
	display: flex;
	flex-direction: column;
	gap: 10px;

	.sk-group-card {
		background: #ffffff;
		border-radius: 16px;
		padding: 14px 16px;
		box-shadow: 0 2px 10px rgba(15, 23, 42, 0.03);
	}

	.sk-row {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.sk-icon {
		width: 32px;
		height: 32px;
		border-radius: 10px;
		flex-shrink: 0;
	}

	.sk-text {
		flex: 1;
	}

	.sk-switch {
		width: 40px;
		height: 22px;
		border-radius: 9999px;
		flex-shrink: 0;
	}
}

.shimmer-bar {
	background: #eef2f7;
	border-radius: 6px;
	animation: menuPulse 1.4s ease-in-out infinite;
}

.sk-w-110 {
	width: 110px;
}
.sk-w-150 {
	width: 150px;
}
.sk-h-15 {
	height: 15px;
}
.sk-h-11 {
	height: 11px;
}
.sk-mt-6 {
	margin-top: 6px;
}

@keyframes menuPulse {
	0%,
	100% {
		opacity: 1;
	}
	50% {
		opacity: 0.45;
	}
}
</style>
