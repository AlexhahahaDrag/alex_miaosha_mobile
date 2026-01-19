<template>
	<div class="check-title-info">
		<span @click="choose">
			<a>{{ belongToName }}</a>
		</span>
		的
		<span @click="chooseDate">
			<a>{{ infoDateName }}</a>
		</span>
		账单
	</div>
	<van-tabs
		v-model:active="activeTab"
		sticky
		swipeable
		@change="changeTab"
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
			<incomeAnalysis v-bind="props"></incomeAnalysis>
		</van-tab>
		<van-tab
			title="收支明细"
			name="3"
		>
			<incomeDetail v-bind="props"></incomeDetail>
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
const activeTab = ref<number>(2);
const infoDateName = ref<string>(dayjs().format(DATE_FORMATTER));
const belongToName = ref<string>();

// Props 接口定义
interface FinanceAnalysisProps {
	activeTab: number;
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
const changeTab = (name: number) => {
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
			belongToName.value = getListName<UserManagerData>(data || [], belongTo.value || 0, 'id', 'nickName');
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
.check-title-info {
	display: flex;
	align-items: center;
	justify-content: flex-end;
	margin-right: 10px;
}

.topRow {
	padding-top: 10px;
}

a {
	color: blue;
	text-decoration: underline;
}
</style>
