<template>
	<navBar :info="info" @clickRight="addPersonalGift"></navBar>
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
				v-model="searchInfo.keyword"
				shape="round"
				show-action
				placeholder="请输入搜索关键词"
				@search="onSearch"
				@cancel="onCancel"
				action-text="清空"
			/>
		</form>
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
						:key="index"
						is-link
						:to="{
							path: '/selfFinance/personalGift/personalGiftDetail',
							query: { id: item.id },
						}"
					>
						<template #title>
							<div class="text-left">
								<van-space size="4px">
									<span class="custom-title">{{
										item.otherPerson + item.eventName
									}}</span>
									<van-tag type="primary">{{ item.noticeNum }}</van-tag>
									<van-tag type="success" v-if="item.action === 'recieve'"
										>收礼</van-tag
									>
									<van-tag type="warning" v-if="item.action === 'give'"
										>随礼</van-tag
									>
								</van-space>
							</div>
						</template>
						<template #label>
							<div class="iconClass">
								<div class="icon" style="background-color: #ffcc00">
									{{ item.remarks }}
								</div>
							</div>
						</template>
						<template #right-icon>
							<div class="text-right">
								<div style="display: flex">
									<div class="van-ellipsis">
										{{ item.amount }}
									</div>
								</div>
								<div :class="true ? 'rightDiv' : 'rightRedDiv'">
									{{ dayjs(item.eventTime).format('YYYY-MM-DD') }}
								</div>
							</div>
						</template>
					</van-cell>
					<template #right>
						<van-button
							class="right_info"
							@click="delPersonalGift(item.id)"
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
	getPersonalGiftPage,
	deletePersonalGift,
} from '@/api/finance/personalGift/personalGiftTs';
import { getUserManagerList } from '@/api/user/userManager';
import { SearchInfo, pagination, pageInfo } from './personalGiftTs';
import { showSuccessToast, showFailToast } from 'vant';
import dayjs from 'dayjs';

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
	pagination.value.current = 0;
	dataSource.value = [];
	onRefresh();
};
const onCancel = () => {
	searchInfo.value.keyword = '';
	pagination.value.current = 0;
	dataSource.value = [];
	query(searchInfo.value, pagination.value);
};

const query = (param: SearchInfo, cur: pageInfo): void => {
	loading.value = true;
	getPersonalGiftPage(
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

const addPersonalGift = (): void => {
	router.push({ path: '/selfFinance/personalGift/personalGiftDetail' });
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

const delPersonalGift = (id: number): void => {
	deletePersonalGift(id + '').then((res: any) => {
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
