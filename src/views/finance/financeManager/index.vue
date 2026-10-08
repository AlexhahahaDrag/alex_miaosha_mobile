<template>
	<div class="finance-manager-page">
		<section class="page-search">
			<div class="search-shell">
				<form
					action="/"
					class="search-shell__form"
				>
					<van-search
						v-model="searchInfo.bigTypeCode"
						placeholder="搜索账单、商家名或备注"
						shape="round"
						background="transparent"
						class="search-bar"
						@search="onSearch"
						@clear="onCancel"
					/>
				</form>
				<van-button
					type="primary"
					plain
					icon="filter-o"
					class="search-shell__filter-btn"
					@click="onToggleFilterPanel"
				/>
			</div>

			<div class="quick-time-bar">
				<div class="quick-time-bar__list">
					<button
						v-for="item in quickTimeOptions"
						:key="item.value"
						type="button"
						:class="['quick-time-chip', { 'quick-time-chip--active': activeTimePreset === item.value }]"
						@click="onSelectQuickTime(item.value)"
					>
						{{ item.label }}
					</button>
					<button
						v-if="activeTimePreset === 'custom'"
						type="button"
						class="quick-time-chip quick-time-chip--active"
						@click="onSelectQuickTime('custom')"
					>
						{{ getTimePresetLabel('custom') }}
					</button>
				</div>
			</div>

			<div
				v-if="activeFilterTags.length"
				class="active-tags"
			>
				<van-tag
					v-for="tag in activeFilterTags"
					:key="tag.key"
					plain
					round
					type="primary"
					class="active-tags__item"
				>
					{{ tag.label }}
				</van-tag>
				<button
					type="button"
					class="active-tags__clear"
					@click="onResetFilters"
				>
					清空
				</button>
			</div>
		</section>

		<common-filter-panel
			:show="showFilterPanel"
			:sections="filterSections"
			:model-value="searchInfo"
			:active-map="{ time: activeTimePreset }"
			@select="handleFilterSelect"
			@reset="onResetFilters"
			@submit="onApplyFilters"
		/>

		<!-- 本月零花钱预算卡片 -->
		<section
			class="pocket-money-card"
			data-testid="pocket-money-card"
		>
			<div class="pocket-money-header">
				<div class="pocket-money-title">
					<van-icon
						name="balance-o"
						class="title-icon"
					/>
					<span>本月零花钱 ({{ currentMonthStr }})</span>
					<van-tag
						v-if="budgetStatus?.isInherited"
						type="primary"
						plain
						round
						size="small"
						class="inherited-tag"
					>
						继承上月
					</van-tag>
				</div>
				<van-button
					size="mini"
					plain
					round
					type="primary"
					icon="setting-o"
					data-testid="btn-edit-budget"
					@click="onOpenBudgetDialog"
				>
					调整
				</van-button>
			</div>

			<div class="pocket-money-body">
				<div class="amount-main">
					<div class="amount-item">
						<div class="amount-label">月度预算</div>
						<div class="amount-value budget"> ¥{{ Number(budgetStatus?.budgetAmount || 0).toFixed(2) }} </div>
					</div>
					<div class="amount-item">
						<div class="amount-label">已用金额</div>
						<div class="amount-value expense"> ¥{{ Number(budgetStatus?.actualExpense || 0).toFixed(2) }} </div>
					</div>
					<div class="amount-item">
						<div class="amount-label">剩余额度</div>
						<div :class="['amount-value', (budgetStatus?.remainingAmount ?? 0) < 0 ? 'over' : 'remain']">
							¥{{ Number(budgetStatus?.remainingAmount || 0).toFixed(2) }}
						</div>
					</div>
				</div>

				<van-progress
					:percentage="Math.min(100, Number(budgetStatus?.usagePercent || 0))"
					:color="
						(budgetStatus?.remainingAmount ?? 0) < 0
							? '#ee0a24'
							: (budgetStatus?.usagePercent ?? 0) > 85
								? '#ff976a'
								: '#1989fa'
					"
					:pivot-text="`${budgetStatus?.usagePercent || 0}%`"
					class="pocket-money-progress"
					stroke-width="6"
				/>

				<div class="pocket-money-tags">
					<span class="tag-desc">统计分类:</span>
					<template v-if="budgetStatus?.categoryCodes?.length">
						<van-tag
							v-for="cat in budgetStatus?.categoryNames || budgetStatus?.categoryCodes"
							:key="cat"
							plain
							round
							size="small"
							class="category-tag"
						>
							{{ cat }}
						</van-tag>
					</template>
					<span
						v-else
						class="tag-all"
					>
						全部非转账支出
					</span>
				</div>
			</div>
		</section>

		<common-pull-refresh
			ref="pullRefresh"
			v-model="isRefresh"
			:class="'refresh-info'"
			@refresh="onRefreshData"
		>
			<common-list
				id="finance-manager-list"
				v-model="loading"
				:loading="loading"
				:refreshing="isRefresh"
				:finished="finished"
				:is-empty="!groupedDataSource.length"
				empty-text="没有找到符合条件的账单"
				@load="onLoadMore"
			>
				<template #skeleton>
					<div
						v-for="groupIndex in 2"
						:key="groupIndex"
						class="skeleton-group"
					>
						<div class="skeleton-date-header">
							<van-skeleton
								title
								:row="0"
							/>
						</div>
						<div
							v-for="itemIndex in 3"
							:key="itemIndex"
							class="skeleton-card"
						>
							<div class="skeleton-card__icon"></div>
							<div class="skeleton-card__main">
								<van-skeleton
									title
									:row="2"
								/>
							</div>
							<div class="skeleton-card__side">
								<van-skeleton :row="2" />
							</div>
						</div>
					</div>
				</template>

				<div class="card-list">
					<section
						v-for="group in groupedDataSource"
						:key="group.date"
						class="date-group"
					>
						<header class="date-group__header">
							<div class="date-group__title">
								<span>{{ formatHeaderDate(group.date) }}</span>
								<span class="date-group__weekday">{{ getWeekdayLabel(group.date) }}</span>
							</div>
							<div class="date-group__summary">
								<span v-if="Number(group.expense) > 0">支出 {{ formatCurrency(group.expense) }}</span>
								<span v-if="Number(group.income) > 0">收入 {{ formatCurrency(group.income) }}</span>
							</div>
						</header>

						<div class="date-group__body">
							<transition-group name="list">
								<finance-card
									v-for="item in group.items"
									:key="item.id"
									:item="item"
									@click="handleCardClick"
									@delete="onDeleteFinance"
								/>
							</transition-group>
						</div>
					</section>
				</div>
			</common-list>
		</common-pull-refresh>

		<van-calendar
			v-model:show="showCustomDatePicker"
			type="range"
			color="#1677ff"
			:max-date="new Date()"
			@confirm="onConfirmCustomDate"
		/>

		<!-- 调整本月零花钱预算弹窗 (移动端触控胶囊Chip风格) -->
		<van-dialog
			v-model:show="showBudgetDialog"
			title="调整本月零花钱预算"
			show-cancel-button
			data-testid="budget-dialog"
			@confirm="onSaveBudget"
		>
			<div class="budget-dialog-content">
				<div class="budget-month-banner">
					<span class="month-label">预算月份:</span>
					<span class="month-val">{{ currentMonthStr }}</span>
					<span class="month-tip">每月独立保存，次月自动继承</span>
				</div>

				<van-field
					v-model.number="budgetForm.budgetAmount"
					type="number"
					label="预算金额(元)"
					placeholder="请输入预算金额"
					input-align="right"
					data-testid="input-budget-amount"
					class="budget-amount-field"
				/>

				<div class="dialog-category-section">
					<div class="section-header">
						<div class="section-title">
							<span>纳入统计分类</span>
							<span class="selected-count">(已选 {{ budgetForm.categoryCodes.length }} 项)</span>
						</div>
						<div class="header-actions">
							<span
								class="action-btn"
								@click="selectAllCategories"
							>全选</span>
							<span class="action-sep">|</span>
							<span
								class="action-btn"
								@click="clearAllCategories"
							>清空</span>
						</div>
					</div>

					<div class="section-sub-label">收支类型</div>
					<div class="chip-group">
						<div
							v-for="item in incomeExpenseTypes"
							:key="item.value"
							:class="['chip-item', isCategorySelected(item.value) && 'active']"
							@click="toggleCategory(item.value)"
						>
							<van-icon
								v-if="isCategorySelected(item.value)"
								name="success"
								class="chip-check"
							/>
							<span>{{ item.label }}</span>
						</div>
					</div>

					<div class="section-sub-label category-sub-label">
						<span>账目类别 (提取自上月及本月)</span>
						<span
							v-if="categoriesLoading"
							class="loading-hint"
						>加载中...</span>
					</div>

					<div
						v-if="recentCategories.length"
						class="chip-group category-chips"
					>
						<div
							v-for="cat in recentCategories"
							:key="cat"
							:class="['chip-item', isCategorySelected(cat) && 'active']"
							@click="toggleCategory(cat)"
						>
							<van-icon
								v-if="isCategorySelected(cat)"
								name="success"
								class="chip-check"
							/>
							<span>{{ cat }}</span>
						</div>
					</div>
					<div
						v-else-if="!categoriesLoading"
						class="empty-category-hint"
					>
						近两个月暂无具体记账类别，默认统计全部支出
					</div>
				</div>

				<div class="dialog-hint"> * 仅勾选的类别支出会计入预算，不勾选则默认统计全部支出（不含转账）。 </div>
			</div>
		</van-dialog>

		<van-back-top
			target="#finance-manager-list"
			:bottom="100"
		/>
	</div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import dayjs, { type Dayjs } from 'dayjs';
