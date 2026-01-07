<template>
	<div class="modern-dashboard">
		<!-- 顶部状态栏 -->
		<div class="status-bar">
			<div class="status-left">
				<div class="time">{{ currentTime }}</div>
			</div>
			<div class="status-right">
				<van-icon
					name="wifi"
					class="status-icon"
				/>
				<van-icon
					name="signal"
					class="status-icon"
				/>
				<div class="battery">
					<div
						class="battery-level"
						:style="{ width: batteryLevel + '%' }"
					></div>
				</div>
			</div>
		</div>

		<!-- 主要内容 -->
		<div class="dashboard-content">
			<!-- 用户信息卡片 -->
			<div class="user-card">
				<div class="user-bg">
					<div class="user-info">
						<div class="avatar-wrapper">
							<img
								src="https://via.placeholder.com/60x60/409eff/ffffff?text=U"
								alt="avatar"
								class="user-avatar"
							/>
							<div class="online-dot"></div>
						</div>
						<div class="user-details">
							<h3 class="username">{{ userInfo.name }}</h3>
							<p class="user-role">{{ userInfo.role }}</p>
						</div>
					</div>
					<div class="user-stats">
						<div class="stat-item">
							<div class="stat-value">{{ userInfo.points }}</div>
							<div class="stat-label">积分</div>
						</div>
						<div class="stat-item">
							<div class="stat-value">{{ userInfo.level }}</div>
							<div class="stat-label">等级</div>
						</div>
					</div>
				</div>
			</div>

			<!-- 数据概览 -->
			<div class="data-overview">
				<h4 class="section-title">数据概览</h4>
				<div class="data-grid">
					<div
						class="data-card"
						v-for="item in dataCards"
						:key="item.id"
					>
						<div
							class="data-icon"
							:style="{ background: item.color }"
						>
							<van-icon :name="item.icon" />
						</div>
						<div class="data-content">
							<div class="data-value">{{ item.value }}</div>
							<div class="data-label">{{ item.label }}</div>
							<div
								class="data-trend"
								:class="item.trend"
							>
								<van-icon :name="item.trend === 'up' ? 'arrow-up' : 'arrow-down'" />
								<span>{{ item.change }}</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- 快捷操作 -->
			<div class="quick-actions">
				<h4 class="section-title">快捷操作</h4>
				<div class="actions-grid">
					<div
						class="action-item"
						v-for="action in quickActions"
						:key="action.id"
						@click="handleActionClick(action)"
					>
						<div
							class="action-icon"
							:style="{ background: action.gradient }"
						>
							<van-icon :name="action.icon" />
						</div>
						<span class="action-label">{{ action.label }}</span>
					</div>
				</div>
			</div>

			<!-- 最近活动 -->
			<div class="recent-activity">
				<h4 class="section-title">最近活动</h4>
				<div class="activity-list">
					<div
						class="activity-item"
						v-for="activity in recentActivities"
						:key="activity.id"
					>
						<div
							class="activity-icon"
							:style="{ background: activity.color }"
						>
							<van-icon :name="activity.icon" />
						</div>
						<div class="activity-content">
							<div class="activity-title">{{ activity.title }}</div>
							<div class="activity-desc">{{ activity.description }}</div>
							<div class="activity-time">{{ activity.time }}</div>
						</div>
						<div
							class="activity-status"
							:class="activity.status"
						>
							{{ activity.statusText }}
						</div>
					</div>
				</div>
			</div>

			<!-- 图表区域 -->
			<div class="chart-section">
				<h4 class="section-title">趋势分析</h4>
				<div class="chart-container">
					<div class="chart-placeholder">
						<div class="chart-lines">
							<div
								class="chart-line"
								v-for="i in 6"
								:key="i"
								:style="{ height: Math.random() * 100 + 20 + 'px' }"
							></div>
						</div>
						<div class="chart-info">
							<div class="chart-value">+24.5%</div>
							<div class="chart-label">本月增长</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- 底部导航占位 -->
		<div class="bottom-spacer"></div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { showToast } from 'vant';

// 响应式数据
const currentTime = ref('');
const batteryLevel = ref(85);

const userInfo = ref({
	name: '张三',
	role: '高级用户',
	points: '12,580',
	level: 'VIP 5',
});

