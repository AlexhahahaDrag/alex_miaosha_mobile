<template>
	<NavBar :info="info"></NavBar>
	<van-tabs
		v-model:active="activeTab"
		sticky
		swipeable
		@change="changeTab"
	>
		<van-tab
			title="店总览"
			name="1"
		>
			<ShopStockOverview v-bind="props"></ShopStockOverview>
		</van-tab>
		<van-tab
			title="店收支分析"
			name="2"
		>
			<ShopStockInfoAnalysis v-bind="props"></ShopStockInfoAnalysis>
		</van-tab>
		<van-tab
			title="店收支明细"
			name="3"
		>
			<ShopStockAnalysisDetail v-bind="props"></ShopStockAnalysisDetail>
		</van-tab>
	</van-tabs>
	<monthPop
		:info="chooseDateInfo"
		@select-info="selectDateInfo"
		@cancel-info="cancelDateInfo"
	></monthPop>
</template>

<script lang="ts" setup>
import dayjs, { type Dayjs } from 'dayjs';

const route = useRoute();

const info = ref<any>({
	title: route?.meta?.title || '店财务分析',
	leftPath: '/',
});

const dateFormatter = 'YYYY年MM月';
const YYYYMM = 'YYYY-MM';

const activeTab = ref<number>(2);

const props = reactive<any>({
	activeTab: activeTab.value,
	dateStr: dayjs().format(YYYYMM),
});

const infoDateName = ref<string>(dayjs().format(dateFormatter));

const chooseDateInfo = ref<any>({
	label: 'infoDate',
	labelName: '月份选择',
	selectValue: dayjs(),
	showFlag: false,
	columnsType: ['year', 'month'],
	formatter: (type: string, option: any) => {
		if (type === 'year') {
			option.text += '年';
		}
		if (type === 'month') {
			option.text += '月';
		}
		return option;
	},
});

const changeTab = (name: number) => {
	props.activeTab = name;
	activeTab.value = name;
};

const selectDateInfo = (dateInfo: Dayjs, dateName: string) => {
	chooseDateInfo.value.showFlag = false;
	props.dateStr = dayjs(dateInfo).format(YYYYMM);
	infoDateName.value = dateName;
	chooseDateInfo.value.selectValue = dateInfo;
};

const cancelDateInfo = () => {
	chooseDateInfo.value.showFlag = false;
};
</script>
<style lang="less" scoped>
.topRow {
	padding-top: 10px;
}

a {
	color: blue;
	text-decoration: underline;
}
</style>
