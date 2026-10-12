<template>
	<div
		id="budget-manage-page"
		class="budget-manage-page"
	>
		<!-- 角色模式提示横幅 (家庭成员浏览模式) -->
		<div
			v-if="!canEditBudget"
			class="readonly-notice-banner"
		>
			<van-icon
				name="info-o"
				class="notice-icon"
			/>
			<span>家庭成员浏览模式，仅家庭管理员可调整月度预算设定</span>
		</div>

		<div class="budget-content-card">
			<!-- 预算月份 Banner -->
			<div class="budget-month-banner">
				<div class="banner-left">
					<span class="month-label">预算月份:</span>
					<span class="month-val">{{ currentMonthStr }}</span>
				</div>
				<span class="month-tip">每月独立保存，次月自动继承</span>
			</div>

			<!-- AI 智能测算与口语配置卡片 -->
			<div class="ai-budget-card">
				<!-- 顶部折叠微卡片 (高度约 40px，默认常驻展示核心 AI 摘要，0 视口压迫) -->
				<div
					class="ai-header"
					@click="toggleAiExpanded"
				>
					<div class="ai-title-wrap">
						<div class="ai-badge">AI</div>
						<div class="ai-title-sub">
							<span class="ai-title">AI 智能助手</span>
							<template v-if="aiRecommending">
								<span class="ai-brief-tip animate-pulse">测算中...</span>
							</template>
							<template v-else-if="aiRecommendData">
								<span class="ai-brief-tag"> 适度 ¥{{ (aiRecommendData.moderateAmount || 0).toFixed(0) }} </span>
							</template>
							<template v-else>
								<span class="ai-brief-tip">点击智能测算</span>
							</template>
						</div>
					</div>
					<div
						class="ai-header-right"
						@click.stop
					>
						<div
							class="ai-action-btn"
							:class="{ 'is-loading': aiRecommending }"
							@click="onFetchAiRecommend"
						>
							<van-icon
								name="replay"
								:class="{ 'spin-icon': aiRecommending }"
							/>
							<span>{{ aiRecommendData ? '重测' : '测算' }}</span>
						</div>
						<span class="action-divider">|</span>
						<div
							class="ai-toggle-btn"
							@click="toggleAiExpanded"
						>
							<span>{{ isAiExpanded ? '收起' : '口语配置' }}</span>
							<van-icon
								:name="isAiExpanded ? 'arrow-up' : 'arrow-down'"
								class="toggle-icon"
							/>
						</div>
					</div>
				</div>

				<!-- 展开区域 -->
				<div
					v-if="isAiExpanded"
					class="ai-expanded-area"
				>
					<!-- 口语化指令输入 -->
					<div
						v-if="canEditBudget"
						class="ai-command-wrap"
					>
						<div class="ai-input-box">
							<input
								v-model="aiCommandInput"
								class="ai-input"
								type="text"
								placeholder="如：“设2500预算，重点管餐饮”"
								@keyup.enter="onAiParseCommand"
							/>
							<van-icon
								v-if="aiCommandInput"
								name="clear"
								class="ai-clear-icon"
								@click="clearAiCommandInput"
							/>
							<button
								class="ai-parse-btn"
								:disabled="aiParsing"
								@click="onAiParseCommand"
							>
								{{ aiParsing ? '解析中' : '回填' }}
							</button>
						</div>
						<div class="ai-sample-chips">
							<span
								v-for="sample in aiCommandSamples"
								:key="sample"
								class="sample-chip"
								@click="applyAiSample(sample)"
							>
								{{ sample }}
							</span>
						</div>
					</div>

					<!-- 测算推荐详情 -->
					<div
						v-if="aiRecommendData"
						class="ai-recommend-body"
					>
						<div class="ai-advice-header">
							<div class="ai-advice-text">
								{{ aiRecommendData.healthAdvice }}
							</div>
							<span
								v-if="aiRecommendData.isFallback"
								class="ai-mode-tag ai-mode-tag--fallback"
							>智能规则</span>
							<span
								v-else
								class="ai-mode-tag ai-mode-tag--ai"
							>大模型洞察</span>
						</div>
						<div
							v-if="aiRecommendData.dailyLimitSuggest"
							class="ai-daily-suggest"
						>
							建议日均控制在
							<span class="num">¥{{ aiRecommendData.dailyLimitSuggest.toFixed(2) }}</span>
							以内
						</div>

						<!-- 三档推荐胶囊 -->
						<div class="ai-tier-grid">
							<div
								class="ai-tier-cell"
								:class="{
									active: budgetForm.budgetAmount === aiRecommendData.savingAmount,
								}"
								@click="applyRecommendTier(aiRecommendData.savingAmount)"
							>
								<div class="tier-name">节约档 (85%)</div>
								<div class="tier-val">¥{{ (aiRecommendData.savingAmount || 0).toFixed(0) }}</div>
							</div>
							<div
								class="ai-tier-cell ai-tier-cell--recom"
								:class="{
									active: budgetForm.budgetAmount === aiRecommendData.moderateAmount,
								}"
								@click="applyRecommendTier(aiRecommendData.moderateAmount)"
							>
								<span class="recom-badge">推荐</span>
								<div class="tier-name">适度档 (100%)</div>
								<div class="tier-val">¥{{ (aiRecommendData.moderateAmount || 0).toFixed(0) }}</div>
							</div>
							<div
								class="ai-tier-cell"
								:class="{
									active: budgetForm.budgetAmount === aiRecommendData.relaxedAmount,
								}"
								@click="applyRecommendTier(aiRecommendData.relaxedAmount)"
							>
								<div class="tier-name">宽松档 (115%)</div>
								<div class="tier-val">¥{{ (aiRecommendData.relaxedAmount || 0).toFixed(0) }}</div>
							</div>
						</div>

						<!-- 重点管控分类一键采纳 -->
						<div
							v-if="aiRecommendData.recommendedCategories?.length"
							class="ai-recom-cats"
						>
							<div class="cats-label">建议管控:</div>
							<div class="cats-tags">
								<span
									v-for="cat in aiRecommendData.recommendedCategories"
									:key="cat"
									class="cat-tag"
								>
									{{ cat }}
								</span>
							</div>
							<span
								v-if="canEditBudget"
								class="apply-cat-btn"
								@click="applyRecommendedCategories(aiRecommendData.recommendedCategories)"
							>
								采纳分类
							</span>
						</div>
					</div>
				</div>
			</div>

			<!-- 快捷 AI 推荐条 (当有适度档推荐时轻量常驻展示) -->
			<div
				v-if="aiRecommendData?.moderateAmount"
				class="quick-ai-recommend-bar"
			>
				<span class="bar-label">AI 建议预算:</span>
				<div
					:class="['ai-quick-pill', budgetForm.budgetAmount === aiRecommendData.moderateAmount && 'active']"
					@click="applyRecommendTier(aiRecommendData.moderateAmount)"
				>
					<span class="pill-badge">推荐</span>
					<span class="pill-amount">¥{{ (aiRecommendData.moderateAmount || 0).toFixed(0) }}</span>
				</div>
			</div>

			<!-- 预算金额输入 -->
			<van-field
				v-model.number="budgetForm.budgetAmount"
				type="number"
				label="预算金额(元)"
				placeholder="请输入预算金额"
				input-align="right"
				:readonly="!canEditBudget"
				data-testid="input-budget-amount"
				:class="['budget-amount-field', isAmountHighlighted && 'field-highlight-pulse']"
			/>

			<!-- 纳入统计分类 -->
			<div :class="['dialog-category-section', isCategoriesHighlighted && 'category-highlight-pulse']">
				<div class="section-header">
					<div class="section-title">
						<span>纳入统计分类</span>
						<span class="selected-count">(已选 {{ budgetForm.categoryCodes.length }} 项)</span>
					</div>
					<div
						v-if="canEditBudget"
						class="header-actions"
					>
						<span
							class="action-btn"
							@click="selectAllCategories"
						>全选</span>
						<span class="action-sep">|</span>
						<span
							class="action-btn"
							@click="clearAllCategories"
						>清空</span>
					</div>
				</div>

				<div class="section-sub-label">收支类型 (支持单选或同时勾选)</div>
				<div class="chip-group">
					<div
						:class="[
							'chip-item',
							'chip-item--expense',
							isDirectionSelected('expense') && 'active',
							!canEditBudget && 'chip-item--disabled',
						]"
						@click="toggleDirection('expense')"
					>
						<van-icon
							v-if="isDirectionSelected('expense')"
							name="success"
							class="chip-check"
						/>
						<span>支出 (消费)</span>
					</div>
					<div
						:class="[
							'chip-item',
							'chip-item--income',
							isDirectionSelected('income') && 'active',
							!canEditBudget && 'chip-item--disabled',
						]"
						@click="toggleDirection('income')"
					>
						<van-icon
							v-if="isDirectionSelected('income')"
							name="success"
							class="chip-check"
						/>
						<span>收入</span>
					</div>
				</div>

				<div class="section-sub-label category-sub-label">
					<span>账目类别 (提取自上月及本月)</span>
					<span
						v-if="categoriesLoading"
						class="loading-hint"
					>加载中...</span>
				</div>

				<div
					v-if="recentCategories.length"
					class="chip-group category-chips"
				>
					<div
						v-for="cat in recentCategories"
						:key="cat"
						:class="['chip-item', isCategorySelected(cat) && 'active', !canEditBudget && 'chip-item--disabled']"
						@click="toggleCategory(cat)"
					>
						<van-icon
							v-if="isCategorySelected(cat)"
							name="success"
							class="chip-check"
						/>
						<span>{{ cat }}</span>
					</div>
				</div>
				<div
					v-else-if="!categoriesLoading"
					class="empty-category-hint"
				>
					近两个月暂无具体记账类别，默认统计当前所选收支方向的全部记录
				</div>
			</div>

			<!-- 实时试算与健康度模拟卡片 (对齐 PC 端) -->
			<div class="dialog-simulation-card">
				<div class="simulation-header">
					<div class="simulation-title">
						<van-icon
							name="chart-trending-o"
							class="simulation-icon"
						/>
						<span>实时试算与健康度模拟</span>
					</div>
					<span
						v-if="previewStats.budget > 0"
						:class="['simulation-status', previewStats.isOver ? 'simulation-status--over' : 'simulation-status--normal']"
					>
						{{ previewStats.isOver ? '预算已透支超额' : `已使用 ${previewStats.percent}%` }}
					</span>
					<span
						v-else
						class="simulation-status simulation-status--none"
					>未设置限额</span>
				</div>

				<div class="simulation-grid">
					<div class="simulation-cell">
						<div class="cell-label">设定预算</div>
						<div class="cell-val">
							{{ previewStats.budget > 0 ? `¥${previewStats.budget.toFixed(2)}` : '无上限' }}
						</div>
					</div>
					<div class="simulation-cell">
						<div class="cell-label">本月已计</div>
						<div class="cell-val">
							<span
								v-if="simulationLoading"
								class="loading-text"
							>计算中...</span>
							<span v-else>{{ previewStats.actual < 0 ? '-' : '' }}¥{{ Math.abs(previewStats.actual).toFixed(2) }}</span>
						</div>
					</div>
					<div class="simulation-cell">
						<div class="cell-label">试算结余</div>
						<div :class="['cell-val', previewStats.isOver ? 'cell-val--over' : 'cell-val--remain']">
							<span
								v-if="simulationLoading"
								class="loading-text"
							>计算中...</span>
							<span v-else>{{ previewStats.remaining < 0 ? '-' : '' }}¥{{ Math.abs(previewStats.remaining).toFixed(2) }}</span>
						</div>
					</div>
				</div>

				<div
					v-if="previewStats.budget > 0"
					class="simulation-progress-wrap"
				>
					<van-progress
						:percentage="Math.max(0, Math.min(previewStats.percent, 100))"
						:color="previewStats.isOver ? '#e11d48' : '#1677ff'"
						:show-pivot="false"
						stroke-width="6"
					/>
				</div>
			</div>

			<div class="dialog-hint"> * 仅勾选的类别会计入预算，不勾选则默认统计当前所选收支方向的全部记录（不含转账）。 </div>
		</div>

		<!-- 底部操作悬浮栏 -->
		<div class="budget-footer-bar">
			<van-button
				block
				round
				class="btn-back"
				@click="onCancel"
			>
				{{ canEditBudget ? '取消' : '返回列表' }}
			</van-button>
			<van-button
				v-if="canEditBudget"
				type="primary"
				block
				round
				class="btn-save"
				:loading="saving"
				@click="onSaveBudget"
			>
				保存预算设定
			</van-button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { showFailToast, showSuccessToast } from 'vant';
