<template>
	<van-pull-refresh
		pulling-text="加载中..."
		class="pull-refresh-container"
		v-model="isRefresh"
		@refresh="refresh"
		ref="pullRefresh"
		:immediate-check="false"
	>
		<form action="/">
			<van-search
				v-model="searchInfo.keyword"
				shape="round"
				show-action
				placeholder="请输入搜索关键词"
				@search="onSearch"
				@cancel="onCancel"
				action-text="清空"
			/>
		</form>
		<van-empty
			v-if="!loading && dataSource.length === 0"
			description="暂无数据"
		/>
		<van-list
			v-else
			v-model:loading="loading"
			:finished="finished"
			finished-text="没有更多了"
			:immediate-check="false"
			@load="onRefresh"
		>
			<van-cell-group>
				<van-swipe-cell
					v-for="item in dataSource"
					:key="item.id"
				>
					<van-cell
						is-link
						:to="{
							path: '/selfFinance/personalGift/personalGiftDetail',
							query: { id: item.id },
						}"
					>
						<template #title>
							<div class="text-left">
								<van-space size="4px">
									<span class="custom-title">{{ item?.otherPerson || '' + item?.eventName || '' }}</span>
									<van-tag
										v-if="item.noticeNum"
										type="primary"
									>
										{{ item.noticeNum }}
									</van-tag>
									<van-tag
										type="success"
										v-if="item?.action === 1"
									>
										收礼
									</van-tag>
									<van-tag
										type="warning"
										v-if="item?.action === 2"
									>
										随礼
									</van-tag>
								</van-space>
							</div>
						</template>
						<template #label>
							<div
								v-if="item.remarks"
								class="remarks-container"
							>
								<div class="remarks-icon">
									{{ item.remarks }}
								</div>
							</div>
						</template>
						<template #right-icon>
							<div class="text-right">
								<div class="amount-container">
									<div class="amount-text">
										{{ formatAmount(item.amount) }}
									</div>
								</div>
								<div :class="getDateClass(item.eventTime)">
									{{ formatTime(item.eventTime) }}
								</div>
							</div>
						</template>
					</van-cell>
					<template #right>
						<van-button
							class="delete-button"
							@click="handleDelete(item)"
							square
							type="danger"
							text="删除"
						/>
					</template>
					<van-divider class="divider-class"></van-divider>
				</van-swipe-cell>
			</van-cell-group>
		</van-list>
	</van-pull-refresh>
	<van-back-top />
</template>
<script lang="ts" setup>
import { showSuccessToast, showFailToast, showConfirmDialog } from 'vant';
import { type Dayjs } from 'dayjs';
import type { PersonalGiftData } from './config';
import { pagination } from './config';
import { getPersonalGiftPage, deletePersonalGift } from './api/personalGiftTs';
import type { PageInfo } from '@/views/common/config';
import { useNavBar } from '@/composables/useNavBar';
import { getRoutePathByName } from '@/utils/router';
import { formatTime } from '@/views/common/config';

const router = useRouter();
const route = useRoute();

// 通过路由解析获取详情页路径，使用公共工具方法
const getDetailRoutePath = (): string => {
	return getRoutePathByName(router, 'personalGiftDetail');
};

useNavBar({
	title: (route?.meta?.title as string) || '个人随礼',
	rightButton: '新增',
	leftPath: '/',
	visible: true,
	onRightClick: () => {
		const path = getDetailRoutePath();
		router.push({ path });
	},
});

const loading = ref<boolean>(false);
const dataSource = ref<PersonalGiftData[]>([]);
const searchInfo = ref<PersonalGiftData>({});
const finished = ref<boolean>(false);
const isRefresh = ref<boolean>(false);

// 格式化金额
const formatAmount = (amount: number | string | undefined): string => {
	if (amount === undefined || amount === null) return '--';
	const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
	if (isNaN(numAmount)) return '--';
	return `¥${numAmount.toFixed(2)}`;
};