import { showFailToast, showSuccessToast } from 'vant';
import { useRoute, useRouter } from 'vue-router';
import FinanceCard from './components/FinanceCard.vue';
import { fromSourceTransferList, type FinanceManagerData, type FinanceBudgetStatusVo } from './config';
import { usePagination } from '@/composables/usePagination';
import { useNavBar } from '@/composables/useNavBar';
import { useTabBar } from '@/composables/useTabBar';
import type { PageInfo, DictInfo } from '@/views/common/config';
import { getDictList } from '@/views/finance/dict/api';
import {
	deleteFinanceManager,
	getFinanceMangerPage,
	getBudgetStatus,
	saveMonthlyBudget,
	getBudgetCategories,
} from '@/views/finance/financeManager/api';
import { getUserManagerList } from '@/views/user/userManager/api';
import type { UserManagerData } from '@/views/user/userManager/config';
import type { ResponseBody } from '@/types/api';
import { formatHeaderDate } from '@/utils/dayjs';
import { getRoutePathByName } from '@/utils/router';
import { useDashboardStore } from '@/store/modules/dashboard/dashboard';

type TimePreset = 'today' | '7d' | 'month' | 'year' | 'all' | 'custom';

interface FilterOption {
	text: string;
	value: string;
}

interface GroupedFinanceRecords {
	date: string;
	items: FinanceManagerData[];
	expense: number;
	income: number;
}

