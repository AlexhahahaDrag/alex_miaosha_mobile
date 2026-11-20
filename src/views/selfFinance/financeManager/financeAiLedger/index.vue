<template>
	<div
		class="finance-ai-ledger-page"
		data-testid="page-mobile-finance-ai-ledger"
	>
		<!-- 主体可滚动内容区 -->
		<div class="page-scroll-body">
			<!-- 顶部场景介绍与切换 -->
			<div class="ai-banner-card">
				<div class="banner-header">
					<div class="banner-title-row">
						<div class="ai-icon-bubble">
							<van-icon name="fire-o" />
						</div>
						<div class="banner-texts">
							<h3 class="banner-heading">AI 智能记账</h3>
							<p class="banner-desc">支持自然语言对话、外卖账单与购物小票多模态解析</p>
						</div>
					</div>
				</div>

				<div class="scene-tabs-wrapper">
					<van-tabs
						v-model:active="scene"
						type="card"
						shrink
						class="ai-scene-tabs"
					>
						<van-tab
							title="自动识别"
							name="AUTO_DETECT"
						/>
						<van-tab
							title="日常收支"
							name="DAILY_EXPENSE"
						/>
						<van-tab
							title="购物小票"
							name="SHOP_RECEIPT"
						/>
						<van-tab
							title="预付卡流水"
							name="PREPAID_CARD"
						/>
					</van-tabs>
				</div>
			</div>

			<!-- 快捷示例 -->
			<div class="quick-examples-section">
				<div class="section-title">
					<van-icon
						name="bulb-o"
						class="mr-1 text-amber-500"
					/>
					<span>点击快速填入示例：</span>
				</div>
				<div class="chips-scroll">
					<van-tag
						type="primary"
						plain
						round
						size="medium"
						class="chip-item"
						@click="applyExample('昨天中午和同事聚餐微信付了128.5元，麦当劳汉堡套餐')"
					>
						聚餐微信付128.5
					</van-tag>
					<van-tag
						type="success"
						plain
						round
						size="medium"
						class="chip-item"
						@click="applyExample('沃尔玛购物小票\n鲜牛奶 2 18.50\n全麦面包 1 12.00\n纸巾 3 10.00\n支付宝实付 79.00元')"
					>
						超市小票清单
					</van-tag>
					<van-tag
						type="warning"
						plain
						round
						size="medium"
						class="chip-item"
						@click="applyExample('在咖啡厅刷星巴克星礼卡消费了38元')"
					>
						刷星礼卡38
					</van-tag>
					<van-tag
						type="danger"
						plain
						round
						size="medium"
						class="chip-item"
						@click="applyExample('滴滴打车出行支付宝支付32.8元发票报销')"
					>
						打车报销32.8
					</van-tag>
				</div>
			</div>

			<!-- 文本输入卡片 -->
			<div class="input-card">
				<div class="input-header">
					<span class="input-title">输入描述或小票文本</span>
					<button
						v-if="inputText"
						type="button"
						class="clear-btn"
						@click="inputText = ''"
					>
						清空
					</button>
				</div>
				<van-field
					v-model="inputText"
					rows="4"
					autosize
					type="textarea"
					maxlength="500"
					placeholder="可粘贴微信/支付宝流水通知、外卖消费明细、收银小票文本或语音转文字..."
					show-word-limit
					class="ai-textarea"
					data-testid="mobile-input-ai-text"
				/>
				<div class="parse-btn-row">
					<van-button
						type="primary"
						block
						round
						size="large"
						:loading="parsing"
						:disabled="!inputText.trim()"
						data-testid="mobile-btn-do-ai-parse"
						class="action-parse-btn"
						@click="handleParse"
					>
						<template #icon>
							<van-icon name="fire-o" />
						</template>
						{{ parsing ? 'AI 深度推理中...' : '开始 AI 智能解析' }}
					</van-button>
				</div>
			</div>

			<!-- 流式阶段进度状态条 -->
			<div
				v-if="parsing || stageStatus"
				class="stream-stage-card"
			>
				<div class="stage-info">
					<div class="stage-text">
						<van-loading
							v-if="parsing"
							size="16"
							type="spinner"
							class="stage-spinner"
						/>
						<van-icon
							v-else
							name="passed"
							color="#07c160"
						/>
						<span>{{ stageStatus?.message || '正在分析流水语境...' }}</span>
					</div>
					<span class="stage-progress">{{ stageStatus?.progress ?? 0 }}%</span>
				</div>
				<van-progress
					:percentage="stageStatus?.progress ?? 0"
					stroke-width="5"
					:show-pivot="false"
					color="linear-gradient(to right, #3b82f6, #10b981)"
					track-color="#e2e8f0"
				/>
			</div>

			<!-- 流式思考链与推理打字机 -->
			<div
				v-if="parsing || displayThoughtText"
				class="stream-reasoning-card"
			>
				<div
					class="reasoning-header"
					@click="isThoughtExpanded = !isThoughtExpanded"
				>
					<div class="reasoning-title">
						<van-icon
							name="bulb-o"
							class="mr-1 text-amber-500"
						/>
						<span>AI 语义推理思考过程</span>
					</div>
					<div class="reasoning-meta">
						<span
							v-if="parsedResult?.parseEngine"
							class="engine-tag"
						>
							{{ parsedResult.parseEngine === 'AI_DEEPSEEK' ? 'DeepSeek' : '规则引擎' }}
						</span>
						<van-icon :name="isThoughtExpanded ? 'arrow-up' : 'arrow-down'" />
					</div>
				</div>
				<div
					v-show="isThoughtExpanded"
					class="reasoning-body"
				>
					<span class="reasoning-text">{{ displayThoughtText }}</span>
					<span
						v-if="parsing"
						class="typing-cursor"
					>▌</span>
				</div>
			</div>

			<!-- 解析结果卡片 -->
			<div
				v-if="parsedResult"
				class="preview-card"
				data-testid="mobile-card-ai-preview"
			>
				<div class="preview-header">
					<div class="left-badges">
						<span
							class="direction-badge"
							:class="parsedResult.incomeAndExpenses === 'income' ? 'is-income' : 'is-expense'"
						>
							{{ parsedResult.incomeAndExpenses === 'income' ? '收入' : '支出' }}
						</span>
						<span class="category-badge">{{ parsedResult.typeName || '日常消费' }}</span>
						<span
							v-if="parsedResult.fromSourceName"
							class="source-badge"
						>
							{{ parsedResult.fromSourceName }}
						</span>
						<span
							v-if="parsedResult.prepaidCardName"
							class="card-badge"
						>
							卡: {{ parsedResult.prepaidCardName }}
						</span>
					</div>
					<div class="engine-badge">
						{{ parsedResult.parseEngine === 'AI_DEEPSEEK' ? 'DeepSeek' : '规则兜底' }}
					</div>
				</div>

				<div class="preview-amount-row">
					<span class="currency">¥</span>
					<span class="val">{{ parsedResult.amount || '0.00' }}</span>
				</div>

				<div class="preview-meta-grid">
					<div class="meta-item">
						<span class="meta-label">账目名称：</span>
						<span class="meta-val">{{ parsedResult.name || '日常账目' }}</span>
					</div>
					<div class="meta-item">
						<span class="meta-label">发生时间：</span>
						<span class="meta-val">{{ parsedResult.infoDate || '当前时间' }}</span>
					</div>
					<div
						v-if="parsedResult.description"
						class="meta-item full-width"
					>
						<span class="meta-label">摘要备注：</span>
						<span class="meta-val">{{ parsedResult.description }}</span>
					</div>
				</div>

				<!-- 小票明细清单 -->
				<div
					v-if="parsedResult.receiptItems && parsedResult.receiptItems.length"
					class="receipt-items-list"
				>
					<div class="receipt-title">
						<van-icon
							name="orders-o"
							class="mr-1"
						/>
						<span>小票商品清单 ({{ parsedResult.receiptItems.length }}件)</span>
					</div>
					<div
						v-for="(it, idx) in parsedResult.receiptItems"
						:key="idx"
						class="receipt-line"
					>
						<span class="item-name">{{ it.itemName }}</span>
						<span class="item-qty">x{{ it.quantity }}</span>
						<span class="item-subtotal">¥{{ it.subtotal }}</span>
					</div>
				</div>

				<!-- 确认填单操作按钮 -->
				<div class="apply-action-section">
					<van-button
						type="success"
						block
						round
						size="large"
						data-testid="mobile-btn-apply-ai-result"
						class="btn-apply-result"
						@click="handleApply"
					>
						<template #icon>
							<van-icon name="passed" />
						</template>
						一键填入并保存账目
					</van-button>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { showToast, showSuccessToast, showFailToast } from 'vant';
