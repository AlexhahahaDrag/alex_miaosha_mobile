<template>
	<div class="home-container">
		<!-- Section 1: 数据概览 -->
		<section
			v-if="visibleStats.length > 0"
			class="data-overview"
		>
			<div class="overview-card">
				<div class="overview-header">
					<h2 class="overview-title">最近保存时间</h2>
				</div>
				<div class="overview-content">
					<div
						v-for="(stat, index) in visibleStats"
						:key="stat.label"
						class="stat-item"
						:class="{ 'has-divider': index > 0 }"
					>
						<span class="stat-label">{{ stat.label }}</span>
						<span
							class="stat-value"
							:style="{ color: stat.color || '#191b23' }"
						>
							{{ stat.value }}
						</span>
					</div>
				</div>
			</div>
		</section>

		<!-- Section 2: 快捷功能 -->
		<section class="menu-section">
			<h2 class="section-title">快捷功能</h2>
			<div class="menu-grid">
				<div
					v-for="item in homeList"
					:key="item?.name || ''"
					class="menu-item-card"
					@click="handleGridItemClick(item)"
				>
					<div
						class="icon-wrapper"
						:style="{ backgroundColor: getIconConfig(item).bgColor }"
					>
						<svg-icon
							class="homeSvgClass"
							:name="getIconConfig(item).name"
							:color="getIconConfig(item).color"
						>
						</svg-icon>
					</div>
					<span class="homeFontClass">{{ item?.meta?.title?.toString() || '' }}</span>
				</div>
			</div>
		</section>
	</div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter, type RouteRecordRaw } from 'vue-router';
import { useNavBar } from '@/composables/useNavBar';
import { useTabBar } from '@/composables/useTabBar';
import { useDashboardStore } from '@/store/modules/dashboard/dashboard';

const router = useRouter();
const homeList = ref<RouteRecordRaw[]>([]);
const dashboardStore = useDashboardStore();

/**
 * 1. 颜色与图标动态映射系统
 * 为不同类别的功能分配和谐的色彩体系
 */
const iconConfigMap: Record<string, { icon: string; color: string; bgColor: string }> = {
	用户信息: { icon: 'user', color: '#0058be', bgColor: '#d8e2ff' },
	机构管理: { icon: 'orgManager', color: '#8b5cf6', bgColor: '#f5f3ff' },
	菜单管理: { icon: 'palette', color: '#ec4899', bgColor: '#fdf2f8' },
	权限信息: { icon: 'shield-check', color: '#10b981', bgColor: '#ecfdf5' },
	角色管理: { icon: 'userManager', color: '#f59e0b', bgColor: '#fffbeb' },
	用户: { icon: 'user', color: '#06b6d4', bgColor: '#ecfeff' },
	字典信息: { icon: 'dict', color: '#54647a', bgColor: '#d0e1fb' },
	店财务管理: { icon: 'shopFinance', color: '#0058be', bgColor: '#d8e2ff' },
	店财务分析: { icon: 'shopFinanceAnalysis', color: '#8b5cf6', bgColor: '#f5f3ff' },
	店库存分析: { icon: 'financeAnalysis', color: '#ec4899', bgColor: '#fdf2f8' },
	店铺库存: { icon: 'shopStock', color: '#10b981', bgColor: '#ecfdf5' },
	店铺商品: { icon: 'shopProduct', color: '#f59e0b', bgColor: '#fffbeb' },
	销售单管理: { icon: 'orderManager', color: '#06b6d4', bgColor: '#ecfeff' },
	商品库存批次: { icon: 'shopStockBatch', color: '#54647a', bgColor: '#d0e1fb' },
	财务信息: { icon: 'finance', color: '#8b5cf6', bgColor: '#f5f3ff' },
	猫超管理: { icon: 'order', color: '#ec4899', bgColor: '#fdf2f8' },
	财务分析: { icon: 'financeAnalysis', color: '#06b6d4', bgColor: '#ecfeff' },
	消费卡交易记录: { icon: 'card-transaction', color: '#10b981', bgColor: '#ecfdf5' },
	消费卡信息: { icon: 'card-info', color: '#0058be', bgColor: '#d8e2ff' },
	消费券核销记录表: { icon: 'coupon-check', color: '#0058be', bgColor: '#d8e2ff' },
	消费券信息表: { icon: 'coupon', color: '#10b981', bgColor: '#ecfdf5' },
	用户消费券库存表: { icon: 'coupon', color: '#f59e0b', bgColor: '#fffbeb' },
	商品属性: { icon: 'attribute', color: '#8b5cf6', bgColor: '#f5f3ff' },
	个人随礼信息: { icon: 'gift', color: '#54647a', bgColor: '#d0e1fb' },
};