interface ActiveFilterTag {
	key: string;
	label: string;
}

const timeFilterOptions: { label: string; value: TimePreset }[] = [
	{ label: '全部', value: 'all' },
	{ label: '近7天', value: '7d' },
	{ label: '本月', value: 'month' },
	{ label: '今年', value: 'year' },
	{ label: '今天', value: 'today' },
	{ label: '自定义', value: 'custom' },
];

const quickTimeOptions: { label: string; value: TimePreset }[] = [
	{ label: '全部', value: 'all' },
	{ label: '近7天', value: '7d' },
	{ label: '本月', value: 'month' },
	{ label: '今年', value: 'year' },
];

const router = useRouter();
const route = useRoute();
const dashboardStore = useDashboardStore();

const categoryList = ref<DictInfo[]>([]);
const userList = ref<UserManagerData[]>([]);
const loading = ref(true);
const dataSource = ref<FinanceManagerData[]>([]);
const searchInfo = ref<FinanceManagerData>({
	bigTypeCode: '',
	fromSource: '',
	incomeAndExpenses: '',
	belongTo: undefined,
});
const finished = ref<boolean>(false);
const isRefresh = ref<boolean>(false);
const manualFilterPanelOpen = ref<boolean>(false);
const activeTimePreset = ref<TimePreset>('all');
const showCustomDatePicker = ref<boolean>(false);
const customDateRange = ref<[Date, Date] | null>(null);

const currentMonthStr = computed(() => dayjs().format('YYYY-MM'));
const budgetStatus = ref<FinanceBudgetStatusVo | null>(null);
const showBudgetDialog = ref<boolean>(false);
const budgetForm = reactive({
	budgetAmount: 0,
	categoryCodes: [] as string[],
});

const incomeExpenseTypes = [
	{ label: '支出', value: '支出' },
	{ label: '收入', value: '收入' },
];
const recentCategories = ref<string[]>([]);
const categoriesLoading = ref(false);

const isCategorySelected = (val: string) => {
	return budgetForm.categoryCodes.includes(val);
};

const toggleCategory = (val: string) => {
	if (navigator.vibrate) navigator.vibrate(20);
	const idx = budgetForm.categoryCodes.indexOf(val);
	if (idx > -1) {
		budgetForm.categoryCodes.splice(idx, 1);
	} else {
		budgetForm.categoryCodes.push(val);
	}
};

