<template>
	<div class="layout-container">
		<!-- 全局NavBar -->
		<NavBar
			v-if="navBarStore.getNavBarInfo.visible"
			:info="navBarStore.getNavBarInfo"
			@clickRight="handleRightClick"
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
}

.content-container.with-navbar {
	height: calc(100vh - 46px); /* 减去NavBar的高度 */
}
</style>
