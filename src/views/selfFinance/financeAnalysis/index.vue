<template>
	<div class="finance-analysis-page">
		<!-- 顶部双胶囊对称筛选栏 (Soft Pill Filter Bar) -->
		<div class="selector-container">
			<button
				type="button"
				class="selector-pill selector-pill--user"
				data-testid="analysis-user-selector"
				@click="choose"
			>
				<van-icon
					name="user-o"
					class="pill-lead-icon"
				/>
				<span class="selector-text">{{ belongToName || '全部成员' }}</span>
				<van-icon
					name="arrow-down"
					class="selector-icon"
				/>
			</button>

			<div class="month-stepper-group">
				<button
					type="button"
					class="month-step-btn"
					aria-label="上一月"
					data-testid="analysis-prev-month"
					@click="stepMonth(-1)"
				>
					<van-icon name="arrow-left" />
				</button>
				<button
					type="button"
					class="selector-pill selector-pill--date"
					data-testid="analysis-date-selector"
					@click="chooseDate"
				>
					<van-icon
						name="calendar-o"
						class="pill-lead-icon"
					/>
					<span class="selector-text">{{ infoDateName }}</span>
					<van-icon
						name="arrow-down"
						class="selector-icon"
					/>
				</button>
				<button
					type="button"
					class="month-step-btn"
					aria-label="下一月"
					data-testid="analysis-next-month"
					@click="stepMonth(1)"
				>
					<van-icon name="arrow" />
				</button>
			</div>
		</div>

		<van-tabs
			v-model:active="activeTab"
			sticky
			swipeable
			class="finance-tabs"
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
	</div>
</template>

<script lang="ts" setup>
import { showFailToast } from 'vant';
import { formatDate, formatDayjs, formatMonth, nowDayjs, datePickerFormatter, type Dayjs } from '@/utils/dayjs';
import type { Info } from '@/components/pop/selectPop.vue';
import { getListName } from '@/views/common/config';
import { useUserStore } from '@/store/modules/user/user';
import { getUserManagerList } from '@/views/user/userManager/api';
import type { DatePickerInfo } from '@/utils/common';
import type { UserManagerData } from '@/views/user/userManager/api';
import { useNavBar } from '@/composables/useNavBar';
import { useTabBar } from '@/composables/useTabBar';
import { triggerHaptic } from '@/utils/haptics';
import Overview from '@/views/selfFinance/financeAnalysis/financeAnalysisDetail/overview.vue';
import IncomeAnalysis from '@/views/selfFinance/financeAnalysis/financeAnalysisDetail/incomeAnalysis.vue';
import IncomeDetail from '@/views/selfFinance/financeAnalysis/financeAnalysisDetail/incomeDetail.vue';

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
const ALL_USER_OPTION = { id: '0', nickName: '家庭组所有人' };

// 响应式数据
const userInfo = useUserStore()?.getUserInfo;
const belongTo = ref<string | null>(userInfo?.id ? userInfo.id.toString() : null);
const activeTab = ref<string>('1');
const currentMonthDayjs = ref<Dayjs>(nowDayjs());
const infoDateName = ref<string>(formatDate(currentMonthDayjs.value, DATE_FORMATTER));
const belongToName = ref<string>();

// Props 接口定义
interface FinanceAnalysisProps {
	activeTab: string;
	dateStr: string;
	belongTo: string | null;
}

const props = reactive<FinanceAnalysisProps>({
	activeTab: activeTab.value,
	dateStr: formatMonth(currentMonthDayjs.value),
	belongTo: belongTo.value,
});

