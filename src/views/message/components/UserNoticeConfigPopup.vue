<template>
	<van-popup
		v-model:show="visible"
		position="bottom"
		round
		closeable
		class="user-notice-config-popup"
		data-testid="mobile-notice-popup"
		:style="{ maxHeight: '85vh', height: '85vh' }"
		@closed="handleClosed"
	>
		<div class="popup-wrapper">
			<!-- 顶部标题栏 -->
			<div class="popup-header">
				<div class="title-row">
					<div class="main-title">
						<span class="title-icon">🔔</span>
						<span>通知渠道偏好设置</span>
					</div>
				</div>
				<p class="subtitle">站内信与微信服务号推送正交独立 · 支持全局一票否决</p>
			</div>

			<!-- 加载状态 -->
			<div
				v-if="loading"
				class="loading-container"
			>
				<van-loading
					size="28px"
					vertical
				>加载通知偏好中...</van-loading>
			</div>

			<!-- 内容滚动区 -->
			<div
				v-else
				class="popup-scroll-body"
			>
				<!-- 全局总控卡片 (最高优先级一票否决) -->
				<section
					v-if="globalConfig"
					class="global-override-card"
					data-testid="mobile-notice-global-card"
				>
					<div class="global-card-top">
						<div class="global-badge">
							<span class="badge-icon">⚡</span>
							<span class="badge-text">最高决策权</span>
						</div>
						<div class="global-card-title">全局通知总控</div>
					</div>
					<p class="global-card-desc">
						关闭任一总控渠道，下方所有子业务的该渠道提醒将被<strong>一票否决强制静音</strong>。
					</p>

					<div class="global-switches-grid">
						<div class="global-switch-box">
							<div class="channel-info">
								<van-icon
									name="chat-o"
									class="channel-icon internal"
								/>
								<div class="channel-texts">
									<span class="channel-name">系统站内信</span>
									<span class="channel-sub">控制应用内消息入库</span>
								</div>
							</div>
							<van-switch
								:model-value="globalConfig.internalEnabled"
								size="22px"
								active-color="#1989fa"
								:loading="savingKey === 'GLOBAL_internal'"
								data-testid="mobile-notice-global-internal-switch"
								@update:model-value="(val) => handleToggle(globalConfig!, 'internalEnabled', Boolean(val))"
							/>
						</div>

						<div class="global-switch-box">
							<div class="channel-info">
								<van-icon
									name="comment-circle-o"
									class="channel-icon wechat"
								/>
								<div class="channel-texts">
									<span class="channel-name">微信服务号</span>
									<span class="channel-sub">控制模板消息推送</span>
								</div>
							</div>
							<van-switch
								:model-value="globalConfig.wechatEnabled"
								size="22px"
								active-color="#07c160"
								:loading="savingKey === 'GLOBAL_wechat'"
								data-testid="mobile-notice-global-wechat-switch"
								@update:model-value="(val) => handleToggle(globalConfig!, 'wechatEnabled', Boolean(val))"
							/>
						</div>
					</div>
				</section>

				<!-- 8 大业务细项列表 -->
				<div class="section-divider-title">
					<span>业务通知明细开关</span>
					<span class="sub-hint">点击单独定制</span>
				</div>

				<div class="biz-config-list">
					<div
						v-for="item in subConfigs"
						:key="item.noticeCode"
						class="biz-config-card"
						:data-testid="`mobile-notice-card-${item.noticeCode}`"
					>
						<div class="biz-card-head">
							<div class="biz-head-left">
								<div
									class="biz-icon-badge"
									:style="{
										backgroundColor: getBizMeta(item.noticeCode).badgeBg,
										color: getBizMeta(item.noticeCode).badgeColor,
									}"
								>
									<van-icon :name="getBizMeta(item.noticeCode).icon" />
								</div>
								<div class="biz-name-box">
									<div class="biz-title">{{ getBizMeta(item.noticeCode).title }}</div>
									<div class="biz-desc">{{ getBizMeta(item.noticeCode).desc }}</div>
								</div>
							</div>
						</div>

						<div class="biz-channels-row">
							<!-- 站内信开关 -->
							<div
								class="channel-control-item"
								:class="{ disabled: !isGlobalInternalActive }"
							>
								<div class="control-label-box">
									<span class="control-label">站内信</span>
									<span
										v-if="!isGlobalInternalActive"
										class="veto-tag"
									>已否决</span>
								</div>
								<van-switch
									:model-value="item.internalEnabled"
									size="20px"
									active-color="#1989fa"
									:disabled="!isGlobalInternalActive"
									:loading="savingKey === `${item.noticeCode}_internal`"
									:data-testid="`mobile-notice-switch-internal-${item.noticeCode}`"
									@update:model-value="(val) => handleToggle(item, 'internalEnabled', Boolean(val))"
								/>
							</div>

							<div class="control-divider"></div>

							<!-- 微信服务号开关 -->
							<div
								class="channel-control-item"
								:class="{ disabled: !isGlobalWechatActive }"
							>
								<div class="control-label-box">
									<span class="control-label">微信推送</span>
									<span
										v-if="!isGlobalWechatActive"
										class="veto-tag"
									>已否决</span>
								</div>
								<van-switch
									:model-value="item.wechatEnabled"
									size="20px"
									active-color="#07c160"
									:disabled="!isGlobalWechatActive"
									:loading="savingKey === `${item.noticeCode}_wechat`"
									:data-testid="`mobile-notice-switch-wechat-${item.noticeCode}`"
									@update:model-value="(val) => handleToggle(item, 'wechatEnabled', Boolean(val))"
								/>
							</div>
						</div>
					</div>
				</div>

				<!-- 底部安全保障提示 -->
				<div class="safety-footer-tips">
					<van-icon name="shield-check" />
					<span>系统严格基于登录态鉴权，零数据膨胀，未修改项目恒定默认放行。</span>
				</div>
			</div>
		</div>
	</van-popup>
