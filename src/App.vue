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
import { useUserStore } from '@/store/modules/user/user';

document.title = import.meta.env.VITE_APP_TITLE || '默认标题';

const themeStore = useThemeStore();
const userStore = useUserStore();

const themeVars = computed(() => ({
	primaryColor: themeStore.primaryColor,
}));

onMounted(() => {
	if (userStore.getUserInfo) {
		themeStore.syncUserTheme(
			userStore.getUserInfo as { id?: string | number; username?: string; gender?: string | number | null },
		);
	}
	themeStore.initTheme();
});
</script>
