<template>
	<div class="gift-list-page">
		<section class="search-shell">
			<van-search
				v-model="searchInfo.keyword"
				data-testid="gift-event-search"
				placeholder="搜索事由名称或备注"
				shape="round"
				@search="refresh"
				@clear="refresh"
			/>
		</section>

		<section
			v-if="quickEvents.length"
			class="relation-tags"
			data-testid="gift-event-type-tags"
		>
			<button
				v-for="item in quickEvents"
				:key="item.id"
				type="button"
				:class="['relation-tags__item', { active: searchInfo.eventType === resolveFilterEventType(item.id) }]"
				@click="selectEventType(item.id)"
			>
				{{ item.name }}
			</button>
		</section>

		<section class="event-filter-bar">
			<button
				type="button"
				class="event-filter-bar__toggle"
				@click="filterExpanded = !filterExpanded"
			>
				{{ filterExpanded ? '收起筛选' : '展开筛选' }}
			</button>
		</section>

		<section
			v-if="filterExpanded"
			class="event-filter-panel"
		>
			<van-cell
				title="事由类别"
				:value="eventTypeFilterLabel"
				is-link
				@click="showTypeSheet = true"
			/>
			<van-cell
				title="事由时间"
				:value="eventTimeRangeLabel"
				is-link
				@click="showCalendar = true"
			/>
			<div class="event-filter-panel__actions">
				<button
					type="button"
					class="event-filter-panel__reset"
					@click="resetFilters"
				>
					重置筛选
				</button>
			</div>
		</section>

		<section
			class="event-summary"
			data-testid="gift-event-summary"
		>
			<div class="person-summary__item">
				<span>本月待办</span>
				<strong>{{ summary.monthPendingCount || 0 }}</strong>
			</div>
			<div class="person-summary__item">
				<span>累计礼金</span>
				<strong>{{ formatMoney(summary.totalAmount) }}</strong>
			</div>
			<div class="person-summary__item">
				<span>活跃联系人</span>
				<strong>{{ summary.activePersonCount || 0 }}</strong>
			</div>
		</section>

		<button
			v-if="hasPermission('gift:add')"
			type="button"
			class="gift-event-add-probe"
			data-testid="gift-event-add"
			aria-label="新增事由"
			@click="openCreate"
		>
			新增
		</button>

		<common-pull-refresh
			v-model="refreshing"
			class="gift-refresh gift-refresh--event"
			@refresh="refresh"
		>
			<common-list
				id="gift-event-list"
				v-model="loading"
				data-testid="gift-event-list"
				:loading="loading"
				:refreshing="refreshing"
				:finished="finished"
				:is-empty="!dataSource.length"
				empty-text="暂无事由"
				@load="loadMore"
			>
				<template #skeleton>
					<div
						v-for="i in 4"
						:key="i"
						class="person-card person-card--skeleton"
					>
						<van-skeleton
							title
							:row="3"
						/>
					</div>
				</template>
				<div
					v-for="item in dataSource"
					:key="item.id"
					class="person-card"
					data-testid="gift-event-card"
					@click="openDetail(item.id)"
				>
					<div class="avatar">{{ (item.eventName || '?').slice(0, 1) }}</div>
					<div class="person-card__main">
						<strong>{{ item.eventName || '未命名事由' }}</strong>
						<span> {{ eventLabel(item.eventType) }} · {{ formatEventTime(item.eventTime) }} </span>
						<p>
							<template v-if="item.locationText">{{ item.locationText }} · </template>
							{{ eventStatusText(item.eventStatus) }} · {{ item.participantCount || 0 }}人 ·
							{{ formatMoney(item.totalAmount) }}
						</p>
						<p v-if="item.remark">{{ item.remark }}</p>
					</div>
				</div>
			</common-list>
		</common-pull-refresh>

		<van-action-sheet
			v-model:show="showTypeSheet"
			:actions="typeSheetActions"
			cancel-text="取消"
			close-on-click-action
			@select="onTypeSheetSelect"
		/>

		<van-calendar
			v-model:show="showCalendar"
			type="range"
			color="#2098ee"
			allow-same-day
			@confirm="onConfirmCalendar"
		/>
	</div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs';