import { useRouter } from 'vue-router';
import { parseUniversalFinanceLedger, parseUniversalFinanceLedgerStream } from '@/views/selfFinance/financeManager/api';
import type {
	UniversalFinanceAiParseReq,
	UniversalFinanceAiParseVo,
	UniversalFinanceAiStageVo,
} from '@/views/selfFinance/financeManager/config';
import { triggerHaptic } from '@/utils/haptics';
import { getRoutePathByName } from '@/utils/router';
import type { NavBarConfig } from '@/composables/useNavBar';

const router = useRouter();

// 导航栏配置（头）
const info = ref<Pick<NavBarConfig, 'title' | 'rightButton' | 'leftPath' | 'visible'>>({
	title: 'AI 智能记账',
	leftPath: getRoutePathByName(router, 'financeManager', '/selfFinance/financeManager'),
	visible: true,
});
useNavBar(info);

// 底部导航栏配置（bar）
useTabBar({
	visible: true,
	data: [
		{ name: 'dashboard', title: '首页', icon: 'homepage' },
		{ name: 'financeManager', title: '财务', icon: 'finance' },
		{ name: 'financeAnalysis', title: '分析', icon: 'financeAnalysis' },
		{ name: 'myself', title: '个人', icon: 'user' },
	],
	active: 1,
});

