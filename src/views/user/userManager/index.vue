<template>
	<div class="user-manager-page">
		<section class="user-filter-panel">
			<van-search
				v-model="searchInfo.keyword"
				placeholder="用户名/昵称/手机号"
				shape="round"
				@search="handleSearch"
			/>
			<div class="filter-row">
				<van-field
					v-model="searchInfo.orgName"
					label="机构"
					placeholder="全部机构"
				/>
				<van-field
					v-model="searchInfo.roleName"
					label="角色"
					placeholder="所有角色"
				/>
				<van-field
					v-model="searchInfo.userStatus"
					label="状态"
					placeholder="所有状态"
				/>
			</div>
			<div class="action-row">
				<van-button
					data-testid="user-search-button"
					type="primary"
					size="small"
					@click="handleSearch"
				>
					查询
				</van-button>
				<van-button
					data-testid="user-reset-button"
					size="small"
					@click="handleReset"
				>
					重置
				</van-button>
				<van-button
					data-testid="user-add-button"
					type="primary"
					plain
					size="small"
					@click="handleAddUser"
				>
					添加用户
				</van-button>
				<van-button
					data-testid="user-batch-enable-button"
					size="small"
					@click="handleBatchEnable"
				>
					批量启用
				</van-button>
				<van-button
					data-testid="user-batch-disable-button"
					size="small"
					type="danger"
					plain
					@click="handleBatchDisable"
				>
					批量禁用
				</van-button>
				<van-button
					data-testid="user-assign-role-button"
					size="small"
					@click="openRoleDrawer()"
				>
					分配角色
				</van-button>
			</div>
		</section>

		<section class="summary-card">
			<div>
				<div class="summary-title">技术部用户列表</div>
				<div class="summary-path">{{ selectedOrgPath }}</div>
			</div>
			<van-tag type="primary">{{ dataSource.length }} 人</van-tag>
		</section>

		<section class="permission-preview-card">
			<div>
				<div class="summary-title">权限变更预览</div>
				<div class="summary-path">分配角色后将刷新用户菜单、按钮权限与缓存。</div>
			</div>
			<van-tag type="success">Redis Ready</van-tag>
		</section>

		<common-pull-refresh
			v-model="isRefresh"
			class="user-refresh"
			@refresh="refresh"
		>
			<common-list
				v-model="loading"
				:loading="loading"
				:refreshing="isRefresh"
				:finished="finished"
				:is-empty="dataSource.length === 0"
				empty-text="暂无用户数据"
				@load="onLoad"
			>
				<template #skeleton>
					<div
						v-for="item in 3"
						:key="item"
						class="user-card skeleton-card"
					>
						<van-skeleton
							title
							:row="3"
						/>
					</div>
				</template>

				<div
					v-for="item in dataSource"
					:key="item.id"
					class="user-card"
				>
					<div class="user-main">
						<van-checkbox
							:data-testid="`row-select-user-${item.id}`"
							:model-value="selectedUserIds.includes(item.id)"
							@update:model-value="toggleUserSelection(item.id, $event)"
						/>
						<van-image
							:src="getAvatar(item)"
							class="avatar"
							round
							width="42"
							height="42"
						/>
						<div class="user-info">
							<div class="user-name">
								{{ item.username || item.nickName || '-' }}
								<van-tag
									:type="item.userStatus === '1' ? 'danger' : 'success'"
									class="status-tag"
								>
									{{ item.userStatus === '1' ? '禁用' : '启用' }}
								</van-tag>
							</div>
							<div class="user-meta">{{ item.nickName || '-' }} · {{ item.phone || '-' }}</div>
							<div class="user-path">{{ item.orgPath || item.orgName || '未分配机构' }}</div>
							<div class="user-time">最后登录：{{ item.lastLoginTime || '-' }}</div>
							<div class="user-time">更新时间：{{ item.updateTime || '-' }}</div>
							<div class="role-tags">
								<van-tag
									v-for="role in getRoleNames(item)"
									:key="role"
									plain
									type="primary"
								>
									{{ role }}
								</van-tag>
							</div>
						</div>
					</div>
					<div class="user-actions">
						<van-button
							:data-testid="`row-edit-user-${item.id}`"
							size="mini"
							@click="handleEditUser(item)"
						>
							编辑
						</van-button>
						<van-button
							:data-testid="`row-assign-role-${item.id}`"
							size="mini"
							type="primary"
							plain
							@click="openRoleDrawer(item)"
						>
							分配角色
						</van-button>
						<van-button
							:data-testid="`row-delete-user-${item.id}`"
							size="mini"
							type="danger"
							plain
							@click="handleDeleteUser(item)"
						>
							删除
						</van-button>
					</div>
				</div>
			</common-list>
		</common-pull-refresh>

		<van-popup
			v-model:show="roleDrawerVisible"
			position="right"
			:style="{ width: '84%', height: '100%' }"
		>
			<section class="role-drawer">
				<header class="drawer-header">
					<div>
						<div class="drawer-title">角色分配</div>
						<div class="drawer-subtitle">{{ activeUserLabel }}</div>
					</div>
					<van-button
						data-testid="role-drawer-cancel-button"
						size="small"
						@click="closeRoleDrawer"
					>
						取消
					</van-button>
				</header>
				<div class="role-preview">
					<div class="preview-title">已分配角色</div>
					<div class="role-tags">
						<van-tag
							v-for="role in activeRoleNames"
							:key="role"
							type="primary"
						>
							{{ role }}
						</van-tag>
						<span v-if="activeRoleNames.length === 0">暂无角色</span>
					</div>
				</div>
				<div class="role-preview">
					<div class="preview-title">可选角色列表</div>
					<div class="drawer-subtitle">支持搜索角色后进行批量分配，敏感角色需二次确认。</div>
				</div>
				<div class="permission-diff">
					<div class="preview-title">权限变更预览</div>
					<div class="diff-row success">新增权限：待选择角色后生成</div>
					<div class="diff-row warning">缓存提示：提交后刷新用户菜单与权限缓存</div>
				</div>
				<footer class="drawer-footer">
					<van-button
						data-testid="role-drawer-save-button"
						type="primary"
						block
						@click="saveRoleAssignment"
					>
						保存
					</van-button>
				</footer>
			</section>
		</van-popup>
	</div>
