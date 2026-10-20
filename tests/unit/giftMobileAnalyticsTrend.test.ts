import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { triggerHaptic } from '@/utils/haptics';
import type { GiftPersonBalance, GiftAmountTrend } from '@/views/finance/gift/config';

describe('Gift Mobile Analytics Trend & Circle Filtering Tests', () => {
	const originalVibrate = navigator.vibrate;

	beforeEach(() => {
		navigator.vibrate = vi.fn().mockReturnValue(true);
	});

	afterEach(() => {
		navigator.vibrate = originalVibrate;
	});

	describe('顺逆差计算与 ECharts 配置组装算法', () => {
		const buildTrendChartOption = (trendList: GiftAmountTrend[]) => {
			if (trendList.length === 0) return {};
			const xData = trendList.map((item) => item.label || '');
			const receiveData = trendList.map((item) => Number(item.receiveAmount || 0));
			const giveData = trendList.map((item) => Number(item.giveAmount || 0));
			const gapData = trendList.map(
				(item) => Number(item.receiveAmount || 0) - Number(item.giveAmount || 0),
			);

			return {
				tooltip: {
					trigger: 'axis',
					axisPointer: { type: 'shadow' },
					confine: true,
				},
				legend: {
					data: ['收礼', '随礼', '顺逆差'],
					top: 0,
					itemWidth: 10,
					itemHeight: 10,
				},
				grid: {
					top: 36,
					bottom: 24,
					left: 45,
					right: 45,
				},
				xAxis: {
					type: 'category',
					data: xData,
				},
				yAxis: [
					{
						type: 'value',
						name: '金额(元)',
						position: 'left',
					},
					{
						type: 'value',
						name: '差额(元)',
						position: 'right',
					},
				],
				series: [
					{
						name: '收礼',
						type: 'bar',
						data: receiveData,
						itemStyle: { color: '#52c41a' },
					},
					{
						name: '随礼',
						type: 'bar',
						data: giveData,
						itemStyle: { color: '#fa8c16' },
					},
					{
						name: '顺逆差',
						type: 'line',
						yAxisIndex: 1,
						data: gapData,
						itemStyle: { color: '#2563eb' },
					},
				],
			};
		};

		it('空趋势列表应返回空配置对象以避免图表空白异常', () => {
			const option = buildTrendChartOption([]);
			expect(option).toEqual({});
		});

		it('应正确组装多月度柱条与双轴顺逆差折线系列', () => {
			const mockTrends: GiftAmountTrend[] = [
				{ label: '2026-01', receiveAmount: 3000, giveAmount: 1000 },
				{ label: '2026-02', receiveAmount: 500, giveAmount: 2000 },
				{ label: '2026-03', receiveAmount: 1500, giveAmount: 1500 },
			];

			const option = buildTrendChartOption(mockTrends);
			expect(option.xAxis?.data).toEqual(['2026-01', '2026-02', '2026-03']);
			expect(option.series?.[0].data).toEqual([3000, 500, 1500]); // 收礼
			expect(option.series?.[1].data).toEqual([1000, 2000, 1500]); // 随礼
			// 顺逆差 = 收礼 - 随礼：[+2000, -1500, 0]
			expect(option.series?.[2].data).toEqual([2000, -1500, 0]);
			expect(option.series?.[2].yAxisIndex).toBe(1);
		});

		it('当金额为 0 或缺省时应优雅降级为 0 而非 NaN', () => {
			const mockTrends: GiftAmountTrend[] = [{ label: '2026-04' } as any];
			const option = buildTrendChartOption(mockTrends);
			expect(option.series?.[0].data).toEqual([0]);
			expect(option.series?.[1].data).toEqual([0]);
			expect(option.series?.[2].data).toEqual([0]);
		});
	});

	describe('圈层胶囊过滤与双重条件过滤', () => {
		const mockMatrix: GiftPersonBalance[] = [
			{
				personId: '1001',
				personName: '大姑妈',
				relationType: 'RELATIVE',
				relationTypeName: '亲属',
				totalReceiveAmount: 2000,
				totalGiveAmount: 500,
				netBalance: 1500,
				balanceStatus: 'SURPLUS',
			},
			{
				personId: '1002',
				personName: '王经理',
				relationType: 'COLLEAGUE',
				relationTypeName: '同事',
				totalReceiveAmount: 200,
				totalGiveAmount: 1000,
				netBalance: -800,
				balanceStatus: 'DEFICIT',
			},
			{
				personId: '1003',
				personName: '小李',
				relationType: 'FRIEND',
				relationTypeName: '朋友',
				totalReceiveAmount: 500,
				totalGiveAmount: 500,
				netBalance: 0,
				balanceStatus: 'BALANCED',
			},
		];

		const filterMatrix = (list: GiftPersonBalance[], keyword: string, circle: string) => {
			return list.filter((item) => {
				const matchKeyword =
					!keyword.trim() || item.personName.toLowerCase().includes(keyword.trim().toLowerCase());
				const matchCircle =
					circle === 'ALL' || item.relationType === circle || item.relationTypeName === circle;
				return matchKeyword && matchCircle;
			});
		};

		it('ALL 圈层下应展示全部列表', () => {
			const filtered = filterMatrix(mockMatrix, '', 'ALL');
			expect(filtered.length).toBe(3);
		});

		it('选择特定圈层时应精准过滤', () => {
			const colleagues = filterMatrix(mockMatrix, '', 'COLLEAGUE');
			expect(colleagues.length).toBe(1);
			expect(colleagues[0].personName).toBe('王经理');
		});

		it('圈层与关键词双重交集过滤', () => {
			const res1 = filterMatrix(mockMatrix, '大', 'RELATIVE');
			expect(res1.length).toBe(1);
			expect(res1[0].personName).toBe('大姑妈');

			const res2 = filterMatrix(mockMatrix, '大', 'COLLEAGUE');
			expect(res2.length).toBe(0);
		});
	});

	describe('圈层点击触觉震动微交互', () => {
		it('切换圈层胶囊应触发 selection 触觉震动', () => {
			const res = triggerHaptic('selection');
			expect(res).toBe(true);
			expect(navigator.vibrate).toHaveBeenCalledWith(10);
		});
	});
});
