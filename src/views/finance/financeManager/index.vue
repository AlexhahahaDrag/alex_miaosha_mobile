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

		<common-pull-refresh
			ref="pullRefresh"
			v-model="isRefresh"
			:class="'refresh-info'"
			@refresh="onRefreshData"
		>
			<!-- 本月零花钱预算卡片 (随列表自然滚动，不吸顶) -->
			<section
				class="pocket-money-card"
				:class="{ 'pocket-money-card--expanded': isBudgetCardExpanded }"
				data-testid="pocket-money-card"
			>
				<!-- 紧凑常驻条 (平时仅展示标题、余额与百分比，点击触发折叠/展开) -->
				<div
					class="pocket-money-header"
					@click="toggleBudgetCardExpand"
				>
					<div class="pocket-money-title">
						<div class="title-icon-box">
							<van-icon
								name="balance-o"
								class="title-icon"
							/>
						</div>
						<span class="title-text">本月零花钱</span>
						<span
							v-if="budgetHealthStatus"
							class="health-badge"
							:style="{
								color: budgetHealthStatus.color,
								backgroundColor: budgetHealthStatus.bgColor,
								borderColor: `${budgetHealthStatus.color}33`,
							}"
						>
							<span
								class="health-dot"
								:style="{ backgroundColor: budgetHealthStatus.color }"
							/>
							<span>{{ budgetHealthStatus.text }}</span>
						</span>
					</div>

					<div class="pocket-money-summary">
						<div class="summary-metric">
							<span class="metric-label">剩余</span>
							<span :class="['metric-val', (budgetStatus?.remainingAmount ?? 0) < 0 ? 'over' : 'remain']">
								<span class="currency-symbol">{{ (budgetStatus?.remainingAmount ?? 0) < 0 ? '-¥' : '¥' }}</span>{{ formatAmount(Math.abs(budgetStatus?.remainingAmount || 0)) }}
							</span>
						</div>
						<span class="percent-pill"> {{ budgetStatus?.usagePercent || 0 }}% </span>
						<div class="toggle-arrow-btn">
							<van-icon
								name="arrow-down"
								class="toggle-arrow"
							/>
						</div>
					</div>
				</div>

				<!-- 折叠态常驻底边微环境进度条 (Taste-Skill 隐式状态感知) -->
				<div
					v-if="!isBudgetCardExpanded && Number(budgetStatus?.budgetAmount || 0) > 0"
					class="ambient-progress-track"
				>
					<div
						class="ambient-progress-bar"
						:style="{
							width: `${Math.max(0, Math.min(100, Number(budgetStatus?.usagePercent || 0)))}%`,
							backgroundColor: progressColor,
						}"
					/>
				</div>

				<!-- 展开后的完整详细面板 -->
				<transition name="expand">
					<div
						v-show="isBudgetCardExpanded"
						class="pocket-money-body"
					>
						<div class="amount-main">
							<div class="amount-item amount-card">
								<div class="amount-label">月度预算</div>
								<div class="amount-value budget">
									<span class="amount-currency">¥</span>{{ formatAmount(budgetStatus?.budgetAmount) }}
								</div>
							</div>
							<div
								class="amount-item amount-card amount-card--clickable"
								@click.stop="drillDownBudgetMonth"
							>
								<div class="amount-label flex items-center justify-center gap-0.5">
									<span>{{ mobileSpentLabel }}</span>
									<span class="drill-tag">明细›</span>
								</div>
								<div
									:class="[
										'amount-value',
										(budgetStatus?.actualExpense ?? 0) <= 0 ? 'surplus' : budgetStatus?.isOverBudget ? 'over' : 'expense',
									]"
									title="点击联动查看当月已计明细"
								>
									<span class="amount-currency">{{ (budgetStatus?.actualExpense ?? 0) < 0 ? '-¥' : '¥' }}</span>{{ formatAmount(Math.abs(budgetStatus?.actualExpense || 0)) }}
								</div>
							</div>
							<div class="amount-item amount-card">
								<div class="amount-label">剩余额度</div>
								<div :class="['amount-value', (budgetStatus?.remainingAmount ?? 0) < 0 ? 'over' : 'remain']">
									<span class="amount-currency">{{ (budgetStatus?.remainingAmount ?? 0) < 0 ? '-¥' : '¥' }}</span>{{ formatAmount(Math.abs(budgetStatus?.remainingAmount || 0)) }}
								</div>
							</div>
						</div>

						<van-progress
							:percentage="Math.max(0, Math.min(100, Number(budgetStatus?.usagePercent || 0)))"
							:color="progressColor"
							:pivot-text="`${budgetStatus?.usagePercent || 0}%`"
							class="pocket-money-progress"
							stroke-width="6"
						/>

						<div class="pocket-money-footer">
							<div class="pocket-money-tags">
								<span class="tag-desc">统计分类:</span>
								<template v-if="cleanedCategoryList.length">
									<van-tag
										v-for="cat in displayCategoryList"
										:key="cat"
										plain
										round
										size="small"
										class="category-tag"
									>
										{{ cat }}
									</van-tag>
									<button
										v-if="cleanedCategoryList.length > 4"
										type="button"
										class="tag-expand-btn"
										@click.stop="toggleCategoriesExpand"
									>
										{{ isCategoriesExpanded ? '收起 ∧' : `+${cleanedCategoryList.length - 4}项 ∨` }}
									</button>
								</template>
								<span
									v-else
									class="tag-all"
								>
									{{ mobileDirectionLabel }}
								</span>
							</div>

							<van-button
								v-if="hasPermission(['finance:financeManager:budget:view', 'finance:financeManager:budget:edit'])"
								size="small"
								plain
								round
								type="primary"
								icon="setting-o"
								class="btn-edit-action"
								data-testid="btn-edit-budget"
								@click.stop="onOpenBudgetManage"
							>
								{{ canEditBudget ? '预算设置' : '预算详情' }}
							</van-button>
						</div>
					</div>
				</transition>
			</section>
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

		<van-back-top
			target="#finance-manager-list"
			:bottom="100"
		/>
	</div>
