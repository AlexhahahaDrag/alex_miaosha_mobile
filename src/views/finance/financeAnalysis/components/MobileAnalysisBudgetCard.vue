<template>
	<div
		class="mobile-budget-card"
		data-testid="mobile-analysis-budget-card"
	>
		<!-- 顶部标题栏 + 状态胶囊 + 调整预算入口 -->
		<div class="budget-card-header">
			<div class="header-left">
				<span class="header-icon-box">
					<van-icon name="balance-o" />
				</span>
				<span
					class="header-title"
					title="当月零钱消费与预算分析"
				>
					当月零钱预算
				</span>
				<span
					v-if="hasBudget && isOverBudget"
					class="status-pill status-pill--danger"
				>
					🚨 已超支
				</span>
				<span
					v-else-if="hasBudget && budgetStatus?.isInherited"
					class="status-pill status-pill--indigo"
				>
					继承自上月
				</span>
				<span
					v-else-if="!hasBudget && !loading"
					class="status-pill status-pill--slate"
				>
					未设限额
				</span>
				<span
					v-else-if="hasBudget && !loading"
					:class="['status-pill', usagePercent >= 80 ? 'status-pill--amber' : 'status-pill--emerald']"
				>
					{{ usagePercent >= 80 ? '预算偏紧' : '预算充裕' }}
				</span>
			</div>

			<button
				type="button"
				class="adjust-budget-btn"
				data-testid="mobile-analysis-open-budget-btn"
				@click="$emit('open-budget')"
			>
				<van-icon name="setting-o" />
				<span>{{ hasBudget ? '调整预算' : '设置预算' }}</span>
			</button>
		</div>

		<!-- 骨架屏：双舱流光占位 -->
		<div
			v-if="loading"
			class="budget-skeleton"
			data-testid="budget-card-skeleton"
		>
			<div class="sk-cabin-top">
				<div class="sk-top-row">
					<div class="sk-top-left">
						<div class="shimmer-bar sk-w-72 sk-h-12"></div>
						<div class="shimmer-bar sk-w-120 sk-h-26 sk-mt-6"></div>
					</div>
					<div class="shimmer-bar sk-w-110 sk-h-36 sk-rounded-12"></div>
				</div>
				<div class="shimmer-bar sk-w-full sk-h-10 sk-rounded-pill sk-my-12"></div>
				<div class="sk-compare-row">
					<div class="shimmer-bar sk-w-88 sk-h-14"></div>
					<div class="shimmer-bar sk-w-96 sk-h-14"></div>
				</div>
			</div>
			<div class="sk-cabin-bottom">
				<div class="sk-bottom-header">
					<div class="shimmer-bar sk-w-120 sk-h-14"></div>
					<div class="shimmer-bar sk-w-56 sk-h-12"></div>
				</div>
				<div
					v-for="idx in 3"
					:key="`budget-sk-cat-${idx}`"
					class="sk-cat-row"
				>
					<div class="sk-cat-top">
						<div class="shimmer-bar sk-w-72 sk-h-12"></div>
						<div class="shimmer-bar sk-w-64 sk-h-12"></div>
					</div>
					<div class="shimmer-bar sk-w-full sk-h-6 sk-rounded-pill sk-mt-6"></div>
				</div>
			</div>
		</div>

		<!-- 主体双舱结构 -->
		<div
			v-else
			class="budget-cabins"
		>
			<!-- 上半舱：零钱预算健康度与时间进度双轨条 -->
			<div
				:class="[
					'cabin-top',
					!hasBudget
						? 'cabin-top--empty'
						: isOverBudget
							? 'cabin-top--danger'
							: usagePercent >= 80
								? 'cabin-top--amber'
								: 'cabin-top--emerald',
				]"
			>
				<!-- 已配置零钱预算 -->
				<template v-if="hasBudget">
					<div class="balance-row">
						<div class="balance-main">
							<div class="balance-label-row">
								<span class="balance-label">
									{{ isOverBudget ? '已超支金额' : '剩余可用零钱' }}
								</span>
							</div>
							<div
								:class="['balance-amount', isOverBudget ? 'text-rose' : usagePercent >= 80 ? 'text-amber' : 'text-emerald']"
							>
								<span class="currency"> {{ isOverBudget ? '-' : '' }}¥ </span>{{ formatAmount(Math.abs(remainingAmount)) }}
							</div>
						</div>

						<!-- 右侧日均可用引导胶囊 -->
						<div
							v-if="isCurrentMonth && remainingDays > 0"
							class="daily-guide-pill"
						>
							<template v-if="!isOverBudget">
								<span>剩余 <b>{{ remainingDays }}</b> 天 · 建议日均 ≤</span>
								<strong class="guide-val">¥{{ formatAmount(dailyAvailable) }}</strong>
							</template>
							<template v-else>
								<span class="text-rose">剩余 {{ remainingDays }} 天 · 预算已透支</span>
							</template>
						</div>
						<div
							v-else-if="!isCurrentMonth"
							class="daily-guide-pill"
						>
							<span>全月日均开销</span>
							<strong class="guide-val"> ¥{{ formatAmount(actualExpense / Math.max(totalDaysInMonth, 1)) }}/天 </strong>
						</div>
					</div>

					<!-- 进度条 + 时间进度参考线 (Bullet Bar) -->
					<div class="bullet-wrap">
						<div class="bullet-track">
							<div
								:class="[
									'bullet-fill',
									isOverBudget ? 'bullet-fill--danger' : usagePercent >= 80 ? 'bullet-fill--amber' : 'bullet-fill--emerald',
								]"
								:style="{ width: `${progressBarWidth}%` }"
							></div>
						</div>

						<!-- 本月时间流逝参考锚点 (仅当月未超支时展示) -->
						<div
							v-if="isCurrentMonth && !isOverBudget"
							class="bullet-marker"
							:style="{ left: `${timeProgressPercent}%` }"
						>
							<div class="marker-line marker-line--slate"></div>
							<span class="marker-label marker-label--slate"> 时间参考 {{ timeProgressPercent }}% </span>
						</div>

						<!-- 超支模式下的 100% 预算上限锚点 -->
						<div
							v-if="isOverBudget && overBudgetCapMarkerLeft > 15 && overBudgetCapMarkerLeft < 95"
							class="bullet-marker"
							:style="{ left: `${overBudgetCapMarkerLeft}%` }"
						>
							<div class="marker-line marker-line--danger"></div>
							<span class="marker-label marker-label--danger"> 100% 上限 </span>
						</div>
					</div>

					<!-- 底部预算上限 vs 实际开销对比 -->
					<div class="budget-compare-row">
						<div class="compare-item">
							<span class="compare-label">零花钱预算上限</span>
							<span class="compare-val">¥{{ formatAmount(budgetAmount) }}</span>
						</div>
						<div
							class="compare-item compare-item--right"
							@click="$emit('view-records')"
						>
							<span class="compare-label"> 当月实际开销 ({{ usagePercent.toFixed(1) }}%) › </span>
							<span :class="['compare-val', isOverBudget ? 'text-rose' : 'text-slate']">
								¥{{ formatAmount(actualExpense) }}
							</span>
						</div>
					</div>
				</template>

				<!-- 未配置零钱预算 -->
				<template v-else>
					<div class="empty-budget-top">
						<div>
							<div class="balance-label">当月零花钱实际消费</div>
							<div class="balance-amount text-slate"> <span class="currency">¥</span>{{ formatAmount(actualExpense) }} </div>
						</div>
						<button
							type="button"
							class="setup-budget-cta"
							@click="$emit('open-budget')"
						>
							立即设置月度限额
						</button>
					</div>
					<div class="empty-budget-tip">
						设置月度零花钱预算与关联分类（如餐饮、零食、娱乐等），即可实时追踪每日可用额度与超支预警。
					</div>
				</template>
			</div>

			<!-- 下半舱：零钱消费分类 Top 4 构成与智能归因 -->
			<div class="cabin-bottom">
				<div class="cabin-bottom-header">
					<div class="bottom-title-group">
						<span class="bottom-title">零钱支出 Top 分类</span>
						<span class="scope-pill">{{ categoryScopeText }}</span>
					</div>
					<button
						type="button"
						class="view-detail-link"
						@click="$emit('view-records')"
					>
						<span>查看明细</span>
						<van-icon name="arrow" />
					</button>
				</div>

				<!-- Top 4 分类条形列表 -->
				<div
					v-if="topPocketCategories.length > 0"
					class="top-cat-list"
				>
					<div
						v-for="(cat, idx) in topPocketCategories"
						:key="cat.name"
						class="top-cat-item"
						@click="$emit('select-category', cat.name)"
					>
						<div class="cat-row-top">
							<div class="cat-left">
								<span class="cat-emoji">{{ getCategoryEmoji(cat.name) }}</span>
								<span class="cat-name">{{ cat.name }}</span>
								<span
									v-if="isOverBudget && idx === 0"
									class="culprit-pill"
								>
									主要开销项
								</span>
							</div>
							<div class="cat-right">
								<span class="cat-amount">¥{{ formatAmount(cat.value) }}</span>
								<span
									class="cat-percent"
									:style="{ color: getPocketCatColor(idx) }"
								>
									{{ cat.percent }}%
								</span>
							</div>
						</div>
						<div class="cat-bar-track">
							<div
								class="cat-bar-fill"
								:style="{
									width: `${Math.max(cat.percent, 3)}%`,
									backgroundColor: getPocketCatColor(idx),
								}"
							></div>
						</div>
					</div>
				</div>

				<div
					v-else
					class="empty-cat-state"
				>
					当月在零钱统计范围内暂无消费记录
				</div>

				<!-- 底部智能归因条 -->
				<div
					v-if="topCulpritCategory"
					class="smart-attribution-bar"
				>
					<span class="attribution-text">
						💡 {{ topCulpritCategory.isOverCulprit ? '超支归因：' : '' }}「<b>{{ topCulpritCategory.name }}</b>」为当月首要支出项，占零钱开销
						<strong class="attribution-pct">{{ topCulpritCategory.percent }}%</strong>
					</span>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { formatDayjs, nowDayjs } from '@/utils/dayjs';
