<template>
	<van-popup
		v-model:show="showFlag"
		position="bottom"
		:style="{ width: '100%' }"
		@click-overlay="onClickOverlay"
	>
		<van-date-picker
			v-model="curSelectValue"
			:title="cur.labelName"
			:formatter="info.formatter"
			@confirm="confirm"
			@cancel="cancel"
		/>
	</van-popup>
</template>

<script setup lang="ts">
import { formatDayjs } from '@/utils/dayjs/index';

export interface Info {
	label?: string;
	labelName?: string;
	rule?: any;
	selectValue?: any;
	showFlag?: boolean;
	formatter?: any;
}

interface Props {
	info: Info;
}

const emit = defineEmits(['selectInfo', 'cancelInfo']);

const props = defineProps<Props>();

const showFlag = ref<boolean>(false);

const curSelectValue = ref<string[]>([]);

const confirm = ({ selectedValues }) => {
	showFlag.value = false;
	const dateName = `${selectedValues[0]}-${selectedValues[1]}-${selectedValues[2]}`;
	emit('selectInfo', formatDayjs(dateName), dateName, props.info.label);
};

const cancel = () => {
	showFlag.value = false;
	emit('cancelInfo', false);
};

const onClickOverlay = () => {
	cancel();
};

const cur = ref<Info>({});

watch(
	() => props.info.showFlag,
	() => {
		if (props.info.showFlag) {
			cur.value = props.info;
			showFlag.value = props.info.showFlag;
			if (props.info.selectValue) {
				const month = props.info.selectValue.month() + 1;
				curSelectValue.value = [
					`${props.info.selectValue.year()}`,
					month < 10 ? `0${month}` : `${month}`,
					`${props.info.selectValue.date()}`,
				];
			}
		}
	},
);
</script>