const scene = ref<UniversalFinanceAiParseReq['scene']>('AUTO_DETECT');
const inputText = ref('');
const parsing = ref(false);
const stageStatus = ref<UniversalFinanceAiStageVo | null>(null);
const parsedResult = ref<UniversalFinanceAiParseVo | null>(null);
const isThoughtExpanded = ref(true);
const streamingThought = ref('');

const displayThoughtText = computed(() => {
	if (streamingThought.value) {
		return streamingThought.value;
	}
	if (parsedResult.value?.reasoning) {
		return parsedResult.value.reasoning;
	}
	if (stageStatus.value?.message) {
		return stageStatus.value.message;
	}
	return '';
});

const applyExample = (ex: string) => {
	triggerHaptic('light');
	inputText.value = ex;
	if (ex.includes('小票')) {
		scene.value = 'SHOP_RECEIPT';
	} else if (ex.includes('卡')) {
		scene.value = 'PREPAID_CARD';
	} else {
		scene.value = 'DAILY_EXPENSE';
	}
};

const normalizeParsedResult = (res: UniversalFinanceAiParseVo): UniversalFinanceAiParseVo => {
	return {
		...res,
		belongTo: res.belongTo != null ? String(res.belongTo) : undefined,
		prepaidCardId: res.prepaidCardId != null ? String(res.prepaidCardId) : undefined,
	};
};

