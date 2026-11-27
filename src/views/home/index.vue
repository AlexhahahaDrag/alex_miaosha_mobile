<template>
	<div class="home-container">
		<!-- Section 1: 角色动态态势卡片 (Role-Aware Dashboard Card) -->
		<section
			class="role-dashboard-section"
			data-testid="dash-mobile-role-card"
		>
			<h1 class="van-sr-only">管理中心首页</h1>
			<div class="role-card-wrapper">
				<div class="role-card-header">
					<div class="user-info-box">
						<span class="user-greeting">{{ timeGreeting }}，{{ displayName }}</span>
						<div class="tags-row">
							<span
								class="role-badge"
								:class="roleClass"
							>{{ roleTagText }}</span>
							<span
								v-if="orgName"
								class="org-chip"
							>{{ orgName }}</span>
						</div>
					</div>
					<div class="date-badge">
						<span class="date-text">{{ todayText }}</span>
					</div>
				</div>

				<!-- 核心指标大盘 (动态聚合 + 骨架屏防闪烁) -->
				<div
					v-if="kpiLoading"
					class="role-kpi-grid"
					data-testid="home-kpi-skeleton"
				>
					<div
						v-if="isUserRole"
						class="kpi-box main"
					>
						<div class="shimmer-bar sk-w-64 sk-h-12"></div>
						<div class="shimmer-bar sk-w-120 sk-h-22 sk-my-6"></div>
						<div class="shimmer-bar sk-w-88 sk-h-10"></div>
					</div>
					<div
						v-for="idx in isUserRole ? 3 : 2"
						:key="`home-kpi-sk-${idx}`"
						class="kpi-box"
					>
						<div class="shimmer-bar sk-w-64 sk-h-12"></div>
						<div class="shimmer-bar sk-w-80 sk-h-20 sk-my-6"></div>
						<div class="shimmer-bar sk-w-72 sk-h-10"></div>
					</div>
				</div>

				<div
					v-else
					class="role-kpi-grid"
				>
					<!-- 普通/家庭用户视角：礼金净结余 + 收礼 + 随礼 + 待办提醒 -->
					<template v-if="isUserRole">
						<div
							class="kpi-box main"
							data-testid="dash-mobile-kpi-balance"
						>
							<div class="kpi-label">礼金净结余</div>
							<div
								class="kpi-val"
								:class="{ positive: giftOverview.netAmount >= 0, negative: giftOverview.netAmount < 0 }"
							>
								<span class="currency">¥</span>
								<span class="num">{{ (giftOverview.netAmount || 0).toLocaleString() }}</span>
							</div>
							<div class="kpi-sub">共 {{ giftOverview.recordCount || 0 }} 笔流水</div>
						</div>
						<div class="kpi-box">
							<div class="kpi-label">累计收礼</div>
							<div class="kpi-val receive">
								<span class="currency">¥</span>
								<span class="num">{{ (giftOverview.receiveAmount || 0).toLocaleString() }}</span>
							</div>
							<div class="kpi-sub">收礼总额</div>
						</div>
						<div class="kpi-box">
							<div class="kpi-label">随礼支出</div>
							<div class="kpi-val expense">
								<span class="currency">¥</span>
								<span class="num">{{
									((giftOverview.giveAmount || 0) + (giftOverview.returnAmount || 0)).toLocaleString()
								}}</span>
							</div>
							<div class="kpi-sub">随礼与回礼</div>
						</div>
						<div
							class="kpi-box click-box"
							data-testid="dash-mobile-kpi-remind"
							role="button"
							tabindex="0"
							@click="handleRemindClick"
							@keydown.enter="handleRemindClick"
						>
							<div class="kpi-label">到期与备忘</div>
							<div class="kpi-val remind">
								<span class="num">{{ unreadSummaryCount }}</span>
								<span class="unit">条待办</span>
							</div>
							<div class="kpi-sub">查看消息 ›</div>
						</div>
					</template>

					<!-- 管理员视角：待办通知 + 服务状态（顶部已展示机构徽章，不再重复渲染整行机构卡片） -->
					<template v-else>
						<div
							class="kpi-box click-box"
							data-testid="dash-mobile-kpi-remind"
							role="button"
							tabindex="0"
							@click="handleRemindClick"
							@keydown.enter="handleRemindClick"
						>
							<div class="kpi-label">待办到期通知</div>
							<div class="kpi-val remind">
								<span class="num">{{ unreadSummaryCount }}</span>
								<span class="unit">条未读</span>
							</div>
							<div class="kpi-sub">查看消息 ›</div>
						</div>
						<div
							class="kpi-box"
							data-testid="dash-mobile-kpi-services"
						>
							<div class="kpi-label">集群微服务</div>
							<div
								class="kpi-val"
								:class="onlineServiceCount === totalServiceCount ? 'receive' : 'expense'"
							>
								<span
									class="kpi-status-dot"
									:class="onlineServiceCount === totalServiceCount ? 'is-online' : 'is-warning'"
									aria-hidden="true"
								></span>
								<span class="num">{{ onlineServiceCount }}</span>
								<span class="unit">/ {{ totalServiceCount }} 在线</span>
							</div>
							<div class="kpi-sub">{{ serviceHealthSub }}</div>
						</div>
					</template>
				</div>

				<!-- 快捷行动条：AI 记账 + 随礼记一笔 -->
				<div class="action-capsules-row">
					<button
						type="button"
						class="capsule-btn ai-btn"
						data-testid="dash-mobile-btn-ai-ledger"
						@click="handleAiLedgerClick"
					>
						<van-icon
							name="edit"
							class="btn-vant-icon"
						/>
						<span class="text">AI 记账</span>
					</button>
					<button
						type="button"
						class="capsule-btn ghost-btn"
						data-testid="dash-mobile-btn-add-gift"
						@click="handleAddGiftClick"
					>
						<svg-icon
							class="btn-svg-icon"
							name="gift"
							color="#4f6af6"
						/>
						<span class="text">随礼记一笔</span>
					</button>
				</div>

				<!-- 模块保存动态 (集成于卡片底部，保持层级内敛统一) -->
				<div
					v-if="visibleStats.length > 0"
					class="sub-stats-scroller"
				>
					<div class="sub-stats-title">近期保存</div>
					<div class="sub-stats-chips">
						<span
							v-for="stat in visibleStats"
							:key="stat.label"
							class="mini-chip"
						>
							{{ stat.label }}: {{ stat.value }}
						</span>
					</div>
				</div>
			</div>
		</section>

		<!-- Section 2 & 3: 功能菜单骨架屏（动态路由/菜单加载期间展示） -->
		<template v-if="menuLoading">
			<section
				class="search-section"
				data-testid="home-menu-skeleton"
			>
				<div class="search-skeleton-bar shimmer-bar"></div>
			</section>
			<section class="menu-groups-container">
				<div
					v-for="groupIdx in 2"
					:key="`home-menu-sk-${groupIdx}`"
					class="group-card"
				>
					<div class="group-header">
						<div class="group-title-box">
							<div class="shimmer-bar sk-w-4 sk-h-14 sk-rounded-pill"></div>
							<div class="shimmer-bar sk-w-72 sk-h-14"></div>
						</div>
						<div class="shimmer-bar sk-w-40 sk-h-18 sk-rounded-pill"></div>
					</div>
					<div class="group-grid">
						<div
							v-for="itemIdx in 4"
							:key="`home-menu-sk-item-${groupIdx}-${itemIdx}`"
							class="menu-item-card"
						>
							<div class="shimmer-bar sk-w-44 sk-h-44 sk-rounded-14"></div>
							<div class="shimmer-bar sk-w-48 sk-h-12 sk-mt-2"></div>
						</div>
					</div>
				</div>
			</section>
		</template>

		<!-- Section 2: 全局功能搜索栏 -->
		<template v-else>
			<section
				v-if="totalItemCount > 6"
				class="search-section"
			>
				<van-search
					v-model="searchKeyword"
					placeholder="搜索模块或功能（如：随礼、流水）"
					shape="round"
					clearable
					class="menu-search-bar"
				/>
			</section>

			<!-- Section 3: 分组业务功能卡片流 (解耦一级与二级) -->
			<section
				v-if="filteredMenuGroups.length > 0"
				class="menu-groups-container"
			>
				<div
					v-for="group in filteredMenuGroups"
					:key="group.id"
					class="group-card"
				>
					<div class="group-header">
						<div class="group-title-box">
							<span
								class="group-color-tag"
								:style="{ backgroundColor: group.themeColor }"
							></span>
							<h2 class="group-title">{{ group.title }}</h2>
						</div>
						<span class="group-count">{{ group.items.length }} 项</span>
					</div>

					<div class="group-grid">
						<div
							v-for="item in group.items"
							:key="item.path"
							class="menu-item-card"
							:data-testid="'menu-item-' + (item.name || item.title)"
							role="button"
							tabindex="0"
							@click="handleGridItemClick(item)"
							@keydown.enter="handleGridItemClick(item)"
						>
							<div
								class="icon-wrapper"
								:style="{ backgroundColor: item.bgColor }"
							>
								<svg-icon
									class="homeSvgClass"
									:name="item.icon"
									:color="item.color"
								/>
							</div>
							<span class="homeFontClass">{{ formatMenuTitle(item.title) }}</span>
						</div>
					</div>
				</div>
			</section>

			<!-- 搜索无结果时的空状态 -->
			<div
				v-else-if="searchKeyword"
				class="search-empty-box"
			>
				<van-empty
					image="search"
					description="未找到相关功能或模块"
				>
					<template #bottom>
						<button
							type="button"
							class="clear-search-btn"
							@click="searchKeyword = ''"
						>
							清空搜索条件
						</button>
					</template>
				</van-empty>
			</div>
		</template>
		<!-- AI 智能记账 ActionSheet 抽屉 -->
		<finance-ai-sheet
			v-model:show="showAiSheet"
			@success="handleAiRecordSuccess"
		/>
	</div>
