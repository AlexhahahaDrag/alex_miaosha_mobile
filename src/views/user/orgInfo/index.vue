<template>
	<NavBar
		:info="info"
		@click-right="addOrgInfo"
	></NavBar>
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
				v-model="searchInfo.orgName"
				show-action
				placeholder="请输入机构名称"
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
						:title-class="item.status == '1' ? 'validClass' : 'notValidClass'"
						:title="item.orgName"
						:key="index"
						is-link
						:to="{
							path: '/user/orgInfo/orgInfoDetail',
							query: { id: item.id },
						}"
					>
						<template #label>
							<div class="iconClass">
								<div class="icon">
									{{ item.parentOrgName }}
								</div>
							</div>
						</template>
						<template #right-icon>
							<div class="text-right">
								<div style="display: flex">
									<div class="van-ellipsis">
										{{ item.orgCode }}
									</div>
								</div>
								<div :class="true ? 'rightDiv' : 'rightRedDiv'">
									{{ item.status == '1' ? '有效' : '无效' }}
								</div>
							</div>
						</template>
					</van-cell>
					<template #right>
						<van-button
							class="right_info"
							@click="delOrgInfo(item.id)"
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
	<van-back-top></van-back-top>
</template>
<script lang="ts" setup>
import { showSuccessToast, showFailToast } from 'vant';
import type { SearchInfo } from './orgInfoTs';
import { pagination } from './orgInfoTs';
import { getOrgInfoPage, deleteOrgInfo } from '@/api/user/orgInfo/orgInfoTs';
import { getUserManagerList } from '@/api/user/userManager';
import type { PageInfo } from '@/views/common/config/index';

const router = useRouter();
const route = useRoute();
const info = ref<any>({
	title: route?.meta?.title || '财务管理11',
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
	searchInfo.value.orgName = '';
	pagination.value.current = 0;
	dataSource.value = [];
	query(searchInfo.value, pagination.value);
};

async function query(param: SearchInfo, cur: PageInfo) {
	loading.value = true;
	getOrgInfoPage(param, cur?.current ? cur.current : 1, cur?.pageSize || 10)
		.then((res: any) => {
			if (res.code == '200') {
				dataSource.value = [...dataSource.value, ...res.data.records];
				pagination.value.current = res.data.current + 1;
				pagination.value.pageSize = res.data.size;
				pagination.value.total = res.data.total;
				if (
					!pagination.value?.total ||
					(pagination.value.total &&
						pagination.value.total < (pagination.value.current || 1) * (pagination.value.pageSize || 10))
				) {
					finished.value = true;
				}
			} else {
				showFailToast((res && res.message) || '查询列表失败！');
			}
		})
		.finally(() => {
			isRefresh.value = false;
			loading.value = false;
		});
}

const addOrgInfo = () => {
	router.push({ path: '/user/orgInfo/orgInfoDetail' });
};

const userMap = {};
function getUserInfoList() {
	getUserManagerList({}).then((res) => {
		if (res.code == '200') {
			if (res?.data) {
				res.data.forEach((user: { id: string | number; nickName: any }) => {
					userMap[user.id] = user.nickName;
				});
			}
		} else {
			showFailToast((res && res.message) || '查询列表失败！');
		}
	});
}

const refresh = () => {
	pagination.value.current = 0;
	dataSource.value = [];
	query(searchInfo.value, pagination.value);
};

const onRefresh = () => {
	query(searchInfo.value, pagination.value);
};

const beforeClose = (e: any) => {
	console.log(e);
};

const delOrgInfo = (id: number) => {
	deleteOrgInfo(`${id}`).then((res: any) => {
		if (res?.code == '200') {
			refresh();
			showSuccessToast((res && res.message) || '删除成功！');
		} else {
			showFailToast((res && res.message) || '删除失败，请联系管理员！');
		}
	});
};

function init() {
	dataSource.value = [];
	pagination.value.current = 0;
	query(searchInfo.value, pagination.value);
	//获取用户信息
	getUserInfoList();
}

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

.validClass {
	font-weight: bolder;
}

.notValidClass {
	color: gray;
}
</style>