const handleParse = async () => {
	if (!inputText.value.trim()) {
		showToast('请输入记账描述或小票文本');
		return;
	}
	parsing.value = true;
	parsedResult.value = null;
	streamingThought.value = '正在建立端到端流式连接并解析流水语义...';
	stageStatus.value = {
		stage: 'SCENE_ANALYSIS',
		progress: 10,
		message: '建立流式连接中...',
	};
	triggerHaptic('light');

	let receivedStreamComplete = false;
	let lastStage = 'SCENE_ANALYSIS';

	try {
		await parseUniversalFinanceLedgerStream(
			{
				scene: scene.value,
				text: inputText.value.trim(),
			},
			{
				onStage: (stageVo) => {
					if (stageVo.stage !== lastStage) {
						lastStage = stageVo.stage;
						triggerHaptic('light');
					}
					stageStatus.value = stageVo;
					if (stageVo.message) {
						streamingThought.value = `${streamingThought.value ? `${streamingThought.value}\n` : ''}• ${stageVo.message}`;
					}
					if (stageVo.partialData) {
						parsedResult.value = normalizeParsedResult(stageVo.partialData);
						if (stageVo.partialData.reasoning) {
							streamingThought.value = stageVo.partialData.reasoning;
						}
					}
				},
				onComplete: (result) => {
					receivedStreamComplete = true;
					parsedResult.value = normalizeParsedResult(result);
					if (result.reasoning) {
						streamingThought.value = result.reasoning;
					}
					triggerHaptic('success');
					showSuccessToast('AI 解析完成，已呈现结果');
				},
				onError: () => {
					// 流式异常平滑静默降级走后续同步保底
				},
			},
		);
	} catch {
		// 流式调用异常平滑静默降级
	}

	// 降级兜底
	if (!receivedStreamComplete && !parsedResult.value) {
		try {
			const { code, data, message } = await parseUniversalFinanceLedger({
				scene: scene.value,
				text: inputText.value.trim(),
			});
			if (code === 200 || code === '200' || code === '00000') {
				parsedResult.value = normalizeParsedResult(data);
				if (data.reasoning) {
					streamingThought.value = data.reasoning;
				}
				stageStatus.value = {
					stage: 'COMPLETE',
					progress: 100,
					message: '解析已完成',
				};
				triggerHaptic('success');
				showSuccessToast('AI 解析完成，已呈现结果');
			} else {
				triggerHaptic('warning');
				showFailToast(message || '解析失败，请重试');
			}
		} catch (e: unknown) {
			triggerHaptic('error');
			const errorMsg = e instanceof Error ? e.message : '网络异常，解析失败';
			showFailToast(errorMsg);
		}
	}

	parsing.value = false;
};

const handleApply = () => {
	if (!parsedResult.value) return;
	triggerHaptic('success');
	try {
		sessionStorage.setItem('alex_mobile_ai_parsed_ledger', JSON.stringify(parsedResult.value));
	} catch (e) {
		console.warn('Storage save failed:', e);
	}
	const detailPath = getRoutePathByName(
		router,
		'financeManagerDetail',
		'/selfFinance/financeManager/financeManagerDetail',
	);
	router.push({ path: detailPath });
};
</script>

<style lang="less" scoped>
.finance-ai-ledger-page {
	display: flex;
	flex-direction: column;
	min-height: 100%;
	background-color: #f8fafc;
	box-sizing: border-box;
}

.page-scroll-body {
	flex: 1;
	padding: 16px;
	padding-bottom: 24px;
	box-sizing: border-box;
}

