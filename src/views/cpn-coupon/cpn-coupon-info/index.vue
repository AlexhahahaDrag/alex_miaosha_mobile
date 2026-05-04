<template>
	<div class="coupon-page">
		<!-- 搜索栏与过滤面板 -->
		<section class="page-search">
			<div class="search-shell">
				<form
					action="/"
					class="search-shell__form"
				>
					<van-search
						v-model="searchInfo.couponName"
						placeholder="搜索消费券名称"
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
			:model-value="{ status: activeStatus }"
			:active-map="{ time: activeTimePreset }"
			@select="handleFilterSelect"
			@reset="onResetFilters"
			@submit="onApplyFilters"
		/>

		<!-- 自定义日期选择弹窗 -->
		<van-calendar
			v-model:show="showCustomDatePicker"
			type="range"
			@confirm="onConfirmCustomDate"
			color="#1989fa"
			:min-date="new Date(2020, 0, 1)"
			:max-date="new Date()"
		/>

		<!-- 汇总信息与排序 -->
		<div class="summary-bar">
			<div class="total-count">
				共 <span class="highlight">{{ pagination.total || 0 }}</span> 张消费券
			</div>
			<div class="sort-action"> 按有效期 <van-icon name="arrow-down" /> </div>
		</div>

		<!-- 下拉刷新容器 -->
		<common-pull-refresh
			v-model="isRefresh"
			@refresh="onRefreshData"
			class="refresh-container"
		>
			<common-list
				v-model="loading"
				:loading="loading"
				:refreshing="isRefresh"
				:finished="finished"
				:is-empty="!dataSource.length"
				@load="onLoadMore"
				class="content-wrapper"
			>
				<!-- 骨架屏状态 -->
				<template #skeleton>
					<div class="skeleton-list">
						<div
							v-for="i in 5"
							:key="i"
							class="skeleton-card"
						>
							<van-skeleton
								avatar
								avatar-size="64px"
								avatar-shape="round"
								title
								:row="2"
							/>
						</div>
					</div>
				</template>

				<!-- 消费券列表 -->
				<div class="card-list-wrapper">
					<div
						v-for="(item, index) in dataSource"
						:key="item.id"
						class="card-item"
					>
						<van-swipe-cell>
							<div
								class="coupon-card"
								@click="onCardClick(item.id)"
							>
								<!-- 左侧大圆角图标 -->
								<div class="coupon-icon">
									<img
										:src="getCouponImage(index)"
										alt="coupon"
									/>
								</div>

								<!-- 中间内容 -->
								<div class="coupon-content">
									<div class="coupon-header">
										<span class="coupon-name">{{ item.couponName || '未命名消费券' }}</span>
										<van-tag
											:type="item.paymentStatus === 1 ? 'success' : 'warning'"
											plain
											size="medium"
											class="status-tag"
										>
											{{ item.paymentStatus === 1 ? '已支付' : '未支付' }}
										</van-tag>
									</div>
									<div class="coupon-price">¥ {{ item.unitValue?.toFixed(2) || '0.00' }}</div>
									<div class="coupon-footer">
										{{ getValidityText(item) }} <span class="divider">|</span> 剩余 {{ item.remainingQuantity || 0 }} /
										{{ item.totalQuantity || 0 }}
									</div>
								</div>

								<!-- 右侧箭头 -->
								<div class="coupon-arrow">
									<van-icon
										name="arrow"
										color="#c8c9cc"
										size="18"
									/>
								</div>
							</div>
							<template #right>
								<van-button
									v-if="item.remainingQuantity && item.remainingQuantity > 0"
									class="redeem-button"
									@click="onRedeem(item.id)"
									square
									type="primary"
									text="核销"
								/>
								<van-button
									class="delete-button"
									@click="onDeleteCpnCouponInfo(item.id)"
									square
									type="danger"
									text="删除"
								/>
							</template>
						</van-swipe-cell>
					</div>
				</div>
			</common-list>
		</common-pull-refresh>

		<!-- 删除确认弹窗 -->
		<van-popup
			v-model:show="showDeletePopup"
			position="bottom"
			round
			:style="{ padding: '20px' }"
		>
			<div class="delete-popup-content">
				<div class="delete-icon">
					<van-icon
						name="delete-o"
						size="40"
						color="#ee0a24"
					/>
				</div>
				<div class="delete-title">确认删除该消费券吗？</div>
				<div class="delete-message">删除后将无法恢复此消费券，请确认是否继续操作。</div>
				<div class="delete-buttons">
					<van-button
						class="cancel-btn"
						block
						round
						@click="cancelDelete"
					>
						取消
					</van-button>
					<van-button
						class="confirm-btn"
						block
						round
						type="danger"
						@click="confirmDelete"
					>
						删除
					</van-button>
				</div>
			</div>
		</van-popup>
	</div>
