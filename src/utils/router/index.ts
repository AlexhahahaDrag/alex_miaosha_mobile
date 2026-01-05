import type { Router } from 'vue-router';

/**
 * 通过路由名称解析获取路径，如果路由名称不存在则回退到默认路径
 * @param router - Vue Router 实例
 * @param routeName - 路由名称
 * @param fallbackPath - 回退路径（当路由名称不存在时使用）
 * @returns 路由路径
 */
export const getRoutePathByName = (
	router: Router,
	routeName: string | symbol,
	fallbackPath?: string,
): string => {
	try {
		const resolved = router.resolve({ name: routeName });
		if (resolved.name) {
			return resolved.path;
		}
	} catch {
		// 路由名称不存在时忽略错误
	}
	// 回退到默认路径
	return fallbackPath || '';
};
