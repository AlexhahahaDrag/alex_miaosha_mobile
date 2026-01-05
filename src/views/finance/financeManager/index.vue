<template>
	<form action="/">
		<van-search
			v-model="searchInfo.bigTypeCode"
			show-action
			placeholder="请输入搜索关键词"
			@search="onSearch"
			@cancel="onCancel"
			action-text="清空"
		/>
	</form>
	<van-divider class="divider-style" />
	<van-pull-refresh
		pulling-text="加载中。。。"
		class="refresh-info"
		v-model="isRefresh"
		@refresh="onRefreshData"
		ref="pullRefresh"
		:immediate-check="false"
	>
		<div class="list-container">
			<van-empty
				v-if="!dataSource?.length"
				description="暂无数据"
			/>
			<!-- 有数据时显示列表 -->
			<van-list
				v-else
				v-model:loading="loading"
				:finished="finished"
				:immediate-check="false"
				finished-text="没有更多了"
				@load="onLoadMore"
			>
				<van-cell-group>
					<van-swipe-cell
						v-for="item in dataSource"
						:key="item.id"
					>
						<van-cell
							:title-class="getTitleClass(item.isValid)"
							:title="getCellTitle(item)"
							is-link
							:to="getDetailRoute(item.id)"
						>
							<template #label>
								<div class="svgInfo">
									<div
										class="svgDiv"
										v-for="fromSource in fromSourceTransferList"
										:key="fromSource.value"
									>
										<SvgIcon
											v-if="shouldShowIcon(item.fromSource, fromSource.value)"
											:name="fromSource.label"
											class="svg"
										/>
									</div>
								</div>
							</template>
							<template #right-icon>
								<div class="text-right">
									<div class="date-text">
										{{ formatDate(item.infoDate) }}
									</div>
									<div :class="getAmountClass(item.incomeAndExpenses)">
										{{ formatAmount(item) }}
									</div>
								</div>
							</template>
						</van-cell>
						<template #right>
							<van-button
								class="right_info"
								@click="onDeleteFinance(item.id)"
								square
								type="danger"
								text="删除"
							/>
						</template>
						<van-divider class="item-divider-style" />
					</van-swipe-cell>
				</van-cell-group>
			</van-list>
		</div>
	</van-pull-refresh>
	<van-back-top />
</template>
<script lang="ts" setup>
import type { Dayjs } from 'dayjs';
import { showSuccessToast, showFailToast } from 'vant';
import { pagination, fromSourceTransferList, type FinanceManagerData } from './config';
import { getRoutePathByName } from '@/utils/router';
import { getFinanceMangerPage, deleteFinanceManager } from '@/views/finance/financeManager/api';
import { useNavBar } from '@/composables/useNavBar';
import type { PageInfo } from '@/views/common/config';

const router = useRouter();
const route = useRoute();

// 通过路由解析获取详情页路径，使用公共工具方法
const getDetailRoutePath = () => {
	return getRoutePathByName(router, 'financeManagerDetail');
};

// 获取详情页路由配置
const getDetailRoute = (id?: number) => {
	const path = getDetailRoutePath();
	return {
		path,
		query: { id },
	};
};

// 导航栏配置
useNavBar({
	title: (route?.meta?.title as string) || '财务管理',
	rightButton: '新增',
	leftPath: '/',
	visible: true,
	onRightClick: () => {
		const path = getDetailRoutePath();
		router.push({ path });
	},
});

// 响应式数据
const loading = ref<boolean>(false);
const dataSource = ref<FinanceManagerData[]>([]);
const searchInfo = ref<FinanceManagerData>({});
const finished = ref<boolean>(false);
const isRefresh = ref<boolean>(false);

// 计算属性和工具函数
const getTitleClass = (isValid?: string) => {
	return isValid === '1' ? 'validClass' : 'notValidClass';
};

const getCellTitle = (item: FinanceManagerData) => {
	return `${item.belongToName || '未知用户'}的${item.name || ''}(${item.typeCode || ''})`;
};