import { useRouter } from 'vue-router';
import { useNavBar } from '@/composables/useNavBar';
import { usePermission } from '@/composables/usePermission';
import { formatMonth, getMonthRange } from '@/utils/dayjs';
import {
	getBudgetStatus,
	saveMonthlyBudget,
	getBudgetCategories,
	getFinanceSummary,
	recommendBudget,
	parseBudgetCommand,
} from '@/views/finance/financeManager/api';
import type { FinanceManagerData, FinanceBudgetAiRecommendVo } from '@/views/finance/financeManager/config';

const router = useRouter();
const { hasPermission } = usePermission();

// 导航栏
useNavBar({
	title: '零花钱预算管理',
	leftPath: '/finance/financeManager',
	visible: true,
});

// 编辑权限
const canEditBudget = computed(() => hasPermission('finance:financeManager:budget:edit'));

// 当前月份
const currentMonthStr = computed(() => formatMonth());

const budgetForm = reactive({
	budgetAmount: 0,
	incomeAndExpenses: 'expense',
	selectedDirections: ['expense'] as string[],
	categoryCodes: [] as string[],
});

const recentCategories = ref<string[]>([]);
const categoriesLoading = ref<boolean>(false);
const simulatedActualExpense = ref<number>(0);
const simulationLoading = ref<boolean>(false);
const saving = ref<boolean>(false);