// 根据日期判断样式类（可以根据业务需求调整判断逻辑）
const getDateClass = (date: string | Dayjs | undefined): string => {
	if (!date) return 'date-text';
	// 可以根据业务需求判断是否过期等，这里暂时返回默认样式
	// 例如：如果日期已过期，返回 'date-text date-expired'
	return 'date-text';
};

// 搜索
const onSearch = (): void => {
	pagination.value.current = 0;
	dataSource.value = [];
	finished.value = false;
	onRefresh();
};

// 取消搜索
const onCancel = (): void => {
	searchInfo.value.keyword = '';
	pagination.value.current = 0;
	dataSource.value = [];
	finished.value = false;
	query(searchInfo.value, pagination.value);
};

// 查询数据
const query = async (param: PersonalGiftData, cur: PageInfo): Promise<void> => {
	if (loading.value) return;

	loading.value = true;
	const { code, message, data } = await getPersonalGiftPage(
		param,
		cur?.current ? cur.current : 1,
		cur?.pageSize || 10,
	).finally(() => {
		loading.value = false;
		isRefresh.value = false;
	});

	if (code === '200' && data) {
		dataSource.value.push(...(data.records || []));
		pagination.value.pageSize = data.size || 0;
		pagination.value.total = data.total || 0;
		// 判断是否已加载完所有数据
		finished.value = pagination.value.total < ((pagination.value.current || 0) + 1) * (pagination.value.pageSize || 10);
	} else {
		showFailToast(message || '查询列表失败！');
	}
};

// 下拉刷新
const refresh = (): void => {
	pagination.value.current = 0;
	dataSource.value = [];
	finished.value = false;
	query(searchInfo.value, pagination.value);
};

// 上拉加载更多
const onRefresh = (): void => {
	if (!finished.value) {
		query(searchInfo.value, pagination.value);
	}
};

// 处理删除
const handleDelete = async (item: PersonalGiftData): Promise<void> => {
	if (!item.id) {
		showFailToast('删除失败，缺少必要参数！');
		return;
	}

	try {
		await showConfirmDialog({
			title: '确认删除',
			message: `确定要删除"${item.otherPerson}${item.eventName}"这条记录吗？`,
		});
	} catch {
		// 用户取消删除
		return;
	}

	try {
		const { code, message } = await deletePersonalGift(String(item.id));
		if (code === '200') {
			showSuccessToast(message || '删除成功！');
			// 从列表中移除已删除的项，避免重新加载
			const index = dataSource.value.findIndex((i) => i.id === item.id);
			if (index > -1) {
				dataSource.value.splice(index, 1);
			}
		} else {
			showFailToast(message || '删除失败，请联系管理员！');
		}
	} catch (error) {
		showFailToast('删除失败，请稍后重试！');
	}
};

// 初始化
const init = (): void => {
	dataSource.value = [];
	pagination.value.current = 0;
	finished.value = false;
	query(searchInfo.value, pagination.value);
};

init();
</script>

<style lang="less" scoped>
.pull-refresh-container {
	height: calc(100% - 44px);
}

.text-left {
	text-align: left;
}

.text-right {
	text-align: right;
}

.custom-title {
	font-weight: 500;
}

.remarks-container {
	margin-top: 10px;
	display: flex;
}

.remarks-icon {
	background-color: #ffcc00;
	padding: 2px 8px;
	border-radius: 4px;
	font-size: 12px;
	color: #333;
}

.amount-container {
	display: flex;
	justify-content: flex-end;
}

.amount-text {
	width: 130px;
	text-align: right;
	font-weight: 600;
	color: #ee0a24;
	font-size: 16px;
}

.date-text {
	margin-top: 10px;
	text-align: right;
	color: #969799;
	font-size: 12px;
}

.date-expired {
	color: #ee0a24;
}

.delete-button {
	height: 100%;
}

.divider-class {
	color: #1989fa;
	border-color: #ebedf0;
	padding: 0 16px;
	margin: 0;
}
</style>