import { getCategoryEmoji, type FinanceBudgetStatusVo } from '@/views/finance/financeManager/config';
import type { ItemInfo } from '@/views/finance/financeAnalysis/financeAnalysisDetail/common';

const props = defineProps<{
	loading?: boolean;
	budgetStatus?: FinanceBudgetStatusVo | null;
	expenseCategories: ItemInfo[];
	currentMonth: string;
	formatAmount: (val?: number) => string;
}>();

defineEmits<{
	(e: 'open-budget'): void;
	(e: 'view-records'): void;
	(e: 'select-category', categoryName: string): void;
}>();

const pocketPalette = [
	'#f43f5e', // rose-500
	'#f59e0b', // amber-500
	'#6366f1', // indigo-500
	'#8b5cf6', // violet-500
];
const getPocketCatColor = (idx: number) => pocketPalette[idx % pocketPalette.length];

const budgetAmount = computed(() => Number(props.budgetStatus?.budgetAmount || 0));
const hasBudget = computed(() => budgetAmount.value > 0);

// 过滤属于零花钱预算统计口径的分类明细（未指定分类则统计全部支出分类）
const scopedExpenseItems = computed(() => {
	const allItems = (props.expenseCategories || [])
		.map((item) => ({
			name: item.name || '未分类',
			value: Math.abs(Number(item.value) || 0),
		}))
		.filter((item) => item.value > 0)
		.sort((a, b) => b.value - a.value);

	const allowedNames = props.budgetStatus?.categoryNames || [];
	const allowedCodes = props.budgetStatus?.categoryCodes || [];
	if (allowedNames.length === 0 && allowedCodes.length === 0) {
		return allItems;
	}

	const allowedSet = new Set([...allowedNames, ...allowedCodes]);
	const matched = allItems.filter((item) => allowedSet.has(item.name));
	return matched.length > 0 ? matched : allItems;
});

