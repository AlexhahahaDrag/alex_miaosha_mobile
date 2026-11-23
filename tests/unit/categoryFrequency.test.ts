import { describe, it, expect, beforeEach } from 'vitest';
import {
	loadCategoryFrequency,
	recordCategoryUsage,
	sortCategoriesByFrequency,
	loadRecentCategories,
	saveRecentCategory,
} from '@/views/selfFinance/financeManager/financeManagerDetail/composables/useCategoryFrequency';

describe('useCategoryFrequency - 记账分类频次自适应记忆与排序测试', () => {
	beforeEach(() => {
		localStorage.clear();
	});

	it('初始状态读取分类频次应为空对象', () => {
		const map = loadCategoryFrequency();
		expect(map).toEqual({});
	});

	it('记录分类使用频次后应自增并正确持久化', () => {
		recordCategoryUsage('餐饮');
		recordCategoryUsage('餐饮');
		recordCategoryUsage('交通');

		const map = loadCategoryFrequency();
		expect(map['餐饮']).toBe(2);
		expect(map['交通']).toBe(1);

		const recents = loadRecentCategories();
		expect(recents[0]).toBe('交通');
		expect(recents[1]).toBe('餐饮');
	});

	it('根据频次加权对分类列表进行降序重排，高频优先置顶', () => {
		const list = [{ name: '医疗' }, { name: '娱乐' }, { name: '餐饮' }, { name: '交通' }];
		const freqMap = {
			餐饮: 10,
			交通: 5,
			娱乐: 0,
			医疗: 1,
		};

		const sorted = sortCategoriesByFrequency(list, freqMap);
		expect(sorted.map((item) => item.name)).toEqual(['餐饮', '交通', '医疗', '娱乐']);
	});

	it('空分类名称记录应被安全忽略', () => {
		recordCategoryUsage('');
		recordCategoryUsage('   ');
		const map = loadCategoryFrequency();
		expect(Object.keys(map).length).toBe(0);

		saveRecentCategory('');
		saveRecentCategory('其它');
		expect(loadRecentCategories().length).toBe(0);
	});

	it('最近分类列表按最后使用时间倒序排列并去重', () => {
		saveRecentCategory('餐饮');
		saveRecentCategory('交通');
		saveRecentCategory('餐饮'); // 再次使用餐饮，应移到最前
		saveRecentCategory('宠物');

		const recents = loadRecentCategories();
		expect(recents).toEqual(['宠物', '餐饮', '交通']);
	});
});