const selectAllCategories = () => {
	if (navigator.vibrate) navigator.vibrate(25);
	const all = Array.from(new Set([...incomeExpenseTypes.map((t) => t.value), ...recentCategories.value]));
	budgetForm.categoryCodes = all;
};

const clearAllCategories = () => {
	if (navigator.vibrate) navigator.vibrate(25);
	budgetForm.categoryCodes = [];
};

const fetchRecentCategories = async () => {
	categoriesLoading.value = true;
	try {
		const { code, data } = await getBudgetCategories(currentMonthStr.value, searchInfo.value.belongTo);
		if (code === '200' && Array.isArray(data)) {
			const existingSelected = budgetForm.categoryCodes.filter((c) => c !== '支出' && c !== '收入');
			recentCategories.value = Array.from(new Set([...data, ...existingSelected])).sort();
		}
	} catch (e) {
		console.error('获取近两月记账类别失败:', e);
	} finally {
		categoriesLoading.value = false;
	}
};

const loadBudgetStatus = async () => {
	try {
		const { code, data } = await getBudgetStatus(currentMonthStr.value, searchInfo.value.belongTo);
		if (code === '200' && data) {
			budgetStatus.value = data;
		}
	} catch (e) {
		console.error('获取零花钱预算状态失败:', e);
	}
};

const onOpenBudgetDialog = async () => {
	if (navigator.vibrate) navigator.vibrate(40);
	budgetForm.budgetAmount = Number(budgetStatus.value?.budgetAmount || 0);
	budgetForm.categoryCodes = [...(budgetStatus.value?.categoryCodes || [])];
	showBudgetDialog.value = true;
	await fetchRecentCategories();
};

const onSaveBudget = async () => {
	if (budgetForm.budgetAmount < 0) {
		showFailToast('预算金额不能为负数！');
		return;
	}
	try {
		const { code, message } = await saveMonthlyBudget({
			yearMonth: currentMonthStr.value,
			belongTo: searchInfo.value.belongTo,
			budgetAmount: budgetForm.budgetAmount,
			categoryCodes: budgetForm.categoryCodes,
		});
		if (code === '200') {
			showSuccessToast('零花钱预算已更新');
			if (navigator.vibrate) navigator.vibrate(50);
			showBudgetDialog.value = false;
			await loadBudgetStatus();
		} else {
			showFailToast(message || '保存失败');
		}
	} catch (err: any) {
		showFailToast(err?.message || '保存失败');
	}
};

const { pagination, resetPagination, setTotal, nextPage } = usePagination();

const sourceFilterOptions = computed<FilterOption[]>(() => [
	{ text: '全部', value: '' },
	...fromSourceTransferList.map((item) => ({
		text: item.name || '',
		value: String(item.value || ''),
	})),
]);

const categoryFilterOptions = computed<FilterOption[]>(() => [
	{ text: '全部', value: '' },
	...categoryList.value.map((item) => ({
		text: item.typeName || '',
		value: String(item.typeCode || ''),
	})),
]);

const userFilterOptions = computed<FilterOption[]>(() => [
	{ text: '全部', value: '' },
	...userList.value.map((item) => ({
		text: item.nickName || '',
		value: String(item.id || ''),
	})),
]);

const showFilterPanel = computed(() => manualFilterPanelOpen.value);

const filterSections = computed(() => [
	{ label: '支付方式', icon: 'balance-o', key: 'fromSource', options: sourceFilterOptions.value },
	{ label: '类别', icon: 'apps-o', key: 'incomeAndExpenses', options: categoryFilterOptions.value },
	{ label: '用户', icon: 'user-o', key: 'belongTo', options: userFilterOptions.value },
	{ label: '时间', icon: 'underway-o', key: 'time', options: timeFilterOptions },
]);

const handleFilterSelect = ({ key, value }: { key: string; value: unknown }) => {
	switch (key) {
		case 'fromSource':
			onSelectSource(value as string);
			break;
		case 'incomeAndExpenses':
			onSelectCategory(value as string);
			break;
		case 'belongTo':
			onSelectUser(value as string);
			break;
		case 'time':
			onSelectTimePreset(value as TimePreset);
			break;
	}
};