</template>

<script setup lang="ts">
import type { RouteRecordRaw } from 'vue-router';
import { useNavBar } from '@/composables/useNavBar';
import { useTabBar } from '@/composables/useTabBar';
import { useDashboardStore } from '@/store/modules/dashboard/dashboard';
import { useTabBarStore } from '@/store/modules/tabbar';
import { useUserStore } from '@/store/modules/user/user';
import { routes, routesVersion } from '@/router';
import type { MenuInfoData } from '@/views/user/menuInfo/config';
import { formatDate } from '@/utils/dayjs';
import { getSysMessageSummary } from '@/views/message/api';
import { getGiftAnalysisOverview } from '@/views/finance/gift/analysis/api';
import { getMicroServicesHealth } from '@/views/home/api';
import { triggerHaptic } from '@/utils/haptics';
import FinanceAiSheet from '@/views/selfFinance/financeManager/components/FinanceAiSheet.vue';

const router = useRouter();
const dashboardStore = useDashboardStore();
const searchKeyword = ref('');

interface MenuItem {
	name?: string;
	title: string;
	path: string;
	icon: string;
	color: string;
	bgColor: string;
}

interface MenuGroup {
	id: string;
	title: string;
	themeColor: string;
	items: MenuItem[];
}

const menuGroups = ref<MenuGroup[]>([]);

