<template>
	<div
		class="list-wrapper"
		:id="id"
	>
		<!-- [Skeleton State] -->
		<slot
			name="skeleton"
			v-if="loading && !refreshing && isEmpty"
		>
			<div class="default-skeleton">
				<van-skeleton
					v-for="i in 3"
					:key="i"
					title
					:row="3"
					class="skeleton-item"
				/>
			</div>
		</slot>

		<!-- [Empty State] -->
		<slot
			name="empty"
			v-else-if="!loading && !refreshing && isEmpty"
		>
			<van-empty
				:image="emptyImage"
				:description="emptyText"
			/>
		</slot>

		<!-- [List State] -->
		<van-list
			v-else
			v-model:loading="listLoading"
			:finished="finished"
			:immediate-check="true"
			:finished-text="finishedText"
			@load="onLoad"
		>
			<slot></slot>
		</van-list>
	</div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

// [Emits]
const emit = defineEmits(['update:modelValue', 'load']);

// [Props]
const props = defineProps({
	// Overall data loading status (for skeletons)
	loading: {
		type: Boolean,
		default: false,
	},
	// Whether a parent pull-refresh is active
	refreshing: {
		type: Boolean,
		default: false,
	},
	// List internal loading status (v-model:loading)
	modelValue: {
		type: Boolean,
		default: false,
	},
	// Pagination finished status
	finished: {
		type: Boolean,
		default: false,
	},
	// Element ID for scroll targeting
	id: {
		type: String,
		default: '',
	},
	// Data source is empty
	isEmpty: {
		type: Boolean,
		default: true,
	},
	// Custom empty text
	emptyText: {
		type: String,
		default: '暂无数据',
	},
	// Custom empty image
	emptyImage: {
		type: String,
		default: 'default',
	},
	// Custom finished text
	finishedText: {
		type: String,
		default: '- 已经到底啦 -',
	},
});

const listLoading = computed({
	get: () => props.modelValue,
	set: (val) => emit('update:modelValue', val),
});

// [Methods]
const onLoad = () => {
	emit('load');
};
</script>

<style lang="less" scoped>
.list-wrapper {
	height: 100%;
	overflow-y: auto;
	padding: 12px 16px;
	box-sizing: border-box;
}

.default-skeleton {
	.skeleton-item {
		padding: 20px;
		margin-bottom: 16px;
		background: #fff;
		border-radius: 16px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
	}
}

:deep(.van-list__finished-text) {
	padding: 16px 0;
	color: #969799;
	font-size: 13px;
}

:deep(.van-empty) {
	padding-top: 100px;
}
</style>