const activeFilterTags = computed<ActiveFilterTag[]>(() => {
	const tags: ActiveFilterTag[] = [];
	const keyword = searchInfo.value.bigTypeCode?.trim();
	const sourceText = sourceFilterOptions.value.find((item) => item.value === searchInfo.value.fromSource)?.text;
	const categoryText = categoryFilterOptions.value.find(
		(item) => item.value === searchInfo.value.incomeAndExpenses,
	)?.text;

	if (keyword) {
		tags.push({ key: 'keyword', label: keyword });
	}

	if (sourceText && searchInfo.value.fromSource) {
		tags.push({ key: 'source', label: sourceText });
	}

	if (categoryText && searchInfo.value.incomeAndExpenses) {
		tags.push({ key: 'category', label: categoryText });
	}

	const userText = userFilterOptions.value.find((item) => item.value === String(searchInfo.value.belongTo || ''))?.text;
	if (userText && searchInfo.value.belongTo) {
		tags.push({ key: 'user', label: userText });
	}
	return tags;
});

const filteredRecords = computed(() => {
	const keyword = searchInfo.value.bigTypeCode?.trim().toLowerCase();
	return dataSource.value.filter((item) => {
		if (!keyword) {
			return true;
		}

		const searchTargets = [
			item.name,
			item.description,
			item.typeName,
			item.typeCode,
			item.belongToName,
			item.fromSourceName,
		]
			.filter(Boolean)
			.join(' ')
			.toLowerCase();

		return searchTargets.includes(keyword);
	});
});

const groupedDataSource = computed<GroupedFinanceRecords[]>(() => {
	const groups = new Map<string, GroupedFinanceRecords>();

	filteredRecords.value.forEach((item) => {
		if (!item.infoDate) {
			return;
		}

		const dateStr = dayjs(item.infoDate).format('YYYY-MM-DD');
		const currentGroup =
			groups.get(dateStr) ||
			({
				date: dateStr,
				items: [],
				expense: 0,
				income: 0,
			} satisfies GroupedFinanceRecords);

		currentGroup.items.push(item);

		const amount = Number(item.amount || 0);
		if (item.incomeAndExpenses === 'income') {
			currentGroup.income += amount;
		} else {
			currentGroup.expense += amount;
		}

		groups.set(dateStr, currentGroup);
	});

	return Array.from(groups.values());
});

const fetchCategories = async () => {
	const { code, data } = await getDictList('income_expense_type');
	if (code === '200' && Array.isArray(data)) {
		categoryList.value = data;
	}
};

const fetchUsers = async () => {
	const { code, data } = await getUserManagerList({});
	if (code === '200' && Array.isArray(data)) {
		userList.value = data;
	}
};

const getDetailRoutePath = (): string => getRoutePathByName(router, 'financeManagerDetail');

const getDetailRoute = (id?: string) => ({
	path: getDetailRoutePath(),
	query: { id },
});

useNavBar({
	title: (route?.meta?.title as string) || '财务信息',
	rightIcon: 'plus',
	leftPath: '/',
	visible: true,
	onRightClick: () => {
		router.push({ path: getDetailRoutePath() });
	},
});

useTabBar({
	visible: true,
	data: [
		{ name: 'dashboard', title: '首页', icon: 'homepage' },
		{ name: 'financeManager', title: '财务', icon: 'finance' },
		{ name: 'financeAnalysis', title: '分析', icon: 'financeAnalysis' },
		{ name: 'myself', title: '个人', icon: 'user' },
	],
	active: 1,
});

const resetData = () => {
	dataSource.value = [];
	finished.value = false;
	resetPagination();
};

const getFinancePage = async (param: FinanceManagerData, cur: PageInfo) => {
	if (!isRefresh.value) {
		loading.value = true;
	}

	const query = { ...param };
	if (!query.fromSource) {
		delete query.fromSource;
	}
	if (!query.incomeAndExpenses) {
		delete query.incomeAndExpenses;
	}
	if (!query.bigTypeCode) {
		delete query.bigTypeCode;
	}
	if (!query.belongTo) {
		delete query.belongTo;
	}

	// 将时间范围传递到服务端过滤，避免客户端全量加载
	const boundary = getTimeBoundary();
	if (boundary) {
		query.infoDateStart = boundary.start.format('YYYY-MM-DD');
		query.infoDateEnd = boundary.end.format('YYYY-MM-DD');
	} else {
		delete query.infoDateStart;
		delete query.infoDateEnd;
	}

	const { code, data, message } = await getFinanceMangerPage(query, cur?.current || 1, cur?.pageSize || 10)
		.catch((error: ResponseBody) => {
			throw error;
		})
		.finally(() => {
			loading.value = false;
			isRefresh.value = false;
		});

	if (code === '200') {
		if (cur?.current === 1) {
			dataSource.value = data?.records || [];
		} else {
			dataSource.value = [...dataSource.value, ...(data?.records || [])];
		}
		setTotal(data?.total || 0);
		finished.value = (pagination.total || 0) <= dataSource.value.length;
		return;
	}

	showFailToast(message || '查询账单失败');
};

