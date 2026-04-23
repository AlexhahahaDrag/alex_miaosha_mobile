import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';
import type { ConfigEnv, UserConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import Components from 'unplugin-vue-components/vite';
import { VantResolver } from 'unplugin-vue-components/resolvers';
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons-ng';
import AutoImport from 'unplugin-auto-import/vite';
import { visualizer } from 'rollup-plugin-visualizer';
import viteCompression from 'vite-plugin-compression';
import { qrcode } from 'vite-plugin-qrcode';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const pathResolve = (dir: string): string => {
	return resolve(__dirname, './', dir);
};

const alias: Record<string, string> = {
	'@': pathResolve('src'),
	'@v': pathResolve('src/views'),
	'@u': pathResolve('src/utils'),
	'@a': pathResolve('src/api'),
	'@r': pathResolve('src/router'),
};

export default defineConfig(({ mode }: ConfigEnv): UserConfig => {
	const env = loadEnv(mode, process.cwd(), 'VITE_');
	const isProd = mode === 'production';

	return {
		// 抑制 Node.js 全局变（global → globalThis）并根据环境移除调试语句
		define: {
			global: 'globalThis',
			...(isProd
				? { 'console.log': '(() => {})', 'console.debug': '(() => {})', debugger: '(() => {})' }
				: {}),
		},
		optimizeDeps: {
			// 强制预构建常用依赖，避免冷启动时动态发现导致页面刷新
			include: ['vue', 'vue-router', 'pinia', 'axios', 'dayjs', 'vant'],
			// 自定义预构建阶段 Rolldown 打包器的行为
			rolldownOptions: {
				// 配置模块解析条件，确保 CJS 包被正确处理
				// 注意：'module' 为非标准条件已移除
				resolve: {
					conditionNames: ['import', 'browser', 'default'],
				},
			},
		},
		plugins: [
			vue(),
			AutoImport({
				resolvers: [VantResolver()],
				// 指定需要自动导入的库
				imports: ['vue', 'vue-router', 'pinia'],
				dts: 'src/auto-imports.d.ts', // 生成自动导入类型声明文件
			}),
			Components({
				resolvers: [VantResolver()],
				dirs: ['src/views'],
				dts: true, // 生成类型定义文件，默认生成在根目录的 components.d.ts
			}),
			createSvgIconsPlugin({
				iconDirs: [pathResolve('src/assets/icons')],
				symbolId: 'icon-[name]',
				inject: 'body-last',
				customDomId: '__svg__icons__dom__',
			}),
			// 仅在生产构建时生成包体积分析报告（输出到 dist/stats.html）
			isProd && visualizer({ open: false, gzipSize: true, filename: 'stats.html' }),
			// 仅在生产构建时启用 gzip 压缩，排除 stats.html（开发分析文件，无需压缩）
			isProd &&
				viteCompression({
					filter: (file: string) => /\.(js|css|json|html|svg)$/i.test(file) && !file.includes('stats'),
				}),
			qrcode({
				filter: (url: string) => {
					// 过滤掉本地/内网地址，只显示外网可访问的地址
					return (
						!url.includes('localhost') &&
						!url.includes('127.0.0.1') &&
						!url.includes('0.0.0.0') &&
						!url.match(/192\.168\./) &&
						!url.match(/172\.(1[6-9]|2[0-9]|3[0-1])\./)
					);
				},
			}),
		],
		css: {
			preprocessorOptions: {
				less: {
					javascriptEnabled: true,
				},
			},
		},
		resolve: {
			alias,
		},
		server: {
			host: '0.0.0.0',
			port: env.VITE_PORT ? parseInt(env.VITE_PORT) : 2000,
			open: env.VITE_OPEN === 'true',
			proxy: {
				'/api': {
					target: env.VITE_APP_BASE_API || 'http://localhost:30001',
					changeOrigin: true,
					rewrite: (path) => path.replace(/^\/api/, ''),
				},
			},
		},

		build: {
			outDir: env.VITE_OUTPUT_DIR || 'dist',
			chunkSizeWarningLimit: 800,
			// Vite 8 中 rollupOptions 已废弃，改用 rolldownOptions
			rolldownOptions: {
				checks: {
					pluginTimings: false,
				},
				output: {
					// 静态资源分类打包
					chunkFileNames: 'static/js/[name]-[hash].js',
					entryFileNames: 'static/js/[name]-[hash].js',
					assetFileNames: 'static/[ext]/[name]-[hash].[ext]',
					manualChunks(id: string) {
						// 兼容 Windows 路径分隔符（将 \ 统一转为 /）
						const normalizedId = id.replace(/\\/g, '/');
						if (normalizedId.includes('node_modules')) {
							// Vue 生态
							if (normalizedId.includes('/vue') || normalizedId.includes('/@vue')) {
								return 'vue-vendor';
							}
							// Vant UI
							if (normalizedId.includes('/vant')) {
								return 'vant-vendor';
							}
							// ECharts
							if (normalizedId.includes('/echarts')) {
								return 'echarts-vendor';
							}
							// Axios
							if (normalizedId.includes('/axios')) {
								return 'axios-vendor';
							}
							// 工具库
							if (
								normalizedId.includes('/dayjs') ||
								normalizedId.includes('/crypto-js') ||
								normalizedId.includes('/mathjs')
							) {
								return 'utils-vendor';
							}
							// 小型工具库合并，避免生成空 chunk
							if (
								normalizedId.includes('/javascript-natural-sort') ||
								normalizedId.includes('/tiny-emitter') ||
								normalizedId.includes('/lodash') ||
								normalizedId.includes('/classnames') ||
								normalizedId.includes('/normalize-wheel') ||
								normalizedId.includes('/resize-observer-polyfill')
							) {
								return 'common-utils';
							}
							// 其余较大的运行时库单独打包
							const packageName = normalizedId.split('node_modules/')[1].split('/')[0];
							const largePackages = ['pinia', 'vue-router', '@tsparticles'];
							if (largePackages.some((pkg) => packageName.includes(pkg))) {
								return packageName;
							}
							// 其他小型库归入 misc-vendor
							return 'misc-vendor';
						}
					},
				},
			},
		},
	};
});
