<template>
	<common-pull-refresh
		:style="{ height: 'calc(100% - 44px)' }"
		v-model="isRefresh"
		@refresh="refresh"
		ref="pullRefresh"
	>
		<van-cell-group
			inset
			data-testid="rbac-role-user-search"
		>
			<van-field
				v-model="roleFilterName"
				label="角色："
				placeholder="全部角色"
				@click="chooseFilter('role')"
				data-testid="rbac-role-user-search-role"
				clickable
				readonly
			/>
			<van-field
				v-model="userFilterName"
				label="用户："
				placeholder="全部用户"
				@click="chooseFilter('user')"
				data-testid="rbac-role-user-search-user"
				clickable
				readonly
			/>
		</van-cell-group>
		<div class="filter-actions">
			<van-button
				size="small"
				type="primary"
				data-testid="rbac-role-user-search-btn"
				@click="onSearch"
			>
				查询
			</van-button>
			<van-button
				size="small"
				data-testid="rbac-role-user-reset-btn"
				@click="onCancel"
			>
				清空
			</van-button>
		</div>
		<selectPop
			:info="filterPopInfo"
			@select-info="selectFilterInfo"
			@cancel-info="cancelFilterInfo"
		></selectPop>
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
			@load="onLoad"
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
							path: '/user/roleUserInfo/roleUserInfoDetail',
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
										{{ item.userId }}
									</div>
								</div>
								<div class="rightDiv">{{ item.status || '-' }}</div>
							</div>
						</template>
					</van-cell>
					<template #right>
						<van-button
							class="right_info"
							@click="delRoleUserInfo(item.id)"
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
import type { RoleUserInfoData as RoleUserInfoSearch } from './roleUserInfoTs';
import { useNavBar } from '@/composables/useNavBar';
import { usePagination } from '@/composables/usePagination';
import { getRoleUserInfoPage, deleteRoleUserInfo } from '@/views/user/roleUserInfo/api';
import { getUserManagerList } from '@/views/user/userManager/api';
import { getRoleInfoList } from '@/views/user/roleInfo/api';
import type { Info } from '@/views/common/pop/selectPop.vue';
import type { PageInfo } from '@/views/common/config/index';
import type { RoleUserInfoData } from '@/views/user/roleUserInfo/config';
import type { UserManagerData } from '@/views/user/userManager/config';

interface RoleUserInfoItem extends RoleUserInfoSearch {
	id?: number;
}

const router = useRouter();
const route = useRoute();
useNavBar({
	title: (route?.meta?.title as string) || '角色用户管理',
	rightButton: '新增',
	leftPath: '/',
	visible: true,
	onRightClick: () => {
		router.push({ path: '/user/roleUserInfo/roleUserInfoDetail' });
	},
});
const loading = ref<boolean>(false);
const dataSource = ref<RoleUserInfoItem[]>([]);
const searchInfo = ref<RoleUserInfoSearch>({});
const finished = ref<boolean>(false); // 加载是否已全部完成
const isRefresh = ref<boolean>(false); // 是否下拉刷新
const { pagination, resetPagination, setTotal, nextPage } = usePagination();
const userMap: Record<string | number, string> = {};

// 搜索绑定真实字段：roleId / userId（真实数据库字段），用角色名/用户名做人性化展示
const roleFilterName = ref<string>('');
const userFilterName = ref<string>('');
const filterPopInfo = ref<Info>({ showFlag: false });
const roleFilterInfo = ref<Info>({
	label: 'role',
	labelName: '角色',
	customFieldName: { text: 'roleName', value: 'id' },
});
const userFilterInfo = ref<Info>({
	label: 'user',
	labelName: '用户',
	customFieldName: { text: 'nickName', value: 'id' },
});

const chooseFilter = (type: string) => {
	filterPopInfo.value = type === 'role' ? roleFilterInfo.value : userFilterInfo.value;
	filterPopInfo.value.showFlag = true;
};

const selectFilterInfo = (type: string, value: string, name: string) => {
	filterPopInfo.value.showFlag = false;
	if (type === 'role') {
		searchInfo.value.roleId = value;
		roleFilterName.value = name;
	} else if (type === 'user') {
		searchInfo.value.userId = value;
		userFilterName.value = name;
	}
};

const cancelFilterInfo = () => {
	filterPopInfo.value.showFlag = false;
};

const query = async (param: RoleUserInfoSearch, cur: PageInfo) => {
	loading.value = true;
	try {
		const { code, data, message } = await getRoleUserInfoPage(
			param as RoleUserInfoData,
			cur?.current ? cur.current : 1,
			cur?.pageSize || 10,
		);
		if (code === '200') {
			const records = ((data?.records || []) as RoleUserInfoItem[]) ?? [];
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
};

async function getUserInfoList() {
	const { code, data, message } = await getUserManagerList({});
	if (code === '200') {
		(data || []).forEach((user: UserManagerData) => {
			if (user.id !== undefined) {
				userMap[user.id] = user.nickName || '';
			}
		});
		userFilterInfo.value.list = data || [];
	} else {
		showFailToast(message || '查询用户列表失败');
	}
}

async function getRoleOptionList() {
	const { code, data, message } = await getRoleInfoList();
	if (code === '200') {
		roleFilterInfo.value.list = data?.records || [];
	} else {
		showFailToast(message || '查询角色列表失败');
	}
}

const refresh = async () => {
	resetPagination();
	finished.value = false;
	dataSource.value = [];
	await query(searchInfo.value, pagination);
};

const onLoad = async () => {
	if (!finished.value) {
		await query(searchInfo.value, pagination);
	}
};

const onSearch = async () => {
	await refresh();
};

const onCancel = async () => {
	searchInfo.value.roleId = '';
	searchInfo.value.userId = '';
	roleFilterName.value = '';
	userFilterName.value = '';
	await refresh();
};

const beforeClose = (_e: unknown): void => {
	// console.log(e);
};

const delRoleUserInfo = async (id: number | undefined) => {
	if (id === undefined) {
		showFailToast('删除失败，缺少关联 ID');
		return;
	}
	const { code, message } = await deleteRoleUserInfo(String(id));
	if (code === '200') {
		await refresh();
		showSuccessToast(message || '删除成功');
	} else {
		showFailToast(message || '删除失败，请联系管理员！');
	}
};

const init = async () => {
	dataSource.value = [];
	resetPagination();
	await query(searchInfo.value, pagination);
	// 获取用户信息与角色信息（用于筛选 picker 展示）
	await Promise.all([getUserInfoList(), getRoleOptionList()]);
};

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

.filter-actions {
	display: flex;
	justify-content: flex-end;
	gap: 8px;
	padding: 8px 16px;
}
</style>
