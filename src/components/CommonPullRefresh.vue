<template>
	<van-pull-refresh
		pulling-text="松开以刷新..."
		loosing-text="释放即可刷新..."
		loading-text="努力加载中..."
		v-model="isRefresh"
		@refresh="onRefresh"
		:immediate-check="false"
		v-bind="$attrs"
	>
		<slot></slot>
	</van-pull-refresh>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

// [Variables]
const props = defineProps({
	modelValue: {
		type: Boolean,
		default: false,
	},
});

const isRefresh = computed({
	get: () => props.modelValue,
	set: (val) => emit('update:modelValue', val),
});

// [Methods]
const onRefresh = () => {
	emit('refresh');
};

// [Emits] (必须在最后)
const emit = defineEmits(['update:modelValue', 'refresh']);
</script>