const shouldShowIcon = (fromSource?: string, value?: string) => {
	if (!fromSource || !value || value === '') {
		return false;
	}
	return fromSource.indexOf(value) >= 0;
};

const formatDate = (infoDate?: string | Dayjs | null): string => {
	if (!infoDate) {
		return '--';
	}
	const dateStr = typeof infoDate === 'string' ? infoDate : infoDate.toString();
	return dateStr.substring(0, 10);
};

const getAmountClass = (incomeAndExpenses?: string) => {
	return incomeAndExpenses === 'income' ? 'rightGreenDiv' : 'rightRedDiv';
};

const formatAmount = (item: FinanceManagerData) => {
	if (!item.amount) {
		return '--';
	}
	const amount = item.incomeAndExpenses === 'income' ? item.amount : -item.amount;
	return `${amount}元`;
};

// 统一重置数据函数
const resetData = () => {
	dataSource.value = [];
	pagination.value.current = 1;
	pagination.value.pageSize = 10;
};

// 获取财务数据
const getFinancePage = async (param: FinanceManagerData, cur: PageInfo) => {
	loading.value = true;
	const { code, data, message } = await getFinanceMangerPage(param, cur?.current || 1, cur?.pageSize || 10)
		.catch((error: unknown) => {
			throw error;
		})
		.finally(() => {
			loading.value = false;
			isRefresh.value = false;
		});
	if (code === '200') {
		dataSource.value = [...dataSource.value, ...(data?.records || [])];
		pagination.value.total = data?.total || 0;
		finished.value = pagination.value.total < ((pagination.value.current || 0) + 1) * (pagination.value.pageSize || 10);
	} else {
		showFailToast(message || '查询列表失败！');
	}
};

// 搜索处理
const onSearch = () => {
	pagination.value.current = 1;
	dataSource.value = [];
	onLoadMore();
};

// 取消搜索
const onCancel = () => {
	searchInfo.value.bigTypeCode = '';
	resetData();
	getFinancePage(searchInfo.value, pagination.value);
};

// 下拉刷新
const onRefreshData = () => {
	resetData();
	getFinancePage(searchInfo.value, pagination.value);
};

// 加载更多
const onLoadMore = () => {
	pagination.value.current = (pagination.value.current || 0) + 1;
	getFinancePage(searchInfo.value, pagination.value);
};

// 删除财务记录
const onDeleteFinance = async (id?: string) => {
	if (!id) {
		return;
	}
	const { code, message } = await deleteFinanceManager(`${id}`);
	if (code === '200') {
		onRefreshData();
		showSuccessToast(message || '删除成功！');
	} else {
		showFailToast(message || '删除失败，请联系管理员！');
	}
};

// 初始化
onMounted(() => {
	resetData();
	getFinancePage(searchInfo.value, pagination.value);
});
</script>

<style lang="less" scoped>
.refresh-info {
	height: calc(100% - 64px);
}

.list-container {
	height: 100%;
	overflow-y: auto;
}

.loading-container {
	display: flex;
	justify-content: center;
	align-items: center;
	height: 30%;
	min-height: 200px;
}

.divider-style {
	color: #1989fa;
	border-color: grey;
	margin: 0 0 10px 0;
}

.item-divider-style {
	color: #1989fa;
	border-color: grey;
	padding: 0 16px;
	margin-top: 0;
	margin-bottom: 0;
}

.right_info {
	height: 100%;
}

.text-right {
	display: flex;
	flex-direction: column;
	align-items: flex-end;
}

.date-text {
	width: 130px;
	text-align: right;
}

.svgInfo {
	margin-top: 10px;
	display: flex;

	.svgDiv {
		height: 30px;

		.svg {
			width: 1.5em;
			height: 1.5em;
			font-size: 18px;
			cursor: pointer;
			vertical-align: middle;
		}
	}
}

.rightGreenDiv {
	margin-top: 10px;
	text-align: right;
	color: green;
}

.rightRedDiv {
	margin-top: 10px;
	text-align: right;
	color: red;
}

.validClass {
	font-weight: bolder;
}

.notValidClass {
	color: gray;
}
</style>