</template>

<script setup lang="ts">
import { showFailToast, showSuccessToast } from 'vant';
import type { PageInfo } from '@/views/common/config';
import { useNavBar } from '@/composables/useNavBar';
import { usePagination } from '@/composables/usePagination';
import { deleteUserManager, getUserManagerPage } from '@/views/user/userManager/api';
import type { UserManagerData } from '@/views/user/userManager/config';

interface UserManagerItem extends UserManagerData {
	id: number;
	username?: string;
	nickName?: string;
	phone?: string;
	orgName?: string;
	orgPath?: string;
	roleNames?: string[];
	roleName?: string;
	userStatus?: string;
	lastLoginTime?: string;
	updateTime?: string;
}

interface UserSearchInfo extends UserManagerData {
	keyword?: string;
	orgName?: string;
	roleName?: string;
	userStatus?: string;
}

useNavBar({
	title: '用户管理',
	rightButton: '添加',
	leftPath: '/',
	visible: true,
	onRightClick: () => handleAddUser(),
});

const loading = ref(false);
const finished = ref(false);
const isRefresh = ref(false);
const roleDrawerVisible = ref(false);
const selectedUserIds = ref<number[]>([]);
const dataSource = ref<UserManagerItem[]>([]);
const activeUser = ref<UserManagerItem | null>(null);
const searchInfo = ref<UserSearchInfo>({});
const selectedOrgPath = ref('集团总部 / 全部机构');
const { pagination, resetPagination, setTotal, nextPage } = usePagination();

