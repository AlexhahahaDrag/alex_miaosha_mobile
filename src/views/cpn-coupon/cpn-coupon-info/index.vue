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
			color="#1989fa"
			:min-date="new Date(2020, 0, 1)"
			:max-date="new Date()"
			@confirm="onConfirmCustomDate"
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
			class="refresh-container"
			@refresh="onRefreshData"
		>
			<common-list
				v-model="loading"
				:loading="loading"
				:refreshing="isRefresh"
				:finished="finished"
				:is-empty="!dataSource.length"
				class="content-wrapper"
				@load="onLoadMore"
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
					<coupon-card-item
						v-for="(item, index) in dataSource"
						:key="item.id"
						:item="item"
						:index="index"
						@click="onCardClick"
						@redeem="onRedeem"
						@delete="onDeleteCpnCouponInfo"
					/>
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
import { showFailToast, showSuccessToast } from 'vant';
import type { CpnCouponInfoData } from '@/views/cpn-coupon/cpn-coupon-info/config';
import { debounce } from '@/utils/common';
import type { PageInfo } from '@/views/common/config';
import { getRoutePathByName } from '@/utils/router';
import { getCpnCouponInfoPage, deleteCpnCouponInfo } from '@/views/cpn-coupon/cpn-coupon-info/api';
import { useNavBar } from '@/composables/useNavBar';
import { useTabBar } from '@/composables/useTabBar';
import CommonList from '@/components/common/CommonList.vue';
import CouponCardItem from '@/views/cpn-coupon/cpn-coupon-info/components/CouponCardItem.vue';
import { useCouponFilter } from '@/views/cpn-coupon/cpn-coupon-info/composables/useCouponFilter';
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

// 过滤器组合式逻辑
const {
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
} = useCouponFilter(searchInfo);

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

// 搜索处理
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
	resetData();
	getCpnCouponInfoPageData(searchInfo.value, pagination);
}, 300);

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
		font-size: 18px;
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
		margin-bottom: 16px;
	}

	.delete-title {
		font-size: 18px;
		font-weight: 600;
		color: #323233;
		margin-bottom: 8px;
	}

	.delete-message {
		font-size: 14px;
		color: #969799;
		line-height: 1.5;
		margin-bottom: 24px;
	}

	.delete-buttons {
		display: flex;
		gap: 12px;

		.cancel-btn {
			background: #f7f8fa;
			color: #646566;
			border: none;
		}

		.confirm-btn {
			border: none;
		}
	}
}
</style>