const isDirectionSelected = (dir: string) => budgetForm.selectedDirections.includes(dir);

const toggleDirection = (dir: string) => {
	if (!canEditBudget.value) return;
	const set = new Set(budgetForm.selectedDirections);
	if (set.has(dir)) {
		if (set.size > 1) {
			set.delete(dir);
		}
	} else {
		set.add(dir);
	}
	budgetForm.selectedDirections = Array.from(set);
	if (set.has('expense') && set.has('income')) {
		budgetForm.incomeAndExpenses = 'all';
	} else if (set.has('income')) {
		budgetForm.incomeAndExpenses = 'income';
	} else {
		budgetForm.incomeAndExpenses = 'expense';
	}
	navigator.vibrate?.(10);
	debouncedPreview();
};

const isCategorySelected = (cat: string) => budgetForm.categoryCodes.includes(cat);

const toggleCategory = (cat: string) => {
	if (!canEditBudget.value) return;
	const set = new Set(budgetForm.categoryCodes);
	if (set.has(cat)) {
		set.delete(cat);
	} else {
		set.add(cat);
	}
	budgetForm.categoryCodes = Array.from(set);
	navigator.vibrate?.(10);
	debouncedPreview();
};

const selectAllCategories = () => {
	if (!canEditBudget.value) return;
	budgetForm.categoryCodes = [...recentCategories.value];
	navigator.vibrate?.(10);
	debouncedPreview();
};

