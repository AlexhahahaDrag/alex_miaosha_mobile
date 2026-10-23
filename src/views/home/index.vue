<template>
	<div class="home-container">
		<!-- Section 1: 角色动态态势卡片 (Role-Aware Dashboard Card) -->
		<section
			class="role-dashboard-section"
			data-testid="dash-mobile-role-card"
		>
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

				<!-- 核心指标大盘 (动态聚合) -->
				<div class="role-kpi-grid">
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
							<div class="kpi-sub">共记录 {{ giftOverview.recordCount || 0 }} 笔流水</div>
						</div>
						<div class="kpi-box">
							<div class="kpi-label">累计收礼</div>
							<div class="kpi-val receive">
								<span class="currency">¥</span>
								<span class="num">{{ (giftOverview.receiveAmount || 0).toLocaleString() }}</span>
							</div>
							<div class="kpi-sub">礼入人情</div>
						</div>
						<div class="kpi-box">
							<div class="kpi-label">随礼支出</div>
							<div class="kpi-val expense">
								<span class="currency">¥</span>
								<span class="num">{{
									((giftOverview.giveAmount || 0) + (giftOverview.returnAmount || 0)).toLocaleString()
								}}</span>
							</div>
							<div class="kpi-sub">人情往还</div>
						</div>
						<div
							class="kpi-box click-box"
							data-testid="dash-mobile-kpi-remind"
							@click="handleRemindClick"
						>
							<div class="kpi-label">到期与备忘</div>
							<div class="kpi-val remind">
								<span class="num">{{ unreadSummaryCount }}</span>
								<span class="unit">条待办</span>
							</div>
							<div class="kpi-sub">点击查看通知 ></div>
						</div>
					</template>

					<!-- 管理员视角：机构成员 + 待办巡检 + 服务状态 -->
					<template v-else>
						<div class="kpi-box main">
							<div class="kpi-label">管辖机构/家庭</div>
							<div class="kpi-val admin-val">
								<span class="num text-sm">{{ orgName || '平台总管' }}</span>
							</div>
							<div class="kpi-sub">组织权限体系受控</div>
						</div>
						<div
							class="kpi-box click-box"
							data-testid="dash-mobile-kpi-remind"
							@click="handleRemindClick"
						>
							<div class="kpi-label">待办到期通知</div>
							<div class="kpi-val remind">
								<span class="num">{{ unreadSummaryCount }}</span>
								<span class="unit">条未读</span>
							</div>
							<div class="kpi-sub">XXL-Job 定时巡检 ></div>
						</div>
						<div
							class="kpi-box"
							data-testid="dash-mobile-kpi-services"
						>
							<div class="kpi-label">集群微服务</div>
							<div class="kpi-val receive">
								<span class="num">{{ onlineServiceCount }}</span>
								<span class="unit">/ {{ totalServiceCount }} 在线</span>
							</div>
							<div class="kpi-sub">{{ serviceHealthSub }}</div>
						</div>
					</template>
				</div>

				<!-- 快捷行动条：一键 AI 智能记账 + 随礼记账 -->
				<div class="action-capsules-row">
					<button
						class="capsule-btn ai-btn"
						data-testid="dash-mobile-btn-ai-ledger"
						@click="handleAiLedgerClick"
					>
						<span class="sparkle">✨</span>
						<span class="text">AI 智能流式记账</span>
					</button>
					<button
						class="capsule-btn ghost-btn"
						data-testid="dash-mobile-btn-add-gift"
						@click="handleAddGiftClick"
					>
						<svg-icon
							name="gift"
							color="#0058be"
						/>
						<span class="text">随礼记一笔</span>
					</button>
				</div>
			</div>

			<!-- 模块保存动态 (若有) -->
			<div
				v-if="visibleStats.length > 0"
				class="sub-stats-scroller"
			>
				<div class="sub-stats-title">近期保存动态：</div>
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
		</section>

		<!-- Section 2: 全局功能搜索栏 -->
		<section
			v-if="totalItemCount > 6"
			class="search-section"
		>
			<van-search
				v-model="searchKeyword"
				placeholder="搜索功能名称或模块..."
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
					<span class="group-count">{{ group.items.length }} 项功能</span>
				</div>

				<div class="group-grid">
					<div
						v-for="item in group.items"
						:key="item.path"
						class="menu-item-card"
						:data-testid="'menu-item-' + (item.name || item.title)"
						@click="handleGridItemClick(item)"
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
						<span class="homeFontClass">{{ item.title }}</span>
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
			/>
		</div>
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
import { routes } from '@/router';
import { formatDate } from '@/utils/dayjs';
import { getSysMessageSummary } from '@/views/message/api';
import { getGiftAnalysisOverview } from '@/views/finance/gift/analysis/api';
import { getMicroServicesHealth } from '@/views/home/api';
import { triggerHaptic } from '@/utils/haptics';
import FinanceAiSheet from '@/views/finance/financeManager/components/FinanceAiSheet.vue';

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
	用户信息: { icon: 'user', color: '#0058be', bgColor: '#d8e2ff' },
	机构管理: { icon: 'orgManager', color: '#8b5cf6', bgColor: '#f5f3ff' },
	菜单管理: { icon: 'palette', color: '#ec4899', bgColor: '#fdf2f8' },
	权限信息: { icon: 'shield-check', color: '#10b981', bgColor: '#ecfdf5' },
	角色管理: { icon: 'userManager', color: '#f59e0b', bgColor: '#fffbeb' },
	用户: { icon: 'user', color: '#06b6d4', bgColor: '#ecfeff' },
	角色用户: { icon: 'userManager', color: '#0058be', bgColor: '#d8e2ff' },
	角色权限: { icon: 'shield-check', color: '#8b5cf6', bgColor: '#f5f3ff' },
	字典信息: { icon: 'dict', color: '#54647a', bgColor: '#d0e1fb' },

	// 店铺与财务
	店财务管理: { icon: 'shopFinance', color: '#0058be', bgColor: '#d8e2ff' },
	店财务分析: { icon: 'shopFinanceAnalysis', color: '#8b5cf6', bgColor: '#f5f3ff' },
	店库存分析: { icon: 'financeAnalysis', color: '#ec4899', bgColor: '#fdf2f8' },
	店铺库存: { icon: 'shopStock', color: '#10b981', bgColor: '#ecfdf5' },
	店铺商品: { icon: 'shopProduct', color: '#f59e0b', bgColor: '#fffbeb' },
	销售单管理: { icon: 'orderManager', color: '#06b6d4', bgColor: '#ecfeff' },
	商品库存批次: { icon: 'shopStockBatch', color: '#54647a', bgColor: '#d0e1fb' },
	财务信息: { icon: 'finance', color: '#8b5cf6', bgColor: '#f5f3ff' },
	财务分析: { icon: 'financeAnalysis', color: '#06b6d4', bgColor: '#ecfeff' },

	// 消费卡与消费券
	消费卡交易记录: { icon: 'card-transaction', color: '#10b981', bgColor: '#ecfdf5' },
	消费卡信息: { icon: 'card-info', color: '#0058be', bgColor: '#d8e2ff' },
	消费券核销记录表: { icon: 'coupon-check', color: '#0058be', bgColor: '#d8e2ff' },
	消费券信息表: { icon: 'coupon', color: '#10b981', bgColor: '#ecfdf5' },
	用户消费券库存表: { icon: 'coupon', color: '#f59e0b', bgColor: '#fffbeb' },

	// 商品与礼金
	商品属性: { icon: 'attribute', color: '#8b5cf6', bgColor: '#f5f3ff' },
	个人随礼信息: { icon: 'gift', color: '#f59e0b', bgColor: '#fffbeb' },
	随礼记录: { icon: 'gift', color: '#f59e0b', bgColor: '#fffbeb' },
	事由管理: { icon: 'order', color: '#0058be', bgColor: '#d8e2ff' },
	亲友管理: { icon: 'user', color: '#10b981', bgColor: '#ecfdf5' },
};