const onSearch = () => {
	resetData();
	getFinancePage(searchInfo.value, pagination);
};

const onCancel = () => {
	searchInfo.value.bigTypeCode = '';
	onSearch();
};

const onRefreshData = () => {
	resetPagination();
	getFinancePage(searchInfo.value, pagination);
	loadBudgetStatus();
};

const onLoadMore = () => {
	if (isRefresh.value) {
		return;
	}
	if (dataSource.value.length > 0) {
		nextPage();
	}
	getFinancePage(searchInfo.value, pagination);
};

const onDeleteFinance = async (id?: string) => {
	if (!id) {
		return;
	}

	const { code, message } = await deleteFinanceManager(`${id}`);
	if (code === '200') {
		dashboardStore.updateSaveTime('财务信息');
		onRefreshData();
		showSuccessToast(message || '删除成功');
		return;
	}

	showFailToast(message || '删除失败，请联系管理员');
};

const handleCardClick = (item: FinanceManagerData) => {
	router.push(getDetailRoute(item.id));
};

const onToggleFilterPanel = () => {
	manualFilterPanelOpen.value = !manualFilterPanelOpen.value;
};

const onSelectSource = (value: string) => {
	searchInfo.value.fromSource = value;
};

const onSelectCategory = (value: string) => {
	searchInfo.value.incomeAndExpenses = value;
};

const onSelectUser = (value: string) => {
	searchInfo.value.belongTo = value ? Number(value) : undefined;
};

const onSelectTimePreset = (value: TimePreset) => {
	if (value === 'custom') {
		showCustomDatePicker.value = true;
		return;
	}

	activeTimePreset.value = value;
	customDateRange.value = null;
};

const onSelectQuickTime = (value: TimePreset) => {
	if (value === activeTimePreset.value && value !== 'custom') {
		return;
	}
	onSelectTimePreset(value);
	onSearch();
};

const onConfirmCustomDate = (value: Date[]) => {
	if (Array.isArray(value) && value.length === 2) {
		customDateRange.value = [value[0], value[1]];
		activeTimePreset.value = 'custom';
	}
	showCustomDatePicker.value = false;
};

const onResetFilters = () => {
	searchInfo.value = {
		bigTypeCode: '',
		fromSource: '',
		incomeAndExpenses: '',
		belongTo: undefined,
	};
	activeTimePreset.value = 'all';
	customDateRange.value = null;
	manualFilterPanelOpen.value = false;
	onSearch();
};

const onApplyFilters = () => {
	manualFilterPanelOpen.value = false;
	onSearch();
};

const getTimePresetLabel = (value: TimePreset) => {
	switch (value) {
		case 'today':
			return '今天';
		case '7d':
			return '近7天';
		case 'month':
			return '本月';
		case 'year':
			return '今年';
		case 'custom':
			if (customDateRange.value) {
				return `${dayjs(customDateRange.value[0]).format('MM/DD')} - ${dayjs(customDateRange.value[1]).format('MM/DD')}`;
			}
			return '自定义';
		default:
			return '全部';
	}
};

const getTimeBoundary = (): { start: Dayjs; end: Dayjs } | null => {
	const now = dayjs();

	switch (activeTimePreset.value) {
		case 'today':
			return { start: now.startOf('day'), end: now.endOf('day') };
		case '7d':
			return { start: now.subtract(6, 'day').startOf('day'), end: now.endOf('day') };
		case 'month':
			return { start: now.startOf('month'), end: now.endOf('month') };
		case 'year':
			return { start: now.startOf('year'), end: now.endOf('year') };
		case 'custom':
			if (!customDateRange.value) {
				return null;
			}
			return {
				start: dayjs(customDateRange.value[0]).startOf('day'),
				end: dayjs(customDateRange.value[1]).endOf('day'),
			};
		default:
			return null;
	}
};

const formatCurrency = (value: number) => `¥${value.toFixed(2)}`;

const getWeekdayLabel = (date: string) => dayjs(date).format('ddd').replace('.', '');

onMounted(() => {
	resetData();
	fetchCategories();
	fetchUsers();

	if (route.query.fromSource) {
		searchInfo.value.fromSource = route.query.fromSource as string;
	}

	if (route.query.incomeAndExpenses) {
		searchInfo.value.incomeAndExpenses = route.query.incomeAndExpenses as string;
	}

	if (route.query.belongTo) {
		searchInfo.value.belongTo = Number(route.query.belongTo);
	}

	loadBudgetStatus();
	getFinancePage(searchInfo.value, pagination);
});

