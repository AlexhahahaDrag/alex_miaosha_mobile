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

	describe('移动端轻量人脉网络图谱配置构建', () => {
		const buildMobileGraphOption = (list: GiftPersonBalance[]) => {
			if (!list || list.length === 0) return {};

			const nodes: any[] = [{ id: 'NODE_ME', name: '我', symbolSize: 34 }];
			const links: any[] = [];

			const categories = [
				{ id: 'HUB_RELATIVE', name: '亲属' },
				{ id: 'HUB_COLLEAGUE', name: '同事' },
				{ id: 'HUB_FRIEND', name: '好友' },
				{ id: 'HUB_CLASSMATE', name: '同学' },
			];

			categories.forEach((cat) => {
				nodes.push({ id: cat.id, name: cat.name, symbolSize: 22 });
				links.push({ source: 'NODE_ME', target: cat.id });
			});

			const topList = [...list]
				.sort(
					(a, b) =>
						Number(b.totalReceiveAmount || 0) +
						Number(b.totalGiveAmount || 0) -
						(Number(a.totalReceiveAmount || 0) + Number(a.totalGiveAmount || 0)),
				)
				.slice(0, 8);

			topList.forEach((item) => {
				let hubId = 'HUB_FRIEND';
				if (
					item.relationType === 'RELATIVE' ||
					(item.relationTypeName && item.relationTypeName.includes('亲'))
				) {
					hubId = 'HUB_RELATIVE';
				} else if (
					item.relationType === 'COLLEAGUE' ||
					(item.relationTypeName && item.relationTypeName.includes('同'))
				) {
					hubId = 'HUB_COLLEAGUE';
				} else if (
					item.relationType === 'CLASSMATE' ||
					(item.relationTypeName && item.relationTypeName.includes('学'))
				) {
					hubId = 'HUB_CLASSMATE';
				}

				const pNodeId = `P_${item.personId}`;
				nodes.push({ id: pNodeId, name: item.personName, symbolSize: 18 });
				links.push({ source: hubId, target: pNodeId });
			});

			return { series: [{ data: nodes, links }] };
		};

		it('空列表返回空配置对象', () => {
			expect(buildMobileGraphOption([])).toEqual({});
		});

		it('应正确构建我、4大圈层Hub与前8位亲友节点', () => {
			const mockList: GiftPersonBalance[] = [
				{
					personId: '1',
					personName: '姑父',
					relationType: 'RELATIVE',
					totalReceiveAmount: 2000,
					totalGiveAmount: 1000,
					netBalance: 1000,
					balanceStatus: 'SURPLUS',
				},
				{
					personId: '2',
					personName: '李经理',
					relationType: 'COLLEAGUE',
					totalReceiveAmount: 500,
					totalGiveAmount: 500,
					netBalance: 0,
					balanceStatus: 'BALANCED',
				},
			];

			const option = buildMobileGraphOption(mockList);
			const nodes = option.series[0].data;
			const links = option.series[0].links;

			// 1(我) + 4(Hub) + 2(亲友) = 7
			expect(nodes.length).toBe(7);
			// 4(我到Hub) + 2(Hub到亲友) = 6
			expect(links.length).toBe(6);

			const p1 = nodes.find((n: any) => n.id === 'P_1');
			expect(p1.name).toBe('姑父');
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
