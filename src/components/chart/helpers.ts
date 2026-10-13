/**
 * 移动端 ECharts 纯函数辅助工具 (Ponytail 极简模式)
 * 拒绝多层 Vue 组件嵌套，以纯函数生成标准 ECharts Options，直通 BaseChart
 */

export interface PieDataItem {
	name: string;
	value: number;
	[key: string]: unknown;
}

const DEFAULT_PIE_COLORS = [
	'#1677ff',
	'#52c41a',
	'#faad14',
	'#f5222d',
	'#722ed1',
	'#13c2c2',
	'#eb2f96',
	'#fa8c16',
	'#2f54eb',
	'#fa541c',
];

/**
 * 构造标准环形/饼图配置
 */
export function createPieOption(
	title: string,
	data: PieDataItem[],
	options?: {
		formatter?: string;
		colors?: string[];
	},
): Record<string, unknown> {
	const hasTitle = Boolean(title);
	return {
		title: hasTitle
			? {
				text: title,
				left: 'center',
				textStyle: {
					fontSize: 14,
					fontWeight: 600,
					color: '#334155',
				},
			}
			: undefined,
		color: options?.colors || DEFAULT_PIE_COLORS,
		tooltip: {
			trigger: 'item',
			formatter: options?.formatter || '{b} : {c}元({d}%)',
		},
		legend: {
			bottom: 10,
			left: 'center',
			type: 'scroll',
			textStyle: {
				fontSize: 12,
				color: '#64748b',
			},
		},
		series: [
			{
				name: title || '',
				type: 'pie',
				radius: ['35%', '65%'],
				center: ['50%', hasTitle ? '48%' : '44%'],
				avoidLabelOverlap: true,
				itemStyle: {
					borderRadius: 4,
					borderColor: '#ffffff',
					borderWidth: 2,
				},
				data: data || [],
				emphasis: {
					itemStyle: {
						shadowBlur: 10,
						shadowOffsetX: 0,
						shadowColor: 'rgba(0, 0, 0, 0.2)',
					},
				},
				label: {
					show: false,
				},
			},
		],
	};
}

export interface TrendBarLineParams {
	title: string;
	xAxis: string[];
	xName?: string;
	sales: number[]; // 销售额
	counts: number[]; // 件数
	profits: number[]; // 利润
	tooltipSuffix?: string; // 如 "日" | "月"
}

/**
 * 构造日/月销售趋势复合图（双柱 + 折线 + 双 Y 轴）
 */
export function createSalesTrendOption({
	title,
	xAxis,
	xName = '',
	sales,
	counts,
	profits,
	tooltipSuffix = '',
}: TrendBarLineParams): Record<string, unknown> {
	return {
		title: {
			text: title,
			left: 'center',
			textStyle: {
				fontSize: 14,
				fontWeight: 600,
				color: '#334155',
			},
		},
		grid: {
			left: '6%',
			right: '8%',
			top: '18%',
			bottom: '15%',
			containLabel: true,
		},
		tooltip: {
			trigger: 'axis',
			axisPointer: { type: 'shadow' },
			formatter(
				params: Array<{ axisValue: string; marker: string; seriesName: string; value: number }>,
			) {
				if (!params || !params.length) return '';
				let tip = `<p style="margin: 0; text-align: left; font-weight: bold;">${params[0].axisValue}${tooltipSuffix}</p>`;
				params.forEach((item) => {
					const unit = item.seriesName === '件数' ? '件' : '元';
					tip += `<p style="margin: 2px 0 0 0; text-align: left;">${item.marker}${item.seriesName}: ${item.value ?? 0}${unit}</p>`;
				});
				return tip;
			},
		},
		legend: {
			bottom: 0,
			data: ['销售额', '件数', '利润'],
			textStyle: { fontSize: 12, color: '#64748b' },
		},
		xAxis: {
			type: 'category',
			data: xAxis,
			name: xName,
			axisTick: { alignWithLabel: true },
			axisLabel: { fontSize: 11 },
		},
		yAxis: [
			{
				type: 'value',
				name: '金额(元)',
				axisLabel: {
					formatter: (val: number) => (val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val),
				},
			},
			{
				type: 'value',
				name: '数量(件)',
				position: 'right',
				axisLabel: {
					formatter: (val: number) => val,
				},
			},
		],
		series: [
			{
				name: '销售额',
				type: 'bar',
				data: sales,
				itemStyle: { color: '#55aaff' },
			},
			{
				name: '件数',
				type: 'line',
				yAxisIndex: 1,
				data: counts,
				itemStyle: { color: '#ff9933' },
			},
			{
				name: '利润',
				type: 'bar',
				data: profits,
				itemStyle: { color: '#aa55ff' },
			},
		],
	};
}
