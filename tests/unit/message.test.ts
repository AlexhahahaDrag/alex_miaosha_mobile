import { describe, expect, it } from 'vitest';
import {
	normalizeMessageIds,
	MESSAGE_CATEGORY_TABS,
	resolveMessageBadgeMeta,
	resolveMobileMessageJumpRoute,
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
		expect(resolveMobileMessageJumpRoute({ msgType: 'SYSTEM', bizType: 'SYSTEM' })).toBe('');
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
