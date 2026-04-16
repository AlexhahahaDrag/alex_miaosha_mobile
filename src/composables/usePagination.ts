import { reactive } from 'vue';
import type { PageInfo } from '@/views/common/config';

export const usePagination = (initialConfig?: Partial<PageInfo>) => {
	// 默认配置
	const defaultConfig: PageInfo = {
		total: 0,
		current: 1,
		pageSize: 10,
	};

	// 合并配置并转为响应式
	const pagination = reactive<PageInfo>({
		...defaultConfig,
		...initialConfig,
	});

	// 重置分页
	const resetPagination = () => {
		pagination.current = 1;
		pagination.total = 0;
	};

	// 设置总数
	const setTotal = (total: number) => {
		pagination.total = total;
	};

	// 设置当前页
	const setCurrent = (current: number) => {
		pagination.current = current;
	};

	// 下一页
	const nextPage = () => {
		pagination.current = (pagination.current || 0) + 1;
	};

	return {
		pagination,
		resetPagination,
		setTotal,
		setCurrent,
		nextPage,
	};
};
