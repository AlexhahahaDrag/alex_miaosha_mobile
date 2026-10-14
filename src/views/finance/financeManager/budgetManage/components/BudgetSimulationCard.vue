<template>
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
				v-if="budget > 0"
				:class="['simulation-status', isOver ? 'simulation-status--over' : 'simulation-status--normal']"
			>
				{{ isOver ? '预算已透支超额' : `已使用 ${percent}%` }}
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
					{{ budget > 0 ? `¥${budget.toFixed(2)}` : '无上限' }}
				</div>
			</div>
			<div class="simulation-cell">
				<div class="cell-label">本月已计</div>
				<div class="cell-val">
					<span
						v-if="simulationLoading"
						class="loading-text"
					>计算中...</span>
					<span v-else>{{ actual < 0 ? '-' : '' }}¥{{ Math.abs(actual).toFixed(2) }}</span>
				</div>
			</div>
			<div class="simulation-cell">
				<div class="cell-label">试算结余</div>
				<div :class="['cell-val', isOver ? 'cell-val--over' : 'cell-val--remain']">
					<span
						v-if="simulationLoading"
						class="loading-text"
					>计算中...</span>
					<span v-else>{{ remaining < 0 ? '-' : '' }}¥{{ Math.abs(remaining).toFixed(2) }}</span>
				</div>
			</div>
		</div>

		<div
			v-if="budget > 0"
			class="simulation-progress-wrap"
		>
			<van-progress
				:percentage="Math.max(0, Math.min(percent, 100))"
				:color="isOver ? '#e11d48' : '#1677ff'"
				:show-pivot="false"
				stroke-width="6"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
interface Props {
	budget: number;
	actual: number;
	remaining: number;
	percent: number;
	isOver: boolean;
	simulationLoading?: boolean;
}

withDefaults(defineProps<Props>(), {
	simulationLoading: false,
});
</script>

<style scoped lang="less">
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
</style>
