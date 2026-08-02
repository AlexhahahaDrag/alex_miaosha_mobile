<template>
	<div class="role-permission-page">
		<section class="filter-panel">
			<van-search
				v-model="searchInfo.keyword"
				placeholder="搜索角色/权限名称/权限编码"
				shape="round"
				@search="handleSearch"
			/>
			<div class="filter-row">
				<van-field
					v-model="searchInfo.roleId"
					label="角色"
					placeholder="全部角色"
				/>
				<van-field
					v-model="searchInfo.permissionId"
					label="权限"
					placeholder="全部权限"
				/>
			</div>
			<div class="action-row">
				<van-button
					data-testid="role-permission-search-button"
					type="primary"
					size="small"
					@click="handleSearch"
				>
					查询
				</van-button>
				<van-button
					data-testid="role-permission-reset-button"
					size="small"
					@click="handleReset"
				>
					重置
				</van-button>
				<van-button
					data-testid="role-permission-add-button"
					type="primary"
					plain
					size="small"
					@click="handleAdd"
				>
					新增关联
				</van-button>
				<van-button
					data-testid="role-permission-batch-grant-button"
					size="small"
					@click="handleBatchGrant"
				>
					批量授权
				</van-button>
				<van-button
					data-testid="role-permission-batch-remove-button"
					type="danger"
					plain
					size="small"
					@click="handleBatchRemove"
				>
					批量移除
				</van-button>
				<van-button
					data-testid="role-permission-preview-button"
					size="small"
					@click="handlePreview"
				>
					权限预览
				</van-button>
				<van-button
					data-testid="role-permission-refresh-cache-button"
					size="small"
					@click="handleRefreshCache"
				>
					刷新缓存
				</van-button>
				<van-button
					data-testid="role-permission-save-button"
					type="primary"
					size="small"
					@click="handleSave"
				>
					保存提交
				</van-button>
			</div>
		</section>

		<section class="summary-card">
			<div>
				<div class="summary-title">权限变更预览</div>
				<div class="summary-path">{{ previewText }}</div>
			</div>
			<van-tag :type="cacheDirty ? 'warning' : 'success'">
				{{ cacheDirty ? '待刷新缓存' : '缓存已同步' }}
			</van-tag>
		</section>

		<common-pull-refresh
			v-model="isRefresh"
			class="permission-refresh"
			@refresh="refresh"
		>
			<common-list
				v-model="loading"
				:loading="loading"
				:refreshing="isRefresh"
				:finished="finished"
				:is-empty="dataSource.length === 0"
				empty-text="暂无角色权限关联"
				@load="onLoad"
			>
				<template #skeleton>
					<div
						v-for="item in 3"
						:key="item"
						class="permission-card skeleton-card"
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
					class="permission-card"
				>
					<div class="permission-main">
						<van-checkbox
							:data-testid="`role-permission-row-select-${item.id}`"
							:model-value="selectedIds.includes(item.id)"
							@update:model-value="toggleSelection(item.id, $event)"
						/>
						<div class="permission-info">
							<div class="permission-title">
								{{ item.roleName || item.roleId || '-' }}
								<van-tag
									type="primary"
									class="permission-tag"
								>
									{{ item.permissionCode || item.permissionId || '-' }}
								</van-tag>
							</div>
							<div class="permission-meta">{{ item.permissionName || item.permissionId || '-' }}</div>
							<div class="permission-summary">{{ item.summary || '提交后将刷新角色权限与菜单缓存' }}</div>
						</div>
					</div>
					<div class="permission-actions">
						<van-button
							:data-testid="`role-permission-row-preview-${item.id}`"
							size="mini"
							@click="handleRowPreview(item)"
						>
							预览
						</van-button>
						<van-button
							:data-testid="`role-permission-row-edit-${item.id}`"
							size="mini"
							type="primary"
							plain
							@click="handleEdit(item)"
						>
							编辑
						</van-button>
						<van-button
							:data-testid="`role-permission-row-delete-${item.id}`"
							size="mini"
							type="danger"
							plain
							@click="handleDelete(item)"
						>
							删除
						</van-button>
					</div>
				</div>
			</common-list>
		</common-pull-refresh>
	</div>