/**
 * 图标与色彩映射系统
 */
const iconConfigMap: Record<string, { icon: string; color: string; bgColor: string }> = {
	// 用户与权限
	用户信息: { icon: 'user', color: '#4f6af6', bgColor: '#eef2ff' },
	用户管理: { icon: 'user', color: '#4f6af6', bgColor: '#eef2ff' },
	机构管理: { icon: 'orgManager', color: '#8b5cf6', bgColor: '#f5f3ff' },
	菜单管理: { icon: 'palette', color: '#ec4899', bgColor: '#fdf2f8' },
	权限信息: { icon: 'shield-check', color: '#10b981', bgColor: '#ecfdf5' },
	角色管理: { icon: 'userManager', color: '#f59e0b', bgColor: '#fffbeb' },
	用户: { icon: 'user', color: '#06b6d4', bgColor: '#ecfeff' },
	角色用户: { icon: 'userManager', color: '#4f6af6', bgColor: '#eef2ff' },
	角色权限: { icon: 'shield-check', color: '#8b5cf6', bgColor: '#f5f3ff' },
	字典信息: { icon: 'dict', color: '#64748b', bgColor: '#f1f5f9' },

	// 店铺与个人财务
	店财务管理: { icon: 'shopFinance', color: '#4f6af6', bgColor: '#eef2ff' },
	店财务分析: { icon: 'shopFinanceAnalysis', color: '#8b5cf6', bgColor: '#f5f3ff' },
	店库存分析: { icon: 'financeAnalysis', color: '#ec4899', bgColor: '#fdf2f8' },
	店铺库存: { icon: 'shopStock', color: '#10b981', bgColor: '#ecfdf5' },
	店铺商品: { icon: 'shopProduct', color: '#f59e0b', bgColor: '#fffbeb' },
	销售单管理: { icon: 'orderManager', color: '#06b6d4', bgColor: '#ecfeff' },
	商品库存批次: { icon: 'shopStockBatch', color: '#64748b', bgColor: '#f1f5f9' },
	财务信息: { icon: 'finance', color: '#8b5cf6', bgColor: '#f5f3ff' },
	账单流水: { icon: 'financeManager', color: '#4f6af6', bgColor: '#eef2ff' },
	零花钱预算管理: { icon: 'cash', color: '#8b5cf6', bgColor: '#f5f3ff' },
	财务分析: { icon: 'financeAnalysis', color: '#10b981', bgColor: '#ecfdf5' },
	收支分析: { icon: 'financeAnalysis', color: '#10b981', bgColor: '#ecfdf5' },
	账户流水信息: { icon: 'accountRecordInfo', color: '#4f6af6', bgColor: '#eef2ff' },

	// 消费卡与消费券
	消费卡交易记录: { icon: 'card-transaction', color: '#10b981', bgColor: '#ecfdf5' },
	消费卡信息: { icon: 'card-info', color: '#4f6af6', bgColor: '#eef2ff' },
	消费券核销记录表: { icon: 'coupon-check', color: '#4f6af6', bgColor: '#eef2ff' },
	消费券信息表: { icon: 'coupon', color: '#10b981', bgColor: '#ecfdf5' },
	用户消费券库存表: { icon: 'coupon', color: '#f59e0b', bgColor: '#fffbeb' },

	// 商品与礼金
	商品属性: { icon: 'attribute', color: '#8b5cf6', bgColor: '#f5f3ff' },
	个人随礼信息: { icon: 'gift', color: '#f59e0b', bgColor: '#fffbeb' },
	随礼记录: { icon: 'gift', color: '#f59e0b', bgColor: '#fffbeb' },
	礼金记录: { icon: 'gift', color: '#f59e0b', bgColor: '#fffbeb' },
	数据概览: { icon: 'shopFinanceAnalysis', color: '#4f6af6', bgColor: '#eef2ff' },
	统计报表: { icon: 'financeAnalysis', color: '#ec4899', bgColor: '#fdf2f8' },
	事由管理: { icon: 'order', color: '#4f6af6', bgColor: '#eef2ff' },
	亲友管理: { icon: 'user', color: '#10b981', bgColor: '#ecfdf5' },
};

// 预设柔和调色板，为未显式配置颜色的菜单提供优雅视觉
const PALETTE = [
	{ color: '#4f6af6', bgColor: '#eef2ff' },
	{ color: '#8b5cf6', bgColor: '#f5f3ff' },
	{ color: '#10b981', bgColor: '#ecfdf5' },
	{ color: '#f59e0b', bgColor: '#fffbeb' },
	{ color: '#ec4899', bgColor: '#fdf2f8' },
	{ color: '#06b6d4', bgColor: '#ecfeff' },
	{ color: '#64748b', bgColor: '#f1f5f9' },
];