const dataCards = ref([
	{
		id: 1,
		icon: 'chart-trending-o',
		label: '总收益',
		value: '¥25,680',
		change: '+12.5%',
		trend: 'up',
		color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
	},
	{
		id: 2,
		icon: 'friends-o',
		label: '用户数',
		value: '1,234',
		change: '+8.2%',
		trend: 'up',
		color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
	},
	{
		id: 3,
		icon: 'shopping-cart-o',
		label: '订单量',
		value: '856',
		change: '-2.1%',
		trend: 'down',
		color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
	},
	{
		id: 4,
		icon: 'star-o',
		label: '评分',
		value: '4.8',
		change: '+0.3',
		trend: 'up',
		color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
	},
]);

const quickActions = ref([
	{
		id: 1,
		icon: 'add-o',
		label: '新建',
		gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
	},
	{
		id: 2,
		icon: 'scan',
		label: '扫码',
		gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
	},
	{
		id: 3,
		icon: 'share-o',
		label: '分享',
		gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
	},
	{
		id: 4,
		icon: 'setting-o',
		label: '设置',
		gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
	},
	{
		id: 5,
		icon: 'search',
		label: '搜索',
		gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
	},
	{
		id: 6,
		icon: 'more-o',
		label: '更多',
		gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
	},
]);

const recentActivities = ref([
	{
		id: 1,
		icon: 'shopping-cart-o',
		title: '新订单',
		description: '用户下单购买商品',
		time: '2分钟前',
		status: 'success',
		statusText: '已完成',
		color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
	},
	{
		id: 2,
		icon: 'user-o',
		title: '用户注册',
		description: '新用户注册成功',
		time: '5分钟前',
		status: 'pending',
		statusText: '待审核',
		color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
	},
	{
		id: 3,
		icon: 'comment-o',
		title: '用户评价',
		description: '收到5星好评',
		time: '10分钟前',
		status: 'success',
		statusText: '已回复',
		color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
	},
]);

// 更新时间
const updateTime = () => {
	const now = new Date();
	currentTime.value = now.toLocaleTimeString('zh-CN', {
		hour12: false,
		hour: '2-digit',
		minute: '2-digit',
	});
};

// 处理快捷操作点击
const handleActionClick = (action: any) => {
	showToast(`点击了${action.label}`);
};

// 定时器
let timeInterval: number;

onMounted(() => {
	updateTime();
	timeInterval = setInterval(updateTime, 1000);
});

onUnmounted(() => {
	if (timeInterval) {
		clearInterval(timeInterval);
	}
});
</script>

<style scoped>
.modern-dashboard {
	min-height: 100vh;
	background: linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%);
	padding-bottom: 80px;
}

/* 状态栏 */
.status-bar {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 12px 20px 8px;
	background: rgba(255, 255, 255, 0.9);
	backdrop-filter: blur(10px);
}

.status-left .time {
	font-size: 16px;
	font-weight: 600;
	color: #1a202c;
}

.status-right {
	display: flex;
	align-items: center;
	gap: 8px;
}

.status-icon {
	font-size: 16px;
	color: #4a5568;
}

.battery {
	width: 24px;
	height: 12px;
	border: 1px solid #4a5568;
	border-radius: 2px;
	position: relative;
}

.battery::after {
	content: '';
	position: absolute;
	right: -3px;
	top: 3px;
	width: 2px;
	height: 6px;
	background: #4a5568;
	border-radius: 0 1px 1px 0;
}

