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
			description="暂无数据"
		></van-empty>
		<van-list
			v-else
			:loading="loading"
			@update:loading="onLoadingChange"
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
							path: '/user/permissionInfo/permissionInfoDetail',
							query: { id: item.id },
						}"
					>
						<template #label>
							<div class="iconClass">
								<div
									class="icon"
									style="background-color: #ffcc00"
								>
									{{ item.permissionCode }}
								</div>
							</div>
						</template>
						<template #right-icon>
							<div class="text-right">
								<div style="display: flex">
									<div class="van-ellipsis">
										{{ item.permissionName }}
									</div>
								</div>
								<div class="rightDiv">{{ item.status }} {{ item.options }}</div>
							</div>
						</template>
					</van-cell>
					<template #right>
						<van-button
							class="right_info"
							@click="delPermissionInfo(item.id)"
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
import type { SearchInfo } from './permissionInfoTs';
import { useNavBar } from '@/composables/useNavBar';
import { usePagination } from '@/composables/usePagination';
import { getPermissionInfoPage, deletePermissionInfo } from '@/views/user/permissionInfo/api';
import { getUserManagerList } from '@/views/user/userManager/api';
import type { PageInfo } from '@/views/common/config';
import type { PermissionInfoData } from '@/views/user/permissionInfo/config';
import type { UserManagerData } from '@/views/user/userManager/config';

interface PermissionListItem extends PermissionInfoData {
	id?: string;
	permissionCode?: string;
	permissionName?: string;
	status?: string;
	options?: string;
}

const router = useRouter();
const route = useRoute();

useNavBar({
	title: (route?.meta?.title as string) || '权限管理',
	rightButton: '新增',
	leftPath: '/',
	visible: true,
	onRightClick: () => {
		router.push({ path: '/user/permissionInfo/permissionInfoDetail' });
	},
});
const loading = ref<boolean>(false);
const dataSource = ref<PermissionListItem[]>([]);
const searchInfo = ref<SearchInfo>({});
const finished = ref<boolean>(false); // 加载是否已全部完成
const isRefresh = ref<boolean>(false); // 是否下拉刷新
const { pagination, resetPagination, setTotal, nextPage } = usePagination();
const userMap: Record<string | number, string> = {};

async function query(_param: SearchInfo, cur: PageInfo) {
	loading.value = true;
	try {
		const { code, data, message } = await getPermissionInfoPage(
			undefined,
			cur?.current ? cur.current : 1,
			cur?.pageSize || 10,
		);
		if (code === '200') {
			const records = ((data?.records || []) as PermissionListItem[]) ?? [];
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

const onLoadingChange = (value: boolean) => {
	loading.value = value;
};

const beforeClose = (_e: unknown): void => {
	// console.log(e);
};

const delPermissionInfo = async (id: string | undefined) => {
	if (!id) {
		showFailToast('删除失败，缺少权限 ID');
		return;
	}
	const { code, message } = await deletePermissionInfo(id);
	if (code === '200') {
		await refresh();
		showSuccessToast(message || '删除成功');
	} else {
		showFailToast(message || '删除失败，请联系管理员！');
	}
};

async function init() {
	dataSource.value = [];
	resetPagination();
	await query(searchInfo.value, pagination);
	// 获取用户信息
	await getUserInfoList();
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
