<template>
	<van-row gutter="20">
		<div class="mainGrid">
			<div class="div2">
				<pie-chart
					title="店铺资金分布"
					height="100%"
					width="100%"
					:data="pieShopData"
					:tooltip="tooltip"
				></pie-chart>
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
				></pie-chart>
			</div>
		</div>
	</van-row>
</template>

<script lang="ts" setup>
import { getAllAmount } from '@/api/finance/shopStockAnalysis';
import { showNotify } from 'vant';
import { ItemInfo } from './common';

interface Props {
	activeTab: number | string;
	dateStr: string;
	belongTo?: number | null;
}

let props = defineProps<Props>();

let pieShopData = ref<object[]>([]);

const getAllAmountInfo = () => {
	getAllAmount().then((res: { code: string; data: any[]; message: any }) => {
		if (res.code == '200') {
			if (res.data) {
				let shop: ItemInfo[] = [];
				res.data.forEach((item: { typeName: any; amount: any }) => {
					shop.push({ name: item.typeName, value: item.amount });
				});
				pieShopData.value = shop;
			}
		} else {
			showNotify({
				type: 'danger',
				message: (res && res.message) || '查询列表失败！',
			});
		}
	});
};

let piePayWayData = ref<object[]>([]);

// const getPayWayInfoInfo = (dateStr: string) => {
//   getPayWayInfo(dateStr).then((res: { code: string; data: any[]; message: any }) => {
//     if (res.code == '200') {
//       if (res.data) {
//         let shop: ItemInfo[] = [];
//         res.data.forEach((item: { payWayName: any; saleAmount: any }) => {
//           shop.push({ name: item.payWayName, value: item.saleAmount });
//         });
//         piePayWayData.value = shop;
//       }
//     } else {
//       showNotify({
//         type: 'danger',
//         message: (res && res.message) || '查询列表失败！',
//       });
//     }
//   });
// };

const tooltip = ref({
	trigger: 'item',
	formatter: '{b} : {c}元({d}%)',
});

const init = () => {
	getAllAmountInfo();
	// getPayWayInfoInfo(dateStr);
};

watch(
	() => [props.activeTab, props.dateStr, props.belongTo],
	() => {
		if (props.activeTab === '2' && props.dateStr) {
			init();
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
