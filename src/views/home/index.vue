<template>
	<div class="home-container">
		<!-- KPI Stats Section -->
		<div class="stats-grid">
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
					<div class="icon-wrapper">
						<svg-icon
							class="homeSvgClass"
							:name="item?.meta?.icon?.toString() || ''"
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

// KPI 数据指标配置 (支持显示/隐藏配置)
const stats = ref([
	{ label: '本月营收', value: '¥28,450', trend: 12.5, show: true },
	{ label: '本月支出', value: '¥12,300', trend: 5.8, show: true },
	{ label: '本月库存', value: '4,520 件', trend: -1.2, show: true },
	{ label: '本月销售', value: '892 单', trend: 15.4, show: true },
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

// 初始化数据
const init = () => {
	homeList.value = getHomeList(router?.options?.routes || []);
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
	width: 48px;
	height: 48px;
	background: #eff6ff;
	border-radius: 12px;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 8px;
}

.homeSvgClass {
	height: 24px;
	width: 24px;
	color: #1e40af;
}

.homeFontClass {
	font-size: 13px;
	color: #475569;
	font-weight: 500;
}
</style>
