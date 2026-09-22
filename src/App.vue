<template>
	<van-config-provider
		:theme="themeStore.isDark ? 'dark' : 'light'"
		:theme-vars="themeVars"
	>
		<router-view></router-view>
	</van-config-provider>
</template>

<script setup lang="ts">
import { useThemeStore } from '@/store/modules/theme';

document.title = import.meta.env.VITE_APP_TITLE || '默认标题';

const themeStore = useThemeStore();

const themeVars = computed(() => ({
	primaryColor: themeStore.primaryColor,
}));

onMounted(() => {
	themeStore.initTheme();
});
</script>
