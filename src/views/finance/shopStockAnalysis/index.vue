<template>
	<div class="selector-container">
		<div
			class="selector-item"
			@click="chooseDate"
		>
			<span class="selector-text">{{ infoDateName }} 账单</span>
			<van-icon
				name="arrow-down"
				class="selector-icon"
			/>
		</div>
	</div>
	<van-tabs
		v-model:active="activeTab"
		sticky
		swipeable
		@change="changeTab"
		class="finance-tabs"
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
	<date-pop
		:info="chooseDateInfo"
		@select-date-info="selectDateInfo"
		@cancel-date-info="cancelDateInfo"
	>
	</date-pop>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue';
import { useRoute } from 'vue-router';
import dayjs, { type Dayjs } from 'dayjs';
import { useNavBar } from '@/composables/useNavBar';
import { datePickerFormatter } from '@/utils/dayjs';
import type { DatePickerInfo } from '@/utils/common';

const route = useRoute();

// 导航栏配置
useNavBar({
	title: (route?.meta?.title as string) || '店库存分析',
	leftPath: '/',
	visible: true,
});

const DATE_FORMATTER = 'YYYY年MM月';
const DATE_FORMAT_YYYYMM = 'YYYY-MM';

const activeTab = ref<string>('2');

interface ShopStockAnalysisProps {
	activeTab: string;
	dateStr: string;
}

const props = reactive<ShopStockAnalysisProps>({
	activeTab: activeTab.value,
	dateStr: dayjs().format(DATE_FORMAT_YYYYMM),
});

const changeTab = (name: string) => {
	props.activeTab = name;
	activeTab.value = name;
};

const infoDateName = ref<string>(dayjs().format(DATE_FORMATTER));

const chooseDate = () => {
	chooseDateInfo.value.showFlag = true;
};

const chooseDateInfo = ref<DatePickerInfo<Dayjs>>({
	label: 'infoDate',
	labelName: '月份选择',
	selectValue: dayjs(),
	showFlag: false,
	columnsType: ['year', 'month'],
	formatter: datePickerFormatter,
});

const selectDateInfo = (dateInfo: Dayjs, dateName: string) => {
	chooseDateInfo.value.showFlag = false;
	props.dateStr = dayjs(dateInfo).format(DATE_FORMAT_YYYYMM);
	infoDateName.value = dateName;
	chooseDateInfo.value.selectValue = dateInfo;
};

const cancelDateInfo = () => {
	chooseDateInfo.value.showFlag = false;
};
</script>

<style lang="less" scoped>
.selector-container {
	display: flex;
	align-items: center;
	justify-content: flex-end;
	padding: 8px 16px;
	background-color: #fff;
	gap: 12px;
}

.selector-item {
	display: flex;
	align-items: center;
	gap: 4px;
	cursor: pointer;
}

.selector-text {
	font-size: 16px;
	color: #323233;
	font-weight: 500;
}

.selector-icon {
	font-size: 14px;
	color: #969799;
}

.finance-tabs {
	margin-top: 0;

	:deep(.van-tabs__wrap) {
		padding: 12px 20px;
		height: auto;
		background-color: #fff;
	}

	:deep(.van-tabs__nav) {
		background-color: #f2f3f5;
		padding: 4px;
		border-radius: 12px;
	}

	:deep(.van-tab) {
		flex: 1;
		border-radius: 10px;
		transition: all 0.2s ease;
		color: #646566;
		font-size: 16px;
		font-weight: 400;
		padding: 10px 0;
		margin: 0;
	}

	:deep(.van-tab--active) {
		background-color: #fff;
		color: #1989fa;
		font-weight: 600;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
	}

	:deep(.van-tabs__line) {
		display: none;
	}
}
</style>