.battery-level {
	height: 100%;
	background: linear-gradient(90deg, #48bb78 0%, #38a169 100%);
	border-radius: 1px;
	transition: width 0.3s ease;
}

/* 主要内容 */
.dashboard-content {
	padding: 0 20px;
}

/* 用户卡片 */
.user-card {
	margin-bottom: 24px;
}

.user-bg {
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	border-radius: 20px;
	padding: 24px;
	color: white;
	position: relative;
	overflow: hidden;
}

.user-bg::before {
	content: '';
	position: absolute;
	top: -50%;
	right: -20%;
	width: 200px;
	height: 200px;
	background: rgba(255, 255, 255, 0.1);
	border-radius: 50%;
}

.user-info {
	display: flex;
	align-items: center;
	margin-bottom: 20px;
	position: relative;
	z-index: 1;
}

.avatar-wrapper {
	position: relative;
	margin-right: 16px;
}

.user-avatar {
	width: 60px;
	height: 60px;
	border-radius: 50%;
	border: 3px solid rgba(255, 255, 255, 0.3);
}

.online-dot {
	position: absolute;
	bottom: 2px;
	right: 2px;
	width: 16px;
	height: 16px;
	background: #48bb78;
	border-radius: 50%;
	border: 2px solid white;
}

.username {
	font-size: 20px;
	font-weight: 600;
	margin: 0 0 4px 0;
}

.user-role {
	font-size: 14px;
	opacity: 0.8;
	margin: 0;
}

.user-stats {
	display: flex;
	gap: 32px;
	position: relative;
	z-index: 1;
}

.stat-item {
	text-align: center;
}

.stat-value {
	font-size: 24px;
	font-weight: 700;
	margin-bottom: 4px;
}

.stat-label {
	font-size: 12px;
	opacity: 0.8;
}

/* 章节标题 */
.section-title {
	font-size: 18px;
	font-weight: 600;
	color: #1a202c;
	margin: 0 0 16px 0;
}

/* 数据概览 */
.data-overview {
	margin-bottom: 32px;
}

.data-grid {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 16px;
}

.data-card {
	background: white;
	border-radius: 16px;
	padding: 20px;
	box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
	display: flex;
	align-items: center;
}

.data-icon {
	width: 48px;
	height: 48px;
	border-radius: 12px;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 12px;
}

.data-icon .van-icon {
	font-size: 24px;
	color: white;
}

.data-content {
	flex: 1;
}

.data-value {
	font-size: 20px;
	font-weight: 700;
	color: #1a202c;
	margin-bottom: 4px;
}

.data-label {
	font-size: 12px;
	color: #718096;
	margin-bottom: 4px;
}

.data-trend {
	display: flex;
	align-items: center;
	font-size: 12px;
	font-weight: 600;
}

.data-trend.up {
	color: #48bb78;
}

.data-trend.down {
	color: #f56565;
}

.data-trend .van-icon {
	font-size: 12px;
	margin-right: 2px;
}

/* 快捷操作 */
.quick-actions {
	margin-bottom: 32px;
}

.actions-grid {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 16px;
}

.action-item {
	background: white;
	border-radius: 16px;
	padding: 20px;
	text-align: center;
	box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
	cursor: pointer;
	transition: transform 0.2s ease;
}

.action-item:active {
	transform: scale(0.95);
}

.action-icon {
	width: 48px;
	height: 48px;
	border-radius: 12px;
	display: flex;
	align-items: center;
	justify-content: center;
	margin: 0 auto 12px;
}

.action-icon .van-icon {
	font-size: 24px;
	color: white;
}

.action-label {
	font-size: 14px;
	color: #4a5568;
	font-weight: 500;
}

/* 最近活动 */
.recent-activity {
	margin-bottom: 32px;
}

.activity-list {
	background: white;
	border-radius: 16px;
	overflow: hidden;
	box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.activity-item {
	display: flex;
	align-items: center;
	padding: 16px 20px;
	border-bottom: 1px solid #f7fafc;
}

.activity-item:last-child {
	border-bottom: none;
}

.activity-icon {
	width: 40px;
	height: 40px;
	border-radius: 10px;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 12px;
}

.activity-icon .van-icon {
	font-size: 20px;
	color: white;
}

.activity-content {
	flex: 1;
}

.activity-title {
	font-size: 16px;
	font-weight: 600;
	color: #1a202c;
	margin-bottom: 4px;
}

.activity-desc {
	font-size: 14px;
	color: #718096;
	margin-bottom: 4px;
}

.activity-time {
	font-size: 12px;
	color: #a0aec0;
}

.activity-status {
	font-size: 12px;
	padding: 4px 8px;
	border-radius: 6px;
	font-weight: 500;
}

.activity-status.success {
	background: #f0fff4;
	color: #38a169;
}

.activity-status.pending {
	background: #fffaf0;
	color: #d69e2e;
}

/* 图表区域 */
.chart-section {
	margin-bottom: 32px;
}

.chart-container {
	background: white;
	border-radius: 16px;
	padding: 24px;
	box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.chart-placeholder {
	display: flex;
	align-items: end;
	justify-content: space-between;
	height: 120px;
	margin-bottom: 16px;
}

.chart-lines {
	display: flex;
	align-items: end;
	gap: 8px;
	flex: 1;
}

.chart-line {
	width: 20px;
	background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
	border-radius: 4px 4px 0 0;
	animation: chartGrow 1s ease-out;
}

.chart-info {
	text-align: right;
	margin-left: 20px;
}

.chart-value {
	font-size: 24px;
	font-weight: 700;
	color: #48bb78;
	margin-bottom: 4px;
}

.chart-label {
	font-size: 14px;
	color: #718096;
}

.bottom-spacer {
	height: 20px;
}

/* 动画 */
@keyframes chartGrow {
	from {
		height: 0;
	}
	to {
		height: var(--final-height);
	}
}

/* 响应式 */
@media (max-width: 375px) {
	.dashboard-content {
		padding: 0 16px;
	}

	.actions-grid {
		grid-template-columns: repeat(2, 1fr);
	}
}
</style>
