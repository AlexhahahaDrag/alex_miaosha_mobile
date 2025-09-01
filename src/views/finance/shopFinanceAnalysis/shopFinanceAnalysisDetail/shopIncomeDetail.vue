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
import type { barItem } from './common';
import { getDayShopFinanceInfo, getMonthShopFinanceInfo } from '@/api/finance/shopFinanceAnalysis';

interface Props {
	activeTab: number | string;
	dateStr: string;
	belongTo?: number | null;
}
const props = defineProps<Props>();

const dayConfig = ref<barItem>({});

const monthData = ref<any>([]);

const monthConfig = ref<barItem>({});

const dayData = ref<any>([]);

function getDayExpenseInfo(dateStr: string) {
	getDayShopFinanceInfo(dateStr).then((res: { code: string; data: any[]; message: any }) => {
		if (res.code == '200') {
			if (res.data) {
				const series = [] as any;
				const costSeries = [] as any;
				const numSeries = [] as any;
				const xAxis = [] as any;
				res.data.forEach((item) => {
					series.push(item.saleAmount);
					xAxis.push(item.infoDate.substring(8, 10));
					numSeries.push(item.saleNum);
					costSeries.push(item.saleAmount - item.saleCost);
				});
				const seriesAll = [] as any[];
				seriesAll[0] = series;
				seriesAll[1] = numSeries;
				seriesAll[2] = costSeries;
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
						axisPointer: {
							type: 'shadow',
						},
						formatter(param: any) {
							let tip = '';
							tip += `<p style="margin: 0;text-align: left">${param[0].axisValue}日</p>`;
							param.forEach((element: { axisValue: any; marker: any; value: any; seriesName: any }) => {
								tip += `<p style="margin: 0;text-align: left">${element.marker}${
									element.seriesName
								}: ${element.value ? element.value : 0.0}${
									element.seriesName === '销售额' || element.seriesName === '利润' ? '元' : '件'
								}</p>`;
							});
							return tip;
						},
					},
				};
				dayData.value = seriesAll;
			}
		} else {
			showNotify({
				type: 'danger',
				message: (res && res.message) || '查询列表失败！',
			});
		}
	});
}

function getMonthExpenseInfo(dateStr: string) {
	getMonthShopFinanceInfo(dateStr).then((res: { code: string; data: any[]; message: any }) => {
		if (res.code == '200') {
			if (res.data) {
				const series = [] as any;
				const numSeries = [] as any;
				const xAxis = [] as any;
				const costSeries = [] as any;
				res.data.forEach((item) => {
					series.push(item.saleAmount);
					xAxis.push(item.infoDate);
					numSeries.push(item.saleNum);
					costSeries.push(item.saleAmount - item.saleCost);
				});
				const seriesAll = [] as any[];
				seriesAll[2] = costSeries;
				seriesAll[0] = series;
				seriesAll[1] = numSeries;
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
						axisPointer: {
							type: 'shadow',
						},
						formatter(param: any) {
							let tip = '';
							tip += `<p style="margin: 0;text-align: left">${param[0].axisValue}月</p>`;
							param.forEach((element: { axisValue: any; marker: any; value: any; seriesName: any }) => {
								tip += `<p style="margin: 0;text-align: left">${element.marker}${
									element.seriesName
								}: ${element.value ? element.value : 0.0}${
									element.seriesName === '销售额' || element.seriesName === '利润' ? '元' : '件'
								}</p>`;
							});
							return tip;
						},
					},
				};
				monthData.value = seriesAll;
			}
		} else {
			showNotify({
				type: 'danger',
				message: (res && res.message) || '查询列表失败！',
			});
		}
	});
}

const init = (dateStr: string) => {
	getDayExpenseInfo(dateStr);
	getMonthExpenseInfo(dateStr);
};

watch(
	() => [props.activeTab, props.dateStr, props.belongTo],
	() => {
		if (props.activeTab === '3') {
			init(props.dateStr);
		}
	},
	{ immediate: true },
);
</script>

<style lang="scss" scoped>
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