// 预设柔和调色板，为未显式配置颜色的菜单提供优雅视觉
const PALETTE = [
	{ color: '#0058be', bgColor: '#d8e2ff' },
	{ color: '#8b5cf6', bgColor: '#f5f3ff' },
	{ color: '#10b981', bgColor: '#ecfdf5' },
	{ color: '#f59e0b', bgColor: '#fffbeb' },
	{ color: '#ec4899', bgColor: '#fdf2f8' },
	{ color: '#06b6d4', bgColor: '#ecfeff' },
	{ color: '#54647a', bgColor: '#d0e1fb' },
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
		name: defaultIcon || 'menu-default',
		color: fallback.color,
		bgColor: fallback.bgColor,
	};
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
	if (isSuperAdmin.value) return false;
	const code = (userStore.roleInfo?.roleCode || '').toLowerCase();
	const name = userStore.roleInfo?.roleName || '';
	return code.includes('admin') || name.includes('管理') || name.includes('主管');
});

const isUserRole = computed(() => !isSuperAdmin.value && !isOrgAdmin.value);

const roleTagText = computed(() => {
	if (isSuperAdmin.value) return '超级管理员';
	if (isOrgAdmin.value) return userStore.roleInfo?.roleName || '机构主管';
	return '家庭与随礼记账';
});

