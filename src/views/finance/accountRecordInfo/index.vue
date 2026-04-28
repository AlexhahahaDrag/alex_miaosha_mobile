<template>
	<NavBar
		:info="info"
		@click-right="addAccountRecordInfo"
	></NavBar>
	<common-pull-refresh
		:style="{ height: 'calc(100% - 44px)' }"
		v-model="isRefresh"
		@refresh="refresh"
		ref="pullRefresh"
	>
		<form action="/">
			<!--   <van-search v-model='searchInfo.typeCode' show-action placeholder='请输入搜索关键词' @search='onSearch'
        @cancel='onCancel' /> -->
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
		/>
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
						:title="item.accountName + '的' + item.name"
						:key="index"
						is-link
						:to="{
							path: '/selfFinance/accountRecordInfo/accountRecordInfoDetail',
							query: { id: item.id },
						}"
					>
						<template #label>
							<div style="margin-top: 0; display: flex">
								<div
									class="icon"
									style="background-color: #ffcc00"
								>
									{{ item.fromSource }}
								</div>
							</div>
						</template>
						<template #right-icon>
							<div class="text-right">
								<div style="display: flex">
									<div
										class="van-ellipsis"
										style="width: 130px; text-align: right"
									>
										{{ item?.avliDate ? String(item.avliDate).substring(0, 10) : '--' }}
									</div>
								</div>
								<div class="rightRedDiv">
									{{ item.amount + '元' || '--' }}
								</div>
							</div>
						</template>
					</van-cell>
					<template #right>
						<van-button
							class="right_info"
							@click="delAccountRecordInfo(item.id ?? 0)"
							square
							type="danger"
							text="删除"
						/>
					</template>
					<van-divider
						:style="{
							color: '#1989fa',
							borderColor: 'grey',
							padding: '0 16px',
							'margin-top': '0px',
							'margin-bottom': '0px',
						}"
					></van-divider>
				</van-swipe-cell>
			</van-cell-group>
		</van-list>
	</common-pull-refresh>
	<van-back-top></van-back-top>
</template>
<script lang="ts" setup>
import { showSuccessToast, showFailToast } from 'vant';
import type { Params } from '@/types/global';
import type { PageInfo } from '@/views/common/config';
import type { AccountRecordInfoData } from '@/views/finance/accountRecordInfo/config';
import { usePagination } from '@/composables/usePagination';
import { deleteAccountRecordInfo, getAccountRecordInfoPage } from '@/views/finance/accountRecordInfo/api';
import { getUserManagerList } from '@/views/user/userManager/api';

const router = useRouter();
const route = useRoute();
const info = ref<Params>({
	title: route?.meta?.title || '账号管理',
	rightButton: '新增',
	leftPath: '/',
});
const loading = ref<boolean>(false);
const dataSource = ref<AccountRecordInfoData[]>([]);
const searchInfo = ref<AccountRecordInfoData>({});

const finished = ref<boolean>(false); //加载是否已经没有更多数据
const isRefresh = ref<boolean>(false); //是否下拉刷新
const { pagination, resetPagination, setTotal, nextPage } = usePagination();

// const onSearch = () => {
//  pagination.value.current = 1;
//  dataSource.value = []
//  onRefresh();
// };
// const onCancel = () => {
//   searchInfo.value.typeCode = '';
// };

const query = async (param: AccountRecordInfoData, cur: PageInfo) => {
	loading.value = true;
	const { code, message, data } = await getAccountRecordInfoPage(
		param,
		cur?.current ? cur.current : 1,
		cur?.pageSize || 10,
	).finally(() => {
		isRefresh.value = false;
		loading.value = false;
	});
	if (code == '200') {
		dataSource.value = [...dataSource.value, ...(data?.records || [])];
		setTotal(data?.total || 0);
		nextPage();
		if ((pagination.total || 0) <= dataSource.value.length) {
			finished.value = true;
		}
	} else {
		showFailToast(message || '查询列表失败！');
	}
};

const addAccountRecordInfo = () => {
	router.push({
		path: '/selfFinance/accountRecordInfo/accountRecordInfoDetail',
	});
};

const userMap = {};
const getUserInfoList = async () => {
	const { code, message, data } = await getUserManagerList({});
	if (code == '200') {
		if (data) {
			(data || []).forEach((user: { id: string | number; nickName: string }) => {
				userMap[user.id] = user.nickName;
			});
		}
	} else {
		showFailToast(message || '查询列表失败！');
	}
};

const refresh = () => {
	resetPagination();
	dataSource.value = [];
	query(searchInfo.value, pagination);
};

const onRefresh = () => {
	query(searchInfo.value, pagination);
};

const beforeClose = (_e: Params): void => {
	// console.log(e);
};

const delAccountRecordInfo = async (id: string) => {
	const { code, message } = await deleteAccountRecordInfo(`${id}`);
	if (code == '200') {
		refresh();
		showSuccessToast(message || '删除成功！');
	} else {
		showFailToast(message || '删除失败，请联系管理员！');
	}
};

function init() {
	dataSource.value = [];
	resetPagination();
	query(searchInfo.value, pagination);
	//获取用户信息
	getUserInfoList();
}

init();
</script>

<style lang="less" scoped>
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
</style>