</template>
<script lang="ts" setup>
import dayjs, { type Dayjs } from 'dayjs';
import { showFailToast, showSuccessToast } from 'vant';
import { debounce } from 'lodash';
import type { CpnCouponInfoData } from './config';
import { usePagination } from '@/composables/usePagination';
import type { PageInfo } from '@/views/common/config';
import { getRoutePathByName } from '@/utils/router';
import { formatDate } from '@/utils/dayjs';
import { getCpnCouponInfoPage, deleteCpnCouponInfo } from '@/views/cpn-coupon/cpn-coupon-info/api';
import { useNavBar } from '@/composables/useNavBar';
import { useTabBar } from '@/composables/useTabBar';
import CommonList from '@/views/components/CommonList.vue';
import type { ResponseBody } from '@/types/api';

const router = useRouter();
const route = useRoute();

// 导航栏配置
useNavBar({
	title: (route?.meta?.title as string) || '消费券管理',
	rightIcon: 'plus',
	leftPath: '/',
	visible: true,
	onRightClick: () => {
		const path = getRoutePathByName(router, 'cpnCouponInfoDetail', '/selfFinance/cpnCouponInfo/cpnCouponInfoDetail');
		router.push({ path, query: { mode: 'edit' } });
	},
});

// TabBar配置
useTabBar({
	visible: true,
	data: [
		{ name: 'dashboard', title: '首页', icon: 'homepage' },
		{ name: 'cpnCouponInfo', title: '消费券', icon: 'van-coupon-o' },
		{ name: 'cpnUserCouponInfo', title: '核销记录', icon: 'van-orders-o' },
		{ name: 'myself', title: '个人', icon: 'user' },
	],
	active: 1,
});

// 响应式数据
const loading = ref<boolean>(false);
const dataSource = ref<CpnCouponInfoData[]>([]);
const searchInfo = ref<CpnCouponInfoData>({
	onlyValidAndNotFullyRedeemed: true,
});
const finished = ref<boolean>(false);
const isRefresh = ref<boolean>(false);
const { pagination, resetPagination, setTotal, nextPage } = usePagination();
const showDeletePopup = ref<boolean>(false);
const deleteTargetId = ref<string | undefined>(undefined);

type TimePreset = 'today' | '7d' | 'month' | 'all' | 'custom';

const timeFilterOptions: { label: string; value: TimePreset }[] = [
	{ label: '今天', value: 'today' },
	{ label: '近7天', value: '7d' },
	{ label: '当月', value: 'month' },
	{ label: '全部', value: 'all' },
	{ label: '自定义', value: 'custom' },
];

const statusOptions = [
	{ text: '全部', value: '' },
	{ text: '可用', value: 'AVAILABLE' },
	{ text: '未支付', value: 'UNPAID' },
];

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

interface ActiveFilterTag {
	key: string;
	label: string;
}

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

