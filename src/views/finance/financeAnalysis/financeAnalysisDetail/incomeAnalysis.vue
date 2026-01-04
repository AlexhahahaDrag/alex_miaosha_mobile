<template>
	<van-row gutter="20">
		<div class="mainGrid">
			<div class="div2">
				<pieChart
					title="当月收入分析"
					height="100%"
					width="100%"
					:data="pieData.income"
					:tooltip="tooltip"
				>
				</pieChart>
			</div>
		</div>
		<van-divider />
		<div class="mainGrid">
			<div class="div2">
				<pieChart
					title="当月支出分析"
					height="100%"
					width="100%"
					:data="pieData.expense"
					:tooltip="tooltip"
				>
				</pieChart>
			</div>
		</div>
	</van-row>
</template>

<script lang="ts" setup>
import { showNotify } from 'vant';
import { number } from 'mathjs';
import { getIncomeAndExpense, type BalanceData } from '@/views/finance/financeAnalysis/api';

interface Props {
	activeTab: number | string;
	dateStr: string;
	belongTo?: number | string | null;
}

const props = defineProps<Props>();

// 饼图数据接口定义
interface PieChartData {
	name: string;
	value: number;
}

// 统一管理收入和支出数据
const pieData = ref<{
	income: PieChartData[];
	expense: PieChartData[];
}>({
	income: [],
	expense: [],
});

// 将数据转换为饼图格式
const transformToPieData = (data: BalanceData[], type: 'income' | 'expense'): PieChartData[] => {
	return (
		data
			?.filter((item) => item.incomeAndExpenses === type)
			.map((item) => ({ name: item.typeCode || '', value: item.amount || 0 })) || []
	);
};

const getIncomeAndExpenseInfo = async (userId: number | null, dateStr: string) => {
	const res = await getIncomeAndExpense(userId, dateStr);
	if (res.code === '200') {
		const data = res.data || [];
		pieData.value = {
			income: transformToPieData(data, 'income'),
			expense: transformToPieData(data, 'expense'),
		};
	} else {
		showNotify({ type: 'danger', message: res.message || '查询列表失败！' });
	}
};

const tooltip = ref({
	trigger: 'item',
	formatter: '{b} : {c}元({d}%)',
});

const init = (dateStr: string, belongTo: number | null) => {
	getIncomeAndExpenseInfo(belongTo, dateStr);
};

watch(
	() => [props.activeTab, props.dateStr, props.belongTo],
	() => {
		if (props.activeTab === '2' && props.dateStr) {
			init(props.dateStr, props.belongTo ? number(props.belongTo) : null);
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
		width: 98%;
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