const getIconConfig = (title: string, defaultIcon?: string, index = 0) => {
	const config = iconConfigMap[title];
	if (config) {
		return {
			name: config.icon,
			color: config.color,
			bgColor: config.bgColor,
		};
	}
	const fallback = PALETTE[index % PALETTE.length];
	return {
		name: defaultIcon || 'attribute',
		color: fallback.color,
		bgColor: fallback.bgColor,
	};
};

// 移动端网格短标题映射：去除冗余的数据库“表”尾缀与重复词，避免 4 列网格出现孤字换行 (unslop Rule 16/23)
const MENU_SHORT_TITLE_MAP: Record<string, string> = {
	消费券核销记录表: '核销记录',
	消费券信息表: '消费券信息',
	用户消费券库存表: '用户券库存',
	零花钱预算管理: '零花钱预算',
	账户流水信息: '账户流水',
};

const formatMenuTitle = (rawTitle: string): string => {
	if (!rawTitle) {
		return '';
	}
	if (MENU_SHORT_TITLE_MAP[rawTitle]) {
		return MENU_SHORT_TITLE_MAP[rawTitle];
	}
	return rawTitle
		.replace(/记录表$/, '记录')
		.replace(/信息表$/, '信息')
		.replace(/库存表$/, '库存');
};

// 分组主色调映射
const GROUP_THEME_COLORS: Record<string, string> = {
	用户权限: '#0058be',
	用户管理: '#0058be',
	店财务管理: '#8b5cf6',
	财务信息: '#8b5cf6',
	财务管理: '#8b5cf6',
	猫超管理: '#ec4899',
	商品管理: '#10b981',
	礼尚往来: '#f59e0b',
	常用功能: '#06b6d4',
};

const getGroupThemeColor = (groupTitle: string, index: number): string => {
	return GROUP_THEME_COLORS[groupTitle] || PALETTE[index % PALETTE.length].color;
};

// 今日日期文本
const todayText = computed(() => {
	return formatDate(new Date(), 'YYYY年MM月DD日');
});

// 模块配置：定义需要追踪保存时间的模块及其颜色
const TRACKED_MODULES = [
	{ title: '财务信息', color: '#0058be', key: '财务信息' },
	{ title: '猫超管理', color: '#8b5cf6', key: '猫超管理' },
	{ title: '库存记录', color: '#10b981', key: '库存记录' },
	{ title: '消费卡', color: '#ec4899', key: '消费卡' },
	{ title: '消费券', color: '#2563eb', key: '消费券' },
	{ title: '个人随礼', color: '#f59e0b', key: '个人随礼' },
];

// 动态计算统计数据：从 Pinia Store 中读取各模块最后保存时间
const visibleStats = computed(() => {
	return TRACKED_MODULES.map((module) => {
		const savedTime = dashboardStore.lastSaveTimes[module.key];
		return {
			label: `${module.title}最新保存`,
			value: savedTime || '',
			color: module.color,
			show: !!savedTime,
		};
	}).filter((stat) => stat.show);
});

// 导航栏与底部 TabBar 配置
useNavBar({
	title: '管理中心',
	noShowLeft: true,
	showRight: false,
	visible: true,
});

useTabBar({
	visible: true,
	data: [
		{ name: 'dashboard', title: '首页', icon: 'homepage' },
		{ name: 'message', title: '消息', icon: 'message' },
		{ name: 'myself', title: '我的', icon: 'user' },
	],
	active: 0,
});

const tabBarStore = useTabBarStore();
const userStore = useUserStore();

const isSuperAdmin = computed(() => {
	return Boolean(
		userStore.getSuperAdmin ||
		userStore.roleInfo?.roleCode === 'super_super' ||
		userStore.getPermissionContext?.superAdmin,
	);
});

const isOrgAdmin = computed(() => {
	if (isSuperAdmin.value) {
		return false;
	}
	const code = (userStore.roleInfo?.roleCode || '').toLowerCase();
	const name = userStore.roleInfo?.roleName || '';
	return code.includes('admin') || name.includes('管理') || name.includes('主管');
});

const isUserRole = computed(() => !isSuperAdmin.value && !isOrgAdmin.value);

const roleTagText = computed(() => {
	if (isSuperAdmin.value) {
		return '超级管理员';
	}
	if (isOrgAdmin.value) {
		return userStore.roleInfo?.roleName || '机构主管';
	}
	return '家庭与随礼记账';
});

const roleClass = computed(() => {
	if (isSuperAdmin.value) {
		return 'role-super';
	}
	if (isOrgAdmin.value) {
		return 'role-admin';
	}
	return 'role-user';
});

const displayName = computed(() => {
	return userStore.getUserInfo?.nickName || userStore.getUserInfo?.userName || 'Alex 用户';
});

const orgName = computed(() => {
	return userStore.getOrgInfo?.orgName || userStore.getUserInfo?.orgName || '';
});

const timeGreeting = computed(() => {
	const hour = new Date().getHours();
	if (hour < 6) {
		return '凌晨好';
	}
	if (hour < 12) {
		return '早上好';
	}
	if (hour < 14) {
		return '中午好';
	}
	if (hour < 19) {
		return '下午好';
	}
	return '晚上好';
});

const giftOverview = ref({
	recordCount: 0,
	receiveAmount: 0,
	giveAmount: 0,
	returnAmount: 0,
	netAmount: 0,
});
const unreadSummaryCount = ref(0);
const showAiSheet = ref(false);
const kpiLoading = ref(false);

