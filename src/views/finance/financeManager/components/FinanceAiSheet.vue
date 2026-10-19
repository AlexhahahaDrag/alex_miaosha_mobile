<template>
	<van-action-sheet
		v-model:show="visible"
		title="AI 智能记账 (小票与自然语言)"
		class="finance-ai-sheet"
		data-testid="sheet-mobile-finance-ai"
		@closed="onClosed"
	>
		<div class="sheet-content">
			<!-- 场景切换 -->
			<div class="scene-tabs">
				<van-tabs
					v-model:active="scene"
					type="card"
					shrink
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

			<!-- 快捷示例 -->
			<div class="quick-examples">
				<span class="example-label">点此快速体验：</span>
				<div class="chips-scroll">
					<van-tag
						type="primary"
						plain
						round
						class="chip-item"
						@click="applyExample('昨天中午和同事聚餐微信付了128.5元，麦当劳汉堡套餐')"
					>
						聚餐微信付128.5
					</van-tag>
					<van-tag
						type="success"
						plain
						round
						class="chip-item"
						@click="applyExample('沃尔玛购物小票\n鲜牛奶 2 18.50\n全麦面包 1 12.00\n纸巾 3 10.00\n支付宝实付 79.00元')"
					>
						超市小票清单
					</van-tag>
					<van-tag
						type="warning"
						plain
						round
						class="chip-item"
						@click="applyExample('在咖啡厅刷星巴克星礼卡消费了38元')"
					>
						刷星礼卡38
					</van-tag>
				</div>
			</div>

			<!-- 文本输入区 -->
			<div class="input-card">
				<van-field
					v-model="inputText"
					rows="3"
					autosize
					type="textarea"
					maxlength="500"
					placeholder="粘贴微信/支付宝账单、外卖消费描述、小票文本或输入语音转文字..."
					show-word-limit
					class="ai-textarea"
					data-testid="mobile-input-ai-text"
				/>
				<div class="parse-btn-row">
					<van-button
						type="primary"
						block
						round
						:loading="parsing"
						:disabled="!inputText.trim()"
						data-testid="mobile-btn-do-ai-parse"
						@click="handleParse"
					>
						<template #icon>
							<van-icon name="fire-o" />
						</template>
						开始 AI 智能解析
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
							size="14"
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
					stroke-width="4"
					:show-pivot="false"
					color="linear-gradient(to right, #1989fa, #07c160)"
				/>
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
						<span class="category-badge">{{ parsedResult.typeName || '未分类' }}</span>
						<span
							v-if="parsedResult.fromSourceName"
							class="source-badge"
						>{{ parsedResult.fromSourceName }}</span>
						<span
							v-if="parsedResult.prepaidCardName"
							class="card-badge"
						>卡: {{ parsedResult.prepaidCardName }}</span>
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
					<div class="receipt-title">小票商品清单 ({{ parsedResult.receiptItems.length }}件)：</div>
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

				<div class="apply-btn-wrapper">
					<van-button
						type="success"
						block
						round
						data-testid="mobile-btn-apply-ai-result"
						@click="handleApply"
					>
						一键填入并保存账目
					</van-button>
				</div>
			</div>
		</div>
	</van-action-sheet>
</template>

<script setup lang="ts">
import { showToast, showSuccessToast, showFailToast } from 'vant';
import { parseUniversalFinanceLedger, parseUniversalFinanceLedgerStream } from '@/views/finance/financeManager/api';
import type {
	UniversalFinanceAiParseReq,
	UniversalFinanceAiParseVo,
	UniversalFinanceAiStageVo,
} from '@/views/finance/financeManager/config';
import { triggerHaptic } from '@/utils/haptics';

const props = defineProps<{
	modelValue: boolean;
	belongTo?: string | number;
}>();

const emit = defineEmits<{
	(e: 'update:modelValue', val: boolean): void;
	(e: 'apply', result: UniversalFinanceAiParseVo): void;
}>();

const visible = computed({
	get: () => props.modelValue,
	set: (val: boolean) => emit('update:modelValue', val),
});

const scene = ref<UniversalFinanceAiParseReq['scene']>('AUTO_DETECT');
const inputText = ref('');
const parsing = ref(false);
const stageStatus = ref<UniversalFinanceAiStageVo | null>(null);
const parsedResult = ref<UniversalFinanceAiParseVo | null>(null);

const applyExample = (ex: string) => {
	inputText.value = ex;
	if (ex.includes('小票')) {
		scene.value = 'SHOP_RECEIPT';
	} else if (ex.includes('卡')) {
		scene.value = 'PREPAID_CARD';
	} else {
		scene.value = 'DAILY_EXPENSE';
	}
};

