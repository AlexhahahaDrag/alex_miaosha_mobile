import { describe, expect, it } from 'vitest';
import {
	normalizeMessageIds,
	MESSAGE_CATEGORY_TABS,
	resolveMessageBadgeMeta,
	resolveMobileMessageJumpRoute,
	NOTICE_BIZ_META_MAP,
	isSubNoticeVetoed,
	type UserNoticeConfigData,
} from '@/views/message/config';

describe('Mobile Message Center Utilities', () => {
	it('normalizeMessageIds 应将所有 id 与 *Id 递归转换为 string', () => {
		const raw = {
			code: '200',
			data: {
				records: [
					{
						id: 1829301928301,
						orgId: 2001,
						userId: 1001,
						bizId: 9001,
						title: '张三婚礼提醒',
						readStatus: 0,
					},
				],
			},
		};
		const normalized = normalizeMessageIds(raw);
		const record = normalized.data.records[0];
		expect(typeof record.id).toBe('string');
		expect(record.id).toBe('1829301928301');
		expect(typeof record.orgId).toBe('string');
		expect(record.orgId).toBe('2001');
		expect(typeof record.userId).toBe('string');
		expect(record.userId).toBe('1001');
		expect(typeof record.bizId).toBe('string');
		expect(record.bizId).toBe('9001');
		expect(record.readStatus).toBe(0);
	});

	it('resolveMessageBadgeMeta 应按 subType 与 msgType 返回对应视觉徽章', () => {
		const dDayGift = resolveMessageBadgeMeta({
			msgType: 'GIFT_EVENT',
			subType: 'D_DAY',
			priority: 'HIGH',
		});
		expect(dDayGift.text).toBe('今日举行');
		expect(dDayGift.color).toBe('#ee0a24');

		const dMinus1Coupon = resolveMessageBadgeMeta({
			msgType: 'COUPON_EXPIRE',
			subType: 'D_MINUS_1',
			priority: 'MEDIUM',
		});
		expect(dMinus1Coupon.text).toBe('明日到期');

		const dMinus3Card = resolveMessageBadgeMeta({
			msgType: 'CARD_EXPIRE',
			subType: 'D_MINUS_3',
			priority: 'NORMAL',
		});
		expect(dMinus3Card.text).toBe('临期提醒');

		const sysWelcome = resolveMessageBadgeMeta({
			msgType: 'SYSTEM',
			subType: 'WELCOME',
			priority: 'NORMAL',
		});
		expect(sysWelcome.text).toBe('系统消息');
	});

	it('resolveMobileMessageJumpRoute 应准确解析四类业务的移动端跳转路由', () => {
		expect(resolveMobileMessageJumpRoute({ msgType: 'GIFT_EVENT', bizType: 'GIFT_EVENT' })).toBe(
			'/finance/gift/event',
		);
		expect(resolveMobileMessageJumpRoute({ msgType: 'COUPON_EXPIRE', bizType: 'COUPON' })).toBe(
			'/cpn-coupon/cpn-coupon-info',
		);
		expect(resolveMobileMessageJumpRoute({ msgType: 'CARD_EXPIRE', bizType: 'ACCOUNT_RECORD' })).toBe(
			'/finance/accountRecordInfo',
		);
		expect(resolveMobileMessageJumpRoute({ msgType: 'CARD_EXPIRE', bizType: 'PREPAID_CARD' })).toBe(
			'/selfFinance/prepaidCardInfoT',
		);
		expect(resolveMobileMessageJumpRoute({ msgType: 'GIFT_RETURN', bizType: 'GIFT_RETURN' })).toBe(
			'/finance/gift/analysis',
		);
		expect(resolveMobileMessageJumpRoute({ msgType: 'BUDGET', bizType: 'BUDGET' })).toBe(
			'/finance/financeManager/budgetManage',
		);
		expect(resolveMobileMessageJumpRoute({ msgType: 'SYSTEM', bizType: 'SYSTEM' })).toBe('');
	});

	it('resolveMessageBadgeMeta 应正确解析预算超支与预警徽章', () => {
		const budgetOver = resolveMessageBadgeMeta({
			msgType: 'BUDGET',
			subType: 'BUDGET_OVER',
			priority: 'HIGH',
		});
		expect(budgetOver.text).toBe('预算超支');
		expect(budgetOver.color).toBe('#ee0a24');

		const budgetWarn = resolveMessageBadgeMeta({
			msgType: 'BUDGET',
			subType: 'BUDGET_WARN',
			priority: 'MEDIUM',
		});
		expect(budgetWarn.text).toBe('预算预警');
		expect(budgetWarn.color).toBe('#ff976a');
	});

	it('MESSAGE_CATEGORY_TABS 应包含 5 个核心分类标签', () => {
		expect(MESSAGE_CATEGORY_TABS.map((t) => t.key)).toEqual([
			'ALL',
			'GIFT_EVENT',
			'COUPON_EXPIRE',
			'CARD_EXPIRE',
			'SYSTEM',
		]);
	});
});