.ai-banner-card {
	background: #ffffff;
	border-radius: 16px;
	padding: 16px;
	box-shadow: 0 2px 12px rgba(15, 23, 42, 0.05);
	margin-bottom: 14px;

	.banner-header {
		margin-bottom: 12px;
	}

	.banner-title-row {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.ai-icon-bubble {
		width: 44px;
		height: 44px;
		border-radius: 12px;
		background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		color: #2563eb;
		font-size: 22px;
		flex-shrink: 0;
	}

	.banner-texts {
		flex: 1;
		min-width: 0;

		.banner-heading {
			font-size: 17px;
			font-weight: 700;
			color: #0f172a;
			margin: 0 0 4px 0;
			line-height: 1.3;
		}

		.banner-desc {
			font-size: 12px;
			color: #64748b;
			margin: 0;
			line-height: 1.4;
		}
	}

	.scene-tabs-wrapper {
		margin-top: 8px;

		:deep(.van-tabs__nav--card) {
			border: 1px solid #e2e8f0;
			border-radius: 10px;
			margin: 0;
			height: 34px;
			background: #f1f5f9;

			.van-tab {
				border-right: 1px solid #e2e8f0;
				color: #475569;
				font-size: 13px;
				font-weight: 500;
				line-height: 32px;

				&.van-tab--active {
					background-color: #2563eb;
					color: #ffffff;
					font-weight: 600;
				}

				&:last-child {
					border-right: none;
				}
			}
		}
	}
}

.quick-examples-section {
	margin-bottom: 14px;

	.section-title {
		font-size: 12px;
		font-weight: 600;
		color: #475569;
		margin-bottom: 8px;
		display: flex;
		align-items: center;
	}

	.chips-scroll {
		display: flex;
		gap: 8px;
		overflow-x: auto;
		padding-bottom: 4px;
		-webkit-overflow-scrolling: touch;
		scrollbar-width: none;

		&::-webkit-scrollbar {
			display: none;
		}

		.chip-item {
			cursor: pointer;
			white-space: nowrap;
			padding: 5px 12px;
			font-size: 12px;
			font-weight: 500;
			flex-shrink: 0;
		}
	}
}

.input-card {
	background: #ffffff;
	border-radius: 16px;
	padding: 16px;
	box-shadow: 0 2px 12px rgba(15, 23, 42, 0.05);
	margin-bottom: 14px;

	.input-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 10px;

		.input-title {
			font-size: 14px;
			font-weight: 600;
			color: #1e293b;
		}

		.clear-btn {
			border: none;
			background: transparent;
			font-size: 12px;
			color: #64748b;
			padding: 2px 6px;
			cursor: pointer;

			&:active {
				opacity: 0.7;
			}
		}
	}

	.ai-textarea {
		background: #f8fafc;
		border-radius: 12px;
		padding: 12px;
		border: 1px solid #e2e8f0;
		font-size: 14px;
		line-height: 1.6;
		margin-bottom: 14px;

		:deep(textarea) {
			color: #0f172a;
			&::placeholder {
				color: #94a3b8;
			}
		}
	}

	.action-parse-btn {
		height: 44px;
		font-size: 15px;
		font-weight: 600;
		box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
	}
}

.stream-stage-card {
	background: #ffffff;
	border-radius: 14px;
	padding: 14px 16px;
	margin-bottom: 14px;
	box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
	border: 1px solid #f1f5f9;

	.stage-info {
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-size: 13px;
		font-weight: 500;
		color: #334155;
		margin-bottom: 10px;

		.stage-text {
			display: flex;
			align-items: center;
			gap: 8px;
		}

		.stage-progress {
			font-weight: 600;
			color: #2563eb;
		}
	}
}

.stream-reasoning-card {
	background: #f8fafc;
	border-radius: 14px;
	padding: 12px 14px;
	margin-bottom: 14px;
	border: 1px dashed #cbd5e1;

	.reasoning-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-size: 12px;
		font-weight: 600;
		color: #475569;
		cursor: pointer;

		.reasoning-title {
			display: flex;
			align-items: center;
		}

		.reasoning-meta {
			display: flex;
			align-items: center;
			gap: 6px;

			.engine-tag {
				padding: 2px 8px;
				border-radius: 6px;
				font-size: 11px;
				background: #eff6ff;
				color: #2563eb;
				font-weight: 600;
			}
		}
	}

	.reasoning-body {
		margin-top: 10px;
		font-size: 12px;
		line-height: 1.6;
		color: #334155;
		white-space: pre-wrap;
		word-break: break-all;
		padding-top: 8px;
		border-top: 1px solid #e2e8f0;

		.typing-cursor {
			display: inline-block;
			animation: blink 1s infinite;
			color: #2563eb;
			font-weight: bold;
		}
	}
}

