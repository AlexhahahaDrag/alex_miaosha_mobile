<template>
	<chart :options="options" :width="props.width" :height="props.height" />
</template>

<script setup lang="ts">
import type { barItem } from '@/views/model/chart/bar';

const props = defineProps({
	config: {
		type: Object as PropType<barItem>,
		default: () => {},
	},
	title: {
		type: String,
		default: 'title',
	},
	tooltip: {
		type: Object,
		default: {},
	},
	data: {
		type: Array,
		default: [[]],
	},
	width: {
		type: String,
		default: '600px',
	},
	height: {
		type: String,
		default: '400px',
	},
	stackInfo: {
		type: Array,
		default: [],
	},
	nameInfo: {
		type: Array,
		default: [],
	},
});

const judgeTitle = (yAxis: any[], title: string) => {
	if (!yAxis?.length) {
		return false;
	}
	let exists = false;
	yAxis.forEach((item) => {
		if (exists || item.name === title) {
			exists = true;
		}
	});
	return exists;
};

const setOption = (data: any[]) => {
	const { xAxis, nameInfo, yTitle, tooltip, xTile, dataType, stackInfo } = props.config;
	if (data?.length) {
		const yAxis = [] as any[];
		const series = [] as any[];
		let yAxisIndex = 0;
		const map = {} as any;
		for (let i = 0; i < data.length; i++) {
			const max = getMax(Math.max(...data[i]));
			const min = getMin(Math.min(...data[i]));
			const title = yTitle ? yTitle[i] : '';
			const exists = judgeTitle(yAxis, title);
			if (!exists) {
				map[title] = yAxisIndex++;
				yAxis.push({
					type: 'value',
					name: title,
					min,
					max,
					nameLocation: 'center',
					nameGap: 25,
					interval: (max - min) / 5,
					axisLabel: {
						formatter (value: number) {
							if (value >= 10000) {
								return `${(value / 1000).toFixed(1)}k`;
							} else {
								return value;
							}
						},
					},
				});
			} else {
				yAxis.forEach((item: any) => {
					if (item.name === title) {
						if (item.max < max) {
							item.max = max;
						}
						if (item.min > max) {
							item.min = min;
						}
						item.interval = (item.max - item.min) / 5;
					}
				});
			}
			series.push({
				type: dataType ? dataType[i] : 'bar',
				data: data[i],
				name: nameInfo?.length ? nameInfo[i] : '',
				yAxisIndex: map[title],
				showSymbol: 0,
				stack: stackInfo?.length ? stackInfo[i] : '',
				barGap: exists ? '-100%' : '0%',
			});
		}
		options.value = {
			title: {
				text: props.title,
				left: 'center',
			},
			color: [
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
			],
			tooltip: tooltip || {
				trigger: 'axis',
			},
			xAxis: {
				type: 'category',
				boundaryGap: false,
				data: xAxis ? xAxis : [],
				axisTick: {
					alignWithLabel: true,
				},
				name: xTile ? xTile : '',
			},
			yAxis,
			series,
		};
	}
};

const getMax = (num: number) => {
	if (num <= 5) {
		return 5;
	} else if (num <= 10) {
		return 10;
	} else if (num <= 100) {
		return Math.ceil(num / 5) * 5;
	}
	return getMax(num / 10) * 10;
};

const getMin = (num: number) => {
	if (num < 0) {
		return -getMax(-num);
	}
	if (num <= 5) {
		return 0;
	} else if (num <= 10) {
		return 5;
	} else if (num <= 100) {
		return Math.floor(num / 5) * 5;
	}
	return getMin(num / 10) * 10;
};

const chartOption = {
	title: {
		text: '',
		left: 'center',
	},
	color: [] as string[],
	tooltip: {} as Object,
	xAxis: {
		type: 'category',
		boundaryGap: false,
		data: [] as string[],
		axisTick: {
			alignWithLabel: true,
		},
		name: '',
	},
	legend: {
		data: [] as any[],
		icon: 'roundRect',
		left: 'right',
		itemHeight: 6,
		itemWidth: 18,
		textStyle: {
			fontSize: 14,
			lineHeight: 14,
			rich: {
				a: {
					verticalAlign: 'middle',
				},
			},
			padding: [0, 0, -2, 0], //[上、右、下、左]
		},
	},
	yAxis: [
		{
			type: 'value',
			name: '',
		},
	],
	series: [] as any,
} as any;

const options = ref(chartOption);

watch(
	() => props.data,
	() => {
		setOption(props.data);
	},
	{ deep: true, flush: 'post' },
);

onMounted(() => {
	setOption(props.data);
});
</script>

<style lang="less" scoped></style>
