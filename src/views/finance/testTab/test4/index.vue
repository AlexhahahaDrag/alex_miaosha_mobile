<template>
	{{ props.activeTab }}
</template>

<script setup lang="ts">
interface Props {
	activeTab: number;
}

const props = defineProps<Props>();

watch(
	() => [props.activeTab],
	() => {
		console.log('test4');
	},
	{ immediate: true },
);
</script>
