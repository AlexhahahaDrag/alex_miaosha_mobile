import { Decimal } from 'decimal.js';
import type { DatePickerColumnType } from 'vant/lib/date-picker/DatePicker';

// 加
const plus = (x: number | string, y: number | string) => {
	if (!x) {
		x = 0;
	}
	if (!y) {
		y = 0;
	}
	const xx = new Decimal(x);
	const yy = new Decimal(y);
	return xx.plus(yy).toNumber();
};

// 减
const minus = (x: number | string, y: number | string) => {
	if (!x) {
		x = 0;
	}
	if (!y) {
		y = 0;
	}
	const xx = new Decimal(x);
	const yy = new Decimal(y);
	return xx.minus(yy).toNumber();
};

// 乘
const multiply = (x: number | string, y: number | string) => {
	if (!x) {
		x = 0;
	}
	if (!y) {
		y = 0;
	}
	const xx = new Decimal(x);
	const yy = new Decimal(y);
	return xx.mul(yy).toNumber();
};

// 除
const divide = (x: number | string, y: number | string) => {
	if (!x) {
		x = 0;
	}
	if (!y) {
		y = 0;
	}
	const xx = new Decimal(x);
	const yy = new Decimal(y);
	return xx.div(yy).toNumber();
};

const formatAmount = (amount: number | Decimal, digit: number, unit: string) => {
	if (amount == null) {
		return '--';
	}
	return (
		String(amount.toFixed(digit))
			.replace(/(?<!\.\d*)\B(?=(\d{3})+(?!\d)) /g, ',')
			.replace(/^(-)*(\d+)\.(\d\d).*$/, '$1$2.$3') + unit
	);
};

/**
 * 日期选择器信息接口定义
 * @template T - 选择值的类型（通常是 Dayjs）
 */
export interface DatePickerInfo<T> {
	label: string;
	labelName: string;
	rule?: unknown;
	selectValue: T;
	showFlag: boolean;
	formatter: (type: string, option: { text: string }) => { text: string };
	columnsType?: DatePickerColumnType[];
}

export default {
	formatAmount,
	plus,
	minus,
	multiply,
	divide,
};