</template>

<script setup lang="ts">
import { showFailToast, showSuccessToast } from 'vant';
import { useRoute, useRouter } from 'vue-router';
import FinanceCard from './components/FinanceCard.vue';
import { fromSourceTransferList, type FinanceManagerData, type FinanceBudgetStatusVo } from './config';
import { useNavBar } from '@/composables/useNavBar';
import { useTabBar } from '@/composables/useTabBar';
import { usePermission } from '@/composables/usePermission';
import type { PageInfo, DictInfo } from '@/views/common/config';
import { getDictList } from '@/views/finance/dict/api';
import { deleteFinanceManager, getFinanceMangerPage, getBudgetStatus } from '@/views/finance/financeManager/api';
import { getUserManagerList } from '@/views/user/userManager/api';
import type { UserManagerData } from '@/views/user/userManager/config';
import type { ResponseBody } from '@/types/api';
import { formatHeaderDate, formatDate, formatMonth, formatDayjs, nowDayjs, type Dayjs } from '@/utils/dayjs';
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

const currentMonthStr = computed(() => formatMonth());
const { hasPermission } = usePermission();
const canEditBudget = computed(() => hasPermission('finance:financeManager:budget:edit'));
const canAddFinance = computed(() => hasPermission('finance:financeManager:add'));

const budgetStatus = ref<FinanceBudgetStatusVo | null>(null);

const onOpenBudgetManage = () => {
	if (navigator.vibrate) navigator.vibrate(30);
	router.push({ path: '/finance/financeManager/budgetManage' });
};

const mobileDirectionLabel = computed(() => {
	const dir = budgetStatus.value?.incomeAndExpenses || 'expense';
	const hasExp = dir.includes('expense');
	const hasInc = dir.includes('income');
	if (hasExp && hasInc) return '全部非转账收支';
	if (hasInc) return '全部非转账收入';
	return '全部非转账支出';
});

