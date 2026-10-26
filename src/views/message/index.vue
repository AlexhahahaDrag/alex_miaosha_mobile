<template>
	<div
		class="message-center-page"
		data-testid="mobile-message-center"
	>
		<!-- 顶部智能提醒概览与工具栏 -->
		<section class="summary-hero-card">
			<div class="hero-top-row">
				<div class="hero-title-group">
					<div class="hero-title">
						消息与到期提醒
						<span
							v-if="summary.unreadTotal > 0"
							class="unread-total-pill"
							data-testid="mobile-message-unread-total"
						>
							{{ summary.unreadTotal }} 条未读
						</span>
					</div>
					<p class="hero-subtitle">礼金事件 · 消费券 · 猫超卡包到期提醒</p>
				</div>
				<div class="hero-actions">
					<button
						type="button"
						class="action-chip"
						data-testid="mobile-message-btn-notice-config"
						@click="showNoticeConfig = true"
					>
						<van-icon name="setting-o" />
						<span>偏好</span>
					</button>
					<button
						type="button"
						class="action-chip primary"
						data-testid="mobile-message-btn-read-all"
						:disabled="summary.unreadTotal <= 0"
						@click="handleMarkAllRead"
					>
						<van-icon name="passed" />
						<span>全部已读</span>
					</button>
				</div>
			</div>

			<!-- 分类胶囊筛选栏 -->
			<div class="category-pills-row">
				<button
					v-for="tab in MESSAGE_CATEGORY_TABS"
					:key="tab.key"
					type="button"
					class="category-pill"
					:class="{ active: activeTab === tab.key }"
					:data-testid="`mobile-message-tab-${tab.key}`"
					@click="handleSelectTab(tab.key)"
				>
					<van-icon :name="tab.icon" />
					<span>{{ tab.label }}</span>
					<span
						v-if="getTabUnreadCount(tab.summaryField) > 0"
						class="pill-badge"
					>
						{{ getTabUnreadCount(tab.summaryField) }}
					</span>
				</button>
			</div>

			<!-- 搜索与仅看未读开关 -->
			<div class="filter-bar-row">
				<van-search
					v-model="keyword"
					placeholder="搜索事件、消费券或卡名称..."
					shape="round"
					clearable
					class="msg-search-input"
					@search="handleFilterChange"
					@clear="handleFilterChange"
				/>
				<button
					type="button"
					class="unread-toggle-btn"
					:class="{ active: onlyUnread }"
					data-testid="mobile-message-toggle-unread"
					@click="toggleOnlyUnread"
				>
					<span class="dot"></span>
					<span>仅未读</span>
				</button>
			</div>
		</section>

		<!-- 消息列表区 -->
		<van-pull-refresh
			v-model="refreshing"
			@refresh="onRefresh"
		>
			<van-list
				v-model:loading="loading"
				:finished="finished"
				finished-text="没有更多消息了"
				@load="onLoad"
			>
				<div
					v-if="messageList.length > 0"
					class="message-card-list"
					data-testid="mobile-message-list"
				>
					<van-swipe-cell
						v-for="item in messageList"
						:key="item.id"
						class="message-swipe-item"
					>
						<div
							class="message-card"
							:class="{
								'is-unread': item.readStatus === 0,
								'priority-high': item.priority === 'HIGH',
							}"
							:data-testid="`mobile-message-item-${item.id}`"
							@click="handleClickMessage(item)"
						>
							<div class="card-header">
								<div class="badge-group">
									<span
										class="type-badge"
										:style="{
											color: resolveMessageBadgeMeta(item).color,
											backgroundColor: resolveMessageBadgeMeta(item).bgColor,
										}"
									>
										<van-icon :name="resolveMessageBadgeMeta(item).icon" />
										{{ resolveMessageBadgeMeta(item).text }}
									</span>
									<span
										v-if="item.readStatus === 0"
										class="unread-dot"
										title="未读"
									></span>
								</div>
								<span class="msg-time">{{ formatDisplayTime(item.createTime || item.remindDate) }}</span>
							</div>

							<h3 class="msg-title">{{ item.title }}</h3>
							<p class="msg-content">{{ item.content }}</p>

							<div class="card-footer">
								<span class="remind-date-tag">
									<van-icon name="clock-o" />
									提醒日期：{{ formatDate(item.remindDate || item.createTime) || '--' }}
								</span>
								<span
									v-if="resolveMobileMessageJumpRoute(item)"
									class="jump-link"
									:data-testid="`mobile-message-jump-${item.id}`"
								>
									去处理
									<van-icon name="arrow" />
								</span>
							</div>
						</div>

						<template #right>
							<div class="swipe-actions">
								<van-button
									v-if="item.readStatus === 0"
									square
									type="primary"
									text="标为已读"
									class="swipe-btn"
									:data-testid="`mobile-message-read-${item.id}`"
									@click.stop="handleMarkSingleRead(item)"
								/>
								<van-button
									square
									type="danger"
									text="删除"
									class="swipe-btn"
									:data-testid="`mobile-message-delete-${item.id}`"
									@click.stop="handleDeleteMessage(item)"
								/>
							</div>
						</template>
					</van-swipe-cell>
				</div>

				<van-empty
					v-else-if="!loading"
					image="search"
					:description="onlyUnread ? '太棒了，当前暂无未读提醒' : '暂无相关消息通知'"
					data-testid="mobile-message-empty"
				/>
			</van-list>
		</van-pull-refresh>

		<!-- 发布自定义系统提醒弹窗 -->
		<van-popup
			v-model:show="publishVisible"
			position="bottom"
			round
			class="publish-popup"
		>
			<div class="popup-header">
				<span class="popup-title">新增系统提醒 / 备忘通知</span>
				<van-icon
					name="cross"
					class="close-icon"
					@click="publishVisible = false"
				/>
			</div>
			<div class="popup-body">
				<van-field
					v-model="publishForm.title"
					label="提醒标题"
					placeholder="例如：周末整理猫超卡与消费券"
					maxlength="60"
					show-word-limit
					required
					data-testid="mobile-message-input-title"
				/>
				<van-field
					v-model="publishForm.content"
					label="提醒内容"
					type="textarea"
					rows="3"
					autosize
					placeholder="请输入详细提醒内容..."
					maxlength="300"
					show-word-limit
					required
					data-testid="mobile-message-input-content"
				/>
				<div class="priority-selector">
					<span class="field-label">重要程度</span>
					<div class="priority-options">
						<button
							v-for="opt in priorityOptions"
							:key="opt.value"
							type="button"
							class="priority-chip"
							:class="{ active: publishForm.priority === opt.value }"
							@click="publishForm.priority = opt.value"
						>
							{{ opt.label }}
						</button>
					</div>
				</div>
				<div class="popup-footer">
					<van-button
						block
						round
						type="primary"
						:loading="publishing"
						data-testid="mobile-message-submit-publish"
						@click="handleSubmitPublish"
					>
						立即发布提醒
					</van-button>
				</div>
			</div>
		</van-popup>

		<!-- 通知偏好设置抽屉 -->
		<user-notice-config-popup
			v-model="showNoticeConfig"
			@saved="loadSummary"
		/>
	</div>