const fallbackCategorySum = computed(() => scopedExpenseItems.value.reduce((sum, item) => sum + item.value, 0));

const actualExpense = computed(() => {
	if (props.budgetStatus?.actualExpense !== undefined) {
		return Number(props.budgetStatus.actualExpense || 0);
	}
	return fallbackCategorySum.value;
});

const remainingAmount = computed(() => {
	if (props.budgetStatus?.remainingAmount !== undefined) {
		return Number(props.budgetStatus.remainingAmount || 0);
	}
	return budgetAmount.value - actualExpense.value;
});

const usagePercent = computed(() => {
	if (props.budgetStatus?.usagePercent !== undefined) {
		return Number(props.budgetStatus.usagePercent || 0);
	}
	if (budgetAmount.value <= 0) return 0;
	return Number(((actualExpense.value / budgetAmount.value) * 100).toFixed(1));
});

const isOverBudget = computed(() => {
	if (props.budgetStatus?.isOverBudget !== undefined) {
		return Boolean(props.budgetStatus.isOverBudget);
	}
	return hasBudget.value && actualExpense.value > budgetAmount.value;
});

// 当月时间流逝与剩余天数计算
const now = computed(() => nowDayjs());
const isCurrentMonth = computed(() => {
	if (!props.currentMonth) return true;
	return props.currentMonth === now.value.format('YYYY-MM');
});