const handleFilterSelect = ({ key, value }: { key: string; value: unknown }) => {
	if (key === 'status') {
		activeStatus.value = value as string;
	} else if (key === 'time') {
		onSelectTimePreset(value as TimePreset);
	}
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
			return { start: now.startOf('month'), end: now.endOf('day') };
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

// 获取消费券图片（使用更大的圆角 rx="16"）
const getCouponImage = (index: number) => {
	const images = [
		'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjN2NiMzQyIiByeD0iMTYiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7imJU8L3RleHQ+PC9zdmc+',
		'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjZmY5ODAwIiByeD0iMTYiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7imJY8L3RleHQ+PC9zdmc+',
		'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjNTY5ZGZmIiByeD0iMTYiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7imIU8L3RleHQ+PC9zdmc+',
		'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjZmY0NTU3IiByeD0iMTYiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7imIY8L3RleHQ+PC9zdmc+',
	];
	return images[index % images.length];
};

// 获取有效期文本
const getValidityText = (item: CpnCouponInfoData) => {
	if (!item.endDate) return '无限期';
	const endDate = formatDate(item.endDate);
	const today = new Date();
	const end = new Date(item.endDate.toString());
	const daysLeft = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

	if (daysLeft < 0) return '已过期';
	if (daysLeft === 0) return '今天到期';
	if (daysLeft <= 3) return `${daysLeft}天后到期`;
	return `有效期至 ${endDate}`;
};

// 点击卡片 - 跳转到详情页
const onCardClick = (id?: string) => {
	if (!id) return;
	const path = getRoutePathByName(router, 'cpnCouponInfoDetail', '/selfFinance/cpnCouponInfo/cpnCouponInfoDetail');
	router.push({
		path,
		query: { id },
	});
};

// 统一重置数据函数
const resetData = () => {
	dataSource.value = [];
	resetPagination();
};

// 获取消费券数据
const getCpnCouponInfoPageData = async (param: CpnCouponInfoData, cur: PageInfo) => {
	loading.value = true;
	const { code, data, message } = await getCpnCouponInfoPage(param, cur?.current || 1, cur?.pageSize || 10)
		.catch((error: ResponseBody) => {
			throw error;
		})
		.finally(() => {
			loading.value = false;
			isRefresh.value = false;
		});
	if (code === '200') {
		data?.records?.forEach((item: CpnCouponInfoData) => {
			item.currentRate = 0;
		});
		if (cur?.current === 1) {
			dataSource.value = data?.records || [];
		} else {
			dataSource.value = [...dataSource.value, ...(data?.records || [])];
		}
		setTotal(data?.total || 0);
		nextPage();
		if ((pagination.total || 0) <= dataSource.value.length) {
			finished.value = true;
		}
	} else {
		showFailToast(message || '查询列表失败！');
	}
};

// 搜索处理 (如果需要立刻触发，可强制执行防抖函数)
const onSearch = () => {
	debouncedQuery.flush();
};

// 取消搜索
const onCancel = () => {
	searchInfo.value.couponName = '';
};

// 下拉刷新
const onRefreshData = () => {
	resetPagination();
	getCpnCouponInfoPageData(searchInfo.value, pagination);
};

// 加载更多
const onLoadMore = () => {
	if (isRefresh.value) {
		return;
	}
	getCpnCouponInfoPageData(searchInfo.value, pagination);
};

// 核销消费券
const onRedeem = (id?: string) => {
	if (!id) {
		return;
	}
	const path = getRoutePathByName(router, 'cpnCouponInfoRedeem', '/selfFinance/cpnCouponInfo/redeem');
	router.push({
		path,
		query: { couponId: id },
	});
};

// 删除消费券
const onDeleteCpnCouponInfo = async (id?: string) => {
	if (!id) {
		return;
	}
	deleteTargetId.value = id;
	showDeletePopup.value = true;
};

// 取消删除
const cancelDelete = () => {
	showDeletePopup.value = false;
	deleteTargetId.value = undefined;
};

// 确认删除
const confirmDelete = async () => {
	const id = deleteTargetId.value;
	if (!id) {
		return;
	}
	showDeletePopup.value = false;
	const { code, message } = await deleteCpnCouponInfo(String(id));
	if (code === '200') {
		onRefreshData();
		showSuccessToast(message || '删除成功！');
	} else {
		showFailToast(message || '删除失败，请联系管理员！');
	}
	deleteTargetId.value = undefined;
};

// 初始化
onMounted(() => {
	resetData();
	activeStatus.value = 'AVAILABLE';
	applyStatusFilter();
});

// 防抖查询函数
const debouncedQuery = debounce(() => {
	// 搜索条件发生变化时，重置数据并重新获取数据
	resetData();
	getCpnCouponInfoPageData(searchInfo.value, pagination);
}, 300); // 300ms延迟

watch(
	() => searchInfo.value,
	() => {
		debouncedQuery();
	},
	{
		deep: true,
		immediate: true,
	},
);
</script>

<style lang="less" scoped>
.coupon-page {
	height: 100%;
	display: flex;
	flex-direction: column;
	background-color: #f7f8fa;
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

.summary-bar {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 12px 16px 4px;
	font-size: 13px;
	color: #969799;

	.highlight {
		color: #1989fa;
		font-weight: bold;
		margin: 0 2px;
	}

	.sort-action {
		display: flex;
		align-items: center;
		gap: 4px;
	}
}

.refresh-container {
	flex: 1;
	overflow-y: auto;
}

.content-wrapper {
	padding: 8px 16px 0;
	position: relative;
}

.card-list-wrapper {
	display: flex;
	flex-direction: column;
}

.card-item {
	margin-bottom: 12px;

	&:last-child {
		margin-bottom: 0;
	}
}

.skeleton-list {
	display: flex;
	flex-direction: column;
	gap: 12px;
}

.skeleton-card {
	background: #fff;
	border-radius: 16px;
	padding: 16px;
	box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}

.coupon-card {
	background: #fff;
	border-radius: 16px;
	padding: 16px;
	display: flex;
	align-items: center;
	gap: 16px;
	box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
	position: relative;
	cursor: pointer;
	transition:
		transform 0.2s,
		box-shadow 0.2s;

	&:active {
		transform: scale(0.98);
	}
}

.coupon-icon {
	flex-shrink: 0;
	width: 64px;
	height: 64px;
	border-radius: 16px;
	overflow: hidden;

	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
}

.coupon-content {
	flex: 1;
	display: flex;
	flex-direction: column;
	min-width: 0;

	.coupon-header {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 6px;

		.coupon-name {
			font-size: 16px;
			font-weight: 600;
			color: #323233;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
			flex: 0 1 auto;
			min-width: 0;
		}

		.status-tag {
			flex-shrink: 0;
			border-radius: 4px;
		}
	}

	.coupon-price {
		font-size: 20px;
		font-weight: 700;
		color: #1989fa;
		margin-bottom: 8px;
		letter-spacing: -0.5px;
	}

	.coupon-footer {
		font-size: 12px;
		color: #969799;
		display: flex;
		align-items: center;

		.divider {
			margin: 0 6px;
			color: #dcdee0;
		}
	}
}

.coupon-arrow {
	flex-shrink: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	padding-left: 4px;
}

:deep(.van-swipe-cell__right) {
	display: flex;
	height: 100%;
}

.redeem-button {
	width: 65px;
	height: 100%;
	border: none;
}

.delete-button {
	width: 65px;
	height: 100%;
	border: none;
	border-top-right-radius: 12px;
	border-bottom-right-radius: 12px;
}

// 如果只有删除按钮时占满高度和位置
.van-swipe-cell__right .delete-button:only-child {
	width: 65px;
}

.delete-popup-content {
	text-align: center;
	animation: popup-in 0.3s cubic-bezier(0.4, 0, 0.2, 1);

	@keyframes popup-in {
		0% {
			opacity: 0;
			transform: translateY(20px);
		}
		100% {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.delete-icon {
		width: 60px;
		height: 60px;
		margin: 0 auto 16px;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: #fee;
		border-radius: 50%;
		animation: icon-bounce 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.2s backwards;

		@keyframes icon-bounce {
			0% {
				transform: scale(0);
			}
			50% {
				transform: scale(1.1);
			}
			100% {
				transform: scale(1);
			}
		}
	}

	.delete-title {
		font-size: 18px;
		font-weight: 600;
		color: #323233;
		margin-bottom: 12px;
		animation: fade-in 0.4s ease 0.3s backwards;
	}

	.delete-message {
		font-size: 14px;
		color: #969799;
		line-height: 20px;
		margin-bottom: 24px;
		padding: 0 10px;
		animation: fade-in 0.4s ease 0.4s backwards;

		@keyframes fade-in {
			from {
				opacity: 0;
			}
			to {
				opacity: 1;
			}
		}
	}

	.delete-buttons {
		display: flex;
		gap: 12px;
		animation: fade-in 0.4s ease 0.5s backwards;

		.cancel-btn,
		.confirm-btn {
			transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

			&:active {
				transform: scale(0.95);
			}
		}

		.cancel-btn {
			background-color: #f7f8fa;
			color: #323233;
			border: none;

			&:hover {
				background-color: #ebedf0;
			}
		}

		.confirm-btn {
			background-color: #ee0a24;
			border: none;

			&:hover {
				background-color: #d9001b;
			}

			&:active {
				background-color: #c00018;
			}
		}
	}
}
</style>
