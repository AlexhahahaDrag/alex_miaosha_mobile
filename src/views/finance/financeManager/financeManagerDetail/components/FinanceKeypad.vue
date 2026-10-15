<template>
	<div class="keypad-panel">
		<div class="keypad-grid">
			<button
				type="button"
				class="kp-btn num-btn"
				data-testid="keypad-btn-1"
				@click="pressKey('1')"
			>1</button>
			<button
				type="button"
				class="kp-btn num-btn"
				data-testid="keypad-btn-2"
				@click="pressKey('2')"
			>2</button>
			<button
				type="button"
				class="kp-btn num-btn"
				data-testid="keypad-btn-3"
				@click="pressKey('3')"
			>3</button>
			<button
				type="button"
				class="kp-btn func-btn delete-btn"
				data-testid="keypad-btn-delete"
				@click="pressKey('backspace')"
			>
				<van-icon name="delete-o" />
			</button>

			<button
				type="button"
				class="kp-btn num-btn"
				data-testid="keypad-btn-4"
				@click="pressKey('4')"
			>4</button>
			<button
				type="button"
				class="kp-btn num-btn"
				data-testid="keypad-btn-5"
				@click="pressKey('5')"
			>5</button>
			<button
				type="button"
				class="kp-btn num-btn"
				data-testid="keypad-btn-6"
				@click="pressKey('6')"
			>6</button>
			<button
				type="button"
				class="kp-btn func-btn date-shortcut-btn"
				data-testid="keypad-btn-date"
				@click="emit('date-click')"
			>
				<span class="date-shortcut-text">{{ dateShortcutText }}</span>
			</button>

			<button
				type="button"
				class="kp-btn num-btn"
				data-testid="keypad-btn-7"
				@click="pressKey('7')"
			>7</button>
			<button
				type="button"
				class="kp-btn num-btn"
				data-testid="keypad-btn-8"
				@click="pressKey('8')"
			>8</button>
			<button
				type="button"
				class="kp-btn num-btn"
				data-testid="keypad-btn-9"
				@click="pressKey('9')"
			>9</button>
			<button
				v-if="!isEdit"
				type="button"
				class="kp-btn func-btn continue-btn"
				data-testid="keypad-btn-continue"
				:disabled="loading"
				@click="emit('save-and-continue')"
			>
				再记一笔
			</button>
			<button
				v-else
				type="button"
				class="kp-btn func-btn reset-btn"
				data-testid="keypad-btn-reset"
				@click="emit('reset')"
			>
				重置
			</button>

			<button
				type="button"
				class="kp-btn num-btn"
				data-testid="keypad-btn-dot"
				@click="pressKey('.')"
			>.</button>
			<button
				type="button"
				class="kp-btn num-btn"
				data-testid="keypad-btn-0"
				@click="pressKey('0')"
			>0</button>
			<button
				type="button"
				class="kp-btn num-btn"
				data-testid="keypad-btn-00"
				@click="pressKey('00')"
			>00</button>
			<button
				v-if="canEdit"
				type="button"
				class="kp-btn func-btn submit-btn"
				data-testid="keypad-btn-submit"
				:disabled="loading"
				@click="emit('save-and-finish')"
			>
				{{ loading ? '保存中' : isEdit ? '保存' : '完成' }}
			</button>
			<button
				v-else
				type="button"
				class="kp-btn func-btn submit-btn readonly-btn"
				disabled
			>
				仅查看
			</button>
		</div>
	</div>
</template>

<script setup lang="ts">
const props = withDefaults(
	defineProps<{
		modelValue?: string;
		loading?: boolean;
		isEdit?: boolean;
		canEdit?: boolean;
		dateShortcutText?: string;
	}>(),
	{
		modelValue: '',
		loading: false,
		isEdit: false,
		canEdit: true,
		dateShortcutText: '今天',
	},
);

const emit = defineEmits<{
	(e: 'update:modelValue', val: string): void;
	(e: 'change-amount', val: number): void;
	(e: 'date-click'): void;
	(e: 'save-and-continue'): void;
	(e: 'save-and-finish'): void;
	(e: 'reset'): void;
}>();

const pressKey = (key: string) => {
	navigator.vibrate?.(10);
	let current = props.modelValue || '';

	if (key === 'backspace') {
		if (current.length > 0) {
			current = current.slice(0, -1);
		}
		emit('update:modelValue', current);
		emit('change-amount', Number(current) || 0);
		return;
	}

	if (key === '.') {
		if (current.includes('.')) return;
		if (!current) {
			current = '0.';
		} else {
			current += '.';
		}
		emit('update:modelValue', current);
		emit('change-amount', Number(current) || 0);
		return;
	}

	if (key === '00') {
		if (!current || current === '0') {
			current = '0';
			emit('update:modelValue', current);
			emit('change-amount', 0);
			return;
		}
		if (current.includes('.')) {
			const decimalPart = current.split('.')[1] || '';
			if (decimalPart.length >= 2) return;
			if (decimalPart.length === 1) {
				current += '0';
			} else {
				current += '00';
			}
		} else {
			if (Number(`${current}00`) > 9999999.99) return;
			current += '00';
		}
		emit('update:modelValue', current);
		emit('change-amount', Number(current) || 0);
		return;
	}

	// 数字按键 0-9
	if (!current || current === '0') {
		if (key === '0') {
			current = '0';
		} else {
			current = key;
		}
	} else {
		if (current.includes('.')) {
			const decimalPart = current.split('.')[1] || '';
			if (decimalPart.length >= 2) return;
		}
		if (Number(current + key) > 9999999.99) return;
		current += key;
	}
	emit('update:modelValue', current);
	emit('change-amount', Number(current) || 0);
};
</script>

<style lang="less" scoped>
.keypad-panel {
	flex-shrink: 0;
	background: #ffffff;
	border-top: 1px solid #e2e8f0;
	padding: 6px 8px calc(6px + env(safe-area-inset-bottom));
	box-shadow: 0 -4px 12px rgba(15, 23, 42, 0.04);

	.keypad-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		grid-auto-rows: 48px;
		gap: 6px;

		.kp-btn {
			border: none;
			border-radius: 10px;
			font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
			font-size: 20px;
			font-weight: 600;
			color: #1e293b;
			display: flex;
			align-items: center;
			justify-content: center;
			cursor: pointer;
			user-select: none;
			transition: background-color 0.1s ease;

			&.num-btn {
				background: #f8fafc;

				&:active {
					background: #e2e8f0;
				}
			}

			&.func-btn {
				&.delete-btn {
					background: #f1f5f9;
					color: #64748b;
					font-size: 20px;

					&:active {
						background: #e2e8f0;
					}
				}

				&.date-shortcut-btn {
					background: #f1f5f9;
					color: #2563eb;
					font-size: 13px;
					font-weight: 500;

					&:active {
						background: #e2e8f0;
					}
				}

				&.continue-btn {
					background: #eff6ff;
					color: #2563eb;
					font-size: 13px;
					font-weight: 600;

					&:active {
						background: #dbeafe;
					}
				}

				&.reset-btn {
					background: #f1f5f9;
					color: #64748b;
					font-size: 13px;

					&:active {
						background: #e2e8f0;
					}
				}

				&.submit-btn {
					background: #2563eb;
					color: #ffffff;
					font-size: 15px;
					font-weight: 600;

					&:active {
						background: #1d4ed8;
					}

					&:disabled {
						opacity: 0.7;
					}

					&.readonly-btn {
						background: #cbd5e1;
						color: #64748b;
					}
				}
			}
		}
	}
}
</style>
