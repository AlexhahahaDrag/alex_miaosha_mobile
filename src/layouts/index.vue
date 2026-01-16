<template>
	<div class="layout-container">
		<!-- 全局NavBar -->
		<nav-bar
			v-if="navBarStore.getNavBarInfo.visible"
			:info="navBarStore.getNavBarInfo"
			@click-right="handleRightClick"
		/>

		<!-- 页面内容 -->
		<div
			class="content-container"
			:class="{
				'with-tabbar': tabBarStore.getTabBarInfo.visible,
			}"
		>
			<router-view />
		</div>

		<!-- 全局TabBar -->
		<tab-bar
			v-if="tabBarStore.getTabBarInfo.visible"
			v-bind="tabBarStore.getTabBarInfo"
		/>
	</div>
</template>

<script setup lang="ts">
import { useNavBarStore } from '@/store/modules/navbar';
import { useTabBarStore } from '@/store/modules/tabbar';

const navBarStore = useNavBarStore();
const tabBarStore = useTabBarStore();
console.log('tabBarStore.getTabBarInfo ooooooooooooooooooo:', tabBarStore.getTabBarInfo);
console.log('tabBarStore.getNavBarInfo ooooooooooooooooooo:', navBarStore.getNavBarInfo);
const handleRightClick = () => {
	const handler = navBarStore.getRightClickHandler;
	if (handler) {
		handler();
	}
};
</script>

<style scoped>
.layout-container {
	height: 100vh;
	display: flex;
	flex-direction: column;
}

.content-container {
	flex: 1;
	overflow-y: auto;
	/* 确保有明确的高度限制 */
	height: 0;
}

.content-container.with-tabbar {
	/* TabBar存在时，内容区域高度需要减去TabBar高度(50px) */
	/* Note: Flex layout handles top navbar naturally.
	   Standard van-tabbar is fixed at bottom, so we add padding-bottom to prevent content cover.
	*/
	padding-bottom: 50px;
}
</style>
