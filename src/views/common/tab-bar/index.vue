<template>
	<van-tabbar
		v-model="curActive"
		route
		active-color="#1989fa"
		inactive-color="#969799"
		class="custom-tab-bar"
	>
		<van-tabbar-item
			v-for="(item, index) in tabBarData"
			:to="item.to"
			:name="item?.name || ''"
			:key="index"
		>
			<template #icon="props">
				<svg-icon
					:name="item.icon"
					:color="props.active ? '#1989fa' : '#969799'"
					class="tab-icon"
				/>
			</template>
			<template #default="props">
				<span
					class="tab-title"
					:class="{ 'active-title': props.active }"
				>
					{{ item.title }}
				</span>
			</template>
		</van-tabbar-item>
	</van-tabbar>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router';
import type { TabBarInfo } from '@/composables/useTabBar';

const router = useRouter();

const curActive = ref<string | number>(0);

const props = defineProps<TabBarInfo>();

const tabBarData = computed(() => {
	const allRoutes = router.getRoutes();
	return (props.data || [])
		.map((item) => {
			const itemName = typeof item === 'string' ? item : item.name;
			const targetRoute = allRoutes.find((r) => r.name === itemName);
			if (targetRoute) {
				return {
					name: targetRoute.name as string,
					path: targetRoute.path,
					to: targetRoute.path,
					title: (typeof item !== 'string' && item.title) || (targetRoute.meta?.title as string) || '',
					icon: (typeof item !== 'string' && item.icon) || (targetRoute.meta?.icon as string) || '',
				};
			}
			return null;
		})
		.filter((item): item is NonNullable<typeof item> => item !== null);
});
</script>

<style lang="less" scoped>
.custom-tab-bar {
	height: 50px;
	border-top: 1px solid #ebedf0;
}

.tab-icon {
	width: 24px;
	height: 24px;
	margin-bottom: 2px;
}

.tab-title {
	font-size: 12px;
	transition: all 0.3s;
}

.active-title {
	font-weight: bold;
	font-size: 13px;
}

:deep(.van-tabbar-item__icon) {
	margin-bottom: 2px;
}
</style>
