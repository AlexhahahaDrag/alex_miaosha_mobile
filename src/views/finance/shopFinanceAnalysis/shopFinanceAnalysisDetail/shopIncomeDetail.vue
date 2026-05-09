<template>
	<van-row gutter="20">
		<div class="mainGrid">
			<div class="div1">
				<bar-chart
					height="100%"
					width="100%"
					title="日销售"
					:data="dayData"
					:config="dayConfig"
				></bar-chart>
			</div>
		</div>
		<van-divider />
		<div class="mainGrid">
			<div class="div2">
				<bar-chart
					height="100%"
					width="100%"
					title="月销售"
					:data="monthData"
					:config="monthConfig"
				></bar-chart>
			</div>
		</div>
	</van-row>
</template>

<script lang="ts" setup>
import { showNotify } from 'vant';
import type { BarItem } from '@/views/model/chart/bar';
import type { ShopFinanceAnalysisData, TooltipPoint } from '@/views/finance/shopFinanceAnalysis/config';
import { getDayShopFinanceInfo, getMonthShopFinanceInfo } from '@/views/finance/shopFinanceAnalysis/api';

interface Props {
	activeTab: number | string;
	dateStr: string;
	belongTo?: number | null;
}

const props = defineProps<Props>();

const dayConfig = ref<BarItem<number>>({});
const monthConfig = ref<BarItem<number>>({});
const dayData = ref<BarItem<number>>({});
const monthData = ref<BarItem<number>>({});

function buildTooltip(param: TooltipPoint[], suffix: string) {
	let tip = `<p style="margin: 0;text-align: left">${param[0].axisValue}${suffix}</p>`;
	param.forEach((element) => {
		tip += `<p style="margin: 0;text-align: left">${element.marker}${element.seriesName}: ${
			element.value ? element.value : 0.0
		}${element.seriesName === '销售额' || element.seriesName === '利润' ? '元' : '件'}</p>`;
	});
	return tip;
}

async function getDayExpenseInfo(dateStr: string) {
	const { code, data, message } = await getDayShopFinanceInfo(dateStr);
	if (code !== '200' || !Array.isArray(data)) {
		showNotify({ type: 'danger', message: message || '查询列表失败！' });
		return;
	}
	const points = data as ShopFinanceAnalysisData[];
	const series: number[] = [];
	const costSeries: number[] = [];
	const numSeries: number[] = [];
	const xAxis: string[] = [];

	points.forEach((item) => {
		series.push(item.saleAmount || 0);
		xAxis.push((item.infoDate || '').substring(8, 10));
		numSeries.push(item.saleNum || 0);
		costSeries.push((item.saleAmount || 0) - (item.saleCost || 0));
	});

	const seriesAll: number[][] = [series, numSeries, costSeries];
	dayConfig.value = {
		xAxis,
		series: seriesAll,
		xTile: '天数',
		yTitle: ['销售额', '件数', '销售额'],
		yNameGap: 50,
		nameInfo: ['销售额', '件数', '利润'],
		dataType: ['bar', 'line', 'bar'],
		stackInfo: ['one', 'two', 'three'],
		color: '#aa55ff',
		tooltip: {
			trigger: 'axis',
			axisPointer: { type: 'shadow' },
			formatter(param: TooltipPoint[]) {
				return buildTooltip(param, '日');
			},
		},
	};
	dayData.value = { series: seriesAll };
}

async function getMonthExpenseInfo(dateStr: string) {
	const { code, data, message } = await getMonthShopFinanceInfo(dateStr);
	if (code !== '200' || !Array.isArray(data)) {
		showNotify({ type: 'danger', message: message || '查询列表失败！' });
		return;
	}
	const points = data as ShopFinanceAnalysisData[];
	const series: number[] = [];
	const numSeries: number[] = [];
	const xAxis: string[] = [];
	const costSeries: number[] = [];

	points.forEach((item) => {
		series.push(item.saleAmount || 0);
		xAxis.push(item.infoDate || '');
		numSeries.push(item.saleNum || 0);
		costSeries.push((item.saleAmount || 0) - (item.saleCost || 0));
	});

	const seriesAll: number[][] = [];
	seriesAll[0] = series;
	seriesAll[1] = numSeries;
	seriesAll[2] = costSeries;
	monthConfig.value = {
		xAxis,
		series: seriesAll,
		yTitle: ['销售额', '件数', '销售额'],
		xTile: '月份',
		yNameGap: 50,
		dataType: ['bar', 'line', 'bar'],
		nameInfo: ['销售额', '件数', '利润'],
		stackInfo: ['one', 'two', 'three'],
		color: '#5555ff',
		tooltip: {
			trigger: 'axis',
			axisPointer: { type: 'shadow' },
			formatter(param: TooltipPoint[]) {
				return buildTooltip(param, '月');
			},
		},
	};
	monthData.value = { series: seriesAll };
}

async function init(dateStr: string) {
	await Promise.all([getDayExpenseInfo(dateStr), getMonthExpenseInfo(dateStr)]);
}

watch(
	() => [props.activeTab, props.dateStr, props.belongTo],
	() => {
		if (props.activeTab === '3') {
			void init(props.dateStr);
		}
	},
	{ immediate: true },
);
</script>

<style lang="less" scoped>
.mainGrid {
	width: 100%;
	height: 400px;

	.div1 {
		display: inline-block;
		/*转为行内块儿 */
		width: 94%;
		height: 100%;
		text-align: center;
		line-height: 100%;
		color: blue;
		background-color: white;
		border-radius: 5px;
		padding-left: 10px;
		padding-right: 10px;
		/*--调节圆周程度*/
	}

	.div2 {
		display: inline-block;
		/*转为行内块儿 */
		width: 94%;
		height: 100%;
		text-align: center;
		line-height: 100%;
		color: aliceblue;
		background-color: white;
		border-radius: 5px;
		padding-left: 10px;
		padding-right: 10px;
		/*--调节圆周程度*/
	}
}
</style>