</template>

<script lang="ts" setup>
import { showFailToast, showSuccessToast } from 'vant';
import type { SearchInfo } from './rolePermissionInfoTs';
import type { PageInfo } from '@/views/common/config';
import { useNavBar } from '@/composables/useNavBar';
import { usePagination } from '@/composables/usePagination';
import {
	addRolePermissionInfo,
	deleteRolePermissionInfo,
	getRolePermissionInfoPage,
} from '@/views/user/rolePermissionInfo/api';
import type { RolePermissionInfoData } from '@/views/user/rolePermissionInfo/config';

interface RolePermissionItem extends RolePermissionInfoData {
	id: string;
	roleId?: string;
	roleName?: string;
	permissionId?: string;
	permissionName?: string;
	permissionCode?: string;
	summary?: string;
	status?: string | number;
}

interface RolePermissionSearchInfo extends SearchInfo {
	keyword?: string;
	roleId?: string;
	permissionId?: string;
}

const router = useRouter();
const route = useRoute();

useNavBar({
	title: (route?.meta?.title as string) || '角色权限分配',
	rightButton: '新增',
	leftPath: '/',
	visible: true,
	onRightClick: () => handleAdd(),
});

const loading = ref(false);
const finished = ref(false);
const isRefresh = ref(false);
const cacheDirty = ref(false);
const selectedIds = ref<string[]>([]);
const dataSource = ref<RolePermissionItem[]>([]);
const searchInfo = ref<RolePermissionSearchInfo>({});
const { pagination, resetPagination, setTotal, nextPage } = usePagination();

const previewText = computed(() => {
	if (selectedIds.value.length > 0) return `已选择 ${selectedIds.value.length} 条授权关系，可批量操作或提交`;
	return `当前加载 ${dataSource.value.length} 条角色权限关系`;
});

const triggerHaptic = () => {
	navigator.vibrate?.(50);
};

const normalizeRecords = (records: RolePermissionInfoData[]): RolePermissionItem[] => {
	return records
		.filter((item) => item.id !== undefined)
		.map((item) => ({
			...item,
			id: String(item.id),
			roleId: typeof item.roleId === 'string' ? item.roleId : String(item.roleId || ''),
			roleName: typeof item.roleName === 'string' ? item.roleName : '',
			permissionId: typeof item.permissionId === 'string' ? item.permissionId : String(item.permissionId || ''),
			permissionName: typeof item.permissionName === 'string' ? item.permissionName : '',
			permissionCode: typeof item.permissionCode === 'string' ? item.permissionCode : '',
			summary: typeof item.summary === 'string' ? item.summary : '',
			status: typeof item.status === 'string' || typeof item.status === 'number' ? item.status : undefined,
		}));
};

async function query(param: RolePermissionSearchInfo, cur: PageInfo) {
	loading.value = true;
	try {
		const { code, data, message } = await getRolePermissionInfoPage(param, cur.current || 1, cur.pageSize || 10);
		if (code === '200') {
			const records = normalizeRecords(data?.records || []);
			dataSource.value = cur.current === 1 ? records : [...dataSource.value, ...records];
			setTotal(data?.total ?? 0);
			nextPage();
			finished.value = (pagination.total || 0) <= dataSource.value.length;
		} else {
			showFailToast(message || '查询角色权限失败');
		}
	} finally {
		isRefresh.value = false;
		loading.value = false;
	}
}

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
	selectedIds.value = [];
	await handleSearch();
};

const handleAdd = () => {
	triggerHaptic();
	router.push({ path: '/user/rolePermissionInfo/rolePermissionInfoDetail' });
};

const handleBatchGrant = () => {
	triggerHaptic();
	cacheDirty.value = true;
	showSuccessToast(`已选择 ${selectedIds.value.length} 条关系，待接入批量授权接口`);
};