</template>

<script setup lang="ts">
import { showFailToast } from 'vant';
import { getMyNoticeConfigs, saveMyNoticeConfig } from '@/views/message/api';
import { NOTICE_BIZ_META_MAP, type NoticeBizMeta, type UserNoticeConfigData } from '@/views/message/config';
import { triggerHaptic } from '@/utils/haptics';

const props = defineProps<{
	modelValue: boolean;
}>();

const emit = defineEmits<{
	(e: 'update:modelValue', value: boolean): void;
	(e: 'saved'): void;
}>();

const visible = computed({
	get: () => props.modelValue,
	set: (val: boolean) => emit('update:modelValue', val),
});

const loading = ref(false);
const configList = ref<UserNoticeConfigData[]>([]);
const savingKey = ref<string>('');

const globalConfig = computed<UserNoticeConfigData | undefined>(() =>
	configList.value.find((c) => c.noticeCode === 'GLOBAL'),
);

const subConfigs = computed<UserNoticeConfigData[]>(() => configList.value.filter((c) => c.noticeCode !== 'GLOBAL'));

const isGlobalInternalActive = computed<boolean>(() =>
	globalConfig.value ? globalConfig.value.internalEnabled : true,
);

const isGlobalWechatActive = computed<boolean>(() => (globalConfig.value ? globalConfig.value.wechatEnabled : true));

const getBizMeta = (code: string): NoticeBizMeta => {
	return (
		NOTICE_BIZ_META_MAP[code] || {
			code,
			icon: 'bell-o',
			badgeBg: '#f2f3f5',
			badgeColor: '#646566',
			title: code,
			desc: '业务通知提醒',
		}
	);
};

const fetchNoticeConfigs = async () => {
	loading.value = true;
	try {
		const { code, data, message } = await getMyNoticeConfigs();
		if (code === '200' && Array.isArray(data)) {
			configList.value = data;
		} else {
			showFailToast(message || '获取通知偏好失败');
		}
	} catch {
		// fetchNoticeConfigs error
		showFailToast('网络异常，获取通知偏好失败');
	} finally {
		loading.value = false;
	}
};

const handleToggle = async (
	item: UserNoticeConfigData,
	field: 'internalEnabled' | 'wechatEnabled',
	nextValue: boolean,
) => {
	const oldValue = item[field];
	if (oldValue === nextValue) {
		return;
	}

	triggerHaptic('light');

	// 乐观更新
	item[field] = nextValue;
	const saveKey = `${item.noticeCode}_${field === 'internalEnabled' ? 'internal' : 'wechat'}`;
	savingKey.value = saveKey;

	try {
		const { code, message } = await saveMyNoticeConfig({
			noticeCode: item.noticeCode,
			internalEnabled: item.internalEnabled,
			wechatEnabled: item.wechatEnabled,
		});

		if (code === '200') {
			triggerHaptic('selection');
			emit('saved');
		} else {
			// 失败回滚
			item[field] = oldValue;
			triggerHaptic('error');
			showFailToast(message || '保存设置失败');
		}
	} catch {
		// saveMyNoticeConfig error
		item[field] = oldValue;
		triggerHaptic('error');
		showFailToast('网络异常，保存失败');
	} finally {
		savingKey.value = '';
	}
};

const handleClosed = () => {
	savingKey.value = '';
};

watch(
	() => props.modelValue,
	(val) => {
		if (val) {
			fetchNoticeConfigs();
		}
	},
	{ immediate: true },
);
</script>

<style scoped lang="less">
.user-notice-config-popup {
	border-radius: 20px 20px 0 0;
	background-color: #f7f8fa;
	display: flex;
	flex-direction: column;
	overflow: hidden;

	:deep(.van-popup__close-icon) {
		top: 18px;
		right: 18px;
		color: #646566;
		font-size: 20px;
	}
}

.popup-wrapper {
	height: 100%;
	display: flex;
	flex-direction: column;
}