const roleClass = computed(() => {
	if (isSuperAdmin.value) return 'role-super';
	if (isOrgAdmin.value) return 'role-admin';
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
	if (hour < 6) return '凌晨好';
	if (hour < 12) return '早上好';
	if (hour < 14) return '中午好';
	if (hour < 19) return '下午好';
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
		if (code == '200' && data) {
			unreadSummaryCount.value = data.unreadTotal || 0;
			tabBarStore.setTabBadge('message', data.unreadTotal || 0);
		}
	} catch {
		// 静默忽略未读角标轮询异常
	}
};

const onlineServiceCount = ref(6);
const totalServiceCount = ref(6);
const serviceHealthSub = computed(() =>
	onlineServiceCount.value === totalServiceCount.value
		? '全栈探针正常'
		: `${onlineServiceCount.value}/${totalServiceCount.value} 节点在线`,
);

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

onMounted(() => {
	fetchGiftStats();
	refreshMessageUnreadBadge();
	if (!isUserRole.value) {
		void fetchServiceHealth();
	}
});

onActivated(() => {
	fetchGiftStats();
	refreshMessageUnreadBadge();
	if (!isUserRole.value) {
		void fetchServiceHealth();
	}
});

// 交互反馈及路由跳转
const handleGridItemClick = (item: MenuItem) => {
	if (navigator.vibrate) {
		navigator.vibrate(40);
	}
	if (item.path) {
		router.push(item.path);
	}
};

/**
 * 递归收集某个节点下的所有有效二级/叶子页面
 */
