<template>
	<navBar :info="info" @clickRight="addShopStockBatch"></navBar>
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
				v-model="searchInfo.title"
				show-action
				placeholder="请输入搜索关键词"
				@search="onSearch"
				@cancel="onCancel"
				@change="onSearch"
				action-text="清空"
			/>
		</form>
		<van-divider
			:style="{
				color: '#1989fa',
				borderColor: 'grey',
			}"
		></van-divider>
		<van-empty v-if="dataSource.length == 0" description="暂无数据" />
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
						:title="item.batchCode"
						:key="index"
						is-link
						:to="{
							path: '/finance/shopStockBatch/shopStockBatchDetail',
							query: { id: item.id },
						}"
					>
						<template #right-icon>
							<div class="text-right">
								<div style="display: flex">
									<div class="van-ellipsis">
										{{ item.batchName }}
									</div>
								</div>
								<div :class="true ? 'rightDiv' : 'rightRedDiv'">
									{{ item.description }}
								</div>
							</div>
						</template>
					</van-cell>
					<template #right>
						<van-button
							class="right_info"
							@click="delShopStockBatch(item.id)"
							square
							type="danger"
							text="删除"
						/>
					</template>
					<van-divider class="dividerClass"></van-divider>
				</van-swipe-cell>
			</van-cell-group>
		</van-list>
	</van-pull-refresh>
	<van-back-top />
</template>
<script lang="ts" setup>
import {
	getShopStockBatchPage,
	deleteShopStockBatch,
} from '@/api/finance/shopStockBatch/shopStockBatchTs';
import { getUserManagerList } from '@/api/user/userManager';
import { SearchInfo, pagination, pageInfo } from './shopStockBatchTs';
import { showSuccessToast, showFailToast } from 'vant';

let router = useRouter();
let route = useRoute();
const info = ref<any>({
	title: route?.meta?.title || '财务管理11',
	rightButton: '新增',
	leftPath: '/',
});
let loading = ref<boolean>(false);
let dataSource = ref<any[]>([]);
let searchInfo = ref<SearchInfo>({});

let finished = ref<boolean>(false); //加载是否已经没有更多数据
let isRefresh = ref<boolean>(false); //是否下拉刷新

const onSearch = () => {
	pagination.value.current = 1;
	dataSource.value = [];
	onRefresh();
};
const onCancel = () => {
	searchInfo.value.title = '';
	pagination.value.current = 0;
	dataSource.value = [];
	query(searchInfo.value, pagination.value);
};

const query = (param: SearchInfo, cur: pageInfo): void => {
	loading.value = true;
	getShopStockBatchPage(
		param,
		cur?.current ? cur.current : 1,
		cur?.pageSize || 10,
	)
		.then((res: any) => {
			if (res?.code == '200') {
				dataSource.value = [...dataSource.value, ...res.data.records];
				pagination.value.current = res.data.current + 1;
				pagination.value.pageSize = res.data.size;
				pagination.value.total = res.data.total;
				if (
					(pagination.value.total || 0) <
					(pagination.value.current || 1) * (pagination.value.pageSize || 10)
				) {
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

const addShopStockBatch = (): void => {
	router.push({ path: '/finance/shopStockBatch/shopStockBatchDetail' });
};

let userMap = {};
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

const delShopStockBatch = (id: number): void => {
	deleteShopStockBatch(id + '').then((res: any) => {
		if (res?.code == '200') {
			refresh();
			showSuccessToast(res?.message || '删除成功！');
		} else {
			showFailToast(res?.message || '删除失败，请联系管理员！');
		}
	});
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
.right_info {
	height: 100%;
}

.rightDiv {
	margin-top: 10px;
	text-align: right;
}

.rightRedDiv {
	margin-top: 10px;
	text-align: right;
	color: red;
}

.iconClass {
	margin-top: 10px;
	display: flex;
}
.van-ellipsis {
	width: 130px;
	text-align: right;
}

.dividerClass {
	color: #1989fa;
	border-color: grey;
	padding: 0 16px;
	margin-top: 0px;
	margin-bottom: 0px;
}
</style>