</template>

<script setup lang="ts">
import { showConfirmDialog, showFailToast, showSuccessToast } from 'vant';
import UserNoticeConfigPopup from '@/views/message/components/UserNoticeConfigPopup.vue';
import { useNavBar, type NavBarConfig } from '@/composables/useNavBar';
import { useTabBar } from '@/composables/useTabBar';
import { useTabBarStore } from '@/store/modules/tabbar';
import { formatDate, getFormatTimeInfo } from '@/utils/dayjs';
import {
	deleteSysMessages,
	getSysMessagePage,
	getSysMessageSummary,
	markAllSysMessageRead,
	markSysMessageRead,
	publishSysMessage,
} from '@/views/message/api';
import {
	MESSAGE_CATEGORY_TABS,
	resolveMessageBadgeMeta,
	resolveMobileMessageJumpRoute,
	type MessagePriority,
	type MessageType,
	type SysMessageInfoData,
	type SysMessageSummaryData,
} from '@/views/message/config';

const router = useRouter();
const tabBarStore = useTabBarStore();

const triggerHaptic = (duration: number = 15) => {
	if (typeof navigator !== 'undefined' && navigator.vibrate) {
		navigator.vibrate(duration);
	}
};

const activeTab = ref<MessageType>('ALL');
const onlyUnread = ref<boolean>(false);
const keyword = ref<string>('');
const showNoticeConfig = ref<boolean>(false);

const messageList = ref<SysMessageInfoData[]>([]);
const loading = ref<boolean>(false);
const finished = ref<boolean>(false);
const refreshing = ref<boolean>(false);
const pageNum = ref<number>(1);
const pageSize = 10;

const summary = ref<SysMessageSummaryData>({
	unreadTotal: 0,
	systemUnread: 0,
	giftEventUnread: 0,
	couponExpireUnread: 0,
	cardExpireUnread: 0,
});

