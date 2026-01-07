<template>
	<div class="modern-profile">
		<!-- 头部背景 -->
		<div class="profile-header">
			<div class="header-bg">
				<div class="bg-pattern"></div>
				<div class="bg-overlay"></div>
			</div>

			<!-- 用户信息 -->
			<div class="user-section">
				<div class="avatar-container">
					<div class="avatar-wrapper">
						<img
							src="https://via.placeholder.com/80x80/409eff/ffffff?text=A"
							alt="avatar"
							class="user-avatar"
						/>
						<div class="avatar-border"></div>
						<div
							class="edit-btn"
							@click="handleEditAvatar"
						>
							<van-icon name="photograph" />
						</div>
					</div>
				</div>

				<div class="user-info">
					<h2 class="username">{{ userProfile.name }}</h2>
					<p class="user-id">ID: {{ userProfile.id }}</p>
					<div class="user-badges">
						<span class="badge vip">VIP</span>
						<span class="badge verified">已认证</span>
					</div>
				</div>
			</div>
		</div>

		<!-- 统计卡片 -->
		<div class="stats-section">
			<div class="stats-container">
				<div
					class="stat-card"
					v-for="stat in userStats"
					:key="stat.key"
				>
					<div class="stat-value">{{ stat.value }}</div>
					<div class="stat-label">{{ stat.label }}</div>
				</div>
			</div>
		</div>

		<!-- 功能菜单 -->
		<div class="menu-section">
			<!-- 账户管理 -->
			<div class="menu-group">
				<h3 class="group-title">账户管理</h3>
				<div class="menu-list">
					<div
						class="menu-item"
						v-for="item in accountMenus"
						:key="item.key"
						@click="handleMenuClick(item)"
					>
						<div
							class="menu-icon"
							:style="{ background: item.color }"
						>
							<van-icon :name="item.icon" />
						</div>
						<div class="menu-content">
							<div class="menu-title">{{ item.title }}</div>
							<div class="menu-desc">{{ item.desc }}</div>
						</div>
						<div class="menu-arrow">
							<van-icon name="arrow" />
						</div>
					</div>
				</div>
			</div>

			<!-- 应用设置 -->
			<div class="menu-group">
				<h3 class="group-title">应用设置</h3>
				<div class="menu-list">
					<div
						class="menu-item"
						v-for="item in settingMenus"
						:key="item.key"
						@click="handleMenuClick(item)"
					>
						<div
							class="menu-icon"
							:style="{ background: item.color }"
						>
							<van-icon :name="item.icon" />
						</div>
						<div class="menu-content">
							<div class="menu-title">{{ item.title }}</div>
							<div class="menu-desc">{{ item.desc }}</div>
						</div>
						<div class="menu-extra">
							<van-switch
								v-if="item.type === 'switch'"
								v-model="item.value"
								size="20px"
								@change="handleSwitchChange(item)"
							/>
							<van-icon
								v-else
								name="arrow"
							/>
						</div>
					</div>
				</div>
			</div>

			<!-- 其他功能 -->
			<div class="menu-group">
				<h3 class="group-title">其他</h3>
				<div class="menu-list">
					<div
						class="menu-item"
						v-for="item in otherMenus"
						:key="item.key"
						@click="handleMenuClick(item)"
					>
						<div
							class="menu-icon"
							:style="{ background: item.color }"
						>
							<van-icon :name="item.icon" />
						</div>
						<div class="menu-content">
							<div class="menu-title">{{ item.title }}</div>
							<div class="menu-desc">{{ item.desc }}</div>
						</div>
						<div class="menu-arrow">
							<van-icon name="arrow" />
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- 退出登录 -->
		<div class="logout-section">
			<van-button
				type="danger"
				block
				round
				class="logout-btn"
				@click="handleLogout"
			>
				退出登录
			</van-button>
		</div>

		<!-- 版本信息 -->
		<div class="version-info">
			<p>版本 v{{ appVersion }}</p>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { showToast, showConfirmDialog } from 'vant';

// 用户资料
const userProfile = ref({
	name: '张小明',
	id: '1234567890',
	avatar: '',
});

