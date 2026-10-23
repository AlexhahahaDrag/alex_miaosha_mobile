<template>
	<div class="layout-container">
		<!-- 全局NavBar -->
		<nav-bar
			v-if="navBarInfo.visible"
			:info="navBarInfo"
			@click-right="handleRightClick"
		/>

		<!-- 页面内容 -->
		<div
			class="content-container"
			:class="{
				'with-tabbar': tabBarInfo.visible,
			}"
		>
			<router-view />
		</div>

		<!-- 全局TabBar -->
		<tab-bar
			v-if="tabBarInfo.visible"
			v-bind="tabBarInfo"
		/>
	</div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useNavBarStore } from '@/store/modules/navbar';
import { useTabBarStore } from '@/store/modules/tabbar';

const navBarStore = useNavBarStore();
const tabBarStore = useTabBarStore();
const { getNavBarInfo: navBarInfo, getRightClickHandler } = storeToRefs(navBarStore);
const { getTabBarInfo: tabBarInfo } = storeToRefs(tabBarStore);

const handleRightClick = () => {
	const handler = getRightClickHandler.value;
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