const publishVisible = ref<boolean>(false);
const publishing = ref<boolean>(false);
const publishForm = ref<{
	title: string;
	content: string;
	priority: MessagePriority;
}>({
	title: '',
	content: '',
	priority: 'NORMAL',
});

const priorityOptions: { label: string; value: MessagePriority }[] = [
	{ label: '普通通知', value: 'NORMAL' },
	{ label: '重要提醒', value: 'MEDIUM' },
	{ label: '紧急预警', value: 'HIGH' },
];

const openPublishPopup = () => {
	triggerHaptic(15);
	publishForm.value = {
		title: '',
		content: '',
		priority: 'NORMAL',
	};
	publishVisible.value = true;
};

const info = ref<Pick<NavBarConfig, 'title' | 'rightButton' | 'leftPath'>>({
	title: '消息中心',
	rightButton: '新增提醒',
	leftPath: '/dashboard',
});

useNavBar({
	title: info.value.title,
	rightButton: info.value.rightButton,
	noShowLeft: true,
	showRight: true,
	visible: true,
	onRightClick: openPublishPopup,
});

useTabBar({
	visible: true,
	data: [
		{ name: 'dashboard', title: '首页', icon: 'homepage' },
		{ name: 'message', title: '消息', icon: 'message' },
		{ name: 'myself', title: '我的', icon: 'user' },
	],
	active: 1,
});

const getTabUnreadCount = (field?: keyof SysMessageSummaryData): number => {
	if (!field) return 0;
	return Number(summary.value[field] || 0);
};

const formatDisplayTime = (timeStr?: string): string => {
	if (!timeStr) return '--';
	return getFormatTimeInfo(timeStr);
};

const loadSummary = async () => {
	try {
		const { code, data } = await getSysMessageSummary();
		if (code == '200' && data) {
			summary.value = {
				unreadTotal: Number(data.unreadTotal || 0),
				systemUnread: Number(data.systemUnread || 0),
				giftEventUnread: Number(data.giftEventUnread || 0),
				couponExpireUnread: Number(data.couponExpireUnread || 0),
				cardExpireUnread: Number(data.cardExpireUnread || 0),
			};
			tabBarStore.setTabBadge('message', summary.value.unreadTotal);
		}
	} catch (error) {
		console.error('加载消息汇总失败:', error);
	}
};

const fetchMessagePage = async (isReset: boolean = false) => {
	if (isReset) {
		pageNum.value = 1;
		finished.value = false;
	}
	loading.value = true;
	try {
		const queryParams: Partial<SysMessageInfoData> = {
			msgType: activeTab.value === 'ALL' ? undefined : activeTab.value,
			onlyUnread: onlyUnread.value ? true : undefined,
			keyword: keyword.value.trim() || undefined,
		};
		const { code, data, message } = await getSysMessagePage(queryParams, pageNum.value, pageSize);
		if (code == '200' && data) {
			const records = data.records || [];
			if (isReset) {
				messageList.value = records;
			} else {
				messageList.value.push(...records);
			}
			const total = Number(data.total || 0);
			if (messageList.value.length >= total || records.length < pageSize) {
				finished.value = true;
			} else {
				pageNum.value += 1;
			}
		} else {
			finished.value = true;
			showFailToast(message || '获取消息列表失败');
		}
	} catch (error) {
		console.error('查询消息分页失败:', error);
		finished.value = true;
	} finally {
		loading.value = false;
		refreshing.value = false;
	}
};

const onLoad = async () => {
	await fetchMessagePage(false);
};

const onRefresh = async () => {
	await Promise.all([loadSummary(), fetchMessagePage(true)]);
};

const handleSelectTab = async (tabKey: MessageType) => {
	if (activeTab.value === tabKey) return;
	triggerHaptic(12);
	activeTab.value = tabKey;
	await fetchMessagePage(true);
};

const toggleOnlyUnread = async () => {
	triggerHaptic(12);
	onlyUnread.value = !onlyUnread.value;
	await fetchMessagePage(true);
};

const handleFilterChange = async () => {
	await fetchMessagePage(true);
};

const handleMarkSingleRead = async (item: SysMessageInfoData) => {
	if (!item.id || item.readStatus === 1) return;
	triggerHaptic(15);
	try {
		const { code, message } = await markSysMessageRead(item.id);
		if (code == '200') {
			item.readStatus = 1;
			await loadSummary();
			if (onlyUnread.value) {
				messageList.value = messageList.value.filter((m) => m.id !== item.id);
			}
		} else {
			showFailToast(message || '标记已读失败');
		}
	} catch (error) {
		console.error('标记已读失败:', error);
	}
};

