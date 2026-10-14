<template>
	<div
		ref="chartDomRef"
		:style="style"
		class="base-chart-container"
	></div>
</template>

<script setup lang="ts">
import * as echarts from 'echarts/core';
import { BarChart, LineChart, PieChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, GridComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

// 注册基础图表核心与渲染器
echarts.use([
	TitleComponent,
	TooltipComponent,
	GridComponent,
	LegendComponent,
	BarChart,
	LineChart,
	PieChart,
	CanvasRenderer,
]);

interface Props {
	options?: Record<string, unknown>;
	width?: string;
	height?: string;
}

const props = withDefaults(defineProps<Props>(), {
	options: () => ({}),
	width: '100%',
	height: '300px',
});

const emit = defineEmits<{
	(e: 'legend-change', selected: Record<string, boolean>): void;
}>();

const chartDomRef = shallowRef<HTMLDivElement>();
let chartInstance: echarts.ECharts | null = null;

const style = computed(() => ({
	height: props.height,
	width: props.width,
}));

const handleResize = () => {
	chartInstance?.resize();
};

const initChart = () => {
	if (!chartDomRef.value) return;

	if (!chartInstance) {
		chartInstance = echarts.init(chartDomRef.value);
		chartInstance.on('legendselectchanged', (params: { selected: Record<string, boolean> }) => {
			emit('legend-change', params.selected);
		});
	}

	if (props.options && Object.keys(props.options).length > 0) {
		chartInstance.setOption(props.options, true);
	}
};

const disposeChart = () => {
	if (chartInstance) {
		chartInstance.dispose();
		chartInstance = null;
	}
};

onMounted(() => {
	initChart();
	window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
	window.removeEventListener('resize', handleResize);
	disposeChart();
});

watch(
	() => props.options,
	(newOptions) => {
		if (chartInstance && newOptions && Object.keys(newOptions).length > 0) {
			chartInstance.setOption(newOptions, true);
		} else if (!chartInstance && newOptions) {
			initChart();
		}
	},
	{ deep: true, flush: 'post' },
);

watch(
	() => [props.height, props.width],
	() => {
		nextTick(() => {
			chartInstance?.resize();
		});
	},
);

defineOptions({
	name: 'BaseChart',
});
</script>

<style scoped>
.base-chart-container {
	position: relative;
	box-sizing: border-box;
}
</style>
