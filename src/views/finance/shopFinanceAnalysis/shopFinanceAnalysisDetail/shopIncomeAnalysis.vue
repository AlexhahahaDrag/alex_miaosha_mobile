<template>
	<van-row gutter="20">
		<div class="mainGrid">
			<div class="div2">
				<pie-chart
					title="当月销售商品类别"
					height="100%"
					width="100%"
					:data="pieShopData"
					:tooltip="tooltip"
				>
				</pie-chart>
			</div>
		</div>
		<van-divider />
		<div class="mainGrid">
			<div class="div2">
				<pie-chart
					title="当月收入支付方式"
					height="100%"
					width="100%"
					:data="piePayWayData"
					:tooltip="tooltip"
				>
				</pie-chart>
			</div>
		</div>
	</van-row>
</template>

<script lang="ts" setup>
import { showNotify } from 'vant';
import type { ItemInfo } from './common';
import type { ShopFinanceAnalysisData } from '@/views/finance/shopFinanceAnalysis/config';
import { getShopNameInfo, getPayWayInfo } from '@/views/finance/shopFinanceAnalysis/api';

interface Props {
	activeTab: number | string;
	dateStr: string;
	belongTo?: number | null;
}

const props = defineProps<Props>();

const pieShopData = ref<ItemInfo[]>([]);
const piePayWayData = ref<ItemInfo[]>([]);
const tooltip = ref({
	trigger: 'item',
	formatter: '{b} : {c}元({d}%)',
});

async function getShopNameInfoInfo(dateStr: string) {
	const { code, data, message } = await getShopNameInfo(dateStr);
	if (code !== '200' || !Array.isArray(data)) {
		showNotify({ type: 'danger', message: message || '查询列表失败！' });
		return;
	}
	pieShopData.value = (data as ShopFinanceAnalysisData[]).map((item) => ({
		name: item.shopName || '',
		value: item.saleAmount || 0,
	}));
}

async function getPayWayInfoInfo(dateStr: string) {
	const { code, data, message } = await getPayWayInfo(dateStr);
	if (code !== '200' || !Array.isArray(data)) {
		showNotify({ type: 'danger', message: message || '查询列表失败！' });
		return;
	}
	piePayWayData.value = (data as ShopFinanceAnalysisData[]).map((item) => ({
		name: item.payWayName || '',
		value: item.saleAmount || 0,
	}));
}

async function init(dateStr: string) {
	await Promise.all([getShopNameInfoInfo(dateStr), getPayWayInfoInfo(dateStr)]);
}

watch(
	() => [props.activeTab, props.dateStr, props.belongTo],
	() => {
		if (props.activeTab === '2' && props.dateStr) {
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