const handleMarkAllRead = async () => {
	if (summary.value.unreadTotal <= 0) return;
	triggerHaptic(20);
	try {
		const targetType = activeTab.value === 'ALL' ? undefined : activeTab.value;
		const { code, message } = await markAllSysMessageRead(targetType);
		if (code == '200') {
			showSuccessToast('已全部标为已读');
			await Promise.all([loadSummary(), fetchMessagePage(true)]);
		} else {
			showFailToast(message || '操作失败');
		}
	} catch (error) {
		console.error('全部标为已读失败:', error);
	}
};

const handleDeleteMessage = async (item: SysMessageInfoData) => {
	if (!item.id) return;
	triggerHaptic(20);
	try {
		await showConfirmDialog({
			title: '删除消息',
			message: '删除后该到期提醒将不再重复弹出，确定删除吗？',
		});
		const { code, message } = await deleteSysMessages(item.id);
		if (code == '200') {
			showSuccessToast('已删除');
			messageList.value = messageList.value.filter((m) => m.id !== item.id);
			await loadSummary();
		} else {
			showFailToast(message || '删除失败');
		}
	} catch {
		// 用户取消删除
	}
};

const handleClickMessage = async (item: SysMessageInfoData) => {
	triggerHaptic(15);
	if (item.id && item.readStatus === 0) {
		await handleMarkSingleRead(item);
	}
	const targetRoute = resolveMobileMessageJumpRoute(item);
	if (targetRoute) {
		router.push(targetRoute);
	}
};

const handleSubmitPublish = async () => {
	const title = publishForm.value.title.trim();
	const content = publishForm.value.content.trim();
	if (!title || !content) {
		showFailToast('请填写提醒标题和内容');
		return;
	}
	triggerHaptic(20);
	publishing.value = true;
	try {
		const { code, message } = await publishSysMessage({
			title,
			content,
			priority: publishForm.value.priority,
			msgType: 'SYSTEM',
			subType: 'ANNOUNCE',
		});
		if (code == '200') {
			showSuccessToast('发布成功');
			publishVisible.value = false;
			await Promise.all([loadSummary(), fetchMessagePage(true)]);
		} else {
			showFailToast(message || '发布失败');
		}
	} catch (error) {
		console.error('发布系统提醒失败:', error);
		showFailToast('发布失败');
	} finally {
		publishing.value = false;
	}
};

const init = async () => {
	await Promise.all([loadSummary(), fetchMessagePage(true)]);
};

onMounted(() => {
	init();
});
</script>

<style lang="less" scoped>
.message-center-page {
	min-height: calc(100vh - 96px);
	background: #f6f7fb;
	padding: 12px 14px 86px;
	box-sizing: border-box;
}

.summary-hero-card {
	background: linear-gradient(135deg, #ffffff 0%, #f3f7ff 100%);
	border-radius: 16px;
	padding: 14px;
	margin-bottom: 12px;
	box-shadow: 0 4px 16px rgba(25, 137, 250, 0.06);
	border: 1px solid rgba(25, 137, 250, 0.12);
}

.hero-top-row {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	gap: 8px;
	margin-bottom: 12px;
}

.hero-title {
	font-size: 16px;
	font-weight: 700;
	color: #1e293b;
	display: flex;
	align-items: center;
	gap: 8px;
}

.unread-total-pill {
	font-size: 11px;
	font-weight: 600;
	color: #ffffff;
	background: #ee0a24;
	padding: 2px 8px;
	border-radius: 999px;
}

.hero-subtitle {
	margin: 4px 0 0;
	font-size: 12px;
	color: #64748b;
}

.hero-actions {
	display: flex;
	align-items: center;
	gap: 6px;
	flex-shrink: 0;
}

.action-chip {
	display: inline-flex;
	align-items: center;
	gap: 4px;
	padding: 5px 10px;
	border-radius: 999px;
	font-size: 12px;
	font-weight: 500;
	color: #1989fa;
	background: rgba(25, 137, 250, 0.1);
	border: none;
	cursor: pointer;

	&.primary {
		color: #ffffff;
		background: #1989fa;
	}

	&:disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}
}

.spin-icon {
	animation: spin 0.9s linear infinite;
}

@keyframes spin {
	from {
		transform: rotate(0deg);
	}
	to {
		transform: rotate(360deg);
	}
}