.popup-header {
	flex-shrink: 0;
	padding: 20px 20px 14px;
	background: #ffffff;
	border-bottom: 1px solid rgba(0, 0, 0, 0.05);

	.title-row {
		display: flex;
		align-items: center;

		.main-title {
			font-size: 18px;
			font-weight: 700;
			color: #323233;
			display: flex;
			align-items: center;
			gap: 8px;

			.title-icon {
				font-size: 20px;
			}
		}
	}

	.subtitle {
		margin: 6px 0 0;
		font-size: 12px;
		color: #969799;
		line-height: 1.4;
	}
}

.loading-container {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	min-height: 240px;
}

.popup-scroll-body {
	flex: 1;
	overflow-y: auto;
	padding: 16px;
	-webkit-overflow-scrolling: touch;
}

/* 全局总控卡片 */
.global-override-card {
	background: linear-gradient(135deg, #ffffff 0%, #f0f7ff 100%);
	border: 1px solid #d4e7fe;
	border-radius: 16px;
	padding: 16px;
	margin-bottom: 16px;
	box-shadow: 0 4px 12px rgba(25, 137, 250, 0.06);

	.global-card-top {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 6px;

		.global-badge {
			display: inline-flex;
			align-items: center;
			gap: 2px;
			background: #e8f4ff;
			color: #1989fa;
			font-size: 11px;
			font-weight: 600;
			padding: 2px 8px;
			border-radius: 12px;

			.badge-icon {
				font-size: 11px;
			}
		}

		.global-card-title {
			font-size: 15px;
			font-weight: 700;
			color: #1989fa;
		}
	}

	.global-card-desc {
		font-size: 12px;
		color: #646566;
		margin: 0 0 14px;
		line-height: 1.5;

		strong {
			color: #ee0a24;
		}
	}

	.global-switches-grid {
		display: flex;
		flex-direction: column;
		gap: 10px;

		.global-switch-box {
			background: #ffffff;
			border-radius: 12px;
			padding: 10px 14px;
			display: flex;
			align-items: center;
			justify-content: space-between;
			border: 1px solid #ebedf0;

			.channel-info {
				display: flex;
				align-items: center;
				gap: 10px;

				.channel-icon {
					font-size: 20px;

					&.internal {
						color: #1989fa;
					}

					&.wechat {
						color: #07c160;
					}
				}

				.channel-texts {
					display: flex;
					flex-direction: column;

					.channel-name {
						font-size: 14px;
						font-weight: 600;
						color: #323233;
					}

					.channel-sub {
						font-size: 11px;
						color: #969799;
					}
				}
			}
		}
	}
}

.section-divider-title {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 4px 10px;
	font-size: 13px;
	font-weight: 600;
	color: #646566;

	.sub-hint {
		font-size: 11px;
		font-weight: normal;
		color: #969799;
	}
}

.biz-config-list {
	display: flex;
	flex-direction: column;
	gap: 12px;
}

.biz-config-card {
	background: #ffffff;
	border-radius: 14px;
	padding: 14px 16px;
	box-shadow: 0 1px 4px rgba(0, 0, 0, 0.03);

	.biz-card-head {
		margin-bottom: 12px;

		.biz-head-left {
			display: flex;
			align-items: flex-start;
			gap: 10px;

			.biz-icon-badge {
				width: 34px;
				height: 34px;
				border-radius: 10px;
				display: flex;
				align-items: center;
				justify-content: center;
				font-size: 17px;
				flex-shrink: 0;
			}

			.biz-name-box {
				flex: 1;

				.biz-title {
					font-size: 14px;
					font-weight: 600;
					color: #323233;
					line-height: 1.3;
				}

				.biz-desc {
					font-size: 11px;
					color: #969799;
					margin-top: 3px;
					line-height: 1.4;
				}
			}
		}
	}

	.biz-channels-row {
		display: flex;
		align-items: center;
		background: #f7f8fa;
		border-radius: 10px;
		padding: 8px 12px;

		.control-divider {
			width: 1px;
			height: 24px;
			background: #ebedf0;
			margin: 0 12px;
		}

		.channel-control-item {
			flex: 1;
			display: flex;
			align-items: center;
			justify-content: space-between;

			&.disabled {
				opacity: 0.6;
			}

			.control-label-box {
				display: flex;
				align-items: center;
				gap: 4px;

				.control-label {
					font-size: 13px;
					color: #323233;
					font-weight: 500;
				}

				.veto-tag {
					font-size: 10px;
					background: #ffe8e8;
					color: #ee0a24;
					padding: 1px 4px;
					border-radius: 4px;
					transform: scale(0.9);
				}
			}
		}
	}
}

.safety-footer-tips {
	margin: 20px 4px 10px;
	display: flex;
	align-items: center;
	gap: 6px;
	font-size: 11px;
	color: #969799;
	line-height: 1.4;

	.van-icon {
		font-size: 14px;
		color: #07c160;
		flex-shrink: 0;
	}
}
</style>
