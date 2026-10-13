<template>
	<base-chart
		:options="options"
		:width="props.width"
		:height="props.height"
	/>
</template>

<script setup lang="ts">
import BaseChart from './BaseChart.vue';
import type { PieChartItem } from './types';

// 移动端优雅图表调色板
const PIE_COLORS = [
	'#1677ff',
	'#52c41a',
	'#faad14',
	'#f5222d',
	'#722ed1',
	'#13c2c2',
	'#eb2f96',
	'#fa8c16',
	'#2f54eb',
	'#fa541c',
];

interface Props {
	title?: string;
	tooltip?: Record<string, unknown>;
	data?: PieChartItem[];
	width?: string;
	height?: string;
}

const props = withDefaults(defineProps<Props>(), {
	title: '',
	tooltip: () => ({}),
	data: () => [],
	width: '100%',
	height: '320px',
});

const options = computed(() => {
	const hasTitle = Boolean(props.title);
	return {
		title: hasTitle
			? {
				text: props.title,
				left: 'center',
				textStyle: {
					fontSize: 14,
					fontWeight: 600,
					color: '#334155',
				},
			}
			: undefined,
		color: PIE_COLORS,
		tooltip:
			props.tooltip && Object.keys(props.tooltip).length > 0
				? props.tooltip
				: {
					trigger: 'item',
					formatter: '{b}: {c} ({d}%)',
				},
		legend: {
			bottom: 10,
			left: 'center',
			type: 'scroll',
			textStyle: {
				fontSize: 12,
				color: '#64748b',
			},
		},
		series: [
			{
				name: props.title || '',
				type: 'pie',
				radius: ['35%', '65%'],
				center: ['50%', hasTitle ? '48%' : '44%'],
				avoidLabelOverlap: true,
				itemStyle: {
					borderRadius: 4,
					borderColor: '#ffffff',
					borderWidth: 2,
				},
				data: props.data || [],
				emphasis: {
					itemStyle: {
						shadowBlur: 10,
						shadowOffsetX: 0,
						shadowColor: 'rgba(0, 0, 0, 0.2)',
					},
				},
				label: {
					show: false,
				},
			},
		],
	};
});

defineOptions({
	name: 'PieChart',
});
</script>
