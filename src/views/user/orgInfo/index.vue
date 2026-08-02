<template>
	<div class="org-page">
		<section class="org-filter-panel">
			<van-search
				v-model="searchInfo.orgName"
				placeholder="搜索机构名称/编码"
				shape="round"
				@search="handleSearch"
			/>
			<div class="filter-row">
				<van-field
					v-model="searchInfo.orgCode"
					label="编码"
					placeholder="全部编码"
				/>
				<van-field
					v-model="searchInfo.status"
					label="状态"
					placeholder="全部状态"
				/>
			</div>
			<div class="action-row">
				<van-button
					data-testid="org-search-button"
					type="primary"
					size="small"
					@click="handleSearch"
				>
					查询
				</van-button>
				<van-button
					data-testid="org-reset-button"
					size="small"
					@click="handleReset"
				>
					重置
				</van-button>
				<van-button
					data-testid="org-add-button"
					type="primary"
					plain
					size="small"
					@click="handleAddOrg"
				>
					新增机构
				</van-button>
				<van-button
					data-testid="org-batch-enable-button"
					size="small"
					@click="handleBatchEnable"
				>
					批量启用
				</van-button>
				<van-button
					data-testid="org-batch-disable-button"
					type="danger"
					plain
					size="small"
					@click="handleBatchDisable"
				>
					批量禁用
				</van-button>
				<van-button
					data-testid="org-drag-sort-button"
					size="small"
					@click="handleDragSort"
				>
					层级排序
				</van-button>
				<van-button
					data-testid="org-expand-all-button"
					size="small"
					@click="handleToggleExpandAll"
				>
					{{ isAllExpanded ? '收起全部' : '展开全部' }}
				</van-button>
			</div>
		</section>

		<section class="org-summary-card">
			<div>
				<div class="summary-title">机构树</div>
				<div class="summary-path">{{ summaryText }}</div>
			</div>
			<van-tag type="primary">{{ dataSource.length }} 个节点</van-tag>
		</section>

		<section class="cache-hint">
			<div>
				<div class="summary-title">缓存状态</div>
				<div class="summary-path">建议后端按 org:tree:{tenantId} 缓存机构树，变更后主动失效。</div>
			</div>
			<van-tag :type="sortMode ? 'warning' : 'success'">
				{{ sortMode ? '排序中' : 'Redis Ready' }}
			</van-tag>
		</section>

		<common-pull-refresh
			v-model="isRefresh"
			class="org-refresh"
			@refresh="refresh"
		>
			<common-list
				v-model="loading"
				:loading="loading"
				:refreshing="isRefresh"
				:finished="finished"
				:is-empty="dataSource.length === 0"
				empty-text="暂无机构数据"
				@load="onLoad"
			>
				<template #skeleton>
					<div
						v-for="item in 3"
						:key="item"
						class="org-card skeleton-card"
					>
						<van-skeleton
							title
							:row="3"
						/>
					</div>
				</template>

				<div
					v-for="item in visibleOrgList"
					:key="item.id"
					class="org-card"
					:style="{ marginLeft: `${Math.min(item.level, 3) * 12}px` }"
				>
					<div class="org-main">
						<van-checkbox
							:data-testid="`org-row-select-${item.id}`"
							:model-value="selectedOrgIds.includes(item.id)"
							@update:model-value="toggleOrgSelection(item.id, $event)"
						/>
						<van-button
							:data-testid="`org-row-expand-${item.id}`"
							class="expand-button"
							size="mini"
							plain
							:disabled="item.children.length === 0"
							@click="toggleExpanded(item.id)"
						>
							{{ item.children.length === 0 ? '-' : expandedIds.includes(item.id) ? '收起' : '展开' }}
						</van-button>
						<div class="org-info">
							<div class="org-name">
								{{ item.orgName || '-' }}
								<van-tag
									:type="isEnabled(item.status) ? 'success' : 'danger'"
									class="status-tag"
								>
									{{ isEnabled(item.status) ? '启用' : '禁用' }}
								</van-tag>
							</div>
							<div class="org-meta">{{ item.orgCode || '-' }} · {{ item.parentOrgName || item.parentName || '顶级机构' }}</div>
							<div class="org-summary">{{ item.summary || '暂无简介' }}</div>
						</div>
					</div>
					<div class="org-actions">
						<van-button
							:data-testid="`org-row-add-child-${item.id}`"
							size="mini"
							type="primary"
							plain
							@click="handleAddChild(item)"
						>
							添加下级
						</van-button>
						<van-button
							:data-testid="`org-row-edit-${item.id}`"
							size="mini"
							@click="handleEditOrg(item)"
						>
							编辑
						</van-button>
						<van-button
							:data-testid="`org-row-delete-${item.id}`"
							size="mini"
							type="danger"
							plain
							@click="handleDeleteOrg(item)"
						>
							删除
						</van-button>
					</div>
				</div>
			</common-list>
		</common-pull-refresh>
	</div>
