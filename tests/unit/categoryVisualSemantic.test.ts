import { describe, it, expect } from 'vitest';
import { getCategoryVisualItem } from '@/views/selfFinance/financeManager/financeManagerDetail/types';

describe('categoryVisualSemantic - 移动端记账分类语义 Emoji 与 Soft UI 色彩系统', () => {
	it('针对常见生活分类应能精准匹配对应的业务语义 Emoji 与图标', () => {
		const catering = getCategoryVisualItem('餐饮');
		expect(catering.emoji).toBe('🍱');
		expect(catering.icon).toBe('food-o');

		const haircut = getCategoryVisualItem('剪发');
		expect(haircut.emoji).toBe('💇');

		const heating = getCategoryVisualItem('取暖费');
		expect(heating.emoji).toBe('♨️');

		const salary = getCategoryVisualItem('工资', true);
		expect(salary.emoji).toBe('💰');

		const water = getCategoryVisualItem('水费');
		expect(water.emoji).toBe('💧');

		const living = getCategoryVisualItem('生活缴费');
		expect(living.emoji).toBe('🧾');

		const commute = getCategoryVisualItem('出行');
		expect(commute.emoji).toBe('🚕');

		const headphone = getCategoryVisualItem('耳机');
		expect(headphone.emoji).toBe('🎧');
	});

	it('子串匹配：未完全命中词典的复合分类应能模糊命中核心语义', () => {
		const taxi = getCategoryVisualItem('打车出行');
		expect(taxi.emoji).toBe('🚕');

		const coffee = getCategoryVisualItem('星巴克咖啡');
		expect(coffee.emoji).toBe('☕');
	});

	it('所有分类均映射到标准的 Soft UI 10% 柔和底色调色板，杜绝单一蓝方块', () => {
		const names = ['公司', '电脑', '菜', '红包', '零花', '年金', '杂物'];
		const colors = new Set<string>();

		names.forEach((name) => {
			const item = getCategoryVisualItem(name);
			expect(item.bgColor).toContain('rgba');
			colors.add(item.color);
		});

		// 确保多样性色彩，而非单调的同一种颜色
		expect(colors.size).toBeGreaterThan(1);
	});

	it('空分类名称与未定义输入应能优雅兜底', () => {
		const fallback = getCategoryVisualItem('');
		expect(fallback.name).toBe('其它');
		expect(fallback.emoji).toBe('🏷️');
	});
});