const mobileSpentLabel = computed(() => {
	const dir = budgetStatus.value?.incomeAndExpenses || 'expense';
	const hasExp = dir.includes('expense');
	const hasInc = dir.includes('income');
	if (hasExp && hasInc) return '已计金额';
	if (hasInc) return '已入金额';
	return '已用金额';
});

/**
 * 根据预算使用率返回语义色阶 (Taste-Skill 财务风控色板)
 * - < 0%: 净结余充裕 (翡翠绿 #07c160)
 * - [0%, 75%): 常规安全 (品牌蓝 #1989fa)
 * - [75%, 90%): 适度关注 (琥珀黄 #ff976a)
 * - [90%, 100%): 临界高压 (火山橙 #fa541c)
 * - [100%, 150%): 超支破线 (警示红 #ee0a24)
 * - >= 150%: 严重爆表 (深绛红 #cf1322)
 */
const getBudgetProgressColor = (percent: number): string => {
	if (percent < 0) return '#07c160';
	if (percent >= 150) return '#cf1322';
	if (percent >= 100) return '#ee0a24';
	if (percent >= 90) return '#fa541c';
	if (percent >= 75) return '#ff976a';
	return '#1989fa';
};

const progressColor = computed(() => {
	return getBudgetProgressColor(Number(budgetStatus.value?.usagePercent || 0));
});

/**
 * 金额千分位格式化工具函数 (Taste-Skill 金融级排版)
 */
const formatAmount = (value: number | string | undefined | null): string => {
	const num = Number(value || 0);
	const parts = Math.abs(num).toFixed(2).split('.');
	parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
	return parts.join('.');
};

/**
 * 预算健康度情绪徽标 (Impact-Cable 水位决策反馈)
 */
const budgetHealthStatus = computed(() => {
	if (!budgetStatus.value) return null;
	const actual = Number(budgetStatus.value.actualExpense || 0);
	const remaining = Number(budgetStatus.value.remainingAmount || 0);
	const usage = Number(budgetStatus.value.usagePercent || 0);
	const isOver = budgetStatus.value.isOverBudget || remaining < 0;

	if (isOver) {
		return { text: '超支透支', color: '#ee0a24', bgColor: '#fff1f0' };
	}
	if (actual <= 0) {
		return { text: '资金充裕', color: '#07c160', bgColor: '#f6ffed' };
	}
	if (usage >= 80) {
		return { text: '接近限额', color: '#fa8c16', bgColor: '#fff7e6' };
	}
	return { text: '控制良好', color: '#1677ff', bgColor: '#e6f4ff' };
});

/**
 * 零花钱卡片常驻折叠机制 (平时极简42px展示余额与百分比，点击平滑展开全部信息)
 */
const isBudgetCardExpanded = ref<boolean>(false);

const toggleBudgetCardExpand = () => {
	if (navigator.vibrate) navigator.vibrate(20);
	isBudgetCardExpanded.value = !isBudgetCardExpanded.value;
};

/**
 * 统计分类折叠机制 (Taste-Skill 空间减负 & 呼吸感重塑)
 */
const isCategoriesExpanded = ref<boolean>(false);

const cleanedCategoryList = computed(() => {
	const raw = budgetStatus.value?.categoryNames || budgetStatus.value?.categoryCodes || [];
	return raw.filter((c) => c && c !== '🪰' && c !== '支出' && c !== '收入' && c !== 'expense' && c !== 'income');
});

const displayCategoryList = computed(() => {
	if (isCategoriesExpanded.value || cleanedCategoryList.value.length <= 4) {
		return cleanedCategoryList.value;
	}
	return cleanedCategoryList.value.slice(0, 4);
});

const toggleCategoriesExpand = () => {
	if (navigator.vibrate) navigator.vibrate(20);
	isCategoriesExpanded.value = !isCategoriesExpanded.value;
};

