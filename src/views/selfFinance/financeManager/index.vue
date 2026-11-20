<template>
	<div class="finance-manager-page">
		<!-- 顶部搜索与时间快捷栏 -->
		<section class="page-search">
			<div class="search-shell">
				<form
					action="/"
					class="search-shell__form"
				>
					<van-search
						v-model="searchInfo.bigTypeCode"
						placeholder="搜索账单或备注"
						shape="round"
						background="transparent"
						class="search-bar"
						@search="onSearch"
						@clear="onCancel"
					/>
				</form>
				<button
					type="button"
					class="search-shell__filter-btn"
					aria-label="筛选"
					@click="onToggleFilterPanel"
				>
					<van-icon name="filter-o" />
				</button>
				<button
					type="button"
					class="search-shell__ai-btn"
					data-testid="mobile-btn-index-ai-ledger"
					@click="onNavigateToAiLedger"
				>
					<van-icon
						name="edit"
						class="search-shell__ai-icon"
					/>
					<span>AI 记账</span>
				</button>
			</div>

			<div class="quick-time-bar">
				<div class="quick-time-bar__tray">
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

		<!-- 高级筛选侧滑抽屉 -->
		<common-filter-panel
			:show="showFilterPanel"
			:sections="filterSections"
			:model-value="searchInfo"
			:active-map="{ time: activeTimePreset }"
			@select="handleFilterSelect"
			@reset="onResetFilters"
			@submit="onApplyFilters"
		/>

		<!-- 下拉刷新与列表流容器 -->
		<common-pull-refresh
			id="finance-manager-scroll"
			ref="pullRefresh"
			v-model="isRefresh"
			class="refresh-info"
			@refresh="onRefreshData"
		>
			<!-- ① 独立拆解的本月零花钱卡片子组件 -->
			<pocket-money-card
				:loading="budgetLoading || (loading && !dataSource.length)"
				:budget-status="budgetStatus"
				:can-edit-budget="canEditBudget"
				:has-view-permission="hasPermission(['finance:financeManager:budget:view', 'finance:financeManager:budget:edit'])"
				@drill-down="drillDownBudgetMonth"
				@open-manage="onOpenBudgetManage"
			/>

			<!-- 账单列表与骨架屏 -->
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
						data-testid="finance-list-skeleton"
					>
						<div class="skeleton-date-header">
							<div class="shimmer-bar sk-w-88 sk-h-14"></div>
							<div class="shimmer-bar sk-w-96 sk-h-12"></div>
						</div>
						<div class="skeleton-group-card">
							<div
								v-for="itemIndex in 3"
								:key="itemIndex"
								class="skeleton-row"
							>
								<div class="shimmer-bar sk-icon"></div>
								<div class="skeleton-row__main">
									<div class="shimmer-bar sk-w-96 sk-h-14"></div>
									<div class="shimmer-bar sk-w-132 sk-h-11 sk-mt-6"></div>
								</div>
								<div class="skeleton-row__side">
									<div class="shimmer-bar sk-w-68 sk-h-14"></div>
									<div class="shimmer-bar sk-w-48 sk-h-11 sk-mt-6"></div>
								</div>
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
								<span class="date-group__date-text">{{ formatHeaderDate(group.date) }}</span>
								<span class="date-group__weekday">{{ getWeekdayLabel(group.date) }}</span>
							</div>
							<div class="date-group__summary">
								<span
									v-if="Number(group.expense) > 0"
									class="summary-expense"
								>支出 {{ formatCurrency(group.expense) }}</span>
								<span
									v-if="Number(group.income) > 0"
									class="summary-income"
								>收入 {{ formatCurrency(group.income) }}</span>
							</div>
						</header>

						<div class="date-group__body">
							<div class="date-group__card">
								<transition-group name="list">
									<finance-card
										v-for="(item, itemIndex) in group.items"
										:key="item.id"
										:item="item"
										:is-last="itemIndex === group.items.length - 1"
										@click="handleCardClick"
										@delete="onDeleteFinance"
									/>
								</transition-group>
							</div>
						</div>
					</section>
				</div>
			</common-list>
		</common-pull-refresh>

		<!-- 自定义日期范围选择器 -->
		<van-calendar
			v-model:show="showCustomDatePicker"
			type="range"
			color="#4f6af6"
			:max-date="new Date()"
			@confirm="onConfirmCustomDate"
		/>

		<van-back-top
			target="#finance-manager-scroll"
			:bottom="100"
		/>
	</div>
</template>