const fetchGiftStats = async () => {
	try {
		const { code, data } = await getGiftAnalysisOverview();
		if ((code === '200' || code === '00000') && data) {
			const receive = Number(data.receiveAmount || 0);
			const give = Number(data.giveAmount || 0);
			const ret = Number(data.returnAmount || 0);
			const net = Number(data.netAmount ?? receive - give - ret);
			giftOverview.value = {
				recordCount: Number(data.recordCount || 0),
				receiveAmount: receive,
				giveAmount: give,
				returnAmount: ret,
				netAmount: net,
			};
		}
	} catch {
		// 安全兜底
	}
};

const handleAiLedgerClick = () => {
	triggerHaptic('light');
	showAiSheet.value = true;
};

const handleAddGiftClick = () => {
	triggerHaptic('selection');
	router.push('/finance/gift/record');
};

const handleRemindClick = () => {
	triggerHaptic('selection');
	router.push('/message');
};

const handleAiRecordSuccess = () => {
	fetchGiftStats();
	refreshMessageUnreadBadge();
};

const refreshMessageUnreadBadge = async () => {
	try {
		const { code, data } = await getSysMessageSummary();
		if ((code === '200' || code === '00000') && data) {
			unreadSummaryCount.value = data.unreadTotal || 0;
			tabBarStore.setTabBadge('message', data.unreadTotal || 0);
		}
	} catch {
		// 静默忽略未读角标轮询异常
	}
};

const onlineServiceCount = ref(6);
const totalServiceCount = ref(6);
const serviceHealthSub = computed(() => {
	const offlineCount = Math.max(totalServiceCount.value - onlineServiceCount.value, 0);
	return offlineCount === 0 ? '全部运行正常' : `${offlineCount} 个服务离线`;
});

const fetchServiceHealth = async () => {
	try {
		const { code, data } = await getMicroServicesHealth();
		if ((code === '200' || code === '00000') && Array.isArray(data) && data.length > 0) {
			totalServiceCount.value = data.length;
			onlineServiceCount.value = data.filter((s) => s.status === 'UP').length;
		}
	} catch {
		// 容灾保持默认
	}
};

const loadDashboardKpis = async (showSkeleton = false) => {
	if (showSkeleton) {
		kpiLoading.value = true;
	}
	try {
		const tasks: Promise<unknown>[] = [fetchGiftStats(), refreshMessageUnreadBadge()];
		if (!isUserRole.value) {
			tasks.push(fetchServiceHealth());
		}
		await Promise.all(tasks);
	} finally {
		kpiLoading.value = false;
	}
};

onMounted(async () => {
	initMenuGroups();
	await loadDashboardKpis(true);
});

onActivated(async () => {
	initMenuGroups();
	await loadDashboardKpis(false);
});

// 交互反馈及路由跳转
const handleGridItemClick = (item: MenuItem) => {
	triggerHaptic('selection');
	if (item.path) {
		router.push(item.path);
	}
};

const SYSTEM_NAMES = new Set(['home', 'message', 'myself', 'login', 'dashboard']);

const deduplicateMenuItems = (items: MenuItem[]): MenuItem[] => {
	const unique: MenuItem[] = [];
	const pathSet = new Set<string>();
	for (const item of items) {
		if (!pathSet.has(item.path)) {
			pathSet.add(item.path);
			unique.push(item);
		}
	}
	return unique;
};

/**
 * 递归收集某个节点下的所有有效二级/叶子页面
 */
const collectLeafItems = (routeList: RouteRecordRaw[]): MenuItem[] => {
	const leaves: MenuItem[] = [];

	routeList.forEach((r, idx) => {
		// 忽略明确标记 hideInMenu 且未指定 showInHome 的路由
		if (r.meta?.hideInMenu && !r.meta?.showInHome) {
			return;
		}

		const hasValidChildren = Array.isArray(r.children) && r.children.length > 0;
		if (hasValidChildren) {
			// 含有子路由，继续递归抓取叶子路由
			const subLeaves = collectLeafItems(r.children as RouteRecordRaw[]);
			leaves.push(...subLeaves);
		} else if (r.path && r.meta?.title) {
			// 叶子节点：可供真实点击的功能页面
			const title = String(r.meta.title);
			const iconCfg = getIconConfig(title, r.meta?.icon as string, idx);
			leaves.push({
				name: r.name ? String(r.name) : undefined,
				title,
				path: r.path,
				icon: iconCfg.name,
				color: iconCfg.color,
				bgColor: iconCfg.bgColor,
			});
		}
	});

	return leaves;
};

/**
 * 兜底：当动态路由数组尚未同步完成时，直接从 Pinia userStore.getMenuInfo 组装菜单分组
 */
const collectMenuInfoLeaves = (nodes: MenuInfoData[]): MenuItem[] => {
	const leaves: MenuItem[] = [];
	nodes.forEach((node, idx) => {
		const hideInMenu = String(node.hideInMenu ?? '') !== '0';
		const showInHome = String(node.showInHome ?? '') === '1';
		if (hideInMenu && !showInHome) {
			return;
		}
		const children = Array.isArray(node.children) ? node.children : [];
		if (children.length > 0) {
			leaves.push(...collectMenuInfoLeaves(children));
		} else if (node.path && node.title) {
			const title = String(node.title);
			const iconCfg = getIconConfig(title, node.icon ? String(node.icon) : undefined, idx);
			leaves.push({
				name: node.name ? String(node.name) : undefined,
				title,
				path: String(node.path),
				icon: iconCfg.name,
				color: iconCfg.color,
				bgColor: iconCfg.bgColor,
			});
		}
	});
	return leaves;
};

