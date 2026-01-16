import zhCn from 'dayjs/locale/zh-cn';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale(zhCn);

// 设置默认时区为中国
dayjs.tz.setDefault('Asia/Shanghai');

const defaultDateFormat = 'YYYY-MM-DD';

const defaultTimeFormat = 'YYYY-MM-DD HH:mm:ss';

const dataTimeFormat = 'YYYY-MM-DD HH:mm';

const dateFormatYYYYMM = 'YYYY-MM';

dayjs.prototype.toISOString = function () {
	return this.format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
};

/**
 * 格式化时间
 * @param date 时间
 * @returns 格式化后的时间
 */
const formatDayjs = (date: string | Dayjs | undefined | null): Dayjs | string | undefined => {
	if (!date) {
		return undefined;
	}
	return dayjs(date);
};

/**
 * 格式化日期
 * @param date 日期
 * @param dateFormat
 * @returns 格式化后的日期
 */
const formatDate = (
	date: string | Dayjs | undefined | null,
	dateFormat: string = defaultDateFormat,
) => {
	if (!date) {
		return '';
	}
	return dayjs(date).format(dateFormat);
};

/**
 * 格式化时间
 * @param date 时间
 * @param dateFormat 时间格式
 * @returns 格式化后的时间
 */
const formatTime = (
	date: string | Dayjs | undefined | null,
	dateFormat: string = defaultTimeFormat,
) => {
	if (!date) {
		return '';
	}
	return dayjs(date).format(dateFormat);
};

/**
 * 日期选择器格式化函数，支持年月日和年月日时分秒格式
 * @param type - 日期类型（year, month, day, hour, minute, second）
 * @param option - 选项对象，包含 text 属性
 * @returns 格式化后的选项对象
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

// 导出所有工具函数和常量
export {
	defaultDateFormat,
	defaultTimeFormat,
	dateFormatYYYYMM,
	dataTimeFormat,
	formatDate,
	formatDayjs,
	formatTime,
	datePickerFormatter,
};