const clearAllCategories = () => {
	if (!canEditBudget.value) return;
	budgetForm.categoryCodes = [];
	navigator.vibrate?.(10);
	debouncedPreview();
};

// 实时试算与健康度模拟卡片
const previewStats = computed(() => {
	const budget = Number(budgetForm.budgetAmount || 0);
	const actual = simulatedActualExpense.value;
	const remaining = budget - actual;
	const percent = budget > 0 ? Math.round((actual / budget) * 100) : 0;
	const isOver = budget > 0 && actual > budget;

	return {
		budget,
		actual,
		remaining,
		percent,
		isOver,
	};
});

let previewTimer: ReturnType<typeof setTimeout> | null = null;
const debouncedPreview = () => {
	if (previewTimer) clearTimeout(previewTimer);
	previewTimer = setTimeout(() => {
		fetchPreviewSimulation();
	}, 200);
};

watch(
	() => budgetForm.budgetAmount,
	() => {
		debouncedPreview();
	},
);

const fetchPreviewSimulation = async () => {
	simulationLoading.value = true;
	try {
		const [monthStart, monthEnd] = getMonthRange();
		const effectiveCategoryCodes = budgetForm.categoryCodes.filter(
			(c) => c !== '支出' && c !== '收入' && c !== 'expense' && c !== 'income',
		);

		const dirs = budgetForm.selectedDirections;
		const hasExp = dirs.includes('expense');
		const hasInc = dirs.includes('income');

		const queryParams: FinanceManagerData = {
			infoDateStart: monthStart,
			infoDateEnd: monthEnd,
		};

		if (effectiveCategoryCodes.length > 0) {
			const results = await Promise.all(
				effectiveCategoryCodes.map((cat) =>
					getFinanceSummary({
						...queryParams,
						typeCode: cat,
					}),
				),
			);

			let total = 0;
			results.forEach((res) => {
				if (res.code === '200' && res.data) {
					const exp = Number(res.data.totalExpense || 0);
					const inc = Number(res.data.totalIncome || 0);
					if (hasExp && !hasInc) total += exp;
					else if (!hasExp && hasInc) total += inc;
					else total += exp;
				}
			});
			simulatedActualExpense.value = total;
		} else {
			const res = await getFinanceSummary(queryParams);
			if (res.code === '200' && res.data) {
				const exp = Number(res.data.totalExpense || 0);
				const inc = Number(res.data.totalIncome || 0);
				if (hasExp && !hasInc) simulatedActualExpense.value = exp;
				else if (!hasExp && hasInc) simulatedActualExpense.value = inc;
				else simulatedActualExpense.value = exp - inc;
			}
		}
	} catch {
		// 忽略试算异常
	} finally {
		simulationLoading.value = false;
	}
};

