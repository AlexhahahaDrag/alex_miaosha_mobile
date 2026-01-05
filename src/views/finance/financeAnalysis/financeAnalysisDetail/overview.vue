<template>
	<van-grid :column-num="2">
		<van-grid-item :center="false"> 总金额:{{ sum }} </van-grid-item>
	</van-grid>
	<van-grid :column-num="2">
		<van-grid-item
			v-for="item in balanceList"
			:key="item.typeCode"
			:default="item.typeName + ':' + (item.amount ? item.amount : 0)"
			:center="false"
		>
			{{ item.typeName }}:{{ item.amount }}
		</van-grid-item>
	</van-grid>
</template>

<script lang="ts" setup>
import { showNotify } from 'vant';
import * as math from 'mathjs';
import type { FinanceDetail } from './common';
import { getBalance } from '@/views/finance/financeAnalysis/api';

interface Props {
	activeTab: number | string;
	dateStr: string;
	belongTo?: string | null;
}

const props = defineProps<Props>();

const balanceList = ref<FinanceDetail[]>([]);
const sum = ref<math.BigNumber>();

const getBalanceInfo = async (userId: number | string | null, dateStr: string) => {
	const { code, data, message } = await getBalance(userId, dateStr);
	if (code == '200') {
		balanceList.value = data ?? [];
		// 使用 reduce 简化金额累加逻辑
		sum.value = (data || []).reduce(
			(acc: math.BigNumber, item: FinanceDetail) => math.add(acc, math.bignumber(item.amount ?? 0)),
			math.bignumber(0),
		);
	} else {
		showNotify({
			type: 'danger',
			message: message || '查询列表失败！',
		});
	}
};

const init = (dateStr: string, belongTo: number | string | null) => {
	getBalanceInfo(belongTo, dateStr);
};

watch(
	() => [props.activeTab, props.dateStr, props.belongTo],
	() => {
		if (props.activeTab === '1') {
			init(props.dateStr, props.belongTo || null);
		}
	},
	{ immediate: true },
);
</script>
