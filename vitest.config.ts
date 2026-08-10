import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

/**
 * 单测独立配置：不加载 vite.config.ts 的 Rolldown/插件链，
 * 避免 vitest 4 与 Vite 8 运行时冲突。
 */
export default defineConfig({
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url)),
		},
	},
	test: {
		// 纯函数测试, 不需要 DOM。后续若要 mount 组件, 再单独引入 jsdom 与 @vue/test-utils
		environment: 'node',
		include: ['tests/**/*.test.ts'],
	},
});