const collectLeafItems = (routeList: RouteRecordRaw[], parentTitle = ''): MenuItem[] => {
	const leaves: MenuItem[] = [];

	routeList.forEach((r, idx) => {
		// 忽略明确标记 hideInMenu 且未指定 showInHome 的路由
		if (r.meta?.hideInMenu && !r.meta?.showInHome) {
			return;
		}

		const hasValidChildren = Array.isArray(r.children) && r.children.length > 0;
		if (hasValidChildren) {
			// 含有子路由，继续递归抓取叶子路由
			const subLeaves = collectLeafItems(r.children as RouteRecordRaw[], parentTitle || (r.meta?.title as string) || '');
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
 * 核心：解耦一级与二级目录，组装为「分类卡片流」数据结构
 */
const initMenuGroups = () => {
	// 从全局路由表中获取完整路由定义
	const rawRoutes = (routes.length ? routes : router?.options?.routes || []) as RouteRecordRaw[];
	const resultGroups: MenuGroup[] = [];
	const orphanItems: MenuItem[] = [];

	// 排除系统底座路由
	const SYSTEM_NAMES = new Set(['home', 'message', 'myself', 'login', 'dashboard']);

	rawRoutes.forEach((topRoute) => {
		const topName = String(topRoute.name || '');
		if (SYSTEM_NAMES.has(topName) || topRoute.path === '/' || topRoute.path.includes('*')) {
			return;
		}

		const topTitle = (topRoute.meta?.title as string) || '';
		const children = (topRoute.children || []) as RouteRecordRaw[];
		const isTopShowInHome = !!topRoute.meta?.showInHome;

		if (children.length > 0) {
			// 一级目录具有子项：提取有效叶子页面
			// 规则：只要一级目录标记了在首页显示，或者子节点标记了在首页显示，均收纳进入该一级卡片中
			const hasAnyChildShowInHome = children.some((c) => c.meta?.showInHome);

			if (isTopShowInHome || hasAnyChildShowInHome) {
				// 如果一级标了显示，则展示所有正常子项；否则仅展示标了 showInHome 的子项
				const targetChildren = isTopShowInHome ? children : children.filter((c) => c.meta?.showInHome);

				const groupLeaves = collectLeafItems(targetChildren, topTitle);

				// 去重（防止路径重复）
				const uniqueLeaves: MenuItem[] = [];
				const pathSet = new Set<string>();
				groupLeaves.forEach((leaf) => {
					if (!pathSet.has(leaf.path)) {
						pathSet.add(leaf.path);
						uniqueLeaves.push(leaf);
					}
				});

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

	menuGroups.value = resultGroups;
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
				(item) =>
					isGroupMatched || item.title.toLowerCase().includes(kw) || (item.name && item.name.toLowerCase().includes(kw)),
			);
			return {
				...group,
				items: matchedItems,
			};
		})
		.filter((group) => group.items.length > 0);
});

// 初始化与路由动态变化侦听
initMenuGroups();

watch(
	() => router.getRoutes().length,
	() => {
		initMenuGroups();
	},
);
</script>

<style lang="less" scoped>
.home-container {
	background-color: var(--bg-color, #f9f9ff);
	padding: 14px 16px;
	box-sizing: border-box;
	min-height: calc(100vh - 96px);
	padding-bottom: 90px; /* 留足底部 TabBar 与安全区空间 */
	overflow-x: hidden;
}

/* ─── Section 1: 角色动态态势卡片 ─── */
.role-dashboard-section {
	margin-bottom: 14px;
}

.role-card-wrapper {
	background: linear-gradient(135deg, #ffffff 0%, #f6f8fc 100%);
	border-radius: var(--border-radius-lg, 14px);
	padding: 16px;
	border: 1px solid var(--border-color, rgba(194, 198, 214, 0.3));
	box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}

.role-card-header {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	margin-bottom: 14px;
}

.user-info-box {
	display: flex;
	flex-direction: column;
	gap: 6px;
}

.user-greeting {
	font-size: 16px;
	font-weight: 700;
	color: var(--text-primary, #191b23);
}

.tags-row {
	display: flex;
	align-items: center;
	gap: 6px;
}

.role-badge {
	font-size: 11px;
	font-weight: 600;
	padding: 2px 8px;
	border-radius: 9999px;
	line-height: 16px;

	&.role-super {
		background-color: #f3e8ff;
		color: #7e22ce;
		border: 1px solid #d8b4fe;
	}

	&.role-admin {
		background-color: #e0f2fe;
		color: #0369a1;
		border: 1px solid #7dd3fc;
	}

	&.role-user {
		background-color: #ecfdf5;
		color: #047857;
		border: 1px solid #a7f3d0;
	}
}

.org-chip {
	font-size: 11px;
	color: #64748b;
	background: #f1f5f9;
	padding: 2px 8px;
	border-radius: 6px;
	max-width: 140px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.date-badge {
	font-size: 11px;
	color: #94a3b8;
	font-weight: 500;
}

.role-kpi-grid {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 10px;
	margin-bottom: 14px;
}

.kpi-box {
	background: #ffffff;
	border-radius: 10px;
	padding: 10px 12px;
	border: 1px solid rgba(226, 232, 240, 0.8);
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);

	&.main {
		grid-column: span 2;
		background: linear-gradient(135deg, #f0f7ff 0%, #ffffff 100%);
		border-color: #bfdbfe;
	}

	&.click-box {
		cursor: pointer;
		transition: all 0.2s ease;
		&:active {
			transform: scale(0.97);
			background-color: #f8fafc;
		}
	}
}

.kpi-label {
	font-size: 11px;
	color: #64748b;
	margin-bottom: 4px;
}

.kpi-val {
	font-size: 16px;
	font-weight: 700;
	color: #1e293b;
	display: flex;
	align-items: baseline;
	gap: 2px;

	.currency {
		font-size: 12px;
		font-weight: 600;
	}

	.num {
		font-size: 18px;
	}

	.unit {
		font-size: 11px;
		font-weight: 500;
		color: #64748b;
		margin-left: 2px;
	}

	&.positive {
		color: #16a34a;
	}

	&.negative {
		color: #dc2626;
	}

	&.receive {
		color: #059669;
	}

	&.expense {
		color: #ea580c;
	}

	&.remind {
		color: #2563eb;
	}

	&.admin-val {
		font-size: 14px;
		color: #1e40af;
	}
}

.kpi-sub {
	font-size: 10px;
	color: #94a3b8;
	margin-top: 4px;
}

.action-capsules-row {
	display: flex;
	gap: 10px;
}

.capsule-btn {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 6px;
	padding: 9px 12px;
	border-radius: 9999px;
	font-size: 13px;
	font-weight: 600;
	border: none;
	cursor: pointer;
	transition: all 0.2s ease;

	&:active {
		transform: scale(0.96);
	}

	&.ai-btn {
		background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
		color: #ffffff;
		box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
	}

	&.ghost-btn {
		background: #ffffff;
		color: #0058be;
		border: 1px solid #bfdbfe;
	}
}

.sub-stats-scroller {
	margin-top: 10px;
	padding: 8px 12px;
	background: #ffffff;
	border-radius: 8px;
	border: 1px solid rgba(226, 232, 240, 0.7);
}

.sub-stats-title {
	font-size: 11px;
	color: #94a3b8;
	margin-bottom: 4px;
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
	padding: 2px 6px;
	border-radius: 4px;
}

/* ─── Section 2: 搜索栏 ─── */
.search-section {
	margin-bottom: 14px;
}

.menu-search-bar {
	padding: 0;
	background: transparent;

	:deep(.van-search__content) {
		background-color: var(--card-bg, #ffffff);
		border: 1px solid var(--border-color, rgba(194, 198, 214, 0.3));
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.02);
		border-radius: 20px;
	}
}

/* ─── Section 3: 分组功能卡片流 ─── */
.menu-groups-container {
	display: flex;
	flex-direction: column;
	gap: 14px;
}

.group-card {
	background-color: var(--card-bg, #ffffff);
	border-radius: var(--border-radius-lg, 12px);
	padding: 14px 14px 16px;
	box-shadow: 0 2px 10px rgba(30, 41, 59, 0.03);
	border: 1px solid var(--border-color, rgba(194, 198, 214, 0.25));
}

.group-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 14px;
	padding-bottom: 8px;
	border-bottom: 1px solid var(--border-color, rgba(194, 198, 214, 0.15));
}

.group-title-box {
	display: flex;
	align-items: center;
	gap: 6px;
}

.group-color-tag {
	width: 4px;
	height: 14px;
	border-radius: 2px;
}

.group-title {
	font-size: 14px;
	font-weight: 600;
	color: var(--text-primary, #191b23);
	margin: 0;
	line-height: 18px;
}

.group-count {
	font-size: 11px;
	color: var(--text-tertiary, #969799);
	background-color: var(--bg-color, #f4f5f8);
	padding: 2px 8px;
	border-radius: 10px;
	font-weight: 500;
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
	border-radius: 8px;
	transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1);

	&:active {
		transform: scale(0.92);
	}
}

.icon-wrapper {
	width: 44px;
	height: 44px;
	border-radius: 14px; /* 舒适的微圆角 */
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.2s ease;
	box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
}

.homeSvgClass {
	height: 22px;
	width: 22px;
}

.homeFontClass {
	font-size: 12px;
	font-weight: 500;
	color: var(--text-primary, #191b23);
	text-align: center;
	line-height: 15px;
	letter-spacing: -0.01em;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
	word-break: break-all;
	max-width: 68px;
}

/* 搜索空状态 */
.search-empty-box {
	padding: 20px 0;
}
</style>
