import { ref, computed } from 'vue';
import {
	fromSourceTransferList,
	type FinanceManagerData,
} from '@/views/finance/financeManager/config';
import type { Dayjs } from '@/utils/dayjs';
import { formatDayjs, nowDayjs } from '@/utils/dayjs';
import type { DictInfo } from '@/views/common/config';
import { getDictList } from '@/views/finance/dict/api';
import { getUserManagerList } from '@/views/user/userManager/api';
import type { UserManagerData } from '@/views/user/userManager/config';

export type TimePreset = 'today' | '7d' | 'month' | 'year' | 'all' | 'custom';

export interface FilterOption {
	text: string;
	value: string;
}

export interface ActiveFilterTag {
	key: string;
	label: string;
}

export const timeFilterOptions: { label: string; value: TimePreset }[] = [
	{ label: '全部', value: 'all' },
	{ label: '近7天', value: '7d' },
	{ label: '本月', value: 'month' },
	{ label: '今年', value: 'year' },
	{ label: '今天', value: 'today' },
	{ label: '自定义', value: 'custom' },
];

export const quickTimeOptions: { label: string; value: TimePreset }[] = [
	{ label: '全部', value: 'all' },
	{ label: '近7天', value: '7d' },
	{ label: '本月', value: 'month' },
	{ label: '今年', value: 'year' },
];

export function useFinanceFilter(onSearchCallback?: () => void) {
	const categoryList = ref<DictInfo[]>([]);
	const userList = ref<UserManagerData[]>([]);

	const searchInfo = ref<FinanceManagerData>({
		bigTypeCode: '',
		fromSource: '',
		incomeAndExpenses: '',
		belongTo: undefined,
	});

	const manualFilterPanelOpen = ref<boolean>(false);
	const activeTimePreset = ref<TimePreset>('all');
	const showCustomDatePicker = ref<boolean>(false);
	const customDateRange = ref<[Date, Date] | null>(null);

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
		onSearchCallback?.();
	};

	const onConfirmCustomDate = (value: Date[]) => {
		if (Array.isArray(value) && value.length === 2) {
			customDateRange.value = [value[0], value[1]];
			activeTimePreset.value = 'custom';
		}
		showCustomDatePicker.value = false;
		onSearchCallback?.();
	};

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
		onSearchCallback?.();
	};

	const onApplyFilters = () => {
		manualFilterPanelOpen.value = false;
		onSearchCallback?.();
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

	const activeFilterTags = computed<ActiveFilterTag[]>(() => {
		const tags: ActiveFilterTag[] = [];
		const keyword = searchInfo.value.bigTypeCode?.trim();
		const sourceText = sourceFilterOptions.value.find(
			(item) => item.value === searchInfo.value.fromSource,
		)?.text;
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
		const userText = userFilterOptions.value.find(
			(item) => item.value === String(searchInfo.value.belongTo || ''),
		)?.text;
		if (userText && searchInfo.value.belongTo) {
			tags.push({ key: 'user', label: userText });
		}
		return tags;
	});

	return {
		searchInfo,
		categoryList,
		userList,
		quickTimeOptions,
		timeFilterOptions,
		activeTimePreset,
		showCustomDatePicker,
		customDateRange,
		showFilterPanel,
		filterSections,
		activeFilterTags,
		fetchCategories,
		fetchUsers,
		onToggleFilterPanel,
		onSelectQuickTime,
		onSelectTimePreset,
		onConfirmCustomDate,
		handleFilterSelect,
		onResetFilters,
		onApplyFilters,
		getTimePresetLabel,
		getTimeBoundary,
	};
}
