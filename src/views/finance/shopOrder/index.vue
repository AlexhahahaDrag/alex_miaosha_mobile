<template>
	<navBar
		:info="info"
		@click-right="addShopOrder"
	></navBar>
	<van-pull-refresh
		pulling-text="加载中。。。"
		:style="{ height: 'calc(100% - 44px)' }"
		v-model="isRefresh"
		@refresh="refresh"
		ref="pullRefresh"
		immediate-check="false"
	>
		<form action="/">
			<van-search
				v-model="searchInfo.typeCode"
				show-action
				placeholder="请输入搜索关键词"
				@search="onSearch"
				@cancel="onCancel"
				action-text="清空"
			/>
		</form>
		<van-divider
			:style="{
				color: '#1989fa',
				borderColor: 'grey',
			}"
		></van-divider>
		<van-empty
			v-if="dataSource.length == 0"
			description="暂无数据"
		></van-empty>
		<van-list
			v-else
			v-model:loading="loading"
			:finished="finished"
			finished-text="没有更多了"
			@load="onRefresh"
		>
			<van-cell-group>
				<van-swipe-cell
					v-for="(item, index) in dataSource"
					:before-close="beforeClose"
					:key="index"
				>
					<van-cell
						:title="item.id"
						:key="index"
						is-link
						:to="{
							path: '/finance/shopOrder/shopOrderDetail',
							query: { id: item.id },
						}"
					>
						<template #title>
							<div class="text-left">
								<van-space size="4px">
									<span class="custom-title">{{ item.saleOrderCode }}</span>
								</van-space>
							</div>
						</template>
						<template #right-icon>
							<div class="text-right">
								<div style="display: flex">
									<div class="van-ellipsis"> ￥{{ commonUtils.formatAmount(item?.saleAmount, 2, '') }} </div>
								</div>
								<div class="rightRedDiv">
									<div>
										{{ commonUtils.formatAmount(item?.saleCount, 2, '') }}
									</div>
								</div>
							</div>
						</template>
						<template #value></template>
						<template #label>
							{{ item.saleDate ? dayjs(item.saleDate).format('YYYY-MM-DD') : '' }}
						</template>
					</van-cell>
					<van-divider class="dividerClass"></van-divider>
				</van-swipe-cell>
			</van-cell-group>
		</van-list>
	</van-pull-refresh>
	<van-back-top></van-back-top>
</template>
<script lang="ts" setup>
import { showFailToast } from 'vant';
import dayjs from 'dayjs';
import type { SearchInfo } from './shopOrderTs';
import { pagination } from './shopOrderTs';
import { getShopOrderPage } from '@/api/finance/shopOrder/shopOrderTs';
import { getUserManagerList } from '@/api/user/userManager';
import type { PageInfo } from '@/views/common/config/index';
import commonUtils from '@/utils/common/index';

const router = useRouter();
const route = useRoute();
const info = ref<any>({
	title: route?.meta?.title || '商品订单',
	rightButton: '新增',
	leftPath: '/',
});
const loading = ref<boolean>(false);
const dataSource = ref<any[]>([]);
const searchInfo = ref<SearchInfo>({});

const finished = ref<boolean>(false); //加载是否已经没有更多数据
const isRefresh = ref<boolean>(false); //是否下拉刷新

const onSearch = () => {
	pagination.value.current = 1;
	dataSource.value = [];
	onRefresh();
};
const onCancel = () => {
	searchInfo.value.saleOrderCode = null;
	pagination.value.current = 0;
	dataSource.value = [];
	query(searchInfo.value, pagination.value);
};

const query = (param: SearchInfo, cur: PageInfo): void => {
	loading.value = true;
	getShopOrderPage(param, cur?.current ? cur.current : 1, cur?.pageSize || 10)
		.then((res: any) => {
			if (res?.code == '200') {
				dataSource.value = [...dataSource.value, ...res.data.records];
				pagination.value.current = res.data.current + 1;
				pagination.value.pageSize = res.data.size;
				pagination.value.total = res.data.total;
				if ((pagination.value.total || 0) < (pagination.value.current || 1) * (pagination.value.pageSize || 10)) {
					finished.value = true;
				}
			} else {
				showFailToast(res?.message || '查询列表失败！');
			}
		})
		.finally(() => {
			isRefresh.value = false;
			loading.value = false;
		});
};

const addShopOrder = (): void => {
	router.push({ path: '/finance/shopOrder/shopOrderDetail' });
};

const userMap = {};
const getUserInfoList = (): void => {
	getUserManagerList({}).then((res: any) => {
		if (res?.code == '200') {
			if (res?.data) {
				res.data.forEach((user: { id: string | number; nickName: any }) => {
					userMap[user.id] = user.nickName;
				});
			}
		} else {
			showFailToast(res?.message || '查询列表失败！');
		}
	});
};

const refresh = (): void => {
	pagination.value.current = 0;
	dataSource.value = [];
	query(searchInfo.value, pagination.value);
};

const onRefresh = (): void => {
	query(searchInfo.value, pagination.value);
};

const beforeClose = (e: any): void => {
	console.log(e);
};

const init = (): void => {
	dataSource.value = [];
	pagination.value.current = 0;
	query(searchInfo.value, pagination.value);
	//获取用户信息
	getUserInfoList();
};

init();
</script>

<style lang="scss" scoped>
.text-left {
	font-size: 17px;
	width: 100%;
	padding-bottom: 15px;
}

.rightRedDiv {
	margin-top: 10px;
	text-align: right;
	height: 20px;

	.svg {
		width: 1.5em;
		height: 1.5em;
		font-size: 18px;
		cursor: pointer;
		vertical-align: middle;
		padding-left: 15px;
	}
}

.iconClass {
	margin-top: 10px;
	display: flex;
}

.van-ellipsis {
	width: 130px;
	text-align: right;
	color: black;
	font-size: 20px;
}

.dividerClass {
	color: #1989fa;
	border-color: grey;
	padding: 0 16px;
	margin-top: 0px;
	margin-bottom: 0px;
}

.upAndDown {
	display: flex;
	justify-content: space-around;
}

.svg {
	width: 1.5em;
	height: 1em;
	font-size: 18px;
	cursor: pointer;
	vertical-align: middle;
}
</style>