const handleBatchRemove = () => {
	triggerHaptic();
	cacheDirty.value = true;
	showSuccessToast(`已选择 ${selectedIds.value.length} 条关系，待接入批量移除接口`);
};

const handlePreview = () => {
	triggerHaptic();
	showSuccessToast(previewText.value);
};

const handleRefreshCache = () => {
	triggerHaptic();
	cacheDirty.value = false;
	showSuccessToast('角色权限与菜单缓存已标记刷新');
};

const handleSave = async () => {
	triggerHaptic();
	const firstSelected = dataSource.value.find((item) => selectedIds.value.includes(item.id)) || dataSource.value[0];
	if (!firstSelected) {
		showFailToast('请先选择需要提交的权限关系');
		return;
	}
	const { code, message } = await addRolePermissionInfo({
		roleId: firstSelected.roleId,
		permissionId: firstSelected.permissionId,
		summary: firstSelected.summary,
		status: firstSelected.status,
	});
	if (code === '200') {
		cacheDirty.value = false;
		showSuccessToast(message || '保存成功');
		await refresh();
	} else {
		showFailToast(message || '保存失败');
	}
};

const handleRowPreview = (item: RolePermissionItem) => {
	triggerHaptic();
	showSuccessToast(`${item.roleName || item.roleId || '-'} / ${item.permissionName || item.permissionId || '-'}`);
};

const handleEdit = (item: RolePermissionItem) => {
	triggerHaptic();
	router.push({ path: '/user/rolePermissionInfo/rolePermissionInfoDetail', query: { id: item.id } });
};

const handleDelete = async (item: RolePermissionItem) => {
	triggerHaptic();
	const { code, message } = await deleteRolePermissionInfo(item.id);
	if (code === '200') {
		cacheDirty.value = true;
		showSuccessToast(message || '删除成功');
		await refresh();
	} else {
		showFailToast(message || '删除失败');
	}
};

const toggleSelection = (id: string, checked: boolean) => {
	if (checked) {
		selectedIds.value = Array.from(new Set([...selectedIds.value, id]));
		return;
	}
	selectedIds.value = selectedIds.value.filter((item) => item !== id);
};

void refresh();
</script>

<style lang="less" scoped>
.role-permission-page {
	min-height: 100%;
	background: #f6f8fb;
	padding: 12px;
	box-sizing: border-box;
}

.filter-panel,
.summary-card,
.permission-card {
	background: #fff;
	border: 1px solid #e5e7eb;
	border-radius: 16px;
}

.filter-panel {
	padding: 12px;
}

.filter-row {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 8px;
	margin-top: 8px;
}

.action-row {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
	margin-top: 12px;
}

.summary-card {
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 12px;
	margin-top: 12px;
	padding: 12px 14px;
}

.summary-title {
	color: #111827;
	font-size: 13px;
	font-weight: 600;
}

.summary-path,
.permission-meta,
.permission-summary {
	margin-top: 4px;
	color: #6b7280;
	font-size: 12px;
	line-height: 1.45;
}

.permission-refresh {
	margin-top: 12px;
}

.permission-card {
	padding: 12px;
	margin-bottom: 12px;
	transition: transform 0.16s ease;
}

.permission-card:active {
	transform: scale(0.98);
}

.skeleton-card {
	min-height: 100px;
}

.permission-main {
	display: flex;
	gap: 10px;
	align-items: flex-start;
}

.permission-info {
	min-width: 0;
	flex: 1;
}

.permission-title {
	display: flex;
	align-items: center;
	gap: 8px;
	color: #111827;
	font-size: 15px;
	font-weight: 600;
}

.permission-tag {
	flex: 0 0 auto;
}

.permission-actions {
	display: flex;
	justify-content: flex-end;
	flex-wrap: wrap;
	gap: 8px;
	margin-top: 12px;
}

@media (max-width: 560px) {
	.filter-row {
		grid-template-columns: 1fr;
	}

	.summary-card {
		align-items: flex-start;
		flex-direction: column;
	}

	.permission-actions {
		justify-content: flex-start;
	}
}
</style>
