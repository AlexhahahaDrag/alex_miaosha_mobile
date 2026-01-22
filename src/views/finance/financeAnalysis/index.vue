<template>
	<div class="selector-container">
		<div
			class="selector-item"
			@click="choose"
		>
			<span class="selector-text">{{ belongToName || '请选择' }}</span>
			<van-icon
				name="arrow-down"
				class="selector-icon"
			/>
		</div>
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
			title="总览"
			name="1"
		>
			<overview v-bind="props"></overview>
		</van-tab>
		<van-tab
			title="收支分析"
			name="2"
		>
			<income-analysis v-bind="props"></income-analysis>
		</van-tab>
		<van-tab
			title="收支明细"
			name="3"
		>
			<income-detail v-bind="props"></income-detail>
		</van-tab>
	</van-tabs>
	<date-pop
		:info="chooseDateInfo"
		@select-date-info="selectDateInfo"
		@cancel-date-info="cancelDateInfo"
	></date-pop>
	<select-pop
		:info="popInfo"
		@select-info="selectInfo"
		@cancel-info="cancelInfo"
	></select-pop>
</template>

<script lang="ts" setup>
import dayjs, { type Dayjs } from 'dayjs';
import { showFailToast } from 'vant';
import type { Info } from '@/views/common/pop/selectPop.vue';
import { getListName } from '@/views/common/config';
import { useUserStore } from '@/store/modules/user/user';
import { getUserManagerList } from '@/api/user/userManager';
import { datePickerFormatter } from '@/utils/dayjs';
import type { DatePickerInfo } from '@/utils/common';
import type { UserManagerData } from '@/api/user/userManager';
import { useNavBar } from '@/composables/useNavBar';
import { useTabBar } from '@/composables/useTabBar';

const route = useRoute();

// 导航栏配置
useNavBar({
	title: (route?.meta?.title as string) || '财务分析',
	leftPath: '/',
	visible: true,
	rightIcon: 'share-o',
});

// TabBar配置
useTabBar({
	visible: true,
	data: ['dashboard', 'financeManager', 'financeAnalysis', 'myself'],
	active: 2,
});

// 常量定义
const DATE_FORMATTER = 'YYYY年MM月';
const DATE_FORMAT_YYYYMM = 'YYYY-MM';
const ALL_USER_OPTION = { id: '0', nickName: '所有人' };

// 响应式数据
const userInfo = useUserStore()?.getUserInfo;
const belongTo = ref<string | null>(userInfo?.id ? userInfo.id.toString() : null);
const activeTab = ref<string>('1');
const infoDateName = ref<string>(dayjs().format(DATE_FORMATTER));
const belongToName = ref<string>();

// Props 接口定义
interface FinanceAnalysisProps {
	activeTab: string;
	dateStr: string;
	belongTo: string | null;
}

const props = reactive<FinanceAnalysisProps>({
	activeTab: activeTab.value,
	dateStr: dayjs().format(DATE_FORMAT_YYYYMM),
	belongTo: belongTo.value,
});

const chooseDateInfo = ref<DatePickerInfo<Dayjs>>({
	label: 'infoDate',
	labelName: '月份选择',
	selectValue: dayjs(),
	showFlag: false,
	columnsType: ['year', 'month'],
	formatter: datePickerFormatter,
});

// 用户选择器信息
const popInfo = ref<Info>({
	showFlag: false,
	label: 'belongTo',
	labelName: '属于',
	customFieldName: {
		text: 'nickName',
		value: 'id',
	},
	list: [ALL_USER_OPTION],
	selectValue: [belongTo.value],
});

// Tab 切换处理
const changeTab = (name: string) => {
	props.activeTab = name;
	activeTab.value = name;
};

// 日期选择处理
const chooseDate = () => {
	chooseDateInfo.value.showFlag = true;
};

const selectDateInfo = (dateInfo: Dayjs, dateName: string) => {
	chooseDateInfo.value.showFlag = false;
	props.dateStr = dayjs(dateInfo).format(DATE_FORMAT_YYYYMM);
	infoDateName.value = dateName;
	chooseDateInfo.value.selectValue = dateInfo;
};

const cancelDateInfo = () => {
	chooseDateInfo.value.showFlag = false;
};

// 用户选择处理
const choose = () => {
	popInfo.value.showFlag = true;
};

const selectInfo = (type: string, value: string | null, name: string) => {
	popInfo.value.showFlag = false;
	if (type === 'belongTo') {
		belongTo.value = value;
		belongToName.value = name;
		props.belongTo = value;
	}
};

const cancelInfo = () => {
	popInfo.value.showFlag = false;
};

// 获取用户列表
const getUserInfoListInfo = async () => {
	try {
		const { code, data, message } = await getUserManagerList({});
		if (code === '200') {
			popInfo.value.list = [...(popInfo.value?.list || []), ...(data || [])];
			const name = getListName<UserManagerData>(data || [], belongTo.value || 0, 'id', 'nickName');
			belongToName.value = name || ALL_USER_OPTION.nickName;
			// 如果没有选择用户，默认选择"所有人"
			if (!belongTo.value) {
				belongTo.value = ALL_USER_OPTION.id;
				belongToName.value = ALL_USER_OPTION.nickName;
			}
		} else {
			showFailToast(message || '查询失败，请联系管理员!');
		}
	} catch (error) {
		showFailToast('查询失败，请联系管理员!');
	}
};

// 初始化
const init = () => {
	getUserInfoListInfo();
};

init();
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
