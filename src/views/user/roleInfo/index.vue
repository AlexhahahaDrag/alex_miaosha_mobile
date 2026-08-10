<template>
	<common-pull-refresh
		:style="{ height: 'calc(100% - 44px)' }"
		v-model="isRefresh"
		@refresh="refresh"
		ref="pullRefresh"
	>
		<form
			action="/"
			data-testid="rbac-role-search"
		>
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
						data-testid="rbac-role-row"
						:title="item.id"
						:key="index"
						is-link
						:to="{
							path: '/user/roleInfo/roleInfoDetail',
							query: { id: item.id },
						}"
					>
						<template #label>
							<div class="iconClass">
								<div
									class="icon"
									style="background-color: #ffcc00"
								>
									{{ item.roleCode }}
								</div>
							</div>
						</template>
						<template #right-icon>
							<div class="text-right">
								<div style="display: flex">
									<div class="van-ellipsis">
										{{ item.roleName }}
									</div>
								</div>
								<div class="rightDiv">{{ item.status || '-' }}</div>
							</div>
						</template>
					</van-cell>
					<template #right>
						<van-button
							data-testid="rbac-role-row-delete"
							class="right_info"
							@click="delRoleInfo(item.id)"
							square
							type="danger"
							text="删除"
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
import type { SearchInfo } from './roleInfoTs';
import { useNavBar } from '@/composables/useNavBar';
import { usePagination } from '@/composables/usePagination';
import { getRoleInfoPage, deleteRoleInfo } from '@/views/user/roleInfo/api';
import { getUserManagerList } from '@/views/user/userManager/api';
import type { PageInfo } from '@/views/common/config/index';
import type { RoleInfoData } from '@/views/user/roleInfo/config';
import type { UserManagerData } from '@/views/user/userManager/config';

interface RoleInfoItem extends RoleInfoData {
	id?: string;
	roleCode?: string;
	roleName?: string;
	status?: string;
}

const router = useRouter();
const route = useRoute();
useNavBar({
	title: (route?.meta?.title as string) || '角色管理',
	rightIcon: 'plus',
	leftPath: '/',
	visible: true,
	onRightClick: () => {
		router.push({ path: '/user/roleInfo/roleInfoDetail' });
	},
});
const loading = ref<boolean>(false);
const dataSource = ref<RoleInfoItem[]>([]);
const searchInfo = ref<SearchInfo>({});

const finished = ref<boolean>(false); // 加载是否已全部完成
const isRefresh = ref<boolean>(false); // 是否下拉刷新
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
	try {
		const { code, data, message } = await getRoleInfoPage(
			param as RoleInfoData,
			cur?.current ? cur.current : 1,
			cur?.pageSize || 10,
		);
		if (code === '200') {
			const records = ((data?.records || []) as RoleInfoItem[]) ?? [];
			dataSource.value = [...dataSource.value, ...records];
			setTotal(data?.total ?? 0);
			nextPage();
			finished.value = (pagination.total || 0) <= dataSource.value.length;
		} else {
			showFailToast(message || '查询列表失败');
		}
	} finally {
		isRefresh.value = false;
		loading.value = false;
	}
}

const userMap: Record<string | number, string> = {};
async function getUserInfoList() {
	const { code, data, message } = await getUserManagerList({});
	if (code === '200') {
		(data || []).forEach((user: UserManagerData) => {
			if (user.id !== undefined) {
				userMap[user.id] = user.nickName || '';
			}
		});
	} else {
		showFailToast(message || '查询用户列表失败');
	}
}

const refresh = () => {
	resetPagination();
	dataSource.value = [];
	query(searchInfo.value, pagination);
};

const onRefresh = () => {
	query(searchInfo.value, pagination);
};

const beforeClose = (_e: unknown): void => {
	// console.log(e);
};

const delRoleInfo = (id: string | undefined) => {
	if (!id) {
		showFailToast('删除失败，缺少角色 ID');
		return;
	}
	deleteRoleInfo(`${id}`).then((res) => {
		if (res?.code == '200') {
			refresh();
			showSuccessToast(res?.message || '删除成功');
		} else {
			showFailToast(res?.message || '删除失败，请联系管理员！');
		}
	});
};

function init() {
	dataSource.value = [];
	resetPagination();
	query(searchInfo.value, pagination);
	// 获取用户信息
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
	margin-top: 0px;
	margin-bottom: 0px;
}
</style>