</template>

<script setup lang="ts">
import { showFailToast, showSuccessToast } from 'vant';
import type { SearchInfo } from './orgInfoTs';
import type { PageInfo } from '@/views/common/config';
import { useNavBar } from '@/composables/useNavBar';
import { usePagination } from '@/composables/usePagination';
import { deleteOrgInfo, getOrgInfoPage } from '@/views/user/orgInfo/api';
import type { OrgInfoData } from '@/views/user/orgInfo/config';

interface OrgTreeItem extends OrgInfoData {
	id: string;
	level: number;
	children: OrgTreeItem[];
}

const router = useRouter();
const route = useRoute();

useNavBar({
	title: (route?.meta?.title as string) || '机构管理',
	rightButton: '新增',
	leftPath: '/',
	visible: true,
	onRightClick: () => handleAddOrg(),
});

const loading = ref(false);
const finished = ref(false);
const isRefresh = ref(false);
const sortMode = ref(false);
const dataSource = ref<OrgInfoData[]>([]);
const selectedOrgIds = ref<string[]>([]);
const expandedIds = ref<string[]>([]);
const searchInfo = ref<SearchInfo>({});
const { pagination, resetPagination, setTotal, nextPage } = usePagination();

const treeList = computed(() => buildOrgTree(dataSource.value));
const allExpandableIds = computed(() => treeList.value.filter((item) => item.children.length > 0).map((item) => item.id));
const isAllExpanded = computed(() => allExpandableIds.value.length > 0 && allExpandableIds.value.every((id) => expandedIds.value.includes(id)));
const visibleOrgList = computed(() => {
	const result: OrgTreeItem[] = [];
	const walk = (items: OrgTreeItem[]) => {
		items.forEach((item) => {
			result.push(item);
			if (expandedIds.value.includes(item.id)) {
				walk(item.children);
			}
		});
	};
	walk(treeList.value.filter((item) => item.level === 0));
	return result;
});
const summaryText = computed(() => {
	if (selectedOrgIds.value.length > 0) return `已选择 ${selectedOrgIds.value.length} 个机构`;
	return `当前展示 ${visibleOrgList.value.length} / ${dataSource.value.length} 个机构节点`;
});

const triggerHaptic = () => {
	navigator.vibrate?.(50);
};

const isEnabled = (status: OrgInfoData['status']) => {
	return status === '0' || status === 0 || status === '1' || status === 1 || status === undefined;
};

const buildOrgTree = (records: OrgInfoData[]) => {
	const map = new Map<string, OrgTreeItem>();
	records.forEach((record) => {
		if (!record.id) return;
		map.set(String(record.id), {
			...record,
			id: String(record.id),
			level: 0,
			children: [],
		});
	});

	const roots: OrgTreeItem[] = [];
	map.forEach((item) => {
		const parentId = item.parentId ? String(item.parentId) : '';
		const parent = map.get(parentId);
		if (parent && parent.id !== item.id) {
			parent.children.push(item);
		} else {
			roots.push(item);
		}
	});

	const setLevel = (items: OrgTreeItem[], level: number) => {
		items.forEach((item) => {
			item.level = level;
			setLevel(item.children, level + 1);
		});
	};
	setLevel(roots, 0);

	return Array.from(map.values());
};