const initData = async () => {
	categoriesLoading.value = true;
	try {
		const month = currentMonthStr.value;
		const [statusRes, catRes] = await Promise.all([getBudgetStatus(month), getBudgetCategories(month)]);

		if (catRes.code === '200' && Array.isArray(catRes.data)) {
			recentCategories.value = catRes.data.filter(
				(c) => c && c !== '支出' && c !== '收入' && c !== 'expense' && c !== 'income' && c !== '转账',
			);
		}

		if (statusRes.code === '200' && statusRes.data) {
			const d = statusRes.data;
			budgetForm.budgetAmount = Number(d.budgetAmount || 0);
			budgetForm.incomeAndExpenses = d.incomeAndExpenses || 'expense';

			if (d.incomeAndExpenses === 'all') {
				budgetForm.selectedDirections = ['expense', 'income'];
			} else if (d.incomeAndExpenses === 'income') {
				budgetForm.selectedDirections = ['income'];
			} else {
				budgetForm.selectedDirections = ['expense'];
			}

			if (Array.isArray(d.categoryCodes) && d.categoryCodes.length > 0) {
				budgetForm.categoryCodes = [...d.categoryCodes];
			} else if (recentCategories.value.length > 0) {
				budgetForm.categoryCodes = [...recentCategories.value];
			}
		} else if (recentCategories.value.length > 0) {
			budgetForm.categoryCodes = [...recentCategories.value];
		}

		fetchPreviewSimulation();
		onFetchAiRecommend();
	} catch {
		showFailToast('加载预算数据失败');
	} finally {
		categoriesLoading.value = false;
	}
};

// AI 智能预算测算与指令解析
const isAiExpanded = ref<boolean>(false);
const isAmountHighlighted = ref<boolean>(false);
const isCategoriesHighlighted = ref<boolean>(false);
const aiRecommending = ref<boolean>(false);
const aiParsing = ref<boolean>(false);
const aiCommandInput = ref<string>('');
const aiRecommendData = ref<FinanceBudgetAiRecommendVo | null>(null);

const triggerAmountHighlight = () => {
	isAmountHighlighted.value = true;
	navigator.vibrate?.([15, 50, 15]);
	setTimeout(() => {
		isAmountHighlighted.value = false;
	}, 1200);
};

const triggerCategoriesHighlight = () => {
	isCategoriesHighlighted.value = true;
	navigator.vibrate?.([15, 50, 15]);
	setTimeout(() => {
		isCategoriesHighlighted.value = false;
	}, 1200);
};

const clearAiCommandInput = () => {
	aiCommandInput.value = '';
	navigator.vibrate?.(10);
};

const toggleAiExpanded = () => {
	isAiExpanded.value = !isAiExpanded.value;
	navigator.vibrate?.(10);
};

const aiCommandSamples = ['设2500预算管餐饮交通', '每月2000管餐饮', '不设上限'];

const applyAiSample = (sample: string) => {
	aiCommandInput.value = sample;
	onAiParseCommand();
};

const onFetchAiRecommend = async () => {
	navigator.vibrate?.(10);
	aiRecommending.value = true;
	try {
		const month = currentMonthStr.value;
		const {
			code,
			data,
			message: msg,
		} = await recommendBudget({
			budgetMonth: month,
		});
		if (code === '200' && data) {
			aiRecommendData.value = data;
			showSuccessToast('AI 测算完成');
		} else {
			showFailToast(msg || 'AI 测算服务暂不可用');
		}
	} catch (e: any) {
		showFailToast(e?.message || '获取 AI 推荐失败');
	} finally {
		aiRecommending.value = false;
	}
};

const onAiParseCommand = async () => {
	if (!aiCommandInput.value || !aiCommandInput.value.trim()) {
		showFailToast('请输入指令');
		return;
	}
	navigator.vibrate?.(10);
	aiParsing.value = true;
	try {
		const month = currentMonthStr.value;
		const {
			code,
			data,
			message: msg,
		} = await parseBudgetCommand({
			command: aiCommandInput.value.trim(),
			budgetMonth: month,
		});
		if (code === '200' && data) {
			if (data.hasBudget && data.amount !== undefined && data.amount !== null) {
				budgetForm.budgetAmount = Number(data.amount);
				triggerAmountHighlight();
			}
			if (data.hasCategories && data.categories && data.categories.length > 0) {
				budgetForm.categoryCodes = [...data.categories];
				triggerCategoriesHighlight();
			}
			showSuccessToast(data.reasoning || '已应用 AI 配置');
			debouncedPreview();
		} else {
			showFailToast(msg || '未能解析该指令');
		}
	} catch (e: any) {
		showFailToast(e?.message || '指令解析失败');
	} finally {
		aiParsing.value = false;
	}
};

