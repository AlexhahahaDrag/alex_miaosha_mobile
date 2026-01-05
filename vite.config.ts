import { resolve } from 'path';
import { defineConfig, loadEnv } from 'vite';
import type { ConfigEnv, UserConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import Components from 'unplugin-vue-components/vite';
import { VantResolver } from 'unplugin-vue-components/resolvers';
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons';
import AutoImport from 'unplugin-auto-import/vite';
import { visualizer } from 'rollup-plugin-visualizer';
import viteCompression from 'vite-plugin-compression';
import { qrcode } from 'vite-plugin-qrcode';

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

	return {
		optimizeDeps: {
			esbuildOptions: {
				// 抑制 Node.js 弃用警告
				define: {
					global: 'globalThis',
				},
			},
		},
		plugins: [
			vue(),
			AutoImport({
				resolvers: [VantResolver()],
				// 指定需要自动导入的库
				imports: ['vue', 'vue-router', 'pinia'],
				// Vite特定的配置
				dts: 'src/auto-imports.d.ts', // 生成自动导入类型声明文件
				// 其他配置...
			}),
			Components({
				resolvers: [VantResolver()],
				dirs: ['src/views'],
				dts: true, // 生成类型定义文件，默认生成在根目录的 components.d.ts
			}),
			createSvgIconsPlugin({
				iconDirs: [
					pathResolve('src/assets/icons/menu'),
					pathResolve('src/assets/icons/common'),
					pathResolve('src/assets/icons/finance'),
					pathResolve('src/assets/icons/soft'),
					pathResolve('src/assets/icons/home'),
					pathResolve('src/assets/icons'),
				],
				symbolId: 'icon-[dir]-[name]',
				inject: 'body-last', //body-last|body-first默认body-last
				customDomId: '__svg__icons__dom__', //默认__svg__icons__dom__
			}),
			visualizer(),
			viteCompression(),
			qrcode({
				filter: (url: string) => {
					// 过滤掉本地地址，只显示外网可访问的地址
					return (
						!url.includes('localhost') &&
						!url.includes('127.0.0.1') &&
						!url.includes('0.0.0.0') &&
						!url.includes('2.0.0.1') &&
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
			// port: VITE_PORT,
			port: env.VITE_PORT ? parseInt(env.VITE_PORT) : 2000,
			open: env.VITE_OPEN === 'true',
			proxy: {
				'/api': {
					// target: 'http://120.48.156.47:30001',
					target: env.VITE_APP_BASE_API || 'http://localhost:30001',
					changeOrigin: true,
					rewrite: (path) => path.replace(/^\/api/, ''),
				},
			},
		},
		build: {
			outDir: env.VITE_OUTPUT_DIR || 'dist',
			chunkSizeWarningLimit: 800, // 将警告阈值提高到800KB
			minify: 'terser',
			terserOptions: {
				compress: {
					drop_console: true,
					drop_debugger: true,
				},
			},
			rollupOptions: {
				output: {
					//静态资源分类打包
					chunkFileNames: 'static/js/chunkName-[hash].js',
					entryFileNames: 'static/js/chunkName-[hash].js',
					assetFileNames: 'static/[ext]/chunkName-[hash].[ext]',
					manualChunks(id: string) {
						//静态资源分拆打包
						if (id.includes('node_modules')) {
							// 将大型库分别打包
							if (id.includes('vue') || id.includes('@vue')) {
								return 'vue-vendor';
							}
							if (id.includes('vant')) {
								return 'vant-vendor';
							}
							if (id.includes('echarts')) {
								return 'echarts-vendor';
							}
							if (id.includes('axios')) {
								return 'axios-vendor';
							}
							if (id.includes('dayjs') || id.includes('crypto-js') || id.includes('mathjs')) {
								return 'utils-vendor';
							}
							// 将小型工具库打包到一起，避免生成空chunks
							if (
								id.includes('javascript-natural-sort') ||
								id.includes('tiny-emitter') ||
								id.includes('lodash') ||
								id.includes('classnames') ||
								id.includes('normalize-wheel') ||
								id.includes('resize-observer-polyfill')
							) {
								return 'common-utils';
							}
							// 对于较大的第三方库，才创建单独的chunk
							const packageName = id.toString().split('node_modules/')[1].split('/')[0].toString();
							// 只为较大的包创建单独的chunk，小包归类到misc-vendor
							const largePackages = [
								'pinia',
								'vue-router',
								'typescript',
								'@types',
								'rollup',
								'unplugin',
								'particles.vue3',
							];
							if (largePackages.some((pkg) => packageName.includes(pkg))) {
								return packageName;
							}
							// 其他小型库统一打包
							return 'misc-vendor';
						}
					},
				},
			},
		},
	};
});