async function query(param: SearchInfo, cur: PageInfo) {
	loading.value = true;
	try {
		const { code, data, message } = await getOrgInfoPage(param, cur.current || 1, cur.pageSize || 10);
		if (code === '200') {
			const records = data?.records || [];
			dataSource.value = cur.current === 1 ? records : [...dataSource.value, ...records];
			setTotal(data?.total ?? 0);
			nextPage();
			finished.value = (pagination.total || 0) <= dataSource.value.length;
			if (expandedIds.value.length === 0) {
				expandedIds.value = allExpandableIds.value.slice(0, 1);
			}
		} else {
			showFailToast(message || '查询机构失败');
		}
	} finally {
		loading.value = false;
		isRefresh.value = false;
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
	selectedOrgIds.value = [];
	sortMode.value = false;
	await handleSearch();
};

const handleAddOrg = () => {
	triggerHaptic();
	router.push({ path: '/user/orgInfo/orgInfoDetail' });
};

const handleAddChild = (item: OrgTreeItem) => {
	triggerHaptic();
	router.push({
		path: '/user/orgInfo/orgInfoDetail',
		query: {
			parentId: item.id,
			parentName: item.orgName,
		},
	});
};

const handleEditOrg = (item: OrgTreeItem) => {
	triggerHaptic();
	router.push({ path: '/user/orgInfo/orgInfoDetail', query: { id: item.id } });
};

const handleDeleteOrg = async (item: OrgTreeItem) => {
	triggerHaptic();
	const { code, message } = await deleteOrgInfo(item.id);
	if (code === '200') {
		showSuccessToast(message || '删除成功');
		await refresh();
	} else {
		showFailToast(message || '删除失败');
	}
};

const handleBatchEnable = () => {
	triggerHaptic();
	showSuccessToast(`已选择 ${selectedOrgIds.value.length} 个机构，待接入批量启用接口`);
};

const handleBatchDisable = () => {
	triggerHaptic();
	showSuccessToast(`已选择 ${selectedOrgIds.value.length} 个机构，待接入批量禁用接口`);
};

const handleDragSort = () => {
	triggerHaptic();
	sortMode.value = !sortMode.value;
	showSuccessToast(sortMode.value ? '已进入层级排序模式' : '已退出层级排序模式');
};

const handleToggleExpandAll = () => {
	triggerHaptic();
	expandedIds.value = isAllExpanded.value ? [] : allExpandableIds.value;
};

const toggleExpanded = (id: string) => {
	triggerHaptic();
	if (expandedIds.value.includes(id)) {
		expandedIds.value = expandedIds.value.filter((item) => item !== id);
		return;
	}
	expandedIds.value = [...expandedIds.value, id];
};

const toggleOrgSelection = (id: string, checked: boolean) => {
	if (checked) {
		selectedOrgIds.value = Array.from(new Set([...selectedOrgIds.value, id]));
		return;
	}
	selectedOrgIds.value = selectedOrgIds.value.filter((item) => item !== id);
};

void refresh();
</script>

<style lang="less" scoped>
.org-page {
	min-height: 100%;
	background: #f6f8fb;
	padding: 12px;
	box-sizing: border-box;
}

.org-filter-panel,
.org-summary-card,
.cache-hint,
.org-card {
	background: #fff;
	border: 1px solid #e5e7eb;
	border-radius: 16px;
}

.org-filter-panel {
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

.org-summary-card,
.cache-hint {
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
.org-meta,
.org-summary {
	margin-top: 4px;
	color: #6b7280;
	font-size: 12px;
	line-height: 1.45;
}

.org-refresh {
	margin-top: 12px;
}

.org-card {
	padding: 12px;
	margin-bottom: 12px;
	transition:
		transform 0.16s ease,
		box-shadow 0.16s ease;
}

.org-card:active {
	transform: scale(0.98);
}

.skeleton-card {
	min-height: 100px;
}

.org-main {
	display: flex;
	gap: 8px;
	align-items: flex-start;
}

.expand-button {
	flex: 0 0 auto;
	min-width: 44px;
}

.org-info {
	min-width: 0;
	flex: 1;
}

.org-name {
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

.org-actions {
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

	.org-summary-card,
	.cache-hint {
		align-items: flex-start;
		flex-direction: column;
	}

	.org-actions {
		justify-content: flex-start;
	}
}
</style>
