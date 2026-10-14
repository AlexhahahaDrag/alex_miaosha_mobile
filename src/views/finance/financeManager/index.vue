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
			ref="pullRefresh"
			v-model="isRefresh"
			class="refresh-info"
			@refresh="onRefreshData"
		>
			<!-- ① 独立拆解的本月零花钱卡片子组件 -->
			<pocket-money-card
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

		<!-- 自定义日期范围选择器 -->
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
import FinanceCard from '@/views/finance/financeManager/components/FinanceCard.vue';
import PocketMoneyCard from '@/views/finance/financeManager/components/PocketMoneyCard.vue';
import { useFinanceFilter } from '@/views/finance/financeManager/composables/useFinanceFilter';
import type { FinanceManagerData, FinanceBudgetStatusVo } from '@/views/finance/financeManager/config';
import { useNavBar } from '@/composables/useNavBar';
import { useTabBar } from '@/composables/useTabBar';
import { usePermission } from '@/composables/usePermission';
import type { PageInfo } from '@/views/common/config';
import { deleteFinanceManager, getFinanceMangerPage, getBudgetStatus } from '@/views/finance/financeManager/api';
import type { ResponseBody } from '@/types/api';
import { formatHeaderDate, formatDate, formatMonth, formatDayjs } from '@/utils/dayjs';
import { getRoutePathByName } from '@/utils/router';
import { useDashboardStore } from '@/store/modules/dashboard/dashboard';

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
const budgetStatus = ref<FinanceBudgetStatusVo | null>(null);

const currentMonthStr = computed(() => formatMonth());
const canEditBudget = computed(() => hasPermission('finance:financeManager:budget:edit'));
const canAddFinance = computed(() => hasPermission('finance:financeManager:add'));

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

const onOpenBudgetManage = () => {
	if (navigator.vibrate) navigator.vibrate(30);
	router.push({ path: '/finance/financeManager/budgetManage' });
};

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
	if (isRefresh.value) return;
	if (dataSource.value.length > 0) {
		nextPage();
	}
	getFinancePage(searchInfo.value, pagination);
};

const onDeleteFinance = async (id?: string) => {
	if (!id) return;
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
	resetData();
	fetchCategories();
	fetchUsers();
	if (route.query.fromSource) {
		searchInfo.value.fromSource = route.query.fromSource as string;
	}
	onSearch();
	loadBudgetStatus();
});
</script>

<style lang="less" scoped>
.finance-manager-page {
	padding-bottom: 74px;
	min-height: 100vh;
	background-color: var(--page-bg, #f4f6fa);
}

.page-search {
	position: sticky;
	top: 0;
	z-index: 20;
	padding: 10px 12px 8px;
	background: var(--card-bg, #ffffff);
	box-shadow: 0 2px 10px rgba(15, 23, 42, 0.05);

	.search-shell {
		display: flex;
		align-items: center;
		gap: 8px;

		&__form {
			flex: 1;
		}

		.search-bar {
			padding: 0;
		}

		&__filter-btn {
			width: 38px;
			height: 38px;
			padding: 0;
			border-radius: 12px;
			font-size: 16px;
			border-color: #dbeafe;
			color: #2563eb;
			background: #eff6ff;
		}
	}

	.quick-time-bar {
		margin-top: 10px;
		overflow-x: auto;
		-webkit-overflow-scrolling: touch;

		&::-webkit-scrollbar {
			display: none;
		}

		&__list {
			display: flex;
			align-items: center;
			gap: 8px;
			padding-bottom: 2px;
		}

		.quick-time-chip {
			border: 1px solid #e2e8f0;
			background: #f8fafc;
			color: #64748b;
			border-radius: 16px;
			font-size: 12px;
			line-height: 1;
			padding: 7px 12px;
			cursor: pointer;
			white-space: nowrap;
			transition: all 0.2s ease;

			&--active {
				color: #ffffff;
				background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
				border-color: #2563eb;
				font-weight: 600;
				box-shadow: 0 2px 6px rgba(37, 99, 235, 0.28);
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
			color: #2563eb;
			cursor: pointer;
			padding: 0 4px;
		}
	}
}

.refresh-info {
	min-height: calc(100vh - 180px);
}

.card-list {
	padding: 6px 12px 16px;

	.date-group {
		margin-bottom: 12px;

		&__header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 8px 4px 6px;
			font-size: 12px;
			color: #64748b;
		}

		&__title {
			display: flex;
			align-items: center;
			gap: 6px;
			font-weight: 600;
			color: #334155;
		}

		&__weekday {
			font-weight: normal;
			color: #94a3b8;
		}

		&__summary {
			display: flex;
			gap: 8px;
			font-size: 11px;
		}

		&__body {
			display: flex;
			flex-direction: column;
			gap: 8px;
		}
	}
}

.skeleton-group {
	padding: 10px 12px;
	margin-bottom: 8px;

	.skeleton-date-header {
		width: 120px;
		margin-bottom: 8px;
	}

	.skeleton-card {
		display: flex;
		align-items: center;
		padding: 12px;
		margin-bottom: 8px;
		background: #ffffff;
		border-radius: 12px;
		gap: 10px;

		&__icon {
			width: 36px;
			height: 36px;
			border-radius: 10px;
			background: #f1f5f9;
		}

		&__main {
			flex: 1;
		}

		&__side {
			width: 60px;
		}
	}
}
</style>
