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
			:class="{ 'with-navbar': navBarStore.getNavBarInfo.visible }"
		>
			<router-view />
		</div>
	</div>
</template>

<script setup lang="ts">
import { useNavBarStore } from '@/store/modules/navbar';
import NavBar from '@/views/common/navBar/index.vue';

const navBarStore = useNavBarStore();

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

.content-container.with-navbar {
	/* NavBar存在时，内容区域高度需要减去NavBar高度 */
	height: calc(100vh - 46px);
}
</style>
