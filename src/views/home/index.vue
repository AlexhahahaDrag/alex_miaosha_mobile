<template>
	<div class="home-container">
		<!-- KPI Stats Section -->
		<div
			v-if="visibleStats.length > 0"
			class="stats-grid"
		>
			<div
				v-for="stat in visibleStats"
				:key="stat.label"
				class="stat-card"
			>
				<div class="stat-label">{{ stat.label }}</div>
				<div class="stat-value">{{ stat.value }}</div>
				<div
					class="stat-trend"
					:class="stat.trend > 0 ? 'up' : 'down'"
				>
					{{ stat.trend > 0 ? '+' : '' }}{{ stat.trend }}% 较昨日
				</div>
			</div>
		</div>

		<!-- Main Menu Grid -->
		<div class="menu-section">
			<div class="section-title">快捷功能</div>
			<van-grid
				:column-num="3"
				:border="false"
				class="custom-grid"
			>
				<van-grid-item
					v-for="item in homeList"
					:key="item?.name || ''"
					:to="item.path"
					class="grid-item-card"
					@click="handleIconClick"
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
				</van-grid-item>
			</van-grid>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { RouteRecordRaw } from 'vue-router';
import { useNavBar } from '@/composables/useNavBar';
import { useTabBar } from '@/composables/useTabBar';

const router = useRouter();
const homeList = ref<RouteRecordRaw[]>([]);

/**
 * 1. 颜色与图标动态映射系统
 * 为不同类别的功能分配和谐的色彩体系
 */
const iconConfigMap: Record<string, { icon: string; color: string; bgColor: string }> = {
	用户信息: { icon: 'user', color: '#6366f1', bgColor: '#eef2ff' },
	机构管理: { icon: 'orgManager', color: '#8b5cf6', bgColor: '#f5f3ff' },
	菜单管理: { icon: 'palette', color: '#ec4899', bgColor: '#fdf2f8' },
	权限信息: { icon: 'shield-check', color: '#6366f1', bgColor: '#eef2ff' },
	角色管理: { icon: 'userManager', color: '#8b5cf6', bgColor: '#f5f3ff' },
	用户: { icon: 'user', color: '#ec4899', bgColor: '#fdf2f8' },
	字典信息: { icon: 'dict', color: '#64748b', bgColor: '#f8fafc' },
	店财务管理: { icon: 'shopFinance', color: '#f59e0b', bgColor: '#fffbeb' },
	店财务分析: { icon: 'shopFinanceAnalysis', color: '#e11d48', bgColor: '#fff1f2' },
	店库存分析: { icon: 'financeAnalysis', color: '#f43f5e', bgColor: '#fff1f2' },
	店铺库存: { icon: 'shopStock', color: '#10b981', bgColor: '#ecfdf5' },
	店铺商品: { icon: 'shopProduct', color: '#3b82f6', bgColor: '#eff6ff' },
	销售单管理: { icon: 'orderManager', color: '#2563eb', bgColor: '#eff6ff' },
	商品库存批次: { icon: 'shopStockBatch', color: '#1e40af', bgColor: '#eff6ff' },
	财务信息: { icon: 'finance', color: '#d97706', bgColor: '#fffbeb' },
	猫超管理: { icon: 'order', color: '#4f46e5', bgColor: '#eef2ff' },
	财务分析: { icon: 'financeAnalysis', color: '#be123c', bgColor: '#fff1f2' },
	消费卡交易记录: { icon: 'card-transaction', color: '#0ea5e9', bgColor: '#f0f9ff' },
	消费卡信息: { icon: 'card-info', color: '#06b6d4', bgColor: '#ecfeff' },
	消费券核销记录表: { icon: 'coupon-check', color: '#8b5cf6', bgColor: '#f5f3ff' },
	消费券信息表: { icon: 'coupon', color: '#ec4899', bgColor: '#fdf2f8' },
	用户消费券库存表: { icon: 'coupon', color: '#10b981', bgColor: '#ecfdf5' },
	商品属性: { icon: 'attribute', color: '#7c3aed', bgColor: '#f5f3ff' },
	个人随礼信息: { icon: 'gift', color: '#f97316', bgColor: '#fff7ed' },
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

// KPI 数据指标配置 (支持显示/隐藏配置)
const stats = ref([
	{ label: '本月营收', value: '¥28,450', trend: 12.5, show: false },
	{ label: '本月支出', value: '¥12,300', trend: 5.8, show: false },
	{ label: '本月库存', value: '4,520 件', trend: -1.2, show: false },
	{ label: '本月销售', value: '892 单', trend: 15.4, show: false },
]);

// 过滤仅展示配置为 show: true 的指标
const visibleStats = computed(() => stats.value.filter((item) => item.show));

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

// 交互反馈
const handleIconClick = () => {
	if (navigator.vibrate) {
		navigator.vibrate(50);
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
	// 保持界面整洁，这里可以添加排序逻辑
	homeList.value = rawList;
};

init();
</script>

<style lang="less" scoped>
.home-container {
	background-color: #f8fafc;
	padding: 16px;
	box-sizing: border-box;
}

.stats-grid {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 12px;
	margin-bottom: 24px;
}

.stat-card {
	background: #ffffff;
	padding: 16px;
	border-radius: 16px;
	box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.stat-label {
	font-size: 12px;
	color: #64748b;
	margin-bottom: 4px;
}

.stat-value {
	font-size: 20px;
	font-weight: 800;
	color: #1e293b;
	margin-bottom: 4px;
}

.stat-trend {
	font-size: 11px;
	&.up {
		color: #10b981;
	}
	&.down {
		color: #ef4444;
	}
}

.menu-section {
	background: #ffffff;
	border-radius: 16px;
	padding: 16px 8px;
	box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.section-title {
	font-size: 15px;
	font-weight: 700;
	color: #1e293b;
	margin-left: 8px;
	margin-bottom: 12px;
}

.grid-item-card {
	transition: transform 0.2s;
	&:active {
		transform: scale(0.95);
	}
}

.icon-wrapper {
	width: 52px;
	height: 52px;
	border-radius: 16px;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 10px;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	box-shadow: 0 4px 12px -2px rgba(0, 0, 0, 0.04);
}

.homeSvgClass {
	height: 28px;
	width: 28px;
	transition: transform 0.3s ease;
}

.grid-item-card:active .homeSvgClass {
	transform: scale(1.1);
}

.homeFontClass {
	font-size: 12px;
	color: #334155;
	font-weight: 600;
	letter-spacing: -0.2px;
}
</style>