.preview-card {
	background: linear-gradient(180deg, #ffffff 0%, #fcfdfe 100%);
	border-radius: 16px;
	padding: 16px;
	box-shadow: 0 4px 16px rgba(15, 23, 42, 0.08);
	border: 1px solid #e2e8f0;
	margin-bottom: 16px;

	.preview-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 12px;

		.left-badges {
			display: flex;
			align-items: center;
			flex-wrap: wrap;
			gap: 6px;

			.direction-badge {
				padding: 3px 8px;
				border-radius: 6px;
				font-size: 11px;
				font-weight: 700;

				&.is-income {
					background-color: #ecfdf5;
					color: #059669;
				}

				&.is-expense {
					background-color: #fef2f2;
					color: #dc2626;
				}
			}

			.category-badge {
				padding: 3px 8px;
				border-radius: 6px;
				font-size: 11px;
				background-color: #f1f5f9;
				color: #475569;
				font-weight: 600;
			}

			.source-badge,
			.card-badge {
				padding: 3px 8px;
				border-radius: 6px;
				font-size: 11px;
				background-color: #eff6ff;
				color: #2563eb;
			}
		}

		.engine-badge {
			font-size: 11px;
			color: #94a3b8;
			font-weight: 500;
		}
	}

	.preview-amount-row {
		display: flex;
		align-items: baseline;
		justify-content: center;
		padding: 12px 0 16px 0;
		color: #0f172a;

		.currency {
			font-size: 20px;
			font-weight: 700;
			margin-right: 4px;
		}

		.val {
			font-size: 36px;
			font-weight: 800;
			letter-spacing: -0.02em;
		}
	}

	.preview-meta-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 10px;
		background: #f8fafc;
		border-radius: 12px;
		padding: 12px;
		margin-bottom: 12px;

		.meta-item {
			font-size: 12px;
			display: flex;
			flex-direction: column;
			gap: 2px;

			&.full-width {
				grid-column: 1 / -1;
			}

			.meta-label {
				color: #64748b;
			}

			.meta-val {
				color: #1e293b;
				font-weight: 600;
			}
		}
	}

	.receipt-items-list {
		margin-top: 10px;
		margin-bottom: 16px;
		background: #ffffff;
		border-radius: 10px;
		border: 1px dashed #cbd5e1;
		padding: 10px 12px;

		.receipt-title {
			font-size: 12px;
			font-weight: 600;
			color: #334155;
			margin-bottom: 8px;
			display: flex;
			align-items: center;
		}

		.receipt-line {
			display: flex;
			justify-content: space-between;
			align-items: center;
			font-size: 12px;
			color: #475569;
			padding: 4px 0;
			border-bottom: 1px dashed #f1f5f9;

			&:last-child {
				border-bottom: none;
			}

			.item-name {
				flex: 1;
				min-width: 0;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}

			.item-qty {
				color: #94a3b8;
				margin: 0 12px;
			}

			.item-subtotal {
				font-weight: 600;
				color: #0f172a;
			}
		}
	}

	.apply-action-section {
		margin-top: 14px;

		.btn-apply-result {
			height: 48px;
			font-size: 16px;
			font-weight: 700;
			box-shadow: 0 4px 14px rgba(16, 185, 129, 0.25);
		}
	}
}

@keyframes blink {
	0%,
	100% {
		opacity: 1;
	}
	50% {
		opacity: 0;
	}
}
</style>