/**
 * 点击已计金额一键下钻到当月明细 (Impact-Cable 闭环追溯链路)
 */
const drillDownBudgetMonth = () => {
	if (navigator.vibrate) navigator.vibrate(30);
	onSelectQuickTime('month');
	showSuccessToast('已联动筛选本月明细');
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

		const dateStr = formatDate(item.infoDate);
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
	rightIcon: canAddFinance.value ? 'plus' : '',
	leftPath: '/',
	visible: true,
	onRightClick: () => {
		if (canAddFinance.value) {
			router.push({ path: getDetailRoutePath() });
		}
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
				return `${formatDayjs(customDateRange.value[0]).format('MM/DD')} - ${formatDayjs(customDateRange.value[1]).format('MM/DD')}`;
			}
			return '自定义';
		default:
			return '全部';
	}
};

const getTimeBoundary = (): { start: Dayjs; end: Dayjs } | null => {
	const now = nowDayjs();

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
				start: formatDayjs(customDateRange.value[0]).startOf('day'),
				end: formatDayjs(customDateRange.value[1]).endOf('day'),
			};
		default:
			return null;
	}
};

const formatCurrency = (value: number) => `¥${formatAmount(value)}`;

const getWeekdayLabel = (date: string) => formatDayjs(date).format('ddd').replace('.', '');

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

