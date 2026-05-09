<template>
	<div
		:id="id"
		:style="style"
	></div>
</template>

<script setup lang="ts">
// 鎸夐渶瀵煎叆ECharts缁勪欢锛屽噺灏戝寘浣撶Н
import * as echarts from 'echarts/core';
import { BarChart, LineChart, PieChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, GridComponent, LegendComponent, ToolboxComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { nanoid } from 'nanoid';

// 娉ㄥ唽蹇呰鐨勭粍浠?
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

const style = computed(() => ({
	height: props.height,
	width: props.width,
}));

const emit = defineEmits(['legend-change']);

let chart: unknown = null;
const initEcharts = () => {
	disposeChart();
	if (!chart) {
		const chartDom = document.getElementById(id.value);
		if (chartDom) {
			chart = echarts.init(chartDom);
			chart.on('legendselectchanged', (params: { selected: Record<string, boolean> }) => {
				emit('legend-change', params.selected);
			});
		}
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

// 鐩戝惉绐楀彛澶у皬鍙樺寲
onUnmounted(() => {
	disposeChart();
});

watch(
	() => [props.height, props.width],
	() => {
		nextTick(() => {
			chart?.resize();
		});
	},
);

defineOptions({
	name: 'BaseChart',
});
</script>
