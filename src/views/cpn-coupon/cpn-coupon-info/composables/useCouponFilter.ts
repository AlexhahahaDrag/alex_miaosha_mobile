import type { Ref } from 'vue';
import type { CpnCouponInfoData } from '@/views/cpn-coupon/cpn-coupon-info/config';
import { formatDate, formatDayjs, nowDayjs, type Dayjs } from '@/utils/dayjs';

export type TimePreset = 'today' | '7d' | 'month' | 'all' | 'custom';

export interface ActiveFilterTag {
	key: string;
	label: string;
}

export const timeFilterOptions: { label: string; value: TimePreset }[] = [
	{ label: '全部', value: 'all' },
	{ label: '今天', value: 'today' },
	{ label: '近7天', value: '7d' },
	{ label: '当月', value: 'month' },
	{ label: '自定义', value: 'custom' },
];

export const statusOptions = [
	{ text: '全部', value: '' },
	{ text: '可用', value: 'AVAILABLE' },
	{ text: '未支付', value: 'UNPAID' },
];

export function useCouponFilter(searchInfo: Ref<CpnCouponInfoData>) {
	const manualFilterPanelOpen = ref<boolean>(false);
	const activeStatus = ref<string>('AVAILABLE'); // 默认展示可用
	const activeTimePreset = ref<TimePreset>('all');
	const showCustomDatePicker = ref<boolean>(false);
	const customDateRange = ref<[Date, Date] | null>(null);

	const showFilterPanel = computed(() => manualFilterPanelOpen.value);

	const filterSections = computed(() => [
		{ label: '状态', icon: 'info-o', key: 'status', options: statusOptions },
		{ label: '时间', icon: 'underway-o', key: 'time', options: timeFilterOptions },
	]);

	const getTimePresetLabel = (value: TimePreset) => {
		switch (value) {
			case 'today':
				return '今天';
			case '7d':
				return '近7天';
			case 'month':
				return '当月';
			case 'custom':
				if (customDateRange.value) {
					return `${formatDate(customDateRange.value[0], 'MM/DD')} - ${formatDate(customDateRange.value[1], 'MM/DD')}`;
				}
				return '自定义';
			default:
				return '全部';
		}
	};

	const activeFilterTags = computed<ActiveFilterTag[]>(() => {
		const tags: ActiveFilterTag[] = [];
		const keyword = searchInfo.value.couponName?.trim();
		const statusText = statusOptions.find((o) => o.value === activeStatus.value)?.text;

		if (keyword) {
			tags.push({ key: 'keyword', label: keyword });
		}

		if (statusText && activeStatus.value) {
			tags.push({ key: 'status', label: statusText });
		}

		if (activeTimePreset.value !== 'all') {
			tags.push({ key: 'time', label: getTimePresetLabel(activeTimePreset.value) });
		}

		return tags;
	});

	const onToggleFilterPanel = () => {
		manualFilterPanelOpen.value = !manualFilterPanelOpen.value;
	};

	const onSelectTimePreset = (value: TimePreset) => {
		if (value === 'custom') {
			showCustomDatePicker.value = true;
			return;
		}

		activeTimePreset.value = value;
		customDateRange.value = null;
	};

	const handleFilterSelect = ({ key, value }: { key: string; value: unknown }) => {
		if (key === 'status') {
			activeStatus.value = value as string;
		} else if (key === 'time') {
			onSelectTimePreset(value as TimePreset);
		}
	};

	const onConfirmCustomDate = (value: Date[]) => {
		if (Array.isArray(value) && value.length === 2) {
			customDateRange.value = [value[0], value[1]];
			activeTimePreset.value = 'custom';
		}
		showCustomDatePicker.value = false;
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

	const applyStatusFilter = () => {
		searchInfo.value.onlyValidAndNotFullyRedeemed = undefined;
		searchInfo.value.paymentStatus = undefined;
		if (activeStatus.value === 'AVAILABLE') {
			searchInfo.value.onlyValidAndNotFullyRedeemed = true;
		} else if (activeStatus.value === 'UNPAID') {
			searchInfo.value.paymentStatus = 0;
		}

		// 处理时间过滤
		const boundary = getTimeBoundary();
		if (boundary) {
			searchInfo.value.createTimeStart = boundary.start.format('YYYY-MM-DD');
			searchInfo.value.createTimeEnd = boundary.end.format('YYYY-MM-DD');
		} else {
			delete searchInfo.value.createTimeStart;
			delete searchInfo.value.createTimeEnd;
		}
	};

	const onApplyFilters = () => {
		manualFilterPanelOpen.value = false;
		applyStatusFilter();
	};

	const onResetFilters = () => {
		searchInfo.value.couponName = '';
		activeStatus.value = 'AVAILABLE';
		activeTimePreset.value = 'all';
		customDateRange.value = null;
		manualFilterPanelOpen.value = false;
		applyStatusFilter();
	};

	return {
		activeStatus,
		activeTimePreset,
		showFilterPanel,
		showCustomDatePicker,
		filterSections,
		activeFilterTags,
		onToggleFilterPanel,
		handleFilterSelect,
		onConfirmCustomDate,
		applyStatusFilter,
		onApplyFilters,
		onResetFilters,
	};
}