onActivated(() => {
	loadBudgetStatus();
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
	position: relative;
	margin: 8px 12px 6px;
	padding: 10px 14px;
	background: linear-gradient(180deg, #ffffff 0%, #fafcff 100%);
	border-radius: 16px;
	box-shadow:
		0 1px 3px rgba(0, 0, 0, 0.02),
		0 4px 12px rgba(22, 119, 255, 0.04);
	border: 1px solid rgba(226, 232, 240, 0.85);
	overflow: hidden;
	transition: all 0.28s cubic-bezier(0.4, 0, 0.2, 1);

	&--expanded {
		padding: 12px 14px 14px;
		box-shadow: 0 4px 20px rgba(22, 119, 255, 0.07);
		border-color: rgba(147, 197, 253, 0.45);

		.toggle-arrow-btn {
			transform: rotate(180deg);
			background: #eef2f6;
		}
	}

	.pocket-money-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		cursor: pointer;
		user-select: none;
		min-height: 28px;
		transition: opacity 0.15s ease;

		&:active {
			opacity: 0.8;
		}

		.pocket-money-title {
			display: flex;
			align-items: center;
			gap: 7px;
			font-size: 13.5px;
			font-weight: 600;
			color: #0f172a;

			.title-icon-box {
				width: 28px;
				height: 28px;
				border-radius: 8px;
				background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
				display: flex;
				align-items: center;
				justify-content: center;
				flex-shrink: 0;

				.title-icon {
					font-size: 15px;
					color: #2563eb;
				}
			}

			.title-text {
				letter-spacing: 0.2px;
			}

			.health-badge {
				display: inline-flex;
				align-items: center;
				gap: 4px;
				font-size: 10.5px;
				padding: 2px 7px;
				border-radius: 999px;
				font-weight: 600;
				line-height: 1.3;
				border: 1px solid transparent;
				letter-spacing: 0.2px;

				.health-dot {
					width: 5px;
					height: 5px;
					border-radius: 50%;
					flex-shrink: 0;
				}
			}
		}

		.pocket-money-summary {
			display: flex;
			align-items: center;
			gap: 7px;

			.summary-metric {
				display: flex;
				align-items: baseline;
				gap: 3px;

				.metric-label {
					font-size: 11px;
					color: #64748b;
					font-weight: 500;
				}

				.metric-val {
					font-size: 14.5px;
					font-weight: 700;
					font-variant-numeric: tabular-nums;
					letter-spacing: -0.2px;

					.currency-symbol {
						font-size: 10.5px;
						margin-right: 1px;
						font-weight: 600;
					}

					&.remain {
						color: #059669;
					}

					&.over {
						color: #e11d48;
					}
				}
			}

			.percent-pill {
				font-size: 11px;
				font-weight: 600;
				padding: 1.5px 7px;
				background: #f1f5f9;
				color: #475569;
				border: 1px solid #e2e8f0;
				border-radius: 999px;
				font-variant-numeric: tabular-nums;
			}

			.toggle-arrow-btn {
				width: 22px;
				height: 22px;
				border-radius: 50%;
				background: #f8fafc;
				display: flex;
				align-items: center;
				justify-content: center;
				transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

				.toggle-arrow {
					font-size: 11px;
					color: #94a3b8;
				}
			}
		}
	}

	.ambient-progress-track {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 2.5px;
		background: #f1f5f9;

		.ambient-progress-bar {
			height: 100%;
			border-radius: 0 2px 2px 0;
			transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		}
	}

	.pocket-money-body {
		padding-top: 12px;
		margin-top: 10px;
		border-top: 1px dashed #e2e8f0;

		.amount-main {
			display: grid;
			grid-template-columns: repeat(3, 1fr);
			gap: 8px;
			margin-bottom: 12px;

			.amount-card {
				background: #f8fafc;
				border: 1px solid #f1f5f9;
				border-radius: 10px;
				padding: 8px 4px;
				text-align: center;
				transition: all 0.15s ease;

				&--clickable {
					cursor: pointer;

					&:active {
						transform: scale(0.97);
						background: #f1f5f9;
					}
				}

				.amount-label {
					font-size: 11px;
					color: #64748b;
					margin-bottom: 3px;
					font-weight: 500;

					.drill-tag {
						font-size: 9.5px;
						color: #2563eb;
						background: #eff6ff;
						padding: 0.5px 4px;
						border-radius: 4px;
						margin-left: 2px;
					}
				}

				.amount-value {
					font-size: 14.5px;
					font-weight: 700;
					font-variant-numeric: tabular-nums;
					color: #0f172a;

					.amount-currency {
						font-size: 10.5px;
						margin-right: 1px;
						font-weight: 600;
					}

					&.budget {
						color: #1e293b;
					}

					&.expense {
						color: #d97706;
					}

					&.surplus {
						color: #059669;
					}

					&.remain {
						color: #059669;
					}

					&.over {
						color: #e11d48;
					}
				}
			}
		}

		.pocket-money-progress {
			margin-bottom: 12px;
			background: #f1f5f9;
			border-radius: 999px;
		}

		.pocket-money-footer {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 8px;
			margin-top: 4px;

			.pocket-money-tags {
				flex: 1;
				min-width: 0;
				display: flex;
				align-items: center;
				flex-wrap: wrap;
				gap: 5px;
				font-size: 12px;
				color: #64748b;

				.tag-desc {
					font-size: 11px;
					color: #94a3b8;
				}

				.category-tag {
					font-size: 10.5px;
					color: #2563eb;
					background: #eff6ff;
					border-color: #dbeafe;
				}

				.tag-expand-btn {
					appearance: none;
					background: #eff6ff;
					border: 1px dashed #bfdbfe;
					border-radius: 999px;
					color: #2563eb;
					font-size: 10px;
					padding: 1px 7px;
					cursor: pointer;
					line-height: 16px;
					display: inline-flex;
					align-items: center;
					transition: all 0.2s;

					&:active {
						opacity: 0.65;
						background: #dbeafe;
					}
				}

				.tag-all {
					color: #64748b;
					font-size: 11px;
				}
			}

			.btn-edit-action {
				flex-shrink: 0;
				font-size: 11px;
				height: 24px;
				padding: 0 10px;
				font-weight: 500;
			}
		}
	}
}

.expand-enter-active,
.expand-leave-active {
	transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
	overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
	opacity: 0;
	transform: translateY(-6px);
}
</style>
