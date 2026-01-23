<template>
	<base-chart
		:options="options"
		:width="props.width"
		:height="props.height"
	/>
</template>

<script setup lang="ts">
import type { BarItem } from '@/views/model/chart/bar';

// 图表颜色配置常量
const CHART_COLORS = [
	'#55aaff',
	'#ff9933',
	'#5555ff',
	'#aa55ff',
	'#dd4444',
	'#bb2222',
	'#dd4488',
	'#22ff99',
	'#ffcc66',
	'#7777dd',
	'rgb(217, 0, 27)',
	'#777fff',
] as const;

// 默认网格配置
const DEFAULT_GRID = {
	left: '10%',
	right: '10%',
	top: '15%',
	bottom: '15%',
} as const;

interface Props {
	config?: BarItem<number>;
	title?: string;
	tooltip?: Record<string, unknown>;
	data?: BarItem<number>;
	width?: string;
	height?: string;
	stackInfo?: string[];
	nameInfo?: string[];
}

const props = withDefaults(defineProps<Props>(), {
	config: () => ({}),
	title: 'title',
	tooltip: () => ({}),
	data: () => ({}),
	width: '600px',
	height: '400px',
	stackInfo: () => [],
	nameInfo: () => [],
});

// 判断 Y 轴标题是否已存在
const judgeTitle = (yAxis: Array<{ name: string }>, title: string): boolean => {
	return yAxis.some((item) => item.name === title);
};

// 格式化 Y 轴标签
const formatYAxisLabel = (value: number): string | number => {
	if (value >= 10000) {
		return `${(value / 1000).toFixed(1)}k`;
	}
	return value;
};

// 设置图表配置
const setOption = (data: BarItem<number>) => {
	const { xAxis, nameInfo, yTitle, tooltip, xTile, dataType, stackInfo, grid } = props.config;

	if (!data?.series?.length) {
		return;
	}

	const yAxis: Array<{
		type: string;
		name: string;
		min: number;
		max: number;
		nameLocation: string;
		nameGap: number;
		interval: number;
		axisLabel: {
			formatter: (value: number) => string | number;
		};
	}> = [];
	const series: Array<{
		type: string;
		data: number[];
		name: string;
		yAxisIndex: number;
		showSymbol: number;
		stack: string;
		barGap: string;
	}> = [];
	const titleMap: Record<string, number> = {};
	let yAxisIndex = 0;

	// 遍历每个系列数据
	for (let i = 0; i < data.series.length; i++) {
		const seriesData = (data.series[i] ?? []) as number[];
		if (seriesData.length === 0) {
			continue;
		}

		const max = getMax(Math.max(...seriesData));
		const min = getMin(Math.min(...seriesData));
		const title = yTitle?.[i] ?? '';
		const exists = judgeTitle(yAxis, title);

		// 如果 Y 轴不存在，创建新的 Y 轴
		if (!exists) {
			titleMap[title] = yAxisIndex++;
			yAxis.push({
				type: 'value',
				name: title,
				min,
				max,
				nameLocation: 'center',
				nameGap: 25,
				interval: (max - min) / 5,
				axisLabel: {
					formatter: formatYAxisLabel,
				},
			});
		} else {
			// 更新已存在的 Y 轴范围
			const existingAxis = yAxis.find((item) => item.name === title);
			if (existingAxis) {
				if (existingAxis.max < max) {
					existingAxis.max = max;
				}
				if (existingAxis.min > min) {
					existingAxis.min = min;
				}
				existingAxis.interval = (existingAxis.max - existingAxis.min) / 5;
			}
		}

		// 添加系列数据
		series.push({
			type: dataType?.[i] ?? 'bar',
			data: seriesData,
			name: nameInfo?.[i] ?? '',
			yAxisIndex: titleMap[title] ?? 0,
			showSymbol: 0,
			stack: stackInfo?.[i] ?? '',
			barGap: exists ? '-100%' : '0%',
		});
	}

	// 更新图表配置
	options.value = {
		title: {
			text: props.title,
			left: 'center',
		},
		grid: grid ?? DEFAULT_GRID,
		color: CHART_COLORS,
		tooltip: tooltip && Object.keys(tooltip).length > 0 ? tooltip : { trigger: 'axis' },
		xAxis: {
			type: 'category',
			boundaryGap: false,
			data: xAxis ?? [],
			axisTick: {
				alignWithLabel: true,
			},
			name: xTile ?? '',
		},
		yAxis,
		series,
	};
};

// 计算 Y 轴最大值（向上取整到合适的刻度）
const getMax = (num: number): number => {
	if (num <= 5) {
		return 5;
	}
	if (num <= 10) {
		return 10;
	}
	if (num <= 100) {
		return Math.ceil(num / 5) * 5;
	}
	return getMax(num / 10) * 10;
};

// 计算 Y 轴最小值（向下取整到合适的刻度）
const getMin = (num: number): number => {
	if (num < 0) {
		return -getMax(-num);
	}
	if (num <= 5) {
		return 0;
	}
	if (num <= 10) {
		return 5;
	}
	if (num <= 100) {
		return Math.floor(num / 5) * 5;
	}
	return getMin(num / 10) * 10;
};

// 初始化图表配置
const initChartOption = (): Record<string, unknown> => ({
	title: {
		text: '',
		left: 'center',
	},
	color: CHART_COLORS,
	tooltip: {
		trigger: 'axis',
	},
	xAxis: {
		type: 'category',
		boundaryGap: false,
		data: [] as string[],
		axisTick: {
			alignWithLabel: true,
		},
		name: '',
	},
	yAxis: [
		{
			type: 'value',
			name: '',
		},
	],
	series: [] as Array<Record<string, unknown>>,
});

const options = ref<Record<string, unknown>>(initChartOption());

// 监听 data 变化，更新图表
watch(
	() => props.data,
	(newData) => {
		if (newData) {
			setOption(newData);
		}
	},
	{ deep: true, flush: 'post' },
);

// 监听 config 变化，更新图表
watch(
	() => props.config,
	() => {
		if (props.data) {
			setOption(props.data);
		}
	},
	{ deep: true },
);

// 组件挂载时初始化图表
onMounted(() => {
	if (props.data) {
		setOption(props.data);
	}
});
</script>

<style lang="less" scoped></style>
