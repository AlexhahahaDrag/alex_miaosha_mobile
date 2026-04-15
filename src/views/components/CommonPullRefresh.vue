<template>
	<van-pull-refresh
		v-model="refreshing"
		pulling-text="松开以刷新..."
		loosing-text="释放即可刷新..."
		loading-text="努力加载中..."
		@refresh="onRefresh"
		:immediate-check="false"
		v-bind="$attrs"
	>
		<slot></slot>
	</van-pull-refresh>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

// [Emits]
const emit = defineEmits(['update:modelValue', 'refresh']);

// [Props]
const props = defineProps({
	modelValue: {
		type: Boolean,
		default: false,
	},
});

// [Variables]
const refreshing = computed({
	get: () => props.modelValue,
	set: (val) => emit('update:modelValue', val),
});

// [Methods]
const onRefresh = () => {
	emit('refresh');
};
</script>

<style lang="less" scoped>
// 基础容器样式
</style>
