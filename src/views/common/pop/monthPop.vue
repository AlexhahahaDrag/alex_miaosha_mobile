<template>
	<van-popup
		v-model:show="showFlag"
		position="bottom"
		:style="{ width: '100%' }"
		@click-overlay="onCancel"
	>
		<van-date-picker
			v-model="curSelectValue"
			:title="info.labelName"
			:formatter="info.formatter"
			:columns-type="info.columnsType || ['year', 'month']"
			@confirm="onConfirm"
			@cancel="onCancel"
		/>
	</van-popup>
</template>

<script setup lang="ts">
import dayjs, { type Dayjs } from 'dayjs';
import type { DatePickerInfo } from '@/utils/common';

interface Props {
	info: DatePickerInfo<Dayjs>;
}

const props = defineProps<Props>();

const showFlag = ref<boolean>(false);
const curSelectValue = ref<string[]>([]);

/**
 * 确认选择
 */
const onConfirm = ({ selectedValues }: { selectedValues: string[] }) => {
	showFlag.value = false;
	const dateName = `${selectedValues[0]}年${selectedValues[1]}月`;
	const dateStr = `${selectedValues[0]}-${selectedValues[1]}-01`;
	emit('select-info', dayjs(dateStr), dateName, props.info.label);
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
		if (newVal && props.info.selectValue) {
			const date = dayjs(props.info.selectValue);
			const columnsType = props.info.columnsType || ['year', 'month'];
			const values: string[] = [];

			if (columnsType.includes('year')) values.push(date.format('YYYY'));
			if (columnsType.includes('month')) values.push(date.format('MM'));

			curSelectValue.value = values;
		}
	},
	{ immediate: true, deep: true },
);

const emit = defineEmits(['select-info', 'cancel-info']);
</script>