const totalDaysInMonth = computed(() => {
	if (!props.currentMonth) return now.value.daysInMonth();
	return formatDayjs(`${props.currentMonth}-01`).daysInMonth();
});

const elapsedDays = computed(() => {
	if (!isCurrentMonth.value) return totalDaysInMonth.value;
	return Math.min(Math.max(now.value.date(), 1), totalDaysInMonth.value);
});

const remainingDays = computed(() => {
	if (!isCurrentMonth.value) return 0;
	return Math.max(totalDaysInMonth.value - now.value.date() + 1, 1);
});

const timeProgressPercent = computed(() =>
	Math.min(100, Math.max(1, Math.round((elapsedDays.value / totalDaysInMonth.value) * 100))),
);

const dailyAvailable = computed(() => {
	if (remainingAmount.value <= 0 || remainingDays.value <= 0) return 0;
	return remainingAmount.value / remainingDays.value;
});

const progressBarWidth = computed(() => {
	if (!hasBudget.value) return 0;
	if (isOverBudget.value) return 100;
	return Math.min(100, Math.max(2, usagePercent.value));
});

const overBudgetCapMarkerLeft = computed(() => {
	if (!isOverBudget.value || actualExpense.value <= 0) return 100;
	return Math.round((budgetAmount.value / actualExpense.value) * 100);
});

const categoryScopeText = computed(() => {
	const names = props.budgetStatus?.categoryNames || [];
	if (!names.length) return '全部分类';
	if (names.length <= 2) return names.join('、');
	return `${names.slice(0, 2).join('、')}等${names.length}类`;
});

const topPocketCategories = computed(() => {
	const list = scopedExpenseItems.value;
	const total = list.reduce((sum, item) => sum + item.value, 0);
	if (total <= 0) return [];
	return list.slice(0, 4).map((item) => ({
		name: item.name,
		value: item.value,
		percent: Number(((item.value / total) * 100).toFixed(1)),
	}));
});

const topCulpritCategory = computed(() => {
	if (topPocketCategories.value.length === 0) return null;
	const first = topPocketCategories.value[0];
	return {
		...first,
		isOverCulprit: isOverBudget.value,
	};
});
</script>

<style lang="less" scoped>
.mobile-budget-card {
	background: #ffffff;
	border-radius: 18px;
	padding: 16px;
	margin-bottom: 14px;
	box-shadow: 0 4px 16px rgba(15, 23, 42, 0.04);
}

.budget-card-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 6px;
	margin-bottom: 12px;
	flex-wrap: nowrap;

	.header-left {
		display: flex;
		align-items: center;
		gap: 6px;
		min-width: 0;
		flex-wrap: nowrap;
	}

	.header-icon-box {
		width: 24px;
		height: 24px;
		border-radius: 8px;
		background: rgba(79, 106, 246, 0.1);
		color: #4f6af6;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-size: 14px;
		flex-shrink: 0;
	}

	.header-title {
		font-size: 14px;
		font-weight: 700;
		color: #0f172a;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
}

.status-pill {
	display: inline-flex;
	align-items: center;
	padding: 2px 7px;
	border-radius: 9999px;
	font-size: 10px;
	font-weight: 600;
	white-space: nowrap;
	flex-shrink: 0;

	&--danger {
		background: rgba(244, 63, 94, 0.12);
		color: #e11d48;
	}
	&--indigo {
		background: rgba(79, 106, 246, 0.1);
		color: #4f6af6;
	}
	&--amber {
		background: rgba(245, 158, 11, 0.14);
		color: #d97706;
	}
	&--emerald {
		background: rgba(16, 185, 129, 0.12);
		color: #059669;
	}
	&--slate {
		background: #f1f5f9;
		color: #64748b;
	}
}

.adjust-budget-btn {
	display: inline-flex;
	align-items: center;
	gap: 4px;
	height: 26px;
	padding: 0 9px;
	border-radius: 9999px;
	border: none;
	background: rgba(79, 106, 246, 0.1);
	color: #4f6af6;
	font-size: 11px;
	font-weight: 600;
	white-space: nowrap;
	flex-shrink: 0;
	cursor: pointer;
	transition: all 0.15s ease;

	&:active {
		transform: scale(0.96);
		background: #4f6af6;
		color: #ffffff;
	}
}