import { showFailToast } from 'vant';
import { useGiftEventTypeOptions } from '@/composables/useGiftEventTypeOptions';
import { useNavBar } from '@/composables/useNavBar';
import { useTabBar } from '@/composables/useTabBar';
import { usePagination } from '@/composables/usePagination';
import { usePermission } from '@/composables/usePermission';
import { formatTime } from '@/utils/dayjs';
import { getRoutePathByName } from '@/utils/router';
import { getGiftEventBusinessPage, getGiftEventSummary } from '@/views/finance/gift/event/api';
import type { GiftEventBusinessInfo, GiftEventQuery, GiftEventSummary } from '@/views/finance/gift/config';
import { GIFT_EVENT_DETAIL_NAME, GIFT_TAB_BAR, eventStatusText, formatMoney } from '@/views/finance/gift/config';

interface TypeSheetAction {
	name: string;
	eventType?: string;
}

const router = useRouter();
const route = useRoute();
const { hasPermission } = usePermission();
const { quickEvents, presetOptions, customOptions, loadEventTypeOptions, eventLabel, resolveFilterEventType } =
	useGiftEventTypeOptions();

const loading = ref(false);
const refreshing = ref(false);
const finished = ref(false);
const filterExpanded = ref(false);
const showTypeSheet = ref(false);
const showCalendar = ref(false);
const dataSource = ref<GiftEventBusinessInfo[]>([]);
const searchInfo = ref<GiftEventQuery>({});
const summary = ref<GiftEventSummary>({});
const { pagination, resetPagination, setTotal, nextPage } = usePagination();

const detailPath = () => getRoutePathByName(router, GIFT_EVENT_DETAIL_NAME, '/finance/gift/event/giftEventDetail');

const eventTypeFilterLabel = computed(() => {
	const current = searchInfo.value.eventType;
	if (!current) return '全部';
	const preset = presetOptions.value.find((item) => resolveFilterEventType(item.id) === current);
	if (preset) return preset.name;
	const custom = customOptions.value.find((item) => item.name === current || item.id === current);
	return custom?.name || eventLabel(current);
});

const eventTimeRangeLabel = computed(() => {
	const { eventTimeStart, eventTimeEnd } = searchInfo.value;
	if (!eventTimeStart || !eventTimeEnd) return '全部时间';
	return `${dayjs(eventTimeStart).format('MM-DD')} ~ ${dayjs(eventTimeEnd).format('MM-DD')}`;
});

const typeSheetActions = computed<TypeSheetAction[]>(() => [
	{ name: '全部类别', eventType: undefined },
	...presetOptions.value.map((item) => ({
		name: item.name,
		eventType: resolveFilterEventType(item.id),
	})),
	...customOptions.value.map((item) => ({
		name: item.name,
		eventType: item.name,
	})),
]);

const formatEventTime = (value?: string) => {
	if (!value) return '--';
	return formatTime(value, 'YYYY-MM-DD HH:mm') || '--';
};

const openCreate = () => {
	if (!hasPermission('gift:add')) return;
	navigator.vibrate?.(50);
	router.push({ path: detailPath() });
};

const openDetail = (id?: string) => {
	if (!hasPermission('gift:edit')) {
		showFailToast('无编辑权限');
		return;
	}
	navigator.vibrate?.(50);
	router.push({ path: detailPath(), query: id ? { id: String(id) } : {} });
};

useNavBar({
	title: '事由管理',
	rightButton: hasPermission('gift:add') ? '新增' : '',
	visible: true,
	onRightClick: openCreate,
});

useTabBar({
	visible: true,
	data: [...GIFT_TAB_BAR],
});

