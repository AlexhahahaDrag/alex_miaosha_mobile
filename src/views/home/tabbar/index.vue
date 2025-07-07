<template>
	<van-tabbar v-model="active">
		<van-tabbar-item
			v-for="(item, index) in props.data"
			:icon="item.icon"
			:to="item.to"
			:name="item.name"
			:key="index"
			>{{ item.title }}</van-tabbar-item
		>
	</van-tabbar>
</template>

<script lang="ts" setup>
interface Props {
	data: any;
}

let active = ref<number>(0);

const props = defineProps<Props>();
</script>