<script setup lang="ts">
import { showFailToast, showSuccessToast } from 'vant';
import FinanceCard from '@/views/selfFinance/financeManager/components/FinanceCard.vue';
import PocketMoneyCard from '@/views/selfFinance/financeManager/components/PocketMoneyCard.vue';
import type { FinanceManagerData, FinanceBudgetStatusVo } from '@/views/selfFinance/financeManager/config';
import { useFinanceFilter } from '@/views/selfFinance/financeManager/composables/useFinanceFilter';
import { useNavBar } from '@/composables/useNavBar';
import { useTabBar } from '@/composables/useTabBar';
import { usePermission } from '@/composables/usePermission';
import type { PageInfo } from '@/views/common/config';
import { deleteFinanceManager, getFinanceMangerPage, getBudgetStatus } from '@/views/selfFinance/financeManager/api';
import { formatHeaderDate, formatDate, formatMonth, formatDayjs } from '@/utils/dayjs';
import { getRoutePathByName } from '@/utils/router';
import { useDashboardStore } from '@/store/modules/dashboard/dashboard';
import { triggerHaptic } from '@/utils/haptics';
import {
	loadFinanceOfflineSnapshot,
	saveFinanceOfflineSnapshot,
	loadBudgetOfflineSnapshot,
	saveBudgetOfflineSnapshot,
} from '@/views/selfFinance/financeManager/composables/useFinanceOfflineCache';

interface GroupedFinanceRecords {
	date: string;
	items: FinanceManagerData[];
	expense: number;
	income: number;
}

const router = useRouter();
const route = useRoute();
const dashboardStore = useDashboardStore();
const { hasPermission } = usePermission();
const { pagination, resetPagination, setTotal, nextPage } = usePagination();

const loading = ref(true);
const dataSource = ref<FinanceManagerData[]>([]);
const finished = ref<boolean>(false);
const isRefresh = ref<boolean>(false);
const fetchingPage = ref<boolean>(false);
const budgetStatus = ref<FinanceBudgetStatusVo | null>(null);

const currentMonthStr = computed(() => formatMonth());
const canEditBudget = computed(() => hasPermission('finance:financeManager:budget:edit'));
const canAddFinance = computed(() => hasPermission('finance:financeManager:add'));

const onNavigateToAiLedger = () => {
	triggerHaptic('light');
	const path = getRoutePathByName(router, 'financeAiLedger', '/selfFinance/financeManager/financeAiLedger');
	router.push({ path });
};

// 挂载筛选组合式函数
const {
	searchInfo,
	quickTimeOptions,
	activeTimePreset,
	showCustomDatePicker,
	showFilterPanel,
	filterSections,
	activeFilterTags,
	fetchCategories,
	fetchUsers,
	onToggleFilterPanel,
	onSelectQuickTime,
	onConfirmCustomDate,
	handleFilterSelect,
	onResetFilters,
	onApplyFilters,
	getTimePresetLabel,
	getTimeBoundary,
} = useFinanceFilter(() => {
	onSearch();
});

const getDetailRoutePath = (): string =>
	getRoutePathByName(router, 'financeManagerDetail', '/selfFinance/financeManager/financeManagerDetail');

const getBudgetRoutePath = (): string =>
	getRoutePathByName(router, 'financeBudgetManage', '/selfFinance/financeManager/budgetManage');

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
		{ name: 'financeManager', title: '账单流水', icon: 'finance' },
		{ name: 'financeAnalysis', title: '收支分析', icon: 'financeAnalysis' },
		{ name: 'myself', title: '我的', icon: 'user' },
	],
	active: 1,
});

const onOpenBudgetManage = () => {
	triggerHaptic('medium');
	router.push({ path: getBudgetRoutePath() });
};

const drillDownBudgetMonth = () => {
	triggerHaptic('medium');
	onSelectQuickTime('month');
	showSuccessToast('已联动筛选本月明细');
};

const budgetLoading = ref<boolean>(false);

const loadBudgetStatus = async () => {
	budgetLoading.value = true;
	try {
		const { code, data } = await getBudgetStatus(currentMonthStr.value, searchInfo.value.belongTo);
		if (code === '200' && data) {
			budgetStatus.value = data;
			saveBudgetOfflineSnapshot(data);
		}
	} catch (e) {
		console.error('获取零花钱预算状态失败:', e);
	} finally {
		budgetLoading.value = false;
	}
};

const resetData = () => {
	dataSource.value = [];
	finished.value = false;
	resetPagination();
};

