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

export type MessageType =
	'ALL' | 'GIFT_EVENT' | 'GIFT_RETURN' | 'BUDGET' | 'COUPON_EXPIRE' | 'CARD_EXPIRE' | 'SYSTEM';

export type MessageSubType =
	| 'WELCOME'
	| 'ANNOUNCE'
	| 'D_DAY'
	| 'D_MINUS_1'
	| 'D_MINUS_3'
	| 'IMBALANCE'
	| 'EVENT_RETURN'
	| 'BUDGET_OVER'
	| 'BUDGET_WARN';

export type MessagePriority = 'HIGH' | 'MEDIUM' | 'NORMAL';

export type MessageBizType =
	'SYSTEM' | 'GIFT_EVENT' | 'GIFT_RETURN' | 'BUDGET' | 'COUPON' | 'ACCOUNT_RECORD' | 'PREPAID_CARD';

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
	if (item.msgType === 'BUDGET' || item.bizType === 'BUDGET') {
		return {
			text: item.subType === 'BUDGET_OVER' ? '预算超支' : '预算预警',
			color: item.subType === 'BUDGET_OVER' ? '#ee0a24' : '#ff976a',
			bgColor: item.subType === 'BUDGET_OVER' ? 'rgba(238, 10, 36, 0.1)' : 'rgba(255, 151, 106, 0.15)',
			icon: 'balance-pay',
		};
	}
	if (item.msgType === 'GIFT_RETURN' || item.bizType === 'GIFT_RETURN') {
		return {
			text: item.subType === 'EVENT_RETURN' ? '重大喜事回礼' : '礼金盈余待回',
			color: '#ff976a',
			bgColor: 'rgba(255, 151, 106, 0.15)',
			icon: 'gold-coin-o',
		};
	}
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
	if (item.bizType === 'BUDGET' || item.msgType === 'BUDGET') {
		return '/finance/financeManager/budgetManage';
	}
	if (item.bizType === 'GIFT_RETURN' || item.msgType === 'GIFT_RETURN') {
		return '/finance/gift/analysis';
	}
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

export interface UserNoticeConfigData {
	id?: string;
	userId?: string;
	noticeCode: string;
	noticeName?: string;
	noticeDesc?: string;
	internalEnabled: boolean;
	wechatEnabled: boolean;
}

export interface NoticeBizMeta {
	code: string;
	icon: string;
	badgeBg: string;
	badgeColor: string;
	title: string;
	desc: string;
}

export const NOTICE_BIZ_META_MAP: Record<string, NoticeBizMeta> = {
	GLOBAL: {
		code: 'GLOBAL',
		icon: 'setting-o',
		badgeBg: '#e8f4ff',
		badgeColor: '#1989fa',
		title: '全局通知总控',
		desc: '一票否决权：关闭后将彻底禁用对应渠道的所有业务提醒',
	},
	GIFT_EVENT: {
		code: 'GIFT_EVENT',
		icon: 'calendar-o',
		badgeBg: '#fff7e6',
		badgeColor: '#ff976a',
		title: '重大礼金喜事',
		desc: '喜事临近倒计时（D-3/D-1/当天）智能提醒',
	},
	GIFT_RETURN: {
		code: 'GIFT_RETURN',
		icon: 'gold-coin-o',
		badgeBg: '#ffe8e8',
		badgeColor: '#ee0a24',
		title: '人情往来回礼',
		desc: '亲友人情往来顺逆差与喜事待回礼智能预警',
	},
	COUPON: {
		code: 'COUPON',
		icon: 'coupon-o',
		badgeBg: '#fffbe8',
		badgeColor: '#ed6a0c',
		title: '消费券到期',
		desc: '优惠券临近失效防漏核销提醒',
	},
	PREPAID_CARD: {
		code: 'PREPAID_CARD',
		icon: 'credit-pay',
		badgeBg: '#e8ffea',
		badgeColor: '#07c160',
		title: '预付卡与猫超',
		desc: '猫超卡及多店铺预付卡有效期与余额提醒',
	},
	BUDGET_OVER: {
		code: 'BUDGET_OVER',
		icon: 'balance-pay',
		badgeBg: '#ffe8ec',
		badgeColor: '#ee0a24',
		title: '预算超支预警',
		desc: '月度家庭或个人支出预算超额时强提醒',
	},
	FINANCE_REPORT: {
		code: 'FINANCE_REPORT',
		icon: 'bar-chart-o',
		badgeBg: '#f0e8ff',
		badgeColor: '#7232dd',
		title: '财务收支简报',
		desc: '月度人情收支与资产分析汇总报表推送',
	},
	SYSTEM: {
		code: 'SYSTEM',
		icon: 'volume-o',
		badgeBg: '#f2f3f5',
		badgeColor: '#646566',
		title: '系统公告提醒',
		desc: '安全登录、版本更新与重要系统消息通知',
	},
};

/**
 * 判定子业务项在特定渠道（internal 或 wechat）是否已被 GLOBAL 全局总控一票否决
 */
export function isSubNoticeVetoed(
	configs: UserNoticeConfigData[],
	channel: 'internal' | 'wechat',
): boolean {
	const globalConfig = configs.find((item) => item.noticeCode === 'GLOBAL');
	if (!globalConfig) {
		return false;
	}
	if (channel === 'internal') {
		return !globalConfig.internalEnabled;
	}
	return !globalConfig.wechatEnabled;
}