describe('User Notice Configuration & Global Veto', () => {
	it('NOTICE_BIZ_META_MAP 应包含完整的 8 大业务项元数据', () => {
		const expectedCodes = [
			'GLOBAL',
			'GIFT_EVENT',
			'GIFT_RETURN',
			'COUPON',
			'PREPAID_CARD',
			'BUDGET_OVER',
			'FINANCE_REPORT',
			'SYSTEM',
		];
		for (const code of expectedCodes) {
			expect(NOTICE_BIZ_META_MAP[code]).toBeDefined();
			expect(NOTICE_BIZ_META_MAP[code].code).toBe(code);
			expect(NOTICE_BIZ_META_MAP[code].title).toBeTruthy();
			expect(NOTICE_BIZ_META_MAP[code].icon).toBeTruthy();
			expect(NOTICE_BIZ_META_MAP[code].badgeBg).toBeTruthy();
			expect(NOTICE_BIZ_META_MAP[code].badgeColor).toBeTruthy();
		}
	});

	it('isSubNoticeVetoed 在无 GLOBAL 配置时应安全返回 false', () => {
		const configs: UserNoticeConfigData[] = [
			{ noticeCode: 'COUPON', internalEnabled: true, wechatEnabled: true },
		];
		expect(isSubNoticeVetoed(configs, 'internal')).toBe(false);
		expect(isSubNoticeVetoed(configs, 'wechat')).toBe(false);
	});

	it('isSubNoticeVetoed 应准确反映 GLOBAL 站内信一票否决', () => {
		const configs: UserNoticeConfigData[] = [
			{ noticeCode: 'GLOBAL', internalEnabled: false, wechatEnabled: true },
			{ noticeCode: 'COUPON', internalEnabled: true, wechatEnabled: true },
		];
		expect(isSubNoticeVetoed(configs, 'internal')).toBe(true);
		expect(isSubNoticeVetoed(configs, 'wechat')).toBe(false);
	});

	it('isSubNoticeVetoed 应准确反映 GLOBAL 微信服务号一票否决', () => {
		const configs: UserNoticeConfigData[] = [
			{ noticeCode: 'GLOBAL', internalEnabled: true, wechatEnabled: false },
			{ noticeCode: 'GIFT_EVENT', internalEnabled: true, wechatEnabled: true },
		];
		expect(isSubNoticeVetoed(configs, 'internal')).toBe(false);
		expect(isSubNoticeVetoed(configs, 'wechat')).toBe(true);
	});

	it('isSubNoticeVetoed 在 GLOBAL 双开时允许子项正常受控', () => {
		const configs: UserNoticeConfigData[] = [
			{ noticeCode: 'GLOBAL', internalEnabled: true, wechatEnabled: true },
		];
		expect(isSubNoticeVetoed(configs, 'internal')).toBe(false);
		expect(isSubNoticeVetoed(configs, 'wechat')).toBe(false);
	});

	it('normalizeMessageIds 应准确处理 UserNoticeConfigData 的 Long 型 ID', () => {
		const raw = {
			code: '200',
			data: [
				{
					id: 1847162769425887234n,
					userId: 1001,
					noticeCode: 'GLOBAL',
					internalEnabled: true,
					wechatEnabled: false,
				},
			],
		};
		const normalized = normalizeMessageIds(raw);
		expect(normalized.data[0].id).toBe('1847162769425887234');
		expect(typeof normalized.data[0].id).toBe('string');
		expect(normalized.data[0].userId).toBe('1001');
		expect(typeof normalized.data[0].userId).toBe('string');
	});
});