watch(
	() => searchInfo.value.belongTo,
	() => {
		loadBudgetStatus();
	},
);
</script>

<style lang="less" scoped>
.finance-manager-page {
	background: #f5f7fb;
	height: 100%;
	display: flex;
	flex-direction: column;
	overflow: hidden;
}

.page-search {
	padding: 12px 14px 8px;
	background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
}

.search-shell {
	display: flex;
	align-items: center;
	gap: 10px;

	&__form {
		flex: 1;
	}

	&__filter-btn {
		width: 38px;
		height: 38px;
		padding: 0;
		border-radius: 12px;
		font-size: 18px; /* 调大一点图标 */
	}
}

.search-bar {
	--van-search-padding: 0;
	--van-search-content-background: #f2f5fb;
	--van-search-input-height: 38px;
	background: transparent;

	:deep(.van-search__content) {
		border-radius: 14px;
		padding-left: 12px;
	}
}

.quick-time-bar {
	display: flex;
	align-items: center;
	padding-top: 10px;

	&__list {
		display: flex;
		align-items: center;
		gap: 8px;
		flex-wrap: wrap;
	}
}

.quick-time-chip {
	border: 1px solid #e2e8f0;
	background: #f8fafc;
	color: #64748b;
	font-size: 12px;
	font-weight: 500;
	padding: 4px 12px;
	border-radius: 9999px;
	cursor: pointer;
	transition: all 0.2s ease;
	line-height: 18px;

	&--active {
		border-color: #1677ff;
		background: #e6f4ff;
		color: #1677ff;
		font-weight: 600;
	}
}

.active-tags {
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	gap: 8px;
	padding-top: 10px;

	&__item {
		padding: 5px 10px;
		background: #f4f8ff;
		border-color: #d7e7ff;
	}

	&__clear {
		border: none;
		background: transparent;
		color: #1677ff;
		font-size: 12px;
		padding: 0 2px;
	}
}

.refresh-info {
	flex: 1;
	min-height: 0;
	background: #f5f7fb;
}

.card-list {
	padding: 0 0;
}

.date-group {
	margin-bottom: 12px;

	&__header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 10px 4px 8px;
	}

	&__title {
		display: flex;
		align-items: baseline;
		gap: 6px;
		font-size: 15px;
		font-weight: 700;
		color: #25324a;
	}

	&__weekday {
		font-size: 11px;
		font-weight: 500;
		color: #8b97ab;
		text-transform: uppercase;
	}

	&__summary {
		display: flex;
		gap: 10px;
		font-size: 11px;
		color: #8b97ab;
	}

	&__body {
		background: #ffffff;
		border-radius: 18px;
		padding: 4px 0;
		box-shadow: 0 8px 24px rgba(15, 56, 120, 0.05);
	}
}

.list-enter-active,
.list-leave-active {
	transition: all 0.25s ease;
}

.list-enter-from,
.list-leave-to {
	opacity: 0;
	transform: translateY(8px);
}

.empty-state-container {
	padding: 48px 0 120px;
}

.clear-filters-btn {
	margin-top: 16px;
	padding: 0 28px;
}

.skeleton-group {
	margin-bottom: 16px;
}

.skeleton-date-header {
	margin: 12px 0 10px;
	width: 120px;

	:deep(.van-skeleton__title) {
		margin: 0;
		height: 14px;
	}
}

