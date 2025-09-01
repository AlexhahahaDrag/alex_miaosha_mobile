<template>
	<van-grid :column-num="2">
		<div class="box-content-show">
			<div :class="index % 2 === 0 ? 'show-left' : 'show-right'" v-for="(item, index) in stockList" :key="index">
				<BoardData :info="item"></BoardData>
			</div>
		</div>
		<div class="box-content-show">
			<div :class="index % 2 === 0 ? 'show-left' : 'show-right'" v-for="(item, index) in crashList" :key="index">
				<BoardData :info="item"></BoardData>
			</div>
		</div>
	</van-grid>
</template>

<script lang="ts" setup>
import { showNotify } from 'vant';

import type { ShopFinanceChainYear } from './common';

import { getAllStock, getCashAmount } from '@/api/finance/shopStockAnalysis';
import commonUtils from '@/utils/common/index';
import type { Info } from '@/views/common/boardData/config';

interface Props {
	activeTab: number | string;
	dateStr: string;
	belongTo?: number | null;
}

const props = defineProps<Props>();

const stockList = ref<Info[]>([]);

const getAllStockInfo = () => {
	getAllStock().then((res: { code: string; data: ShopFinanceChainYear; message: any }) => {
		if (res.code == '200') {
			console.log('res:', res);
			const arr: Info[] = [];
			arr.push({
				title: '库存金额',
				value: res.data?.costAmount !== null ? commonUtils.formatAmount(res.data.costAmount || 0, 2, '') : '--',
				icon: 'stockAmount',
				unit: '元',
				showChain: false,
				showYear: false,
				color: '#55aaff',
			});
			arr.push({
				title: '库存数量',
				value: res.data?.saleNum !== null ? commonUtils.formatAmount(res.data.saleNum || 0, 0, '') : '--',
				icon: 'stockNum',
				unit: '件',
				showChain: false,
				showYear: false,
				color: '#55aaff',
			});
			stockList.value = arr;
		} else {
			showNotify({
				type: 'danger',
				message: (res && res.message) || '查询列表失败！',
			});
		}
	});
};

const crashList = ref<Info[]>([]);

const getCashAmountInfo = () => {
	getCashAmount().then((res: any) => {
		if (res.code == '200') {
			console.log('res:', res);
			const arr: Info[] = [];
			arr.push({
				title: '流动资金',
				value: res.data?.amount !== null ? commonUtils.formatAmount(res.data.amount || 0, 2, '') : '--',
				icon: 'stockAmount',
				unit: '元',
				showChain: false,
				showYear: false,
				color: '#1c54aa',
			});
			arr.push({});
			crashList.value = arr;
		} else {
			showNotify({
				type: 'danger',
				message: (res && res.message) || '查询列表失败！',
			});
		}
	});
};

const init = () => {
	getAllStockInfo();
	getCashAmountInfo();
};

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

<style lang="scss" scoped>
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