.category-pills-row {
	display: flex;
	align-items: center;
	gap: 8px;
	overflow-x: auto;
	padding-bottom: 6px;
	scrollbar-width: none;

	&::-webkit-scrollbar {
		display: none;
	}
}

.category-pill {
	display: inline-flex;
	align-items: center;
	gap: 4px;
	padding: 6px 12px;
	border-radius: 999px;
	font-size: 12px;
	font-weight: 500;
	color: #475569;
	background: #ffffff;
	border: 1px solid #e2e8f0;
	white-space: nowrap;
	transition: all 0.2s ease;

	&.active {
		color: #ffffff;
		background: #1989fa;
		border-color: #1989fa;
		box-shadow: 0 2px 8px rgba(25, 137, 250, 0.25);
	}
}

.pill-badge {
	min-width: 16px;
	height: 16px;
	padding: 0 4px;
	border-radius: 999px;
	font-size: 10px;
	line-height: 16px;
	text-align: center;
	background: #ee0a24;
	color: #ffffff;
}

.filter-bar-row {
	display: flex;
	align-items: center;
	gap: 8px;
	margin-top: 6px;
}

.msg-search-input {
	flex: 1;
	padding: 0;
	background: transparent;

	:deep(.van-search__content) {
		background: #ffffff;
		border: 1px solid #e2e8f0;
	}
}

.unread-toggle-btn {
	display: inline-flex;
	align-items: center;
	gap: 5px;
	padding: 7px 11px;
	border-radius: 999px;
	font-size: 12px;
	color: #64748b;
	background: #ffffff;
	border: 1px solid #e2e8f0;
	white-space: nowrap;

	.dot {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: #cbd5e1;
	}

	&.active {
		color: #1989fa;
		border-color: #1989fa;
		background: rgba(25, 137, 250, 0.08);

		.dot {
			background: #ee0a24;
		}
	}
}

.message-card-list {
	display: flex;
	flex-direction: column;
	gap: 10px;
}

.message-swipe-item {
	border-radius: 14px;
	overflow: hidden;
}

.message-card {
	background: #ffffff;
	border-radius: 14px;
	padding: 14px;
	border: 1px solid #eef2f6;
	box-shadow: 0 2px 10px rgba(15, 23, 42, 0.03);
	transition: transform 0.15s ease;

	&.is-unread {
		border-left: 4px solid #1989fa;
	}

	&.is-unread.priority-high {
		border-left-color: #ee0a24;
	}
}

.card-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 8px;
}

.badge-group {
	display: flex;
	align-items: center;
	gap: 6px;
}

.type-badge {
	display: inline-flex;
	align-items: center;
	gap: 4px;
	font-size: 11px;
	font-weight: 600;
	padding: 2px 8px;
	border-radius: 6px;
}

.unread-dot {
	width: 8px;
	height: 8px;
	border-radius: 50%;
	background: #ee0a24;
}

.msg-time {
	font-size: 11px;
	color: #94a3b8;
}

.msg-title {
	margin: 0 0 6px;
	font-size: 14px;
	font-weight: 600;
	color: #1e293b;
	line-height: 1.4;
}

.msg-content {
	margin: 0 0 10px;
	font-size: 13px;
	color: #475569;
	line-height: 1.55;
}

.card-footer {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding-top: 8px;
	border-top: 1px dashed #f1f5f9;
	font-size: 11px;
	color: #64748b;
}

.remind-date-tag {
	display: inline-flex;
	align-items: center;
	gap: 4px;
}

.jump-link {
	display: inline-flex;
	align-items: center;
	gap: 2px;
	color: #1989fa;
	font-weight: 600;
}

.swipe-actions {
	display: flex;
	height: 100%;
}

.swipe-btn {
	height: 100%;
}

.publish-popup {
	padding: 16px;
}

.popup-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding-bottom: 12px;
	border-bottom: 1px solid #f1f5f9;
}

.popup-title {
	font-size: 15px;
	font-weight: 700;
	color: #1e293b;
}

.close-icon {
	font-size: 18px;
	color: #94a3b8;
}

.popup-body {
	padding-top: 8px;
}

.priority-selector {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 12px 16px;
}

.field-label {
	font-size: 14px;
	color: #323233;
}

.priority-options {
	display: flex;
	gap: 8px;
}

.priority-chip {
	padding: 5px 12px;
	border-radius: 999px;
	font-size: 12px;
	border: 1px solid #e2e8f0;
	background: #f8fafc;
	color: #475569;

	&.active {
		background: #1989fa;
		color: #ffffff;
		border-color: #1989fa;
	}
}

.popup-footer {
	margin-top: 14px;
}
</style>