const chooseDateInfo = ref<DatePickerInfo<Dayjs>>({
	label: 'infoDate',
	labelName: '月份选择',
	selectValue: currentMonthDayjs.value,
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
	triggerHaptic('selection');
	props.activeTab = name;
	activeTab.value = name;
};

// 快捷切换上/下月
const stepMonth = (offset: number) => {
	triggerHaptic('light');
	const nextDate = formatDayjs(currentMonthDayjs.value).add(offset, 'month');
	currentMonthDayjs.value = nextDate;
	props.dateStr = formatMonth(nextDate);
	infoDateName.value = formatDate(nextDate, DATE_FORMATTER);
	chooseDateInfo.value.selectValue = nextDate;
};

// 日期选择处理
const chooseDate = () => {
	triggerHaptic('light');
	chooseDateInfo.value.showFlag = true;
};

const selectDateInfo = (dateInfo: Dayjs, dateName: string) => {
	triggerHaptic('light');
	chooseDateInfo.value.showFlag = false;
	currentMonthDayjs.value = dateInfo;
	props.dateStr = formatMonth(dateInfo);
	infoDateName.value = dateName || formatDate(dateInfo, DATE_FORMATTER);
	chooseDateInfo.value.selectValue = dateInfo;
};

const cancelDateInfo = () => {
	chooseDateInfo.value.showFlag = false;
};

// 用户选择处理
const choose = () => {
	triggerHaptic('light');
	popInfo.value.showFlag = true;
};

const selectInfo = (type: string, value: string | null, name: string) => {
	triggerHaptic('light');
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
			popInfo.value.list = [ALL_USER_OPTION, ...(data || [])];
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
	} catch {
		showFailToast('查询失败，请联系管理员!');
	}
};

// 初始化
const init = () => {
	getUserInfoListInfo();
};

onMounted(() => {
	init();
});
</script>

<style lang="less" scoped>
.finance-analysis-page {
	min-height: 100%;
	background-color: #f1f4fa;
}

.selector-container {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 10px 16px 6px;
	background-color: #ffffff;
	gap: 10px;
}

.selector-pill {
	display: inline-flex;
	align-items: center;
	gap: 5px;
	padding: 6px 12px;
	border-radius: 9999px;
	border: none;
	cursor: pointer;
	transition: all 0.18s ease;
	line-height: 1.2;

	&:active {
		transform: scale(0.97);
	}

	&--user {
		background-color: rgba(79, 106, 246, 0.1);
		color: #4f6af6;

		.pill-lead-icon,
		.selector-text,
		.selector-icon {
			color: #4f6af6;
		}
	}

	&--date {
		background-color: #f1f5f9;
		color: #1e293b;
		padding: 6px 11px;

		.pill-lead-icon {
			color: #4f6af6;
		}
	}
}

.pill-lead-icon {
	font-size: 14px;
}

.selector-text {
	font-size: 13px;
	font-weight: 600;
	color: #1e293b;
	font-variant-numeric: tabular-nums;
	max-width: 112px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.selector-icon {
	font-size: 11px;
	color: #64748b;
}

.month-stepper-group {
	display: inline-flex;
	align-items: center;
	gap: 4px;
	background-color: #f8fafc;
	padding: 2px;
	border-radius: 9999px;
}

.month-step-btn {
	width: 28px;
	height: 28px;
	border-radius: 9999px;
	border: none;
	background: #ffffff;
	color: #475569;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	font-size: 12px;
	cursor: pointer;
	box-shadow: 0 1px 3px rgba(15, 23, 42, 0.05);
	transition: all 0.15s ease;

	&:active {
		transform: scale(0.94);
		color: #4f6af6;
		background-color: rgba(79, 106, 246, 0.08);
	}
}

.finance-tabs {
	margin-top: 0;

	:deep(.van-tabs__wrap) {
		padding: 8px 16px 12px;
		height: auto;
		background-color: #ffffff;
		border-bottom: 1px solid rgba(226, 232, 240, 0.6);
	}

	:deep(.van-tabs__nav) {
		background-color: #eef2f9;
		padding: 4px;
		border-radius: 14px;
	}

	:deep(.van-tab) {
		flex: 1;
		border-radius: 10px;
		transition: all 0.2s cubic-bezier(0.22, 1, 0.36, 1);
		color: #64748b;
		font-size: 14px;
		font-weight: 500;
		padding: 8px 0;
		margin: 0;
	}

	:deep(.van-tab--active) {
		background-color: #ffffff;
		color: #4f6af6;
		font-weight: 700;
		box-shadow: 0 2px 8px rgba(79, 106, 246, 0.14);
	}

	:deep(.van-tabs__line) {
		display: none;
	}
}
</style>