const getFinancePage = async (param: FinanceManagerData, cur: PageInfo, options: { silent?: boolean } = {}) => {
	fetchingPage.value = true;
	if (!isRefresh.value && !options.silent) {
		loading.value = true;
	}

	const query = { ...param };
	if (!query.fromSource) delete query.fromSource;
	if (!query.incomeAndExpenses) delete query.incomeAndExpenses;
	if (!query.bigTypeCode) delete query.bigTypeCode;
	if (!query.belongTo) delete query.belongTo;

	const boundary = getTimeBoundary();
	if (boundary) {
		query.infoDateStart = boundary.start.format('YYYY-MM-DD');
		query.infoDateEnd = boundary.end.format('YYYY-MM-DD');
	} else {
		delete query.infoDateStart;
		delete query.infoDateEnd;
	}

	try {
		const { code, data, message } = await getFinanceMangerPage(query, cur?.current || 1, cur?.pageSize || 10);

		if (code === '200') {
			if (cur?.current === 1) {
				dataSource.value = data?.records || [];
				saveFinanceOfflineSnapshot(dataSource.value, data?.total || 0);
			} else {
				dataSource.value = [...dataSource.value, ...(data?.records || [])];
			}
			setTotal(data?.total || 0);
			finished.value = !data?.records?.length || (pagination.total || 0) <= dataSource.value.length;
			return;
		}

		showFailToast(message || '查询账单失败');
	} finally {
		fetchingPage.value = false;
		loading.value = false;
		isRefresh.value = false;
	}
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
	if (isRefresh.value || finished.value || fetchingPage.value) return;
	if (dataSource.value.length > 0) {
		nextPage();
	}
	getFinancePage(searchInfo.value, pagination);
};

const onDeleteFinance = async (id?: string) => {
	if (!id) return;
	const { code, message } = await deleteFinanceManager(`${id}`);
	if (code === '200') {
		triggerHaptic('success');
		dashboardStore.updateSaveTime('财务信息');
		onRefreshData();
		showSuccessToast(message || '删除成功');
		return;
	}
	triggerHaptic('error');
	showFailToast(message || '删除失败，请联系管理员');
};

const handleCardClick = (item: FinanceManagerData) => {
	triggerHaptic('light');
	router.push(getDetailRoute(item.id));
};

