<template>
	<van-popup
		v-model:show="showFlag"
		position="bottom"
		:style="{ width: '100%' }"
		@click-overlay="onCancel"
	>
		<van-picker
			v-model="curSelectValue"
			:title="info.labelName"
			:columns="info.list"
			:columns-field-names="info.customFieldName || defaultCustomFieldName"
			@confirm="onConfirm"
			@cancel="onCancel"
		/>
	</van-popup>
</template>

<script setup lang="ts" generic="T extends Record<string, any> = Params">
// 1. Imports
import type { Params } from '@/types/global';

// 2. Constants / Types / API
export interface FieldInfo {
	value: string;
	text: string;
}

export interface Info<T = Params> {
	label?: string;
	labelName?: string;
	rule?: unknown;
	list?: T[];
	selectValue?: string | number | null;
	showFlag?: boolean;
	customFieldName?: FieldInfo;
}

const defaultCustomFieldName = {
	text: 'typeName',
	value: 'typeCode',
};

// 3. useHooks (None)

// 4. Variables
interface Props {
	info: Info<T>;
}

const props = defineProps<Props>();

const showFlag = ref<boolean>(false);
const curSelectValue = ref<(string | number)[]>([]);

// 5. Methods
/**
 * 确认选择
 */
const onConfirm = ({ selectedOptions }: { selectedOptions: T[] }) => {
	showFlag.value = false;
	const fieldNames = props.info.customFieldName || defaultCustomFieldName;
	const selected = selectedOptions?.[0];
	if (selected) {
		emit('select-info', props.info.label, selected[fieldNames.value], selected[fieldNames.text]);
	}
};

/**
 * 取消选择
 */
const onCancel = () => {
	showFlag.value = false;
	emit('cancel-info', false);
};

// 6. Lifecycle (None)

// 7. Watchers
/**
 * 监听 info 的变化，同步状态
 */
watch(
	() => props.info.showFlag,
	(newVal) => {
		showFlag.value = !!newVal;
		if (newVal) {
			curSelectValue.value =
				props.info.selectValue !== undefined && props.info.selectValue !== null ? [props.info.selectValue] : [];
		}
	},
	{ immediate: true },
);

// 8. Emits
const emit = defineEmits(['select-info', 'cancel-info']);
</script>
