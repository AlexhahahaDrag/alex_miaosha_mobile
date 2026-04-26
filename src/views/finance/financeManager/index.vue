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
				>
					筛选
				</van-button>
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

		<section
			v-show="showFilterPanel"
			class="filter-card"
		>
			<div class="filter-card__section">
				<div class="filter-card__label">
					<van-icon
						name="balance-o"
						class="filter-card__label-icon"
					/>
					支付方式
				</div>
				<div class="chip-group">
					<button
						v-for="option in sourceFilterOptions"
						:key="`source-${option.value}`"
						type="button"
						:class="['chip', { 'chip--active': searchInfo.fromSource === option.value }]"
						@click="onSelectSource(option.value)"
					>
						{{ option.text }}
					</button>
				</div>
			</div>

			<div class="filter-card__section">
				<div class="filter-card__label">
					<van-icon
						name="apps-o"
						class="filter-card__label-icon"
					/>
					类别
				</div>
				<div class="chip-group">
					<button
						v-for="option in categoryFilterOptions"
						:key="`category-${option.value}`"
						type="button"
						:class="['chip', { 'chip--active': searchInfo.incomeAndExpenses === option.value }]"
						@click="onSelectCategory(option.value)"
					>
						{{ option.text }}
					</button>
				</div>
			</div>

			<div class="filter-card__section">
				<div class="filter-card__label">
					<van-icon
						name="user-o"
						class="filter-card__label-icon"
					/>
					用户
				</div>
				<div class="chip-group">
					<button
						v-for="option in userFilterOptions"
						:key="`user-${option.value}`"
						type="button"
						:class="['chip', { 'chip--active': String(searchInfo.belongTo || '') === option.value }]"
						@click="onSelectUser(option.value)"
					>
						{{ option.text }}
					</button>
				</div>
			</div>

			<div class="filter-card__section">
				<div class="filter-card__label">
					<van-icon
						name="underway-o"
						class="filter-card__label-icon"
					/>
					时间
				</div>
				<div class="chip-group">
					<button
						v-for="option in timeFilterOptions"
						:key="option.value"
						type="button"
						:class="['chip', { 'chip--active': activeTimePreset === option.value }]"
						@click="onSelectTimePreset(option.value)"
					>
						{{ option.label }}
					</button>
				</div>
			</div>

			<div class="filter-card__actions">
				<van-button
					plain
					round
					class="filter-card__reset"
					@click="onResetFilters"
				>
					重置
				</van-button>
				<van-button
					round
					type="primary"
					class="filter-card__submit"
					@click="onApplyFilters"
				>
					完成筛选
				</van-button>
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

				<template #empty>
					<div class="empty-state-container">
						<van-empty description="暂无数据"> </van-empty>
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
								<span>支出 {{ formatCurrency(group.expense) }}</span>
								<span>收入 {{ formatCurrency(group.income) }}</span>
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

		<van-back-top target="#finance-manager-list" />
	</div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import dayjs, { type Dayjs } from 'dayjs';
import { showFailToast, showSuccessToast } from 'vant';
import { useRoute, useRouter } from 'vue-router';
import FinanceCard from './components/FinanceCard.vue';
import { fromSourceTransferList, type FinanceManagerData } from './config';
import { usePagination } from '@/composables/usePagination';
import { useNavBar } from '@/composables/useNavBar';
import { useTabBar } from '@/composables/useTabBar';
import type { PageInfo, DictInfo } from '@/views/common/config';
import { getDictList } from '@/views/finance/dict/api';
import { deleteFinanceManager, getFinanceMangerPage } from '@/views/finance/financeManager/api';
import { getUserManagerList } from '@/views/user/userManager/api';
import type { UserManagerData } from '@/views/user/userManager/config';
import type { ResponseBody } from '@/types/api';
import { formatHeaderDate } from '@/utils/dayjs';
import { getRoutePathByName } from '@/utils/router';

type TimePreset = 'today' | '7d' | '30d' | 'all' | 'custom';

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
	{ label: '今天', value: 'today' },
	{ label: '近7天', value: '7d' },
	{ label: '近30天', value: '30d' },
	{ label: '全部', value: 'all' },
	{ label: '自定义', value: 'custom' },
];

const router = useRouter();
const route = useRoute();

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
const activeTimePreset = ref<TimePreset>('30d');
const showCustomDatePicker = ref<boolean>(false);
const customDateRange = ref<[Date, Date] | null>(null);

const { pagination, resetPagination, setTotal, nextPage } = usePagination();

const sourceFilterOptions = computed<FilterOption[]>(() => [
	{ text: '全部', value: '' },
	...fromSourceTransferList.map((item) => ({
		text: item.name,
		value: item.value,
	})),
]);

const categoryFilterOptions = computed<FilterOption[]>(() => [
	{ text: '全部', value: '' },
	...categoryList.value.map((item) => ({
		text: item.typeName,
		value: item.typeCode,
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

	if (activeTimePreset.value !== 'all') {
		tags.push({ key: 'time', label: getTimePresetLabel(activeTimePreset.value) });
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
		dataSource.value = [...dataSource.value, ...(data?.records || [])];
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
	resetData();
	getFinancePage(searchInfo.value, pagination);
};

const onLoadMore = () => {
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
		case '30d':
			return '近30天';
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
		case '30d':
			return { start: now.subtract(29, 'day').startOf('day'), end: now.endOf('day') };
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

	getFinancePage(searchInfo.value, pagination);
});
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
		height: 38px;
		padding: 0 14px;
		border-radius: 12px;
		font-size: 13px;
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

.filter-card {
	margin: 0 14px 10px;
	padding: 14px;
	background: #ffffff;
	border-radius: 18px;
	box-shadow: 0 8px 24px rgba(15, 56, 120, 0.06);

	&__section + &__section {
		margin-top: 14px;
	}

	&__label {
		display: flex;
		align-items: center;
		gap: 6px;
		margin-bottom: 10px;
		font-size: 13px;
		font-weight: 600;
		color: #25324a;
	}

	&__label-icon {
		color: #1677ff;
		font-size: 15px;
	}

	&__actions {
		display: grid;
		grid-template-columns: 96px 1fr;
		gap: 10px;
		margin-top: 16px;
	}

	&__reset,
	&__submit {
		height: 40px;
		border-radius: 12px;
	}
}

.chip-group {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
}

.chip {
	border: 1px solid #e7edf6;
	background: #f8fafc;
	border-radius: 10px;
	padding: 7px 12px;
	font-size: 12px;
	line-height: 1;
	color: #52617a;
	transition: all 0.2s ease;

	&--active {
		color: #ffffff;
		background: linear-gradient(135deg, #3e8cff 0%, #1677ff 100%);
		border-color: transparent;
		box-shadow: 0 6px 12px rgba(22, 119, 255, 0.2);
	}
}

.refresh-info {
	flex: 1;
	min-height: 0;
	background: #f5f7fb;
}

.card-list {
	padding: 0 0 16px;
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
</style>
