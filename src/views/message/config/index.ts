export const ID_KEY_PATTERN = /(^id$|Id$)/;

/**
 * 递归将所有 id / *Id 字段强制转为 string，防止雪花算法 64 位整数在 JS 中精度丢失
 */
export function normalizeMessageIds<T>(input: T): T {
	if (input === null || input === undefined) {
		return input;
	}
	if (Array.isArray(input)) {
		return input.map((item) => normalizeMessageIds(item)) as unknown as T;
	}
	if (typeof input === 'object') {
		const copy: Record<string, unknown> = {};
		for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
			if (ID_KEY_PATTERN.test(key) && (typeof value === 'number' || typeof value === 'bigint')) {
				copy[key] = String(value);
			} else if (value && typeof value === 'object') {
				copy[key] = normalizeMessageIds(value);
			} else {
				copy[key] = value;
			}
		}
		return copy as T;
	}
	return input;
}

export type MessageType = 'ALL' | 'GIFT_EVENT' | 'COUPON_EXPIRE' | 'CARD_EXPIRE' | 'SYSTEM';

export type MessageSubType = 'WELCOME' | 'ANNOUNCE' | 'D_DAY' | 'D_MINUS_1' | 'D_MINUS_3';

export type MessagePriority = 'HIGH' | 'MEDIUM' | 'NORMAL';

export type MessageBizType = 'SYSTEM' | 'GIFT_EVENT' | 'COUPON' | 'ACCOUNT_RECORD' | 'PREPAID_CARD';

export interface SysMessageInfoData {
	id?: string;
	orgId?: string;
	userId?: string;
	msgType?: string;
	subType?: string;
	priority?: MessagePriority | string;
	title?: string;
	content?: string;
	bizId?: string;
	bizType?: MessageBizType | string;
	jumpUrl?: string;
	readStatus?: number;
	readTime?: string;
	dedupKey?: string;
	remindDate?: string;
	createTime?: string;
	keyword?: string;
	onlyUnread?: boolean;
}

export interface SysMessageSummaryData {
	unreadTotal: number;
	systemUnread: number;
	giftEventUnread: number;
	couponExpireUnread: number;
	cardExpireUnread: number;
}

export interface MessageCategoryTab {
	key: MessageType;
	label: string;
	icon: string;
	summaryField?: keyof SysMessageSummaryData;
}

export const MESSAGE_CATEGORY_TABS: MessageCategoryTab[] = [
	{ key: 'ALL', label: '全部', icon: 'bell', summaryField: 'unreadTotal' },
	{ key: 'GIFT_EVENT', label: '礼金事件', icon: 'calendar-o', summaryField: 'giftEventUnread' },
	{
		key: 'COUPON_EXPIRE',
		label: '消费券',
		icon: 'coupon-o',
		summaryField: 'couponExpireUnread',
	},
	{ key: 'CARD_EXPIRE', label: '猫超/预付卡', icon: 'credit-pay', summaryField: 'cardExpireUnread' },
	{ key: 'SYSTEM', label: '系统通知', icon: 'volume-o', summaryField: 'systemUnread' },
];

export interface MessageBadgeMeta {
	text: string;
	color: string;
	bgColor: string;
	icon: string;
}

/**
 * 根据消息类型与子阶段解析视觉标签样式
 */
export const resolveMessageBadgeMeta = (item: SysMessageInfoData): MessageBadgeMeta => {
	if (item.subType === 'D_DAY' || item.priority === 'HIGH') {
		return {
			text: item.msgType === 'GIFT_EVENT' ? '今日举行' : '今日到期',
			color: '#ee0a24',
			bgColor: 'rgba(238, 10, 36, 0.1)',
			icon: item.msgType === 'GIFT_EVENT' ? 'calendar-o' : 'warning-o',
		};
	}
	if (item.subType === 'D_MINUS_1' || item.priority === 'MEDIUM') {
		return {
			text: item.msgType === 'GIFT_EVENT' ? '明日举行' : '明日到期',
			color: '#ff976a',
			bgColor: 'rgba(255, 151, 106, 0.12)',
			icon: item.msgType === 'GIFT_EVENT' ? 'clock-o' : 'underway-o',
		};
	}
	if (item.subType === 'D_MINUS_3') {
		return {
			text: '临期提醒',
			color: '#1989fa',
			bgColor: 'rgba(25, 137, 250, 0.1)',
			icon: 'info-o',
		};
	}
	if (item.msgType === 'GIFT_EVENT') {
		return {
			text: '礼金事件',
			color: '#ff976a',
			bgColor: 'rgba(255, 151, 106, 0.12)',
			icon: 'calendar-o',
		};
	}
	if (item.msgType === 'COUPON_EXPIRE') {
		return {
			text: '消费券提醒',
			color: '#1989fa',
			bgColor: 'rgba(25, 137, 250, 0.1)',
			icon: 'coupon-o',
		};
	}
	if (item.msgType === 'CARD_EXPIRE') {
		return {
			text: '卡包到期',
			color: '#07c160',
			bgColor: 'rgba(7, 193, 96, 0.1)',
			icon: 'credit-pay',
		};
	}
	return {
		text: '系统消息',
		color: '#7232dd',
		bgColor: 'rgba(114, 50, 221, 0.1)',
		icon: 'volume-o',
	};
};

/**
 * 解析移动端点击消息后的目标跳转路由
 */
export const resolveMobileMessageJumpRoute = (item: SysMessageInfoData): string => {
	if (item.jumpUrl && item.jumpUrl.trim()) {
		return item.jumpUrl.trim();
	}
	if (item.bizType === 'GIFT_EVENT' || item.msgType === 'GIFT_EVENT') {
		return '/finance/gift/event';
	}
	if (item.bizType === 'COUPON' || item.msgType === 'COUPON_EXPIRE') {
		return '/cpn-coupon/cpn-coupon-info';
	}
	if (item.bizType === 'ACCOUNT_RECORD') {
		return '/finance/accountRecordInfo';
	}
	if (item.bizType === 'PREPAID_CARD' || item.msgType === 'CARD_EXPIRE') {
		return '/selfFinance/prepaidCardInfoT';
	}
	return '';
};
