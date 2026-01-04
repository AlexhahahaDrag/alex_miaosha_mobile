<template>
	<van-popup
		v-model:show="showFlag"
		position="bottom"
		:style="{ width: '100%' }"
		@click-overlay="onClickOverlay"
	>
		<van-date-picker
			v-model="curSelectValue"
			:title="info.labelName"
			:formatter="info.formatter"
			:columns-type="info.columnsType as any"
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
 * @param param0 - 选择的结果
 */
const onConfirm = ({ selectedValues }: { selectedValues: string[] }) => {
	showFlag.value = false;
	// 根据选择的列数构造日期字符串
	let dateName = '';
	if (selectedValues.length > 3) {
		dateName = `${selectedValues[0]}-${selectedValues[1]}-${selectedValues[2]}`;
		if (selectedValues.length >= 5) {
			dateName += ` ${selectedValues[3]}:${selectedValues[4]}`;
			if (selectedValues.length >= 6) {
				dateName += `:${selectedValues[5]}`;
			}
		}
	} else {
		dateName = selectedValues.join('-');
	}

	const date = dayjs(dateName);
	emit('select-date-info', date, dateName, props.info.label);
};

/**
 * 取消选择
 */
const onCancel = () => {
	showFlag.value = false;
	emit('cancel-date-info');
};

/**
 * 点击遮罩层
 */
const onClickOverlay = () => {
	onCancel();
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
			const columnsType = props.info.columnsType || ['year', 'month', 'day'];
			const values: string[] = [];

			// 根据 columnsType 初始化选中的值
			if (columnsType.includes('year')) values.push(date.format('YYYY'));
			if (columnsType.includes('month')) values.push(date.format('MM'));
			if (columnsType.includes('day')) values.push(date.format('DD'));
			if (columnsType.includes('hour')) values.push(date.format('HH'));
			if (columnsType.includes('minute')) values.push(date.format('mm'));
			if (columnsType.includes('second')) values.push(date.format('ss'));

			curSelectValue.value = values;
		}
	},
	{ immediate: true, deep: true },
);

const emit = defineEmits(['select-date-info', 'cancel-date-info']);
</script>
