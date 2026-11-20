<template>
	<div class="dialog-simulation-card">
		<div class="simulation-header">
			<div class="simulation-title">
				<van-icon
					name="chart-trending-o"
					class="simulation-icon"
				/>
				<span>预算试算</span>
			</div>
			<span
				v-if="budget > 0"
				:class="['simulation-status', isOver ? 'simulation-status--over' : 'simulation-status--normal']"
			>
				{{ isOver ? '已超支' : `已用 ${percent}%` }}
			</span>
			<span
				v-else
				class="simulation-status simulation-status--none"
			>不限额</span>
		</div>

		<div class="simulation-grid">
			<div class="simulation-cell">
				<div class="cell-label">预算</div>
				<div class="cell-val">
					{{ budget > 0 ? `¥${budget.toFixed(2)}` : '不限' }}
				</div>
			</div>
			<div class="simulation-cell">
				<div class="cell-label">本月已用</div>
				<div class="cell-val">
					<span
						v-if="simulationLoading"
						class="loading-text"
					>计算中...</span>
					<span v-else>{{ actual < 0 ? '-' : '' }}¥{{ Math.abs(actual).toFixed(2) }}</span>
				</div>
			</div>
			<div class="simulation-cell">
				<div class="cell-label">预计结余</div>
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
				:color="isOver ? '#e11d48' : '#4f6af6'"
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
	background: #f8fafc;
	border-radius: 12px;
	padding: 12px;
	margin-bottom: 12px;

	.simulation-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 10px;

		.simulation-title {
			display: flex;
			align-items: center;
			gap: 5px;
			font-size: 13px;
			font-weight: 600;
			color: #0f172a;

			.simulation-icon {
				color: #4f6af6;
			}
		}

		.simulation-status {
			font-size: 11px;
			font-weight: 600;
			padding: 2px 8px;
			border-radius: 999px;

			&--normal {
				background: #eef2ff;
				color: #4f6af6;
			}

			&--over {
				background: #fff1f2;
				color: #e11d48;
			}

			&--none {
				background: #e2e8f0;
				color: #64748b;
			}
		}
	}

	.simulation-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 8px;
		text-align: center;

		.simulation-cell {
			background: #ffffff;
			border-radius: 8px;
			padding: 10px 4px;

			.cell-label {
				font-size: 11px;
				color: #94a3b8;
				margin-bottom: 4px;
			}

			.cell-val {
				font-size: 13px;
				font-weight: 700;
				color: #0f172a;
				font-variant-numeric: tabular-nums;

				&--remain {
					color: #059669;
				}

				&--over {
					color: #e11d48;
				}
			}

			.loading-text {
				font-size: 11px;
				color: #94a3b8;
			}
		}
	}

	.simulation-progress-wrap {
		margin-top: 10px;
	}
}
</style>
