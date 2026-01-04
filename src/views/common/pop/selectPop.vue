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

<script setup lang="ts">
export interface FieldInfo {
	value: string;
	text: string;
}

export interface Info {
	label?: string;
	labelName?: string;
	rule?: unknown;
	list?: any[];
	selectValue?: any;
	showFlag?: boolean;
	customFieldName?: FieldInfo;
}

interface Props {
	info: Info;
}

const props = defineProps<Props>();

const showFlag = ref<boolean>(false);
const curSelectValue = ref<any[]>([]);

const defaultCustomFieldName = {
	text: 'typeName',
	value: 'typeCode',
};

/**
 * 确认选择
 */
const onConfirm = ({ selectedOptions }: { selectedOptions: any[] }) => {
	showFlag.value = false;
	const fieldNames = props.info.customFieldName || defaultCustomFieldName;
	emit(
		'select-info',
		props.info.label,
		selectedOptions ? selectedOptions[0][fieldNames.value] : '',
		selectedOptions ? selectedOptions[0][fieldNames.text] : '',
	);
};

/**
 * 取消选择
 */
const onCancel = () => {
	showFlag.value = false;
	emit('cancel-info', false);
};

/**
 * 监听 info 的变化，同步状态
 */
watch(
	() => props.info.showFlag,
	(newVal) => {
		showFlag.value = !!newVal;
		if (newVal) {
			curSelectValue.value = props.info.selectValue ? [props.info.selectValue] : [];
		}
	},
	{ immediate: true },
);

const emit = defineEmits(['select-info', 'cancel-info']);
</script>