const handleParse = async () => {
	if (!inputText.value.trim()) {
		showToast('请输入记账描述或小票文本');
		return;
	}
	parsing.value = true;
	parsedResult.value = null;
	stageStatus.value = {
		stage: 'SCENE_ANALYSIS',
		progress: 10,
		message: '建立流式连接中...',
	};
	triggerHaptic('light');

	let receivedStreamComplete = false;

	try {
		await parseUniversalFinanceLedgerStream(
			{
				scene: scene.value,
				text: inputText.value.trim(),
				belongTo: props.belongTo,
			},
			{
				onStage: (stageVo) => {
					stageStatus.value = stageVo;
					triggerHaptic('light');
					if (stageVo.partialData) {
						parsedResult.value = stageVo.partialData;
					}
				},
				onComplete: (result) => {
					receivedStreamComplete = true;
					parsedResult.value = result;
					triggerHaptic('success');
					showSuccessToast('AI 解析完成，已呈现预览卡片');
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
				belongTo: props.belongTo,
			});
			if (code === 200 || code === '00000') {
				parsedResult.value = data;
				stageStatus.value = {
					stage: 'COMPLETE',
					progress: 100,
					message: '解析已完成',
				};
				triggerHaptic('success');
				showSuccessToast('AI 解析完成，已呈现预览卡片');
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
	emit('apply', parsedResult.value);
	visible.value = false;
};

const onClosed = () => {
	inputText.value = '';
	parsedResult.value = null;
	stageStatus.value = null;
	scene.value = 'AUTO_DETECT';
};
</script>

<style scoped lang="less">
.finance-ai-sheet {
	max-height: 85vh;
	.sheet-content {
		padding: 16px 20px 32px;
	}
	.stream-stage-card {
		margin-top: 12px;
		background: #f0fdf4;
		border: 1px solid #bbf7d0;
		border-radius: 10px;
		padding: 10px 12px;
		.stage-info {
			display: flex;
			justify-content: space-between;
			align-items: center;
			font-size: 12px;
			margin-bottom: 6px;
			.stage-text {
				display: flex;
				align-items: center;
				gap: 6px;
				color: #166534;
				font-weight: 500;
				.stage-spinner {
					margin-right: 2px;
				}
			}
			.stage-progress {
				color: #15803d;
				font-weight: 600;
			}
		}
	}
	.scene-tabs {
		margin-bottom: 12px;
	}
	.quick-examples {
		margin-bottom: 12px;
		.example-label {
			font-size: 12px;
			color: #64748b;
			display: block;
			margin-bottom: 6px;
		}
		.chips-scroll {
			display: flex;
			gap: 8px;
			overflow-x: auto;
			padding-bottom: 4px;
			&::-webkit-scrollbar {
				display: none;
			}
			.chip-item {
				cursor: pointer;
				flex-shrink: 0;
			}
		}
	}
	.input-card {
		background: #f8fafc;
		border-radius: 12px;
		padding: 10px 12px;
		border: 1px solid #e2e8f0;
		.ai-textarea {
			background: transparent;
			padding: 4px 0;
		}
		.parse-btn-row {
			margin-top: 10px;
		}
	}
	.preview-card {
		margin-top: 16px;
		background: #ffffff;
		border: 1px solid #cbd5e1;
		border-radius: 12px;
		padding: 14px 16px;
		box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);

		.preview-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 8px;
			.left-badges {
				display: flex;
				gap: 6px;
				flex-wrap: wrap;
				span {
					font-size: 11px;
					padding: 2px 8px;
					border-radius: 999px;
				}
				.direction-badge {
					&.is-expense {
						background: #fee2e2;
						color: #ef4444;
					}
					&.is-income {
						background: #dcfce7;
						color: #10b981;
					}
				}
				.category-badge {
					background: #e0f2fe;
					color: #0284c7;
				}
				.source-badge {
					background: #f1f5f9;
					color: #475569;
				}
				.card-badge {
					background: #f3e8ff;
					color: #7e22ce;
				}
			}
			.engine-badge {
				font-size: 11px;
				color: #94a3b8;
			}
		}

		.preview-amount-row {
			display: flex;
			align-items: baseline;
			margin-bottom: 10px;
			.currency {
				font-size: 18px;
				color: #ef4444;
				font-weight: bold;
				margin-right: 2px;
			}
			.val {
				font-size: 26px;
				color: #ef4444;
				font-weight: 800;
				font-family: monospace;
			}
		}

		.preview-meta-grid {
			font-size: 13px;
			display: grid;
			grid-template-columns: 1fr;
			gap: 4px;
			color: #334155;
			.meta-item {
				.meta-label {
					color: #64748b;
				}
				.meta-val {
					font-weight: 500;
				}
			}
		}

		.receipt-items-list {
			margin-top: 12px;
			padding-top: 10px;
			border-top: 1px dashed #e2e8f0;
			.receipt-title {
				font-size: 12px;
				font-weight: bold;
				color: #475569;
				margin-bottom: 6px;
			}
			.receipt-line {
				display: flex;
				justify-content: space-between;
				font-size: 12px;
				padding: 2px 0;
				color: #64748b;
				.item-name {
					flex: 1;
				}
				.item-qty {
					width: 40px;
					text-align: center;
				}
				.item-subtotal {
					font-family: monospace;
					color: #0f172a;
				}
			}
		}

		.apply-btn-wrapper {
			margin-top: 14px;
		}
	}
}
</style>
