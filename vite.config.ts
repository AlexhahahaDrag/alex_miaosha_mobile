import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import Components from 'unplugin-vue-components/vite';
import { VantResolver } from 'unplugin-vue-components/resolvers';
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons';
import AutoImport from 'unplugin-auto-import/vite';
import { visualizer } from 'rollup-plugin-visualizer';
import viteCompression from 'vite-plugin-compression';

const pathResolve = (dir: string): any => {
	return resolve(__dirname, './', dir);
};

const alias: Record<string, string> = {
	'@': pathResolve('src'),
	'@v': pathResolve('src/views'),
	'@u': pathResolve('src/utils'),
	'@a': pathResolve('src/api'),
	'@r': pathResolve('src/router'),
};

export default defineConfig({
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
		port: 2000,
		open: true,
		proxy: {
			'/api': {
				target: 'http://120.48.156.47:30001',
				// target: 'http://localhost:30001',
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/api/, ''),
			},
		},
	},
	build: {
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
						if (
							id.includes('dayjs') ||
							id.includes('crypto-js') ||
							id.includes('mathjs')
						) {
							return 'utils-vendor';
						}
						return id
							.toString()
							.split('node_modules/')[1]
							.split('/')[0]
							.toString();
					}
				},
			},
		},
	},
});