const buildMenuGroupsFromStore = (menus: MenuInfoData[]): MenuGroup[] => {
	const resultGroups: MenuGroup[] = [];
	const orphanItems: MenuItem[] = [];

	menus.forEach((top) => {
		const topName = String(top.name || '');
		const topPath = String(top.path || '');
		if (SYSTEM_NAMES.has(topName) || topPath === '/' || topPath.includes('*')) {
			return;
		}
		const topTitle = String(top.title || '');
		const children = Array.isArray(top.children) ? top.children : [];
		const isTopShowInHome = String(top.showInHome ?? '') === '1';

		if (children.length > 0) {
			const hasAnyChildShowInHome = children.some((c) => String(c.showInHome ?? '') === '1');
			if (isTopShowInHome || hasAnyChildShowInHome) {
				const targetChildren = isTopShowInHome ? children : children.filter((c) => String(c.showInHome ?? '') === '1');
				const uniqueLeaves = deduplicateMenuItems(collectMenuInfoLeaves(targetChildren));
				if (uniqueLeaves.length > 0) {
					resultGroups.push({
						id: topName || topPath,
						title: topTitle || '快捷服务',
						themeColor: getGroupThemeColor(topTitle, resultGroups.length),
						items: uniqueLeaves,
					});
				}
			}
		} else if (isTopShowInHome && topPath && topTitle) {
			const iconCfg = getIconConfig(topTitle, top.icon ? String(top.icon) : undefined, orphanItems.length);
			orphanItems.push({
				name: topName,
				title: topTitle,
				path: topPath,
				icon: iconCfg.name,
				color: iconCfg.color,
				bgColor: iconCfg.bgColor,
			});
		}
	});

	if (orphanItems.length > 0) {
		resultGroups.push({
			id: 'common_group',
			title: '常用功能',
			themeColor: '#06b6d4',
			items: orphanItems,
		});
	}
	return resultGroups;
};

/**
 * 核心：解耦一级与二级目录，组装为「分类卡片流」数据结构
 */
const initMenuGroups = () => {
	// 从全局路由表中获取完整路由定义
	const rawRoutes = (routes.length ? routes : router?.options?.routes || []) as RouteRecordRaw[];
	const resultGroups: MenuGroup[] = [];
	const orphanItems: MenuItem[] = [];

	rawRoutes.forEach((topRoute) => {
		const topName = String(topRoute.name || '');
		if (SYSTEM_NAMES.has(topName) || topRoute.path === '/' || topRoute.path.includes('*')) {
			return;
		}

		const topTitle = (topRoute.meta?.title as string) || '';
		const children = (topRoute.children || []) as RouteRecordRaw[];
		const isTopShowInHome = Boolean(topRoute.meta?.showInHome);

		if (children.length > 0) {
			// 一级目录具有子项：提取有效叶子页面
			// 规则：只要一级目录标记了在首页显示，或者子节点标记了在首页显示，均收纳进入该一级卡片中
			const hasAnyChildShowInHome = children.some((c) => c.meta?.showInHome);

			if (isTopShowInHome || hasAnyChildShowInHome) {
				// 如果一级标了显示，则展示所有正常子项；否则仅展示标了 showInHome 的子项
				const targetChildren = isTopShowInHome ? children : children.filter((c) => c.meta?.showInHome);
				const uniqueLeaves = deduplicateMenuItems(collectLeafItems(targetChildren));

				if (uniqueLeaves.length > 0) {
					resultGroups.push({
						id: topName || topRoute.path,
						title: topTitle || '快捷服务',
						themeColor: getGroupThemeColor(topTitle, resultGroups.length),
						items: uniqueLeaves,
					});
				}
			}
		} else if (isTopShowInHome && topRoute.path && topRoute.meta?.title) {
			// 独立无子级的单页面，收纳至孤立项
			const title = String(topRoute.meta.title);
			const iconCfg = getIconConfig(title, topRoute.meta?.icon as string, orphanItems.length);
			orphanItems.push({
				name: topName,
				title,
				path: topRoute.path,
				icon: iconCfg.name,
				color: iconCfg.color,
				bgColor: iconCfg.bgColor,
			});
		}
	});

	// 若存在孤立项，汇总入独立卡片
	if (orphanItems.length > 0) {
		resultGroups.push({
			id: 'common_group',
			title: '常用功能',
			themeColor: '#06b6d4',
			items: orphanItems,
		});
	}

	if (resultGroups.length > 0) {
		menuGroups.value = resultGroups;
		return;
	}

	// 双保险兜底：若路由数组因重登/HMR 尚未同步完成，直接从 Pinia userStore.getMenuInfo 组装分组
	if (userStore.getMenuInfo?.length) {
		menuGroups.value = buildMenuGroupsFromStore(userStore.getMenuInfo);
		return;
	}

	menuGroups.value = [];
};

// 统计总功能项数
const totalItemCount = computed(() => {
	return menuGroups.value.reduce((acc, g) => acc + g.items.length, 0);
});

// 关键词实时搜索过滤
const filteredMenuGroups = computed(() => {
	const kw = searchKeyword.value.trim().toLowerCase();
	if (!kw) {
		return menuGroups.value;
	}

	return menuGroups.value
		.map((group) => {
			const isGroupMatched = group.title.toLowerCase().includes(kw);
			const matchedItems = group.items.filter(
				(item) => isGroupMatched || item.title.toLowerCase().includes(kw) || item.name?.toLowerCase().includes(kw),
			);
			return {
				...group,
				items: matchedItems,
			};
		})
		.filter((group) => group.items.length > 0);
});

