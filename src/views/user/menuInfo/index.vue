<template>
	<div class="menu-page">
		<van-divider
			:style="{
				color: '#1989fa',
				borderColor: 'grey',
			}"
		></van-divider>
		<van-empty
			v-if="!loading && treeData.length == 0"
			description="暂无数据"
		></van-empty>
		<van-cell-group
			v-else
			data-testid="rbac-menu-tree"
		>
			<menu-tree-item
				v-for="node in treeData"
				:key="node.id"
				:node="node"
				@changed="refresh"
			/>
		</van-cell-group>
	</div>
	<van-back-top></van-back-top>
</template>
<script lang="ts" setup>
import { showFailToast } from 'vant';
import { useNavBar } from '@/composables/useNavBar';
import { getMenuInfoTree } from '@/views/user/menuInfo/api';
import type { MenuInfoData } from '@/views/user/menuInfo/config';

const router = useRouter();
const route = useRoute();
useNavBar({
	title: (route?.meta?.title as string) || '菜单管理',
	rightIcon: 'plus',
	leftPath: '/',
	visible: true,
	onRightClick: () => {
		router.push({ path: '/user/menuInfo/menuInfoDetail' });
	},
});

const loading = ref<boolean>(false);
const treeData = ref<MenuInfoData[]>([]);

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

void refresh();
</script>

<style lang="less" scoped>
.menu-page {
	padding-bottom: 24px;
}
</style>