const applyRecommendTier = (amount?: number) => {
	if (!canEditBudget.value || amount === undefined || amount === null) return;
	budgetForm.budgetAmount = Number(amount);
	triggerAmountHighlight();
	debouncedPreview();
};

const applyRecommendedCategories = (categories?: string[]) => {
	if (!canEditBudget.value || !categories || !categories.length) return;
	budgetForm.categoryCodes = [...categories];
	triggerCategoriesHighlight();
	showSuccessToast('已采纳推荐分类');
	debouncedPreview();
};

const onSaveBudget = async () => {
	if (!canEditBudget.value) return;
	if (budgetForm.budgetAmount < 0) {
		showFailToast('预算金额不能为负数');
		return;
	}
	saving.value = true;
	try {
		const month = currentMonthStr.value;
		const { code, message } = await saveMonthlyBudget({
			budgetMonth: month,
			budgetAmount: budgetForm.budgetAmount,
			incomeAndExpenses: budgetForm.incomeAndExpenses,
			categoryCodes: budgetForm.categoryCodes,
		});

		if (code === '200') {
			showSuccessToast('预算保存成功');
			router.back();
		} else {
			showFailToast(message || '保存预算失败');
		}
	} catch {
		showFailToast('网络异常，保存失败');
	} finally {
		saving.value = false;
	}
};

const onCancel = () => {
	router.back();
};

onMounted(() => {
	initData();
});
</script>

