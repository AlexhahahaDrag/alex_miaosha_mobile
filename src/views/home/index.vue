<template>
	<div>
		<van-grid
			:column-num="3"
			:square="true"
		>
			<van-grid-item
				v-for="item in homeList"
				:key="item?.name || ''"
				:text="item?.meta?.title?.toString() || ''"
				:to="item.path"
			>
				<svg-icon
					class="homeSvgClass"
					:name="item?.meta?.icon?.toString() || ''"
				>
				</svg-icon>
				<span class="homeFontClass">{{ item?.meta?.title?.toString() || '' }}</span>
			</van-grid-item>
		</van-grid>
	</div>
</template>

<script setup lang="ts">
import type { RouteRecordRaw } from 'vue-router';
import { useNavBar } from '@/composables/useNavBar';
import { useTabBar } from '@/composables/useTabBar';

const route = useRoute();
const router = useRouter();
const homeList = ref<RouteRecordRaw[]>([]);

// 使用新的NavBar系统
useNavBar({
	title: (route?.meta?.title as string) || '财务明细',
	noShowLeft: true,
	showRight: false,
	visible: true,
});

useTabBar({
	visible: true,
	data: [
		{ name: 'dashboard', title: '首页', icon: 'homepage' },
		{ name: 'message', title: '消息', icon: 'message' },
		{ name: 'myself', title: '个人', icon: 'user' },
	],
	active: 0,
});

// 获取主页数据
const getHomeList = (arr: readonly RouteRecordRaw[] | null): RouteRecordRaw[] => {
	return (arr || []).flatMap((item) => [
		...(item.meta?.showInHome ? [item] : []),
		...(item.children ? getHomeList(item.children) : []),
	]);
};

// 初始化数据
const init = () => {
	homeList.value = getHomeList(router?.options?.routes || []);
};

init();
</script>

<style lang="less" scoped>
.homeSvgClass {
	height: 80%;
	width: 80%;
	font-size: 18px;
	cursor: pointer;
	vertical-align: middle;
}

.homeFontClass {
	margin-top: 8px;
	margin-bottom: 8px;
	color: darkgray;
	font-weight: bold;
	font-size: 14px;
}
</style>