const activeUserLabel = computed(() => {
	if (!activeUser.value) return '请选择用户后进行角色分配';
	return `${activeUser.value.nickName || activeUser.value.username || '-'} · ${activeUser.value.orgPath || activeUser.value.orgName || '未分配机构'}`;
});

const activeRoleNames = computed(() => (activeUser.value ? getRoleNames(activeUser.value) : []));

const getAvatar = (item: UserManagerItem) => {
	return item.avatarThumbnailUrl || item.avatarUrl || item.avatar || '';
};

const getRoleNames = (item: UserManagerItem) => {
	if (Array.isArray(item.roleNames)) return item.roleNames;
	if (item.roleName) return [item.roleName];
	return [];
};

const normalizeRecords = (records: UserManagerData[]): UserManagerItem[] => {
	return records
		.filter((item): item is UserManagerItem => item.id !== undefined)
		.map((item) => ({
			...item,
			id: Number(item.id),
			username: typeof item.username === 'string' ? item.username : '',
			nickName: typeof item.nickName === 'string' ? item.nickName : '',
			phone: typeof item.phone === 'string' ? item.phone : '',
			orgName: typeof item.orgName === 'string' ? item.orgName : '',
			orgPath: typeof item.orgPath === 'string' ? item.orgPath : '',
			roleName: typeof item.roleName === 'string' ? item.roleName : '',
			roleNames: Array.isArray(item.roleNames) ? (item.roleNames as string[]) : undefined,
			userStatus: typeof item.userStatus === 'string' ? item.userStatus : '0',
			lastLoginTime: typeof item.lastLoginTime === 'string' ? item.lastLoginTime : '',
			updateTime: typeof item.updateTime === 'string' ? item.updateTime : '',
		}));
};

async function query(param: UserSearchInfo, cur: PageInfo) {
	loading.value = true;
	try {
		const { code, data, message } = await getUserManagerPage(param, cur.current || 1, cur.pageSize || 10);
		if (code === '200') {
			const records = normalizeRecords(data?.records || []);
			dataSource.value = cur.current === 1 ? records : [...dataSource.value, ...records];
			setTotal(data?.total ?? 0);
			nextPage();
			finished.value = (pagination.total || 0) <= dataSource.value.length;
		} else {
			showFailToast(message || '查询用户失败');
		}
	} finally {
		loading.value = false;
		isRefresh.value = false;
	}
}

const triggerHaptic = () => {
	navigator.vibrate?.(50);
};

const handleSearch = async () => {
	triggerHaptic();
	resetPagination();
	finished.value = false;
	dataSource.value = [];
	await query(searchInfo.value, pagination);
};

const handleReset = async () => {
	triggerHaptic();
	searchInfo.value = {};
	selectedOrgPath.value = '集团总部 / 全部机构';
	await handleSearch();
};

const handleAddUser = () => {
	triggerHaptic();
	showSuccessToast('添加用户功能待接入详情页');
};

const handleBatchEnable = () => {
	triggerHaptic();
	showSuccessToast(`已选择 ${selectedUserIds.value.length} 个用户，待接入批量启用接口`);
};

const handleBatchDisable = () => {
	triggerHaptic();
	showSuccessToast(`已选择 ${selectedUserIds.value.length} 个用户，待接入批量禁用接口`);
};

const handleEditUser = (item: UserManagerItem) => {
	triggerHaptic();
	showSuccessToast(`编辑用户：${item.nickName || item.username || item.id}`);
};

const handleDeleteUser = async (item: UserManagerItem) => {
	triggerHaptic();
	const { code, message } = await deleteUserManager(String(item.id));
	if (code === '200') {
		showSuccessToast(message || '删除成功');
		await refresh();
	} else {
		showFailToast(message || '删除失败');
	}
};

const openRoleDrawer = (item?: UserManagerItem) => {
	triggerHaptic();
	activeUser.value = item || dataSource.value.find((user) => selectedUserIds.value.includes(user.id)) || null;
	roleDrawerVisible.value = true;
};

