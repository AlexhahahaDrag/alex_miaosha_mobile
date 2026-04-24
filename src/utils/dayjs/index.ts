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
 * 格式化为 dayjs 对象
 */
const formatDayjs = (date: string | Dayjs | undefined | null): Dayjs | undefined => {
	if (!date) {
		return undefined;
	}

	return dayjs(date);
};

/**
 * 格式化日期
 */
const formatDate = (
	date: string | Dayjs | undefined | null,
	dateFormat: string = defaultDateFormat,
): string => {
	if (!date) {
		return '';
	}

	return dayjs(date).format(dateFormat);
};

/**
 * 格式化时间
 */
const formatTime = (
	date: string | Dayjs | undefined | null,
	dateFormat: string = defaultTimeFormat,
): string => {
	if (!date) {
		return '';
	}

	return dayjs(date).format(dateFormat);
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

	if (target.isSame(now, 'day')) return '今天 (Today)';
	if (target.isSame(now.subtract(1, 'day'), 'day')) return '昨天 (Yesterday)';
	if (target.isSame(now, 'year')) return target.format('MM月DD日');

	return target.format('YYYY年MM月DD日');
};

export {
	defaultDateFormat,
	defaultTimeFormat,
	dateFormatYYYYMM,
	dataTimeFormat,
	formatDate,
	formatDayjs,
	formatTime,
	datePickerFormatter,
	getFormatTimeInfo,
	formatHeaderDate,
};