const filteredRecords = computed(() => {
	const keyword = searchInfo.value.bigTypeCode?.trim().toLowerCase();
	return dataSource.value.filter((item) => {
		if (!keyword) return true;
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
		if (!item.infoDate) return;
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

const formatCurrency = (value: number) => {
	const parts = Math.abs(value || 0)
		.toFixed(2)
		.split('.');
	parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
	return `¥${parts.join('.')}`;
};

const getWeekdayLabel = (date: string) => formatDayjs(date).format('ddd').replace('.', '');

onMounted(() => {
	// 离线快照秒开：有快照时静默拉取最新第 1 页并平滑替换，避免先清空数据反闪骨架屏
	const cachedSnapshot = loadFinanceOfflineSnapshot();
	const hasCachedList = Boolean(cachedSnapshot && cachedSnapshot.records.length > 0);
	if (hasCachedList && cachedSnapshot) {
		dataSource.value = cachedSnapshot.records;
		setTotal(cachedSnapshot.total || cachedSnapshot.records.length);
		fetchingPage.value = false;
		loading.value = false;
	}
	const cachedBudget = loadBudgetOfflineSnapshot();
	if (cachedBudget) {
		budgetStatus.value = cachedBudget;
	}

	fetchCategories();
	fetchUsers();
	if (route.query.fromSource) {
		searchInfo.value.fromSource = route.query.fromSource as string;
	}
	if (hasCachedList && !route.query.fromSource) {
		resetPagination();
		getFinancePage(searchInfo.value, pagination, { silent: true });
	} else {
		onSearch();
	}
	loadBudgetStatus();
});
</script>

<style lang="less" scoped>
.finance-manager-page {
	height: 100%;
	display: flex;
	flex-direction: column;
	overflow: hidden;

	background-color: #f1f4fa;
}

.page-search {
	position: sticky;
	top: 0;
	flex-shrink: 0;
	z-index: 20;
	padding: 10px 12px 6px;
	background: #f1f4fa;

	.search-shell {
		display: flex;
		align-items: center;
		gap: 8px;

		&__form {
			flex: 1;
		}

		.search-bar {
			padding: 0;

			:deep(.van-search__content) {
				background: #ffffff;
				border: none;
				border-radius: 999px;
				box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
			}
		}

		&__filter-btn {
			width: 38px;
			height: 38px;
			padding: 0;
			border-radius: 12px;
			font-size: 17px;
			border: none;
			color: #475569;
			background: #ffffff;
			box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
			display: flex;
			align-items: center;
			justify-content: center;
			cursor: pointer;
			transition: all 0.2s ease;

			&:active {
				background: #e2e8f0;
				color: #4f6af6;
				transform: scale(0.96);
			}
		}

		&__ai-btn {
			height: 38px;
			padding: 0 12px;
			border-radius: 12px;
			font-size: 13px;
			font-weight: 600;
			color: #4f6af6;
			background: rgba(79, 106, 246, 0.12);
			border: none;
			display: inline-flex;
			align-items: center;
			justify-content: center;
			gap: 4px;
			cursor: pointer;
			white-space: nowrap;
			transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

			.search-shell__ai-icon {
				font-size: 15px;
				color: #4f6af6;
			}

			&:active {
				transform: scale(0.96);
				background: rgba(79, 106, 246, 0.2);
			}
		}
	}

	.quick-time-bar {
		margin-top: 8px;

		&__tray {
			display: grid;
			grid-auto-flow: column;
			grid-auto-columns: minmax(0, 1fr);
			gap: 4px;
			padding: 3px;
			background: #e6ebf5;
			border-radius: 14px;
		}

		.quick-time-chip {
			border: 0;
			background: transparent;
			color: #64748b;
			border-radius: 11px;
			font-size: 12px;
			font-weight: 500;
			line-height: 1;
			padding: 7px 4px;
			text-align: center;
			cursor: pointer;
			white-space: nowrap;
			transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

			&--active {
				color: #4338ca;
				background: #ffffff;
				font-weight: 600;
				box-shadow: 0 1px 4px rgba(15, 23, 42, 0.08);
			}

			&:active:not(&--active) {
				background: rgba(255, 255, 255, 0.6);
			}
		}
	}

	.active-tags {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 6px;
		margin-top: 8px;
		padding-top: 8px;
		border-top: 1px dashed #e2e8f0;

		&__item {
			font-size: 11px;
			padding: 2px 8px;
		}

		&__clear {
			border: none;
			background: transparent;
			font-size: 12px;
			color: #4f46e5;
			cursor: pointer;
			padding: 0 4px;
		}
	}
}

.refresh-info {
	flex: 1;
	min-height: 0;

	:deep(.list-wrapper) {
		padding: 0 !important;
	}
}

.card-list {
	padding: 4px 12px 20px;

	.date-group {
		margin-bottom: 14px;

		&__header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 8px 4px 6px;
		}

		&__title {
			display: flex;
			align-items: center;
			gap: 6px;
			font-size: 14px;
			font-weight: 600;
			color: #1e293b;
		}

		&__weekday {
			font-size: 12px;
			font-weight: 500;
			color: #64748b;
		}

		&__summary {
			display: flex;
			align-items: center;
			gap: 10px;
			font-size: 12px;
			font-weight: 600;
			font-variant-numeric: tabular-nums;
			color: #64748b;

			.summary-expense {
				color: #475569;
			}

			.summary-income {
				color: #059669;
			}
		}

		&__body {
			.date-group__card {
				background: #ffffff;
				border-radius: 18px;
				box-shadow: 0 4px 16px rgba(15, 23, 42, 0.04);
				border: none;
				overflow: hidden;
			}
		}
	}
}

.skeleton-group {
	padding: 6px 12px 8px;

	.skeleton-date-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 6px 4px 8px;
	}

	.skeleton-group-card {
		background: #ffffff;
		border-radius: 18px;
		box-shadow: 0 4px 16px rgba(15, 23, 42, 0.04);
		overflow: hidden;
	}

	.skeleton-row {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px 14px;

		&:not(:last-child) {
			border-bottom: 1px solid #f1f5f9;
		}

		&__main {
			flex: 1;
			min-width: 0;
		}

		&__side {
			display: flex;
			flex-direction: column;
			align-items: flex-end;
			flex-shrink: 0;
		}
	}
}

.shimmer-bar {
	border-radius: 6px;
	background: #e2e8f0;
	animation: financePulse 1.4s ease-in-out infinite;
}

.sk-icon {
	width: 40px;
	height: 40px;
	border-radius: 12px;
	flex-shrink: 0;
}
.sk-w-48 {
	width: 48px;
}
.sk-w-68 {
	width: 68px;
}
.sk-w-88 {
	width: 88px;
}
.sk-w-96 {
	width: 96px;
}
.sk-w-132 {
	width: 132px;
}
.sk-h-11 {
	height: 11px;
}
.sk-h-12 {
	height: 12px;
}
.sk-h-14 {
	height: 14px;
}
.sk-mt-6 {
	margin-top: 6px;
}

@keyframes financePulse {
	0%,
	100% {
		opacity: 1;
	}
	50% {
		opacity: 0.45;
	}
}
</style>