// 用户统计
const userStats = ref([
	{ key: 'points', label: '积分', value: '12,580' },
	{ key: 'orders', label: '订单', value: '156' },
	{ key: 'coupons', label: '优惠券', value: '8' },
	{ key: 'favorites', label: '收藏', value: '23' },
]);

// 账户管理菜单
const accountMenus = ref([
	{
		key: 'personal-info',
		title: '个人信息',
		desc: '管理您的个人资料',
		icon: 'user-o',
		color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
	},
	{
		key: 'security',
		title: '账户安全',
		desc: '密码、手机号等安全设置',
		icon: 'shield-o',
		color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
	},
	{
		key: 'payment',
		title: '支付管理',
		desc: '银行卡、支付方式管理',
		icon: 'credit-card',
		color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
	},
	{
		key: 'address',
		title: '收货地址',
		desc: '管理您的收货地址',
		icon: 'location-o',
		color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
	},
]);

// 应用设置菜单
const settingMenus = ref([
	{
		key: 'notifications',
		title: '消息通知',
		desc: '推送、短信等通知设置',
		icon: 'bell',
		color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
		type: 'switch',
		value: true,
	},
	{
		key: 'privacy',
		title: '隐私设置',
		desc: '个人信息可见性设置',
		icon: 'eye-o',
		color: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
	},
	{
		key: 'language',
		title: '语言设置',
		desc: '选择应用显示语言',
		icon: 'globe',
		color: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)',
	},
	{
		key: 'theme',
		title: '主题模式',
		desc: '浅色/深色主题切换',
		icon: 'sun-o',
		color: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
		type: 'switch',
		value: false,
	},
]);

// 其他功能菜单
const otherMenus = ref([
	{
		key: 'help',
		title: '帮助中心',
		desc: '常见问题与使用指南',
		icon: 'question-o',
		color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
	},
	{
		key: 'feedback',
		title: '意见反馈',
		desc: '向我们提出宝贵建议',
		icon: 'comment-o',
		color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
	},
	{
		key: 'about',
		title: '关于我们',
		desc: '了解更多应用信息',
		icon: 'info-o',
		color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
	},
]);

const appVersion = ref('2.1.0');

// 处理头像编辑
const handleEditAvatar = () => {
	showToast('编辑头像');
};

// 处理菜单点击
const handleMenuClick = (item: any) => {
	if (item.type === 'switch') return;
	showToast(`点击了${item.title}`);
};

// 处理开关切换
const handleSwitchChange = (item: any) => {
	showToast(`${item.title}: ${item.value ? '开启' : '关闭'}`);
};

// 处理退出登录
const handleLogout = async () => {
	try {
		await showConfirmDialog({
			title: '确认退出',
			message: '确定要退出登录吗？',
			confirmButtonText: '退出',
			cancelButtonText: '取消',
		});

		showToast.success('已退出登录');
	} catch {
		// 用户取消
	}
};
</script>

<style scoped>
.modern-profile {
	min-height: 100vh;
	background: #f8fafc;
	padding-bottom: 40px;
}

/* 头部区域 */
.profile-header {
	position: relative;
	height: 280px;
	overflow: hidden;
}