<style scoped lang="less">
.budget-manage-page {
	min-height: 100vh;
	background-color: var(--page-bg, #f4f6fa);
	padding: 16px 16px 90px;
	box-sizing: border-box;
}

.readonly-notice-banner {
	display: flex;
	align-items: center;
	gap: 6px;
	padding: 10px 14px;
	margin-bottom: 12px;
	background-color: #fffbe6;
	border: 1px solid #ffe58f;
	border-radius: 8px;
	color: #d46b08;
	font-size: 13px;
	line-height: 1.4;

	.notice-icon {
		font-size: 16px;
		flex-shrink: 0;
	}
}

.budget-content-card {
	background: #ffffff;
	border-radius: 14px;
	padding: 16px;
	box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
}

.budget-month-banner {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 10px 12px;
	background: #f0f7ff;
	border-radius: 8px;
	margin-bottom: 14px;

	.banner-left {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.month-label {
		font-size: 13px;
		color: #4b5563;
	}

	.month-val {
		font-size: 14px;
		font-weight: 700;
		color: #1677ff;
	}

	.month-tip {
		font-size: 11px;
		color: #9ca3af;
	}
}

.ai-budget-card {
	background: linear-gradient(135deg, #f0f5ff 0%, #f8faff 50%, #faf5ff 100%);
	border: 1px solid #d6e4ff;
	border-radius: 12px;
	padding: 12px;
	margin-bottom: 14px;

	.ai-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		cursor: pointer;

		.ai-title-wrap {
			display: flex;
			align-items: center;
			gap: 6px;
			flex: 1;
			min-width: 0;

			.ai-badge {
				background: #4f46e5;
				color: #ffffff;
				font-size: 11px;
				font-weight: 700;
				padding: 2px 6px;
				border-radius: 6px;
				line-height: 1;
				flex-shrink: 0;
			}

			.ai-title-sub {
				display: flex;
				align-items: center;
				gap: 6px;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;

				.ai-title {
					font-size: 13px;
					font-weight: 600;
					color: #1e1b4b;
					flex-shrink: 0;
				}

				.ai-brief-tag {
					font-size: 10px;
					background: #e0e7ff;
					color: #4338ca;
					padding: 1px 5px;
					border-radius: 4px;
					font-weight: 500;
				}

				.ai-brief-tip {
					font-size: 11px;
					color: #818cf8;
				}
			}
		}

		.ai-header-right {
			display: flex;
			align-items: center;
			gap: 6px;
			flex-shrink: 0;

			.action-divider {
				color: #c7d2fe;
				font-size: 11px;
			}

			.ai-toggle-btn {
				display: flex;
				align-items: center;
				gap: 2px;
				font-size: 12px;
				color: #4b5563;
				cursor: pointer;

				.toggle-icon {
					font-size: 10px;
				}
			}
		}

		.ai-action-btn {
			display: flex;
			align-items: center;
			gap: 3px;
			font-size: 12px;
			color: #4f46e5;
			cursor: pointer;
			padding: 2px 6px;
			border-radius: 4px;

			.spin-icon {
				animation: spin 1s linear infinite;
			}
		}
	}

	.ai-expanded-area {
		margin-top: 10px;
		padding-top: 10px;
		border-top: 1px solid rgba(199, 210, 254, 0.4);
	}

	.ai-command-wrap {
		margin-top: 4px;

		.ai-input-box {
			display: flex;
			align-items: center;
			background: #ffffff;
			border: 1px solid #c7d2fe;
			border-radius: 8px;
			padding: 4px 6px 4px 10px;

			.ai-clear-icon {
				font-size: 14px;
				color: #9ca3af;
				padding: 0 4px;
				cursor: pointer;
			}

			.ai-input {
				flex: 1;
				border: none;
				outline: none;
				font-size: 12px;
				color: #1f2937;
				background: transparent;

				&::placeholder {
					color: #9ca3af;
				}
			}

			.ai-parse-btn {
				background: #4f46e5;
				color: #ffffff;
				border: none;
				border-radius: 6px;
				font-size: 11px;
				font-weight: 500;
				padding: 4px 10px;
				cursor: pointer;

				&:disabled {
					opacity: 0.6;
				}
			}
		}

		.ai-sample-chips {
			display: flex;
			align-items: center;
			gap: 6px;
			flex-wrap: wrap;
			margin-top: 6px;

			.sample-chip {
				font-size: 10px;
				color: #4b5563;
				background: rgba(255, 255, 255, 0.7);
				border: 1px solid #e0e7ff;
				border-radius: 10px;
				padding: 2px 8px;
				cursor: pointer;

				&:active {
					background: #e0e7ff;
					color: #3730a3;
				}
			}
		}
	}

	.ai-recommend-body {
		margin-top: 10px;
		background: rgba(255, 255, 255, 0.85);
		border: 1px solid #e0e7ff;
		border-radius: 8px;
		padding: 10px;

		.ai-advice-text {
			font-size: 12px;
			color: #374151;
			line-height: 1.5;
		}

		.ai-daily-suggest {
			font-size: 11px;
			color: #6b7280;
			margin-top: 4px;

			.num {
				font-weight: 600;
				color: #4f46e5;
			}
		}

		.ai-tier-grid {
			display: grid;
			grid-template-columns: repeat(3, 1fr);
			gap: 6px;
			margin-top: 8px;
			padding-top: 8px;
			border-top: 1px solid #f1f5f9;

			.ai-tier-cell {
				background: #f8fafc;
				border: 1px solid #e2e8f0;
				border-radius: 6px;
				padding: 6px 4px;
				text-align: center;
				cursor: pointer;
				position: relative;
				transition: all 0.2s;

				.tier-name {
					font-size: 10px;
					color: #64748b;
				}

				.tier-val {
					font-size: 13px;
					font-weight: 700;
					color: #1e293b;
					margin-top: 2px;
				}

				&.active {
					background: #eef2ff;
					border-color: #6366f1;

					.tier-name {
						color: #4f46e5;
					}

					.tier-val {
						color: #4338ca;
					}
				}

				&--recom {
					.recom-badge {
						position: absolute;
						top: -6px;
						right: 4px;
						background: #4f46e5;
						color: #ffffff;
						font-size: 9px;
						padding: 1px 4px;
						border-radius: 4px;
						line-height: 1.2;
					}
				}
			}
		}

		.ai-recom-cats {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 6px;
			margin-top: 8px;
			padding-top: 8px;
			border-top: 1px solid #f1f5f9;
			font-size: 11px;

			.cats-label {
				color: #64748b;
				flex-shrink: 0;
			}

			.cats-tags {
				display: flex;
				align-items: center;
				gap: 4px;
				flex-wrap: wrap;
				flex: 1;

				.cat-tag {
					background: #eef2ff;
					color: #4f46e5;
					border: 1px solid #c7d2fe;
					border-radius: 4px;
					padding: 1px 5px;
					font-size: 10px;
				}
			}

			.apply-cat-btn {
				color: #4f46e5;
				font-weight: 500;
				cursor: pointer;
				flex-shrink: 0;
				padding: 2px 4px;

				&:active {
					opacity: 0.7;
				}
			}
		}
	}
}

@keyframes spin {
	from {
		transform: rotate(0deg);
	}
	to {
		transform: rotate(360deg);
	}
}

.quick-ai-recommend-bar {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 6px 12px;
	background: #f8faff;
	border: 1px dashed #c7d2fe;
	border-radius: 8px;
	margin-bottom: 12px;

	.bar-label {
		font-size: 11px;
		color: #6b7280;
	}

	.ai-quick-pill {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		padding: 2px 8px;
		background: #ffffff;
		border: 1px solid #c7d2fe;
		border-radius: 12px;
		cursor: pointer;
		transition: all 0.2s;

		.pill-badge {
			font-size: 9px;
			color: #ffffff;
			background: #4f46e5;
			padding: 1px 4px;
			border-radius: 3px;
			line-height: 1.1;
		}

		.pill-amount {
			font-size: 12px;
			font-weight: 700;
			color: #4f46e5;
			font-family: monospace;
		}

		&.active {
			background: #4f46e5;
			border-color: #4f46e5;

			.pill-badge {
				background: #ffffff;
				color: #4f46e5;
			}

			.pill-amount {
				color: #ffffff;
			}
		}

		&:active {
			transform: scale(0.97);
		}
	}
}

.field-highlight-pulse {
	box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.5) !important;
	border-color: #6366f1 !important;
	transition: all 0.4s ease;
}

.category-highlight-pulse {
	box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.4) !important;
	border-radius: 12px;
	transition: all 0.4s ease;
}

