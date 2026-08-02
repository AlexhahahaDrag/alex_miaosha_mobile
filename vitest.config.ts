import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';

const rootDir = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
	plugins: [
		vue(),
		AutoImport({
			imports: ['vue', 'vue-router', 'pinia'],
		}),
	],
	resolve: {
		alias: {
			'@': resolve(rootDir, 'src'),
			'#': resolve(rootDir, 'types'),
		},
	},
	test: {
		environment: 'happy-dom',
		include: ['tests/unit/**/*.{test,spec}.ts'],
		setupFiles: ['./tests/setup.ts'],
		clearMocks: true,
		restoreMocks: true,
	},
});
