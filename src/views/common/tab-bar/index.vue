<template>
	curActive:{{ curActive }}
	<van-tabbar
		v-model="curActive"
		route
		active-color="#1989fa"
	>
		<van-tabbar-item
			v-for="(item, index) in props.data"
			:icon="item.icon"
			:to="item.to"
			:name="item.name"
			:key="index"
		>
			{{ item.title }}
		</van-tabbar-item>
	</van-tabbar>
</template>

<script lang="ts" setup>
import type { TabBarInfo } from '@/composables/useTabBar';

const curActive = ref<string | number>(0);

const props = defineProps<TabBarInfo>();

console.log('props sssssssssssssccccccccccccccccccccc:', props);
</script>
