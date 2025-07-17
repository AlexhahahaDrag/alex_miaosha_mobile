<template>
	<div :id="id" :style="style" />
</template>

<script setup lang="ts">
// 按需导入ECharts组件，减少包体积
import * as echarts from 'echarts/core';
import { BarChart, LineChart, PieChart } from 'echarts/charts';
import {
	TitleComponent,
	TooltipComponent,
	GridComponent,
	LegendComponent,
	ToolboxComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { nanoid } from 'nanoid';

// 注册必要的组件
echarts.use([
	TitleComponent,
	TooltipComponent,
	GridComponent,
	LegendComponent,
	ToolboxComponent,
	BarChart,
	LineChart,
	PieChart,
	CanvasRenderer,
]);

const props = defineProps({
	options: {
		type: Object,
		default: () => {
			return {};
		},
	},
	width: {
		type: String,
		default: '200px',
	},
	height: {
		type: String,
		default: '400px',
	},
});

const id = ref(`vue-echarts-${nanoid()}`);

const style = ref({
	height: props.height,
	width: props.width,
});
let chart: any = null;
const initEcharts = () => {
	disposeChart();
	if (!chart) {
		chart = echarts.init(document.getElementById(id.value)!);
	} else {
		return;
	}
	if (!props.options) return;
	chart.setOption(props.options);
	window.addEventListener('resize', function () {
		chart.resize();
	});
};

const disposeChart = () => {
	if (chart) {
		window.addEventListener('resize', function () {
			chart.resize();
		});
	}
	chart?.dispose();
	chart = null;
};
onMounted(() => {
	watch(
		() => props.options,
		() => {
			chart?.setOption(props.options);
		},
		{ deep: true, flush: 'post' },
	);
	initEcharts();
});
onUnmounted(() => {
	disposeChart();
});
</script>
