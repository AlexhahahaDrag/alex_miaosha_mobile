<template>
	<van-pull-refresh
		class="common-pull-refresh-wrapper"
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
.common-pull-refresh-wrapper {
	/* 赋予外层组件独立滚动上下文 */
	height: 100%;
	overflow-y: auto;
	-webkit-overflow-scrolling: touch;

	/* 深度穿透：当内部嵌套 common-list 时，强制剥夺其独立滚动权，由外层接管 */
	:deep(.list-wrapper) {
		height: auto !important;
		overflow-y: visible !important;
	}
}
</style>