.budget-skeleton {
	display: flex;
	flex-direction: column;
	gap: 12px;

	.sk-cabin-top {
		background: #f8fafc;
		border-radius: 16px;
		padding: 14px;
	}

	.sk-top-row {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 8px;
	}

	.sk-compare-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-top: 10px;
		border-top: 1px solid rgba(226, 232, 240, 0.6);
	}

	.sk-cabin-bottom {
		background: #f8fafc;
		border-radius: 16px;
		padding: 14px;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.sk-bottom-header,
	.sk-cat-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
}

.shimmer-bar {
	border-radius: 6px;
	background: #e2e8f0;
	animation: budgetShimmer 1.4s ease-in-out infinite;
}

.sk-w-56 {
	width: 56px;
}
.sk-w-64 {
	width: 64px;
}
.sk-w-72 {
	width: 72px;
}
.sk-w-88 {
	width: 88px;
}
.sk-w-96 {
	width: 96px;
}
.sk-w-110 {
	width: 110px;
}
.sk-w-120 {
	width: 120px;
}
.sk-w-full {
	width: 100%;
}
.sk-h-6 {
	height: 6px;
}
.sk-h-10 {
	height: 10px;
}
.sk-h-12 {
	height: 12px;
}
.sk-h-14 {
	height: 14px;
}
.sk-h-26 {
	height: 26px;
}
.sk-h-36 {
	height: 36px;
}
.sk-mt-6 {
	margin-top: 6px;
}
.sk-my-12 {
	margin: 12px 0;
}
.sk-rounded-12 {
	border-radius: 12px;
}
.sk-rounded-pill {
	border-radius: 9999px;
}

@keyframes budgetShimmer {
	0%,
	100% {
		opacity: 1;
	}
	50% {
		opacity: 0.45;
	}
}

.budget-cabins {
	display: flex;
	flex-direction: column;
	gap: 12px;
}

.cabin-top {
	border-radius: 16px;
	padding: 14px;

	&--emerald {
		background: linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(248, 250, 252, 0.7) 100%);
	}
	&--amber {
		background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(248, 250, 252, 0.7) 100%);
	}
	&--danger {
		background: linear-gradient(135deg, rgba(244, 63, 94, 0.09) 0%, rgba(248, 250, 252, 0.7) 100%);
	}
	&--empty {
		background: #f8fafc;
	}
}

.balance-row {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	gap: 8px;
	flex-wrap: wrap;
	margin-bottom: 12px;
}

.balance-label {
	font-size: 12px;
	color: #64748b;
	font-weight: 500;
}

.balance-amount {
	font-size: 26px;
	font-weight: 800;
	font-variant-numeric: tabular-nums;
	line-height: 1.15;
	margin-top: 4px;

	.currency {
		font-size: 15px;
		font-weight: 700;
		margin-right: 1px;
	}

	&.text-emerald {
		color: #059669;
	}
	&.text-amber {
		color: #d97706;
	}
	&.text-rose {
		color: #e11d48;
	}
	&.text-slate {
		color: #0f172a;
	}
}

.daily-guide-pill {
	background: rgba(255, 255, 255, 0.9);
	padding: 6px 10px;
	border-radius: 12px;
	font-size: 11px;
	color: #475569;
	display: flex;
	flex-direction: column;
	align-items: flex-end;
	gap: 2px;
	box-shadow: 0 1px 4px rgba(15, 23, 42, 0.04);

	.guide-val {
		font-size: 13px;
		font-weight: 800;
		color: #0f172a;
		font-variant-numeric: tabular-nums;
	}
}

.bullet-wrap {
	position: relative;
	padding-top: 4px;
	padding-bottom: 18px;
}

.bullet-track {
	width: 100%;
	height: 10px;
	background: rgba(226, 232, 240, 0.75);
	border-radius: 9999px;
	overflow: hidden;
}

.bullet-fill {
	height: 100%;
	border-radius: 9999px;
	transition: width 0.35s ease;

	&--emerald {
		background: #10b981;
	}
	&--amber {
		background: #f59e0b;
	}
	&--danger {
		background: #f43f5e;
	}
}