const menuLoading = computed(() => kpiLoading.value || (!userStore.getRouteStatus && menuGroups.value.length === 0));

// 路由动态变化侦听（immediate: true 首次自动执行，监听响应式 routesVersion 与 Pinia 菜单/路由就绪状态，彻底消除重登后菜单空白）
watch(
	() => [routesVersion.value, userStore.getRouteStatus, userStore.getMenuInfo?.length],
	() => {
		initMenuGroups();
	},
	{ immediate: true },
);
</script>

<style lang="less" scoped>
.home-container {
	background-color: #f1f4fa;
	padding: 14px 16px calc(24px + env(safe-area-inset-bottom));
	box-sizing: border-box;
	min-height: 100%;
	overflow-x: hidden;
}

/* ─── Section 1: 角色动态态势卡片 (Soft UI 无边框分层) ─── */
.role-dashboard-section {
	margin-bottom: 14px;
}

.role-card-wrapper {
	background: #ffffff;
	border-radius: 16px;
	padding: 16px;
	box-shadow: 0 4px 16px rgba(15, 23, 42, 0.04);
}

.role-card-header {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	margin-bottom: 14px;
	gap: 8px;
}

.user-info-box {
	display: flex;
	flex-direction: column;
	gap: 6px;
	min-width: 0;
}

.user-greeting {
	font-size: 16px;
	font-weight: 700;
	color: #0f172a;
}

.tags-row {
	display: flex;
	align-items: center;
	gap: 6px;
	flex-wrap: wrap;
}

.role-badge {
	font-size: 12px;
	font-weight: 600;
	padding: 2px 9px;
	border-radius: 9999px;
	line-height: 16px;

	&.role-super {
		background-color: rgba(139, 92, 246, 0.12);
		color: #7c3aed;
	}

	&.role-admin {
		background-color: rgba(79, 106, 246, 0.12);
		color: #4f6af6;
	}

	&.role-user {
		background-color: rgba(16, 185, 129, 0.12);
		color: #059669;
	}
}