const loadSummary = async () => {
	const { code, data } = await getGiftEventSummary();
	if (code === '200') summary.value = data || {};
};

const load = async () => {
	loading.value = true;
	const { code, data, message } = await getGiftEventBusinessPage(
		searchInfo.value,
		pagination.current,
		pagination.pageSize,
	).finally(() => {
		loading.value = false;
		refreshing.value = false;
	});
	if (code !== '200') return showFailToast(message || '事由加载失败');
	const list = (data?.records || []).map((item) => ({
		...item,
		id: item.id != null ? String(item.id) : item.id,
	}));
	dataSource.value = pagination.current === 1 ? list : [...dataSource.value, ...list];
	setTotal(data?.total || 0);
	nextPage();
	finished.value = (pagination.total || 0) <= dataSource.value.length;
};

const refresh = () => {
	finished.value = false;
	resetPagination();
	void loadSummary();
	void load();
};

const loadMore = () => load();

const selectEventType = (presetId: string) => {
	navigator.vibrate?.(50);
	const eventType = resolveFilterEventType(presetId);
	searchInfo.value.eventType = searchInfo.value.eventType === eventType ? undefined : eventType;
	refresh();
};

const onTypeSheetSelect = (action: TypeSheetAction) => {
	navigator.vibrate?.(50);
	searchInfo.value.eventType = action.eventType || undefined;
	showTypeSheet.value = false;
	refresh();
};

const onConfirmCalendar = (values: Date[]) => {
	if (!Array.isArray(values) || values.length < 2) {
		showCalendar.value = false;
		return;
	}
	const [start, end] = values;
	searchInfo.value.eventTimeStart = dayjs(start).startOf('day').format('YYYY-MM-DDTHH:mm:ss');
	searchInfo.value.eventTimeEnd = dayjs(end).endOf('day').format('YYYY-MM-DDTHH:mm:ss');
	showCalendar.value = false;
	navigator.vibrate?.(50);
	refresh();
};

const resetFilters = () => {
	navigator.vibrate?.(50);
	searchInfo.value.eventType = undefined;
	searchInfo.value.eventTimeStart = undefined;
	searchInfo.value.eventTimeEnd = undefined;
	refresh();
};

const handleOpenCreateQuery = async () => {
	if (route.query.open !== 'create') return;
	const nextQuery = { ...route.query };
	delete nextQuery.open;
	await router.replace({ path: route.path, query: nextQuery });
	if (hasPermission('gift:add')) {
		navigator.vibrate?.(50);
		router.push({ path: detailPath() });
	}
};

onMounted(async () => {
	await loadEventTypeOptions();
	await handleOpenCreateQuery();
	refresh();
});
</script>

<style scoped lang="less">
@import '../shared.less';

.event-filter-bar {
	padding: 0 16px 8px;
}

.event-filter-bar__toggle {
	padding: 0;
	border: 0;
	background: transparent;
	color: #2098ee;
	font-size: 13px;
	font-weight: 600;
}

.event-filter-panel {
	margin: 0 16px 10px;
	overflow: hidden;
	background: #fff;
	border-radius: 16px;
	box-shadow: 0 6px 18px rgba(32, 152, 238, 0.06);
}

.event-filter-panel__actions {
	padding: 8px 16px 12px;
}

.event-filter-panel__reset {
	padding: 0;
	border: 0;
	background: transparent;
	color: #8a94a6;
	font-size: 12px;
}

.event-summary {
	display: grid;
	grid-template-columns: 1fr 1fr 1fr;
	gap: 8px;
	padding: 0 16px 10px;
}

.gift-refresh--event {
	height: calc(100% - 220px);
}

.gift-event-add-probe {
	position: absolute;
	width: 1px;
	height: 1px;
	padding: 0;
	margin: -1px;
	overflow: hidden;
	clip: rect(0, 0, 0, 0);
	white-space: nowrap;
	border: 0;
}
</style>
