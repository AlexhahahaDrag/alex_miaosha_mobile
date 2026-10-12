import dayjs, { type Dayjs } from 'dayjs';
import zhCn from 'dayjs/locale/zh-cn';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale(zhCn);
dayjs.tz.setDefault('Asia/Shanghai');

const defaultDateFormat = 'YYYY-MM-DD';
const defaultTimeFormat = 'YYYY-MM-DD HH:mm:ss';
const dataTimeFormat = 'YYYY-MM-DD HH:mm';
const dateFormatYYYYMM = 'YYYY-MM';

dayjs.prototype.toISOString = function () {
	return this.format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
};

/**
 * 支持的日期/时间入参类型
 */
export type DateInput = string | number | Date | Dayjs | null | undefined;

/**
 * 格式化为 dayjs 对象（不传参数时默认返回当前时间的 Dayjs 对象）
 */
const formatDayjs = (date?: DateInput): Dayjs => {
	return date ? dayjs(date) : dayjs();
};

/**
 * 获取当前时间的 Dayjs 实例
 */
const nowDayjs = (): Dayjs => dayjs();

/**
 * 按天数进行增减运算（默认基准为当前时间）
 * @param days 增加的天数（负数代表减少）
 * @param baseDate 基准时间（可选，默认当前时间）
 */
const addDays = (days: number, baseDate?: DateInput): Dayjs => {
	return (baseDate ? dayjs(baseDate) : dayjs()).add(days, 'day');
};

/**
 * 格式化日期
 */
const formatDate = (date?: DateInput, dateFormat: string = defaultDateFormat): string => {
	if (!date) {
		return '';
	}

	return dayjs(date).format(dateFormat);
};

/**
 * 格式化时间
 */
const formatTime = (date?: DateInput, dateFormat: string = defaultTimeFormat): string => {
	return formatDate(date, dateFormat);
};

/**
 * 格式化月份 (YYYY-MM)
 * @param date 时间（可选，默认当前时间）
 */
const formatMonth = (date?: DateInput): string => {
	return (date ? dayjs(date) : dayjs()).format(dateFormatYYYYMM);
};

/**
 * 日期选择器格式化函数
 */
const datePickerFormatter = (type: string, option: { text: string }): { text: string } => {
	const suffixMap: Record<string, string> = {
		year: '年',
		month: '月',
		day: '日',
		hour: '时',
		minute: '分',
		second: '秒',
	};

	if (suffixMap[type]) {
		option.text += suffixMap[type];
	}

	return option;
};

/**
 * 获取相对时间信息
 */
const getFormatTimeInfo = (time?: string | Dayjs): string => {
	if (!time) return '--';

	const now = dayjs();
	const targetTime = dayjs(time);
	const diffMinutes = now.diff(targetTime, 'minute');
	const diffHours = now.diff(targetTime, 'hour');

	if (diffMinutes < 3) {
		return '刚刚';
	}

	if (diffMinutes < 60) {
		return `${diffMinutes}分钟前`;
	}

	if (diffHours < 24) {
		return `${diffHours}小时前`;
	}

	return targetTime.format(defaultTimeFormat);
};

/**
 * 格式化列表头部日期
 */
const formatHeaderDate = (date: string | Dayjs): string => {
	const now = dayjs().startOf('day');
	const target = dayjs(date);

	if (target.isSame(now, 'day')) return '今天';
	if (target.isSame(now.subtract(1, 'day'), 'day')) return '昨天';
	if (target.isSame(now, 'year')) return target.format('MM月DD日');

	return target.format('YYYY年MM月DD日');
};

/**
 * 获取指定月份的起止日期字符串 [月初, 月末]
 * @param dateOrOffset 支持月份偏移量（如 -1 上月, 0 本月, 1 下月）或指定日期/月份
 * @returns [月初, 月末] 格式为 YYYY-MM-DD
 */
const getMonthRange = (dateOrOffset: number | string | Dayjs = 0) => {
	const target =
		typeof dateOrOffset === 'number' ? dayjs().add(dateOrOffset, 'month') : dayjs(dateOrOffset);
	return [
		target.startOf('month').format(defaultDateFormat),
		target.endOf('month').format(defaultDateFormat),
	] as const;
};

/**
 * 获取指定月份的起止 Dayjs 对象 [月初, 月末]
 * @param dateOrOffset 支持月份偏移量（如 -1 上月, 0 本月）或指定日期/月份
 */
const getMonthRangeDayjs = (dateOrOffset: number | string | Dayjs = 0): [Dayjs, Dayjs] => {
	const target =
		typeof dateOrOffset === 'number' ? dayjs().add(dateOrOffset, 'month') : dayjs(dateOrOffset);
	return [target.startOf('month'), target.endOf('month')];
};

export type { Dayjs, DateInput };
export {
	defaultDateFormat,
	defaultTimeFormat,
	dateFormatYYYYMM,
	dataTimeFormat,
	formatDate,
	formatDayjs,
	formatTime,
	formatMonth,
	datePickerFormatter,
	getFormatTimeInfo,
	formatHeaderDate,
	getMonthRange,
	getMonthRangeDayjs,
	nowDayjs,
	addDays,
};
