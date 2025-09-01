// @ts-check

import path from 'path';
import { fileURLToPath } from 'url';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import pluginVue from 'eslint-plugin-vue';
import pluginImport from 'eslint-plugin-import';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('eslint').Linter.FlatConfig[]} */
const config = [
	{
		ignores: [
			'**/dist/**',
			'**/node_modules/**',
			'**/.vscode/**',
			'**/.idea/**',
			'**/coverage/**',
			'**/.nyc_output/**',
			'**/build/**',
			'**/.eslintrc.*',
			'**/postcss.config.js',
			'**/components.d.ts',
			'**/auto-imports.d.ts',
		],
	},
	{
		languageOptions: {
			globals: globals.browser,
			parserOptions: {
				ecmaVersion: 'latest',
				sourceType: 'module',
				project: ['./tsconfig.json', './tsconfig.node.json'],
				tsconfigRootDir: __dirname,
				extraFileExtensions: ['.vue'],
			},
		},
	},
	...tseslint.configs.recommended,
	...pluginVue.configs['flat/essential'],
	{
		plugins: {
			import: pluginImport,
		},
		rules: {
			// Import plugin rules
			'import/order': [
				'error',
				{
					groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
					'newlines-between': 'never',
				},
			],
			'import/no-unresolved': 'off', // 暂时关闭，因为别名解析有问题
			'import/no-duplicates': 'error',
			'import/no-unused-modules': 'warn',
			'import/first': 'error',
			'import/newline-after-import': 'error',
			'import/no-named-as-default': 'off',
			'import/no-named-as-default-member': 'off',

			// Vue specific rules
			'vue/multi-word-component-names': 'off',
			'vue/no-unused-vars': 'error',
			'vue/no-unused-components': 'warn',
			'vue/require-default-prop': 'off',
			'vue/require-prop-types': 'off',
			'vue/no-v-html': 'warn',
			'vue/component-name-in-template-casing': ['error', 'kebab-case'],
			'vue/component-definition-name-casing': ['error', 'PascalCase'],
			'vue/prop-name-casing': ['error', 'camelCase'],
			'vue/attribute-hyphenation': ['error', 'always'],
			'vue/v-on-event-hyphenation': ['error', 'always'],
			'vue/v-on-function-call': ['error', 'never'],

			// TypeScript specific rules
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
				},
			],
			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/explicit-function-return-type': 'off',
			'@typescript-eslint/explicit-module-boundary-types': 'off',
			'@typescript-eslint/no-non-null-assertion': 'warn',
			'@typescript-eslint/no-var-requires': 'error',
			'@typescript-eslint/consistent-type-imports': [
				'error',
				{
					prefer: 'type-imports',
					disallowTypeAnnotations: false,
				},
			],

			// General rules
			'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
			'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
			'no-unused-vars': 'off', // 使用 TypeScript 版本
			'prefer-const': 'error',
			'no-var': 'error',
			'object-shorthand': 'error',
			'prefer-template': 'error',
			'template-curly-spacing': 'error',
			'arrow-spacing': 'error',
			'comma-dangle': ['error', 'always-multiline'],
			semi: ['error', 'always'], // 改为要求使用分号
			quotes: ['error', 'single'],
			indent: [
				'error',
				'tab',
				{
					SwitchCase: 1, // Switch cases缩进一个tab
					VariableDeclarator: 1,
					outerIIFEBody: 1,
					MemberExpression: 1,
					FunctionDeclaration: {
						parameters: 1,
						body: 1,
					},
					FunctionExpression: {
						parameters: 1,
						body: 1,
					},
					CallExpression: {
						arguments: 1,
					},
					ArrayExpression: 1,
					ObjectExpression: 1,
				},
			],
			'no-trailing-spaces': 'error',
			'eol-last': 'error',
		},
	},
	{
		files: ['**/*.vue'],
		languageOptions: {
			parserOptions: {
				parser: '@typescript-eslint/parser',
				project: ['./tsconfig.json', './tsconfig.node.json'],
				tsconfigRootDir: __dirname,
				extraFileExtensions: ['.vue'],
			},
		},
		rules: {
			// Vue 文件特定规则
			'vue/html-indent': ['error', 'tab'],
			indent: [
				'error',
				'tab',
				{
					SwitchCase: 1, // Switch cases缩进一个tab
					VariableDeclarator: 1,
					outerIIFEBody: 1,
					MemberExpression: 1,
					FunctionDeclaration: {
						parameters: 1,
						body: 1,
					},
					FunctionExpression: {
						parameters: 1,
						body: 1,
					},
					CallExpression: {
						arguments: 1,
					},
					ArrayExpression: 1,
					ObjectExpression: 1,
				},
			],
			'vue/max-attributes-per-line': [
				'error',
				{
					singleline: 1,
					multiline: 1,
				},
			],
			'vue/html-closing-bracket-newline': [
				'error',
				{
					singleline: 'never',
					multiline: 'always',
				},
			],
			'vue/html-closing-bracket-spacing': [
				'error',
				{
					startTag: 'never',
					endTag: 'never',
					selfClosingTag: 'always',
				},
			],
		},
	},
	{
		files: ['**/*.ts', '**/*.tsx'],
		languageOptions: {
			parserOptions: {
				project: ['./tsconfig.json', './tsconfig.node.json'],
				tsconfigRootDir: __dirname,
			},
		},
		rules: {
			// TypeScript 文件特定规则
			'@typescript-eslint/no-inferrable-types': 'off',
			indent: [
				'error',
				'tab',
				{
					SwitchCase: 1, // Switch cases缩进一个tab
					VariableDeclarator: 1,
					outerIIFEBody: 1,
					MemberExpression: 1,
					FunctionDeclaration: {
						parameters: 1,
						body: 1,
					},
					FunctionExpression: {
						parameters: 1,
						body: 1,
					},
					CallExpression: {
						arguments: 1,
					},
					ArrayExpression: 1,
					ObjectExpression: 1,
				},
			],
		},
	},
];

export default config;