.budget-amount-field {
	border: 1px solid #e5e7eb;
	border-radius: 8px;
	margin-bottom: 16px;
	padding: 10px 12px;
}

.dialog-category-section {
	margin-bottom: 16px;

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 8px;

		.section-title {
			font-size: 13px;
			font-weight: 600;
			color: #1f2937;

			.selected-count {
				color: #1677ff;
				font-weight: normal;
				margin-left: 4px;
			}
		}

		.header-actions {
			display: flex;
			align-items: center;
			gap: 8px;
			font-size: 12px;
			color: #1677ff;

			.action-btn {
				cursor: pointer;
				padding: 2px 4px;
			}

			.action-sep {
				color: #d1d5db;
			}
		}
	}

	.section-sub-label {
		font-size: 12px;
		color: #6b7280;
		margin-bottom: 6px;
	}

	.category-sub-label {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 10px;

		.loading-hint {
			color: #9ca3af;
			font-size: 11px;
		}
	}

	.empty-category-hint {
		font-size: 12px;
		color: #9ca3af;
		padding: 8px;
		background: #f9fafb;
		border-radius: 6px;
	}
}

.chip-group {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;

	.chip-item {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		padding: 6px 12px;
		background: #f3f4f6;
		border-radius: 16px;
		font-size: 12px;
		color: #4b5563;
		cursor: pointer;
		border: 1px solid transparent;
		transition: all 0.2s ease;

		.chip-check {
			font-size: 12px;
		}

		&.active {
			background: #e6f4ff;
			color: #1677ff;
			border-color: #91caff;
			font-weight: 500;
		}

		&--expense.active {
			background: #fff1f0;
			color: #f5222d;
			border-color: #ffa39e;
		}

		&--income.active {
			background: #f6ffed;
			color: #52c41a;
			border-color: #b7eb8f;
		}

		&--disabled {
			cursor: default;
			opacity: 0.85;
		}
	}
}

.dialog-simulation-card {
	background: #f9fafb;
	border-radius: 10px;
	padding: 12px;
	margin-bottom: 12px;
	border: 1px solid #f0f0f0;

	.simulation-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 10px;

		.simulation-title {
			display: flex;
			align-items: center;
			gap: 4px;
			font-size: 13px;
			font-weight: 600;
			color: #374151;

			.simulation-icon {
				color: #1677ff;
			}
		}

		.simulation-status {
			font-size: 12px;
			font-weight: 600;
			padding: 2px 8px;
			border-radius: 10px;

			&--normal {
				background: #e6f4ff;
				color: #1677ff;
			}

			&--over {
				background: #fee2e2;
				color: #ef4444;
			}

			&--none {
				background: #e5e7eb;
				color: #6b7280;
			}
		}
	}

	.simulation-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 6px;
		text-align: center;
		margin-bottom: 10px;

		.simulation-cell {
			background: #ffffff;
			border-radius: 6px;
			padding: 8px 4px;

			.cell-label {
				font-size: 11px;
				color: #9ca3af;
				margin-bottom: 4px;
			}

			.cell-val {
				font-size: 13px;
				font-weight: 700;
				color: #1f2937;

				&--remain {
					color: #10b981;
				}

				&--over {
					color: #ef4444;
				}
			}

			.loading-text {
				font-size: 11px;
				color: #9ca3af;
			}
		}
	}

	.simulation-progress-wrap {
		margin-top: 6px;
	}
}

.dialog-hint {
	font-size: 11px;
	color: #9ca3af;
	line-height: 1.5;
}

.budget-footer-bar {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	background: #ffffff;
	padding: 12px 16px;
	display: flex;
	gap: 12px;
	box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
	z-index: 100;
	box-sizing: border-box;

	.btn-back {
		flex: 1;
		border-color: #d1d5db;
		color: #4b5563;
	}

	.btn-save {
		flex: 2;
	}
}
</style>
