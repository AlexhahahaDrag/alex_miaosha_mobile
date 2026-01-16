import { Dayjs } from 'dayjs';

// 格式化时间显示
export const formatTime = (timeStr: string | Dayjs | undefined): string => {
	if (!timeStr) return '';

	const date = timeStr instanceof Dayjs ? timeStr.toDate() : new Date(timeStr);
	const now = new Date();
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
	const recordDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

	const timeFormat = date.toLocaleTimeString('zh-CN', {
		hour: '2-digit',
		minute: '2-digit',
	});

	if (recordDate.getTime() === today.getTime()) {
		return `今天 ${timeFormat}`;
	} else if (recordDate.getTime() === yesterday.getTime()) {
		return `昨天 ${timeFormat}`;
	} else {
		return `${date.getMonth() + 1}月${date.getDate()}日 ${timeFormat}`;
	}
};

// 格式化金额显示
export const formatAmount = (amount: number, type: string): string => {
	if (!amount) return '￥0.00';

	const formattedAmount = Math.abs(amount).toFixed(2);

	// 根据交易类型决定正负号
	if (type === 'CONSUME' || type === 'DEBIT' || type === '消费') {
		return `-￥${formattedAmount}`;
	} else if (type === 'RECHARGE' || type === 'CREDIT' || type === '充值') {
		return `+￥${formattedAmount}`;
	} else {
		// 默认根据金额正负判断
		return amount >= 0 ? `+￥${formattedAmount}` : `-￥${formattedAmount}`;
	}
};

export interface Pagination {
	pageNum?: number;
	pageSize?: number;
	total?: number;
}

// 分页信息
export interface PageInfo {
	current?: number;
	pageSize?: number;
	total?: number;
}

// 模态框信息
export interface ModelInfo {
	title?: string;
	width?: string;
	id?: number | undefined;
	confirmLoading?: boolean;
}

// 字典信息
export interface DictInfo {
	typeCode?: string | number | undefined;
	typeName?: string | undefined;
}

export const getListName = <T>(list: T[], value: unknown, code: string, name: string): string => {
	if (!list?.length) {
		return '';
	}
	let listName = '';
	list.forEach((item) => {
		if (item[code] == value) {
			listName = item[name];
		}
	});
	return listName;
};