const closeRoleDrawer = () => {
	roleDrawerVisible.value = false;
};

const saveRoleAssignment = () => {
	triggerHaptic();
	showSuccessToast('角色分配已保存');
	closeRoleDrawer();
};

const toggleUserSelection = (id: number, checked: boolean) => {
	if (checked) {
		selectedUserIds.value = Array.from(new Set([...selectedUserIds.value, id]));
		return;
	}
	selectedUserIds.value = selectedUserIds.value.filter((item) => item !== id);
};

const refresh = async () => {
	resetPagination();
	finished.value = false;
	dataSource.value = [];
	await query(searchInfo.value, pagination);
};

const onLoad = async () => {
	if (!finished.value && !loading.value) {
		await query(searchInfo.value, pagination);
	}
};

void refresh();
</script>

<style lang="less" scoped>
.user-manager-page {
	min-height: 100%;
	background: #f6f8fb;
	padding: 12px;
	box-sizing: border-box;
}

.user-filter-panel,
.summary-card,
.permission-preview-card,
.user-card,
.role-drawer {
	background: #fff;
	border: 1px solid #e5e7eb;
	border-radius: 16px;
}

.user-filter-panel {
	padding: 12px;
}

.filter-row {
	display: grid;
	grid-template-columns: repeat(3, minmax(0, 1fr));
	gap: 8px;
	margin-top: 8px;
}

.action-row {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
	margin-top: 12px;
}

.summary-card,
.permission-preview-card {
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 12px;
	margin-top: 12px;
	padding: 12px 14px;
}

.summary-title,
.preview-title {
	color: #111827;
	font-size: 13px;
	font-weight: 600;
}

.summary-path,
.drawer-subtitle,
.user-meta,
.user-path,
.user-time {
	margin-top: 4px;
	color: #6b7280;
	font-size: 12px;
	line-height: 1.45;
}

.user-refresh {
	margin-top: 12px;
}

.user-card {
	padding: 12px;
	margin-bottom: 12px;
	transition: transform 0.16s ease;
}

.user-card:active {
	transform: scale(0.98);
}

.skeleton-card {
	min-height: 110px;
}

.user-main {
	display: flex;
	gap: 10px;
	align-items: flex-start;
}

.avatar {
	flex: 0 0 auto;
	background: #eef2ff;
}

.user-info {
	min-width: 0;
	flex: 1;
}

.user-name {
	display: flex;
	align-items: center;
	gap: 8px;
	color: #111827;
	font-size: 15px;
	font-weight: 600;
}

.status-tag {
	flex: 0 0 auto;
}

.role-tags {
	display: flex;
	flex-wrap: wrap;
	gap: 6px;
	margin-top: 8px;
}

.user-actions {
	display: flex;
	justify-content: flex-end;
	flex-wrap: wrap;
	gap: 8px;
	margin-top: 12px;
}

.role-drawer {
	min-height: 100%;
	padding: 16px;
	box-sizing: border-box;
	border-radius: 0;
}

.drawer-header {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	gap: 12px;
}

.drawer-title {
	color: #111827;
	font-size: 18px;
	font-weight: 700;
}

.role-preview,
.permission-diff {
	margin-top: 16px;
	padding: 12px;
	border-radius: 12px;
	background: #f9fafb;
}

.diff-row {
	margin-top: 8px;
	font-size: 13px;
}

.success {
	color: #16a34a;
}

.warning {
	color: #d97706;
}

.drawer-footer {
	position: sticky;
	bottom: 0;
	margin-top: 20px;
	padding-top: 12px;
	background: #fff;
}

@media (max-width: 560px) {
	.filter-row {
		grid-template-columns: 1fr;
	}

	.summary-card,
	.permission-preview-card {
		align-items: flex-start;
		flex-direction: column;
	}

	.user-actions {
		justify-content: flex-start;
	}
}
</style>
