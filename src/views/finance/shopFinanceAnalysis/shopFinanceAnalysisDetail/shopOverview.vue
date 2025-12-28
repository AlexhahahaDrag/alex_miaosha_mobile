<template>
	<van-grid :column-num="2">
		<div class="box-content-show">
			<div
				:class="index % 2 === 0 ? 'show-left' : 'show-right'"
				v-for="(item, index) in saleList"
				:key="index"
			>
				<BoardData :info="item"></BoardData>
			</div>
		</div>
		<div class="box-content-show">
			<div
				:class="index % 2 === 0 ? 'show-left' : 'show-right'"
				v-for="(item, index) in benefitList"
				:key="index"
			>
				<BoardData :info="item"></BoardData>
			</div>
		</div>
	</van-grid>
</template>

<script lang="ts" setup>
import { showNotify } from 'vant';
import dayjs from 'dayjs';
import type { ShopFinanceChainYear } from './common';
import { getChainAndYear, getBenefit } from '@/api/finance/shopFinanceAnalysis';
import commonUtils from '@/utils/common/index';
import type { Info } from '@/views/common/boardData/config';

const YYYYMMDD = 'YYYY-MM-DD';

interface Props {
	activeTab: number | string;
	dateStr: string;
	belongTo?: number | null;
}

const props = defineProps<Props>();

const saleList = ref<Info[]>([]);

const searchType = ref<string>('month');

const getChainAndYearInfo = (dateStr: string) => {
	const params = {
		startDate: `${dateStr}-01`,
		endDate: `${dateStr}-01`,
		searchType: searchType.value,
	};
	getChainAndYear(params).then((res: { code: string; data: ShopFinanceChainYear; message: any }) => {
		if (res.code == '200') {
			const arr: Info[] = [];
			arr.push({
				title: '月销售额',
				value: res.data?.saleAmount !== null ? commonUtils.formatAmount(res.data.saleAmount || 0, 2, '') : '--',
				year: res.data.saleAmountYear,
				chain: res.data.saleAmountChain,
				icon: 'saleAmount',
				unit: '元',
				showChain: true,
				showYear: true,
				color: '#55aaff',
			});
			arr.push({
				title: '月销售量',
				value: res.data?.saleNum !== null ? commonUtils.formatAmount(res.data.saleNum || 0, 2, '') : '--',
				year: res.data.saleNumYear,
				chain: res.data.saleNumChain,
				icon: 'saleNum',
				unit: '件',
				showChain: true,
				showYear: true,
				color: '#55aaff',
			});
			saleList.value = arr;
		} else {
			showNotify({
				type: 'danger',
				message: (res && res.message) || '查询列表失败！',
			});
		}
	});
};

const benefitList = ref<Info[]>([]);

const getBenefitInfo = (dateStr: string) => {
	const params = {
		startDate: `${dateStr}-01`,
		endDate: dayjs(`${dateStr}-01`).endOf('month').format(YYYYMMDD),
		searchType: searchType.value,
	};
	getBenefit({ params }).then((res: { code: string; data: ShopFinanceChainYear; message: any }) => {
		if (res.code == '200') {
			const arr: Info[] = [];
			arr.push({
				title: '月利润',
				value: res.data?.saleAmount !== null ? commonUtils.formatAmount(res.data.saleAmount || 0, 2, '') : '--',
				year: res.data.saleAmountYear,
				chain: res.data.saleAmountChain,
				icon: 'saleBenefit',
				unit: '元',
				showChain: true,
				showYear: true,
				color: '#ff9933',
			});
			arr.push({
				title: '月成本',
				value: res.data?.saleNum !== null ? commonUtils.formatAmount(res.data.saleNum || 0, 2, '') : '--',
				year: res.data.saleNumYear,
				chain: res.data.saleNumChain,
				icon: 'saleCost',
				unit: '元',
				showChain: true,
				showYear: true,
				color: '#ff9933',
			});
			benefitList.value = arr;
		} else {
			showNotify({
				type: 'danger',
				message: (res && res.message) || '查询列表失败！',
			});
		}
	});
};

const init = (dateStr: string) => {
	getChainAndYearInfo(dateStr);
	getBenefitInfo(dateStr);
};

watch(
	() => [props.activeTab, props.dateStr, props.belongTo],
	() => {
		if (props.activeTab === '1') {
			init(props.dateStr);
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