.header-bg {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.bg-pattern {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-image:
		radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
		radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
		radial-gradient(circle at 40% 60%, rgba(255, 255, 255, 0.05) 0%, transparent 50%);
}

.bg-overlay {
	position: absolute;
	bottom: 0;
	left: 0;
	width: 100%;
	height: 60px;
	background: linear-gradient(180deg, transparent 0%, rgba(248, 250, 252, 0.8) 100%);
}

.user-section {
	position: relative;
	z-index: 2;
	padding: 60px 24px 0;
	text-align: center;
}

.avatar-container {
	margin-bottom: 20px;
}

.avatar-wrapper {
	position: relative;
	display: inline-block;
}

.user-avatar {
	width: 80px;
	height: 80px;
	border-radius: 50%;
	border: 4px solid rgba(255, 255, 255, 0.3);
}

.avatar-border {
	position: absolute;
	top: -4px;
	left: -4px;
	width: 88px;
	height: 88px;
	border-radius: 50%;
	border: 2px solid rgba(255, 255, 255, 0.5);
	animation: avatarGlow 2s ease-in-out infinite;
}

.edit-btn {
	position: absolute;
	bottom: 0;
	right: 0;
	width: 28px;
	height: 28px;
	background: #409eff;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	border: 2px solid white;
	cursor: pointer;
	transition: transform 0.2s ease;
}

.edit-btn:active {
	transform: scale(0.9);
}

.edit-btn .van-icon {
	font-size: 14px;
	color: white;
}

.user-info {
	color: white;
}

.username {
	font-size: 24px;
	font-weight: 700;
	margin: 0 0 8px 0;
	text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.user-id {
	font-size: 14px;
	opacity: 0.8;
	margin: 0 0 16px 0;
}

.user-badges {
	display: flex;
	justify-content: center;
	gap: 8px;
}

.badge {
	padding: 4px 12px;
	border-radius: 12px;
	font-size: 12px;
	font-weight: 600;
}

.badge.vip {
	background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
	color: #8b5a00;
}

.badge.verified {
	background: rgba(255, 255, 255, 0.2);
	color: white;
	border: 1px solid rgba(255, 255, 255, 0.3);
}

/* 统计区域 */
.stats-section {
	padding: 0 24px;
	margin-top: -40px;
	position: relative;
	z-index: 3;
}

.stats-container {
	background: white;
	border-radius: 20px;
	padding: 24px;
	box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	gap: 16px;
}

.stat-card {
	text-align: center;
}

.stat-value {
	font-size: 20px;
	font-weight: 700;
	color: #1a202c;
	margin-bottom: 4px;
}

.stat-label {
	font-size: 12px;
	color: #718096;
}

/* 菜单区域 */
.menu-section {
	padding: 32px 24px 0;
}

.menu-group {
	margin-bottom: 24px;
}

.group-title {
	font-size: 16px;
	font-weight: 600;
	color: #4a5568;
	margin: 0 0 12px 0;
	padding-left: 4px;
}

.menu-list {
	background: white;
	border-radius: 16px;
	overflow: hidden;
	box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

.menu-item {
	display: flex;
	align-items: center;
	padding: 16px 20px;
	border-bottom: 1px solid #f7fafc;
	cursor: pointer;
	transition: background-color 0.2s ease;
}

.menu-item:last-child {
	border-bottom: none;
}

.menu-item:active {
	background-color: #f8fafc;
}

.menu-icon {
	width: 40px;
	height: 40px;
	border-radius: 10px;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 16px;
}

.menu-icon .van-icon {
	font-size: 20px;
	color: white;
}

.menu-content {
	flex: 1;
}

.menu-title {
	font-size: 16px;
	font-weight: 500;
	color: #1a202c;
	margin-bottom: 2px;
}

.menu-desc {
	font-size: 13px;
	color: #718096;
}

.menu-arrow,
.menu-extra {
	color: #cbd5e0;
}

.menu-extra .van-switch {
	--van-switch-on-background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* 退出登录 */
.logout-section {
	padding: 24px;
}

.logout-btn {
	height: 48px;
	background: linear-gradient(135deg, #f56565 0%, #e53e3e 100%);
	border: none;
	font-size: 16px;
	font-weight: 600;
}

/* 版本信息 */
.version-info {
	text-align: center;
	padding: 16px;
}

.version-info p {
	font-size: 12px;
	color: #a0aec0;
	margin: 0;
}

/* 动画 */
@keyframes avatarGlow {
	0%,
	100% {
		opacity: 0.5;
		transform: scale(1);
	}
	50% {
		opacity: 0.8;
		transform: scale(1.05);
	}
}

/* 响应式 */
@media (max-width: 375px) {
	.stats-container {
		grid-template-columns: repeat(2, 1fr);
		gap: 20px;
	}

	.menu-section {
		padding: 24px 16px 0;
	}

	.logout-section {
		padding: 16px;
	}
}
</style>