.skeleton-card {
	display: grid;
	grid-template-columns: 42px 1fr 72px;
	gap: 12px;
	align-items: center;
	padding: 14px 16px;
	margin-bottom: 8px;
	background: #ffffff;
	border-radius: 16px;

	&__icon {
		width: 42px;
		height: 42px;
		border-radius: 50%;
		background: linear-gradient(135deg, #eef4ff 0%, #f8fbff 100%);
	}

	&__main,
	&__side {
		:deep(.van-skeleton) {
			padding: 0;
		}
	}

	&__main {
		:deep(.van-skeleton__title) {
			height: 14px;
			width: 72%;
			margin-bottom: 8px;
		}

		:deep(.van-skeleton__row) {
			height: 10px;
			width: 58%;
		}
	}

	&__side {
		:deep(.van-skeleton__row) {
			height: 12px;
			width: 100%;
			margin-left: auto;
		}
	}
}

.pocket-money-card {
	margin: 10px 14px 6px;
	padding: 14px 16px;
	background: #ffffff;
	border-radius: 14px;
	box-shadow: 0 4px 16px rgba(22, 119, 255, 0.06);
	border: 1px solid rgba(22, 119, 255, 0.08);

	.pocket-money-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 12px;

		.pocket-money-title {
			display: flex;
			align-items: center;
			gap: 6px;
			font-size: 15px;
			font-weight: 600;
			color: #323233;

			.title-icon {
				font-size: 18px;
				color: #1677ff;
			}

			.inherited-tag {
				font-size: 10px;
			}
		}
	}

	.pocket-money-body {
		.amount-main {
			display: grid;
			grid-template-columns: repeat(3, 1fr);
			gap: 8px;
			text-align: center;
			margin-bottom: 12px;

			.amount-item {
				.amount-label {
					font-size: 12px;
					color: #8c8c8c;
					margin-bottom: 4px;
				}

				.amount-value {
					font-size: 15px;
					font-weight: 700;

					&.budget {
						color: #262626;
					}

					&.expense {
						color: #fa8c16;
					}

					&.remain {
						color: #52c41a;
					}

					&.over {
						color: #f5222d;
					}
				}
			}
		}

		.pocket-money-progress {
			margin-bottom: 10px;
		}

		.pocket-money-tags {
			display: flex;
			align-items: center;
			flex-wrap: wrap;
			gap: 6px;
			font-size: 12px;
			color: #8c8c8c;

			.category-tag {
				font-size: 11px;
				color: #1677ff;
				background: #f0f7ff;
				border-color: #d6e4ff;
			}

			.tag-all {
				color: #595959;
			}
		}
	}
}

.budget-dialog-content {
	padding: 14px 16px 8px;
	max-height: 70vh;
	overflow-y: auto;
	box-sizing: border-box;

	.budget-month-banner {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 6px;
		padding: 8px 12px;
		background: #f0f7ff;
		border: 1px solid #d6e4ff;
		border-radius: 8px;
		margin-bottom: 12px;
		font-size: 12px;

		.month-label {
			color: #595959;
		}

		.month-val {
			font-weight: 600;
			color: #1677ff;
		}

		.month-tip {
			font-size: 11px;
			color: #8c8c8c;
			margin-left: auto;
		}
	}

	.budget-amount-field {
		background: #f8fafc;
		border-radius: 8px;
		margin-bottom: 12px;
		padding: 8px 12px;
		border: 1px solid #f0f0f0;
	}

	.dialog-category-section {
		margin-top: 12px;

		.section-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 8px;

			.section-title {
				font-size: 13px;
				font-weight: 600;
				color: #323233;
				display: flex;
				align-items: center;
				gap: 4px;

				.selected-count {
					font-size: 11px;
					color: #1677ff;
					font-weight: normal;
				}
			}

			.header-actions {
				display: flex;
				align-items: center;
				gap: 6px;
				font-size: 12px;
				color: #1677ff;

				.action-btn {
					cursor: pointer;
					padding: 2px 4px;

					&:active {
						opacity: 0.6;
					}
				}

				.action-sep {
					color: #d9d9d9;
				}
			}
		}

		.section-sub-label {
			font-size: 11px;
			color: #8c8c8c;
			margin: 8px 0 6px;

			&.category-sub-label {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-top: 10px;

				.loading-hint {
					font-size: 10px;
					color: #bfbfbf;
				}
			}
		}

		.chip-group {
			display: flex;
			flex-wrap: wrap;
			gap: 8px;

			&.category-chips {
				max-height: 125px;
				overflow-y: auto;
				padding: 2px 0;
			}
		}

		.chip-item {
			display: inline-flex;
			align-items: center;
			gap: 4px;
			padding: 5px 12px;
			font-size: 12px;
			line-height: 1.2;
			border-radius: 16px;
			background: #f5f5f5;
			color: #595959;
			border: 1px solid #f0f0f0;
			cursor: pointer;
			user-select: none;
			transition: all 0.15s ease;

			&:active {
				transform: scale(0.96);
			}

			&.active {
				background: #e6f4ff;
				color: #1677ff;
				border-color: #91caff;
				font-weight: 500;
			}

			.chip-check {
				font-size: 12px;
				color: #1677ff;
			}
		}

		.empty-category-hint {
			font-size: 12px;
			color: #bfbfbf;
			text-align: center;
			padding: 12px 0;
		}
	}

	.dialog-hint {
		font-size: 11px;
		color: #8c8c8c;
		margin-top: 14px;
		line-height: 1.5;
		background: #fafafa;
		padding: 8px 10px;
		border-radius: 6px;
		border-left: 3px solid #1677ff;
	}
}
</style>
