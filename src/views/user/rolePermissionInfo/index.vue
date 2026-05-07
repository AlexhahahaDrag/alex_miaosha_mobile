<template>
	<common-pull-refresh
		:style="{ height: 'calc(100% - 44px)' }"
		v-model="isRefresh"
		@refresh="refresh"
		ref="pullRefresh"
	>
		<form action="/">
			<!--
    <van-search
        v-model='searchInfo.typeCode'
        show-action
        placeholder='璇疯緭鍏ユ悳绱㈠叧閿瘝'
        @search='onSearch'
        @cancel='onCancel'
        action-text="娓呯┖"/>
    -->
		</form>
		<van-divider
			:style="{
				color: '#1989fa',
				borderColor: 'grey',
			}"
		></van-divider>
		<van-empty
			v-if="dataSource.length == 0"
			description="鏆傛棤鏁版嵁"
		></van-empty>
		<van-list
			v-else
			:loading="loading"
			@update:loading="onLoadingChange"
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
							path: '/user/rolePermissionInfo/rolePermissionInfoDetail',
							query: { id: item.id },
						}"
					>
						<template #label>
							<div class="iconClass">
								<div
									class="icon"
									style="background-color: #ffcc00"
								>
									{{ item.roleId }}
								</div>
							</div>
						</template>
						<template #right-icon>
							<div class="text-right">
								<div style="display: flex">
									<div class="van-ellipsis">
										{{ item.permissionId }}
									</div>
								</div>
								<div class="rightDiv"> item.status+; </div>
							</div>
						</template>
					</van-cell>
					<template #right>
						<van-button
							class="right_info"
							@click="delRolePermissionInfo(item.id)"
							square
							type="danger"
							text="鍒犻櫎"
						/>
					</template>
					<van-divider class="dividerClass"></van-divider>
				</van-swipe-cell>
			</van-cell-group>
		</van-list>
	</common-pull-refresh>
	<van-back-top></van-back-top>
</template>
<script lang="ts" setup>
import { showSuccessToast, showFailToast } from 'vant';
import type { SearchInfo } from './rolePermissionInfoTs';
import { useNavBar } from '@/composables/useNavBar';
import { usePagination } from '@/composables/usePagination';
import { getRolePermissionInfoPage, deleteRolePermissionInfo } from '@/views/user/rolePermissionInfo/api';
import { getUserManagerList } from '@/views/user/userManager/api';
import type { PageInfo } from '@/views/common/config';

const router = useRouter();
const route = useRoute();
useNavBar({
	title: route?.meta?.title || '璐㈠姟绠＄悊11',
	rightIcon: 'plus',
	leftPath: '/',
	visible: true,
	onRightClick: () => {
		router.push({ path: '/user/rolePermissionInfo/rolePermissionInfoDetail' });
	},
});
const loading = ref<boolean>(false);
const dataSource = ref<Params[]>([]);
const searchInfo = ref<SearchInfo>({});

const finished = ref<boolean>(false); //鍔犺浇鏄惁宸茬粡娌℃湁鏇村鏁版嵁
const isRefresh = ref<boolean>(false); //鏄惁涓嬫媺鍒锋柊
const { pagination, resetPagination, setTotal, nextPage } = usePagination();

// const onSearch = () => {
//  pagination.value.current = 1;
//  dataSource.value = []
//  onRefresh();
// };
// const onCancel = () => {
//   searchInfo.value.typeCode = '';
//   pagination.value.current = 0;
//   dataSource.value = [];
//   getFinancePage(searchInfo.value, pagination.value);
// };

async function query(param: SearchInfo, cur: PageInfo) {
	loading.value = true;
	getRolePermissionInfoPage(param, cur?.current ? cur.current : 1, cur?.pageSize || 10)
		.then((res) => {
			if (res?.code == '200') {
				dataSource.value = [...dataSource.value, ...res.data.records];
				setTotal(res.data.total);
				nextPage();
				if ((pagination.total || 0) <= dataSource.value.length) {
					finished.value = true;
				}
			} else {
				showFailToast(res?.message || '查询列表失败，请联系管理员！');
			}
		})
		.finally(() => {
			isRefresh.value = false;
			loading.value = false;
		});
}

const userMap = {};
function getUserInfoList() {
	getUserManagerList({}).then((res) => {
		if (res?.code == '200') {
			if (res?.data) {
				res.data.forEach((user: { id: string | number; nickName: string }) => {
					userMap[user.id] = user.nickName;
				});
			}
		} else {
			showFailToast(res?.message || '查询列表失败，请联系管理员！');
		}
	});
}

const refresh = () => {
	resetPagination();
	dataSource.value = [];
	query(searchInfo.value, pagination);
};

const onRefresh = () => {
	query(searchInfo.value, pagination);
};

const onLoadingChange = (value: boolean) => {
	loading.value = value;
};

const beforeClose = (_e: unknown): void => {
	// console.log(e);
};

const delRolePermissionInfo = (id: string) => {
	deleteRolePermissionInfo(`${id}`).then((res) => {
		if (res?.code == '200') {
			refresh();
			showSuccessToast(res?.message || '删除成功！');
		} else {
			showFailToast(res?.message || '鍒犻櫎澶辫触锛岃鑱旂郴绠＄悊鍛橈紒');
		}
	});
};

function init() {
	dataSource.value = [];
	resetPagination();
	query(searchInfo.value, pagination);
	//鑾峰彇鐢ㄦ埛淇℃伅
	getUserInfoList();
}

void init();
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
	margin-top: 0;
	margin-bottom: 0;
}
</style>