const getIconConfig = (item: RouteRecordRaw) => {
	const title = item?.meta?.title?.toString() || '';
	const config = iconConfigMap[title];

	return {
		name: config?.icon || item?.meta?.icon?.toString() || 'menu-default',
		color: config?.color || '#3b82f6',
		bgColor: config?.bgColor || '#eff6ff',
	};
};

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
			show: !!savedTime, // 只有存在保存时间时才显示
		};
	}).filter((stat) => stat.show);
});

// 使用新的NavBar系统
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

// 交互反馈及路由跳转
const handleGridItemClick = (item: RouteRecordRaw) => {
	if (navigator.vibrate) {
		navigator.vibrate(50);
	}
	if (item.path) {
		router.push(item.path);
	}
};

// 获取主页数据
const getHomeList = (arr: readonly RouteRecordRaw[] | null): RouteRecordRaw[] => {
	return (arr || []).flatMap((item) => [
		...(item.meta?.showInHome ? [item] : []),
		...(item.children ? getHomeList(item.children) : []),
	]);
};

// 初始化数据源时进行排序或过滤逻辑
const init = () => {
	const rawList = getHomeList(router?.options?.routes || []);
	homeList.value = rawList;
};

init();
</script>

<style lang="less" scoped>
.home-container {
	background-color: #f9f9ff;
	padding: 16px;
	box-sizing: border-box;
	min-height: calc(100vh - 96px);
	padding-bottom: 80px; /* 为 TabBar 留出合适空间 */
	overflow-x: hidden;
}

.data-overview {
	margin-bottom: 24px;
}

.overview-card {
	background-color: #ffffff;
	border-radius: 12px;
	box-shadow: 0 4px 20px rgba(30, 41, 59, 0.04);
	padding: 16px;
	border: 1px solid rgba(194, 198, 214, 0.3);
}

.overview-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 16px;
	padding: 0 8px;
}

.overview-title {
	font-size: 22px;
	font-weight: 600;
	color: #191b23;
	margin: 0;
	line-height: 28px;
	letter-spacing: -0.01em;
}

.overview-more {
	font-size: 11px;
	font-weight: 600;
	color: #727785;
	cursor: pointer;
	transition: color 0.2s;
	letter-spacing: 0.02em;

	&:hover {
		color: #0058be;
	}
}

.overview-content {
	display: flex;
	flex-direction: column;
	gap: 4px;
}

.stat-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 12px 4px;

	&.has-divider {
		border-top: 1px solid rgba(194, 198, 214, 0.3);
		border-left: none;
	}
}

.stat-label {
	font-size: 14px;
	font-weight: 500;
	color: #505f76;
	line-height: 20px;
}

.stat-value {
	font-size: 15px;
	font-weight: 600;
	line-height: 20px;
	letter-spacing: -0.01em;
}

.menu-section {
	margin-bottom: 24px;
}

.section-title {
	font-size: 22px;
	font-weight: 600;
	color: #191b23;
	margin: 0 0 16px 8px;
	line-height: 28px;
	letter-spacing: -0.01em;
}

.menu-grid {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 16px;
}

.menu-item-card {
	background-color: #ffffff;
	border-radius: 12px;
	padding: 16px;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 8px;
	box-shadow: 0 4px 12px rgba(30, 41, 59, 0.02);
	border: 1px solid rgba(194, 198, 214, 0.2);
	cursor: pointer;
	transition:
		background-color 0.2s,
		transform 0.2s;

	&:hover {
		background-color: #f2f3fd;
	}

	&:active {
		transform: scale(0.95);
	}
}

.icon-wrapper {
	width: 40px;
	height: 40px;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.homeSvgClass {
	height: 24px;
	width: 24px;
	transition: transform 0.3s ease;
}

.menu-item-card:active .homeSvgClass {
	transform: scale(1.1);
}

.homeFontClass {
	font-size: 11px;
	font-weight: 600;
	color: #191b23;
	text-align: center;
	letter-spacing: 0.02em;
	line-height: 13px;
}
</style>