.bullet-marker {
	position: absolute;
	top: 1px;
	display: flex;
	flex-direction: column;
	align-items: center;
	transform: translateX(-50%);
	pointer-events: none;

	.marker-line {
		width: 2px;
		height: 15px;
		border-radius: 9999px;

		&--slate {
			background: #64748b;
		}
		&--danger {
			background: #be123c;
		}
	}

	.marker-label {
		font-size: 9px;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
		margin-top: 2px;

		&--slate {
			color: #64748b;
		}
		&--danger {
			color: #e11d48;
		}
	}
}

.budget-compare-row {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 8px;
	padding-top: 10px;
	border-top: 1px solid rgba(226, 232, 240, 0.6);

	.compare-item {
		display: flex;
		flex-direction: column;
		gap: 2px;

		&--right {
			text-align: right;
			cursor: pointer;
		}
	}

	.compare-label {
		font-size: 11px;
		color: #64748b;
	}

	.compare-val {
		font-size: 13px;
		font-weight: 700;
		color: #1e293b;
		font-variant-numeric: tabular-nums;

		&.text-rose {
			color: #e11d48;
		}
	}
}

.empty-budget-top {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 10px;
	margin-bottom: 8px;
}

.setup-budget-cta {
	padding: 7px 12px;
	border-radius: 10px;
	border: none;
	background: #4f6af6;
	color: #ffffff;
	font-size: 12px;
	font-weight: 600;
	cursor: pointer;
}

.empty-budget-tip {
	font-size: 11px;
	color: #64748b;
	line-height: 1.5;
}

.cabin-bottom {
	background: #f8fafc;
	border-radius: 16px;
	padding: 14px;
}

.cabin-bottom-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 8px;
	margin-bottom: 10px;
	flex-wrap: nowrap;

	.bottom-title-group {
		display: flex;
		align-items: center;
		gap: 6px;
		min-width: 0;
		flex-wrap: nowrap;
	}

	.bottom-title {
		font-size: 13px;
		font-weight: 700;
		color: #1e293b;
		white-space: nowrap;
		flex-shrink: 0;
	}

	.scope-pill {
		font-size: 10px;
		color: #64748b;
		background: #ffffff;
		padding: 2px 8px;
		border-radius: 9999px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 140px;
	}

	.view-detail-link {
		border: none;
		background: transparent;
		padding: 0;
		color: #4f6af6;
		font-size: 11px;
		font-weight: 600;
		display: inline-flex;
		align-items: center;
		gap: 2px;
		white-space: nowrap;
		flex-shrink: 0;
		cursor: pointer;
	}
}

.top-cat-list {
	display: flex;
	flex-direction: column;
	gap: 10px;
}

.top-cat-item {
	cursor: pointer;

	.cat-row-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-size: 12px;
		margin-bottom: 5px;
		gap: 8px;
	}

	.cat-left {
		display: flex;
		align-items: center;
		gap: 6px;
		min-width: 0;
	}

	.cat-emoji {
		font-size: 13px;
		line-height: 1;
	}

	.cat-name {
		font-weight: 600;
		color: #334155;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.culprit-pill {
		font-size: 9px;
		font-weight: 600;
		padding: 1px 6px;
		border-radius: 9999px;
		background: rgba(244, 63, 94, 0.12);
		color: #e11d48;
		flex-shrink: 0;
	}

	.cat-right {
		display: flex;
		align-items: baseline;
		gap: 8px;
		font-variant-numeric: tabular-nums;
		flex-shrink: 0;
	}

	.cat-amount {
		font-weight: 700;
		color: #0f172a;
	}

	.cat-percent {
		font-size: 11px;
		font-weight: 600;
		width: 38px;
		text-align: right;
	}

	.cat-bar-track {
		width: 100%;
		height: 6px;
		background: rgba(226, 232, 240, 0.8);
		border-radius: 9999px;
		overflow: hidden;
	}

	.cat-bar-fill {
		height: 100%;
		border-radius: 9999px;
		transition: width 0.3s ease;
	}
}

.empty-cat-state {
	padding: 20px 0;
	text-align: center;
	font-size: 12px;
	color: #94a3b8;
}

.smart-attribution-bar {
	margin-top: 12px;
	padding-top: 10px;
	border-top: 1px solid rgba(226, 232, 240, 0.8);
	font-size: 11px;
	color: #475569;
	line-height: 1.45;

	b {
		color: #0f172a;
	}

	.attribution-pct {
		color: #e11d48;
		font-variant-numeric: tabular-nums;
	}
}
</style>
