<template>
	<div
		ref="chartDomRef"
		:style="style"
		class="base-chart-container"
	></div>
</template>

<script setup lang="ts">
import * as echarts from 'echarts/core';
import { BarChart, LineChart, PieChart, GraphChart } from 'echarts/charts';
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
	GraphChart,
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
let resizeObserver: ResizeObserver | null = null;

const style = computed(() => ({
	height: props.height,
	width: props.width,
}));

let resizeTimer: ReturnType<typeof setTimeout> | null = null;
const handleResize = () => {
	if (resizeTimer) clearTimeout(resizeTimer);
	resizeTimer = setTimeout(() => {
		chartInstance?.resize();
	}, 100);
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
	if (resizeObserver) {
		resizeObserver.disconnect();
		resizeObserver = null;
	}
	if (resizeTimer) {
		clearTimeout(resizeTimer);
		resizeTimer = null;
	}
	if (chartInstance) {
		chartInstance.dispose();
		chartInstance = null;
	}
};

onMounted(() => {
	initChart();
	window.addEventListener('resize', handleResize);
	if (chartDomRef.value && typeof ResizeObserver !== 'undefined') {
		resizeObserver = new ResizeObserver(() => {
			handleResize();
		});
		resizeObserver.observe(chartDomRef.value);
	}
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
