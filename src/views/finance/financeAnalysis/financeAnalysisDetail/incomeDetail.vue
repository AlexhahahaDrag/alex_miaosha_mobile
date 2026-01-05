<template>
	<van-row gutter="20">
		<div class="mainGrid">
			<div class="div1">
				<bar-chart
					height="100%"
					width="100%"
					title="日消费"
					:data="dayData"
					:config="dayConfig"
				>
				</bar-chart>
			</div>
		</div>
		<van-divider />
		<div class="mainGrid">
			<div class="div2">
				<bar-chart
					height="100%"
					width="100%"
					title="月消费"
					:data="monthData"
					:config="monthConfig"
				>
				</bar-chart>
			</div>
		</div>
	</van-row>
</template>

<script lang="ts" setup>
import { showNotify } from 'vant';
import type { BarItem } from '@/views/model/chart/bar';
import { getDayExpense, getMonthExpense } from '@/views/finance/financeAnalysis/api';

interface Props {
	activeTab: number | string;
	dateStr: string;
	belongTo?: string | null;
}

const props = defineProps<Props>();

const dayData = ref<BarItem<number>>({
	xAxis: [],
	series: [[]],
});

const dayConfig = ref<BarItem<number>>({
	xTile: '天数',
	yTitle: ['金钱(元)'],
	yNameGap: 50,
	grid: {
		left: '10%',
		right: '10%',
		top: '15%',
		bottom: '15%',
	},
	tooltip: {
		trigger: 'axis',
		axisPointer: {
			type: 'shadow',
		},
		formatter(param: any) {
			console.log('param mmmmmmmmmmmmmmmmmmmmm:', param, typeof param);
			let tip = '';
			const unit = '元';
			const name = '花费';
			tip += `<p style="margin: 0;text-align: left">${param[0].axisValue}日</p>`;
			param.forEach((element: { axisValue: any; marker: any; value: any; seriesName: any }) => {
				tip += `<p style="margin: 0;text-align: left">${element.marker}${name}: ${element.value ? element.value : 0.0}${unit}</p>`;
			});
			return tip;
		},
	},
	color: '#aa55ff',
});

const monthData = ref<BarItem<number>>({
	xAxis: [],
	series: [[]],
});

const monthConfig = ref<BarItem<number>>({
	yTitle: ['金钱(元)'],
	xTile: '月份',
	yNameGap: 50,
	grid: {
		left: '10%',
		right: '10%',
		top: '15%',
		bottom: '15%',
	},
	tooltip: {
		trigger: 'axis',
		axisPointer: {
			type: 'shadow',
		},
		formatter(param: any) {
			let tip = '';
			const unit = '元';
			const name = '花费';
			tip += `<p style="margin: 0;text-align: left">${param[0].axisValue}月</p>`;
			param.forEach((element: { axisValue: any; marker: any; value: any; seriesName: any }) => {
				tip += `<p style="margin: 0;text-align: left">${element.marker}${name}: ${element.value ? element.value : 0.0}${unit}</p>`;
			});
			return tip;
		},
	},
	color: '#5555ff',
});

const getDayExpenseInfo = async (userId: number | string | null, dateStr: string) => {
	const { code, data, message } = await getDayExpense(userId, dateStr);
	if (code == '200') {
		if (data?.length) {
			const series = data.map((item) => item.amount ?? 0);
			dayData.value = { xAxis: data.map((item) => item.infoDate?.toString() ?? ''), series: [series] };
		}
	} else {
		showNotify({
			type: 'danger',
			message: message || '查询列表失败！',
		});
	}
};

async function getMonthExpenseInfo(userId: number | string | null, dateStr: string) {
	const { code, data, message } = await getMonthExpense(userId, dateStr);
	if (code == '200') {
		if (data?.length) {
			const series = data.map((item) => item.amount ?? 0);
			monthData.value = { xAxis: data.map((item) => item.infoDate?.toString() ?? ''), series: [series] };
		}
	} else {
		showNotify({
			type: 'danger',
			message: message || '查询列表失败！',
		});
	}
}

const init = (dateStr: string, belongTo: string | null) => {
	getDayExpenseInfo(belongTo, dateStr);
	getMonthExpenseInfo(belongTo, dateStr);
};

watch(
	() => [props.activeTab, props.dateStr, props.belongTo],
	() => {
		if (props.activeTab === '3') {
			init(props.dateStr, props.belongTo || null);
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
		width: 96%;
		height: 100%;
		text-align: center;
		line-height: 100%;
		color: blue;
		background-color: white;
		margin-left: 10px;
		margin-right: 10px;
		border-radius: 5px;
		/*--调节圆周程度*/
	}

	.div2 {
		display: inline-block;
		/*转为行内块儿 */
		width: 92%;
		height: 100%;
		text-align: center;
		line-height: 100%;
		color: aliceblue;
		background-color: white;
		margin-right: 10px;
		border-radius: 5px;
		/*--调节圆周程度*/
	}
}
</style>
