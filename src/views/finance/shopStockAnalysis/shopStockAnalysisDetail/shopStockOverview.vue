<template>
	<van-grid :column-num="2">
		<div class="box-content-show">
			<div
				:class="index % 2 === 0 ? 'show-left' : 'show-right'"
				v-for="(item, index) in stockList"
				:key="index"
			>
				<BoardData :info="item"></BoardData>
			</div>
		</div>
		<div class="box-content-show">
			<div
				:class="index % 2 === 0 ? 'show-left' : 'show-right'"
				v-for="(item, index) in crashList"
				:key="index"
			>
				<BoardData :info="item"></BoardData>
			</div>
		</div>
	</van-grid>
</template>

<script lang="ts" setup>
import { showNotify } from 'vant';
import type { ShopStockAnalysisData } from '@/views/finance/shopStockAnalysis/config';
import { getAllStock, getCashAmount } from '@/views/finance/shopStockAnalysis/api';
import commonUtils from '@/utils/common/index';
import type { Info } from '@/views/common/boardData/config';

interface Props {
	activeTab: number | string;
	dateStr: string;
	belongTo?: number | null;
}

const props = defineProps<Props>();

const stockList = ref<Info[]>([]);
const crashList = ref<Info[]>([]);

async function getAllStockInfo() {
	const { code, data, message } = await getAllStock();
	if (code !== '200') {
		showNotify({ type: 'danger', message: message || '查询列表失败，请联系管理员！' });
		return;
	}
	const stockData = data as ShopStockAnalysisData;
	const arr: Info[] = [];
	arr.push({
		title: '库存金额',
		value: stockData?.costAmount !== null ? commonUtils.formatAmount(stockData.costAmount || 0, 2, '') : '--',
		icon: 'stockAmount',
		unit: '元',
		showChain: false,
		showYear: false,
		color: '#55aaff',
	});
	arr.push({
		title: '库存数量',
		value: stockData?.saleNum !== null ? commonUtils.formatAmount(stockData.saleNum || 0, 0, '') : '--',
		icon: 'stockNum',
		unit: '件',
		showChain: false,
		showYear: false,
		color: '#55aaff',
	});
	stockList.value = arr;
}

async function getCashAmountInfo() {
	const { code, data, message } = await getCashAmount();
	if (code !== '200') {
		showNotify({ type: 'danger', message: message || '查询列表失败，请联系管理员！' });
		return;
	}
	const cashData = data as ShopStockAnalysisData;
	const arr: Info[] = [];
	arr.push({
		title: '流动资金',
		value: cashData?.amount !== null ? commonUtils.formatAmount(cashData.amount || 0, 2, '') : '--',
		icon: 'stockAmount',
		unit: '元',
		showChain: false,
		showYear: false,
		color: '#1c54aa',
	});
	arr.push({});
	crashList.value = arr;
}

async function init() {
	await Promise.all([getAllStockInfo(), getCashAmountInfo()]);
}

watch(
	() => [props.activeTab, props.dateStr, props.belongTo],
	() => {
		if (props.activeTab === '1') {
			init();
		}
	},
	{ immediate: true },
);
</script>

<style lang="less" scoped>
.box-content-show {
	display: flex;
	justify-content: space-around;
	width: 100%;
	margin-left: 10px;
	margin-right: 10px;
	margin-top: 10px;
	.show-left {
		display: flex;
		justify-content: space-around;
		width: 100%;
	}
	.show-right {
		display: flex;
		justify-content: space-around;
		width: 100%;
		margin-left: 10px;
	}
}
</style>