.org-chip {
	font-size: 12px;
	font-weight: 500;
	color: #475569;
	background: #f1f5f9;
	padding: 2px 9px;
	border-radius: 9999px;
	max-width: 150px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.date-badge {
	font-size: 12px;
	color: #64748b;
	font-weight: 500;
	font-variant-numeric: tabular-nums;
	white-space: nowrap;
	flex-shrink: 0;
}

.role-kpi-grid {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 10px;
	margin-bottom: 14px;
}

.kpi-box {
	background: #f8fafc;
	border-radius: 12px;
	padding: 12px;
	min-width: 0;

	&.main {
		grid-column: span 2;
		background: linear-gradient(135deg, rgba(79, 106, 246, 0.08) 0%, #f8fafc 100%);
	}

	&.click-box {
		cursor: pointer;
		transition:
			transform 0.15s ease,
			background-color 0.15s ease;
		&:active {
			transform: scale(0.98);
			background-color: #f1f5f9;
		}
	}
}

.kpi-label {
	font-size: 12px;
	font-weight: 500;
	color: #475569;
	margin-bottom: 4px;
}

.kpi-val {
	font-size: 16px;
	font-weight: 800;
	color: #0f172a;
	font-variant-numeric: tabular-nums;
	display: flex;
	align-items: baseline;
	gap: 2px;

	.currency {
		font-size: 12px;
		font-weight: 700;
	}

	.num {
		font-size: 20px;
		line-height: 1.15;
	}

	.unit {
		font-size: 12px;
		font-weight: 600;
		color: #475569;
		margin-left: 2px;
	}

	&.positive {
		color: #059669;
	}

	&.negative {
		color: #e11d48;
	}

	&.receive {
		color: #059669;
	}

	&.expense {
		color: #e11d48;
	}

	&.remind {
		color: #4f6af6;
	}
}

.kpi-status-dot {
	display: inline-block;
	width: 7px;
	height: 7px;
	border-radius: 50%;
	margin-right: 4px;
	flex-shrink: 0;
	vertical-align: middle;

	&.is-online {
		background-color: #059669;
		box-shadow: 0 0 0 2px rgba(5, 150, 105, 0.2);
	}

	&.is-warning {
		background-color: #e11d48;
		box-shadow: 0 0 0 2px rgba(225, 29, 72, 0.2);
	}
}

.kpi-sub {
	font-size: 12px;
	color: #64748b;
	margin-top: 4px;
	font-variant-numeric: tabular-nums;
}

.action-capsules-row {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 10px;
}

.capsule-btn {
	min-width: 0;
	height: 44px;
	min-height: 44px;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	gap: 6px;
	padding: 0 12px;
	border-radius: 12px;
	font-size: 14px;
	font-weight: 600;
	border: none;
	white-space: nowrap;
	cursor: pointer;
	transition: transform 0.15s ease;

	&:active {
		transform: scale(0.97);
	}

	.btn-vant-icon {
		font-size: 16px;
		flex-shrink: 0;
	}

	.btn-svg-icon {
		width: 16px;
		height: 16px;
		flex-shrink: 0;
	}

	.text {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	&.ai-btn {
		background: linear-gradient(135deg, #4f6af6 0%, #6366f1 100%);
		color: #ffffff;
		box-shadow: 0 6px 14px -3px rgba(79, 106, 246, 0.32);
	}

	&.ghost-btn {
		background: rgba(79, 106, 246, 0.1);
		color: #4f6af6;
	}
}

.sub-stats-scroller {
	margin-top: 14px;
	padding-top: 12px;
	border-top: 0.5px solid rgba(15, 23, 42, 0.08);
	background: transparent;
	box-shadow: none;
	border-radius: 0;
}

.sub-stats-title {
	font-size: 12px;
	color: #64748b;
	margin-bottom: 6px;
}

.sub-stats-chips {
	display: flex;
	flex-wrap: wrap;
	gap: 6px;
}

.mini-chip {
	font-size: 11px;
	color: #475569;
	background: #f1f5f9;
	padding: 2px 8px;
	border-radius: 9999px;
	font-variant-numeric: tabular-nums;
}

/* ─── Section 2: 搜索栏 ─── */
.search-section {
	margin-bottom: 14px;
}

.menu-search-bar {
	padding: 0;
	background: transparent;

	:deep(.van-search__content) {
		background-color: #ffffff;
		border: none;
		box-shadow: 0 2px 10px rgba(15, 23, 42, 0.03);
		border-radius: 9999px;
	}
}

/* ─── Section 3: 分组功能卡片流 ─── */
.menu-groups-container {
	display: flex;
	flex-direction: column;
	gap: 14px;
}

.group-card {
	background-color: #ffffff;
	border-radius: 16px;
	padding: 15px 14px 16px;
	box-shadow: 0 4px 16px rgba(15, 23, 42, 0.04);
}

.group-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 14px;
	padding-bottom: 10px;
	border-bottom: 0.5px solid rgba(15, 23, 42, 0.08);
}

.group-title-box {
	display: flex;
	align-items: center;
	gap: 7px;
}

.group-color-tag {
	width: 4px;
	height: 14px;
	border-radius: 9999px;
}

.group-title {
	font-size: 14px;
	font-weight: 700;
	color: #0f172a;
	margin: 0;
	line-height: 18px;
}

.group-count {
	font-size: 12px;
	color: #475569;
	background-color: #f1f5f9;
	padding: 2px 9px;
	border-radius: 9999px;
	font-weight: 600;
	font-variant-numeric: tabular-nums;
}

/* 4列紧凑网格系统 */
.group-grid {
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	row-gap: 14px;
	column-gap: 8px;
}

.menu-item-card {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: flex-start;
	gap: 6px;
	cursor: pointer;
	padding: 4px 2px;
	border-radius: 10px;
	transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1);

	&:active {
		transform: scale(0.94);
	}
}

.icon-wrapper {
	width: 44px;
	height: 44px;
	border-radius: 12px;
	display: flex;
	align-items: center;
	justify-content: center;
	transition:
		background-color 0.2s ease,
		transform 0.2s ease;
}

.homeSvgClass {
	height: 22px;
	width: 22px;
}

.homeFontClass {
	font-size: 13px;
	font-weight: 500;
	color: #1e293b;
	text-align: center;
	line-height: 17px;
	letter-spacing: -0.01em;
	display: -webkit-box;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 2;
	line-clamp: 2;
	overflow: hidden;
	word-break: keep-all;
	max-width: 80px;
}

/* 搜索空状态 */
.search-empty-box {
	padding: 20px 0;
}

.clear-search-btn {
	margin-top: 10px;
	height: 36px;
	min-height: 36px;
	padding: 0 16px;
	border-radius: 9999px;
	font-size: 13px;
	font-weight: 500;
	color: #4f6af6;
	background: rgba(79, 106, 246, 0.08);
	border: none;
	cursor: pointer;

	&:active {
		opacity: 0.8;
	}
}

.shimmer-bar {
	border-radius: 6px;
	background: #e2e8f0;
	animation: homeKpiPulse 1.4s ease-in-out infinite;
}

.search-skeleton-bar {
	width: 100%;
	height: 36px;
	border-radius: 9999px;
}

.sk-w-4 {
	width: 4px;
}
.sk-w-40 {
	width: 40px;
}
.sk-w-44 {
	width: 44px;
}
.sk-w-48 {
	width: 48px;
}
.sk-w-64 {
	width: 64px;
}
.sk-w-72 {
	width: 72px;
}
.sk-w-80 {
	width: 80px;
}
.sk-w-88 {
	width: 88px;
}
.sk-w-120 {
	width: 120px;
}
.sk-h-10 {
	height: 10px;
}
.sk-h-12 {
	height: 12px;
}
.sk-h-14 {
	height: 14px;
}
.sk-h-18 {
	height: 18px;
}
.sk-h-20 {
	height: 20px;
}
.sk-h-22 {
	height: 22px;
}
.sk-h-44 {
	height: 44px;
}
.sk-mt-2 {
	margin-top: 2px;
}
.sk-my-6 {
	margin: 6px 0;
}
.sk-rounded-14 {
	border-radius: 14px;
}
.sk-rounded-pill {
	border-radius: 9999px;
}

@keyframes homeKpiPulse {
	0%,
	100% {
		opacity: 1;
	}
	50% {
		opacity: 0.45;
	}
}

@media (prefers-reduced-motion: reduce) {
	.shimmer-bar {
		animation: none;
		opacity: 0.7;
	}

	.menu-item-card,
	.capsule-btn,
	.kpi-box.click-box {
		transition: none;

		&:active {
			transform: none;
			opacity: 0.75;
		}
	}
}
</style>
