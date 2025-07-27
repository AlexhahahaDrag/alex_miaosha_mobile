import globals from 'globals';
import tseslint from 'typescript-eslint';
import pluginVue from 'eslint-plugin-vue';
import pluginImport from 'eslint-plugin-import';

import path from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import pluginJs from '@eslint/js';

// mimic CommonJS variables -- not needed if using CommonJS
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
	baseDirectory: __dirname,
	recommendedConfig: pluginJs.configs.recommended,
});

export default [
	{ languageOptions: { globals: globals.browser } },
	...compat.extends('standard-with-typescript'),
	...tseslint.configs.recommended,
	...pluginVue.configs['flat/essential'],
	{
		plugins: {
			import: pluginImport,
		},
		rules: {
			// Import plugin rules
			'import/order': ['error', {
				'groups': ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
				'newlines-between': 'always',
			}],
			'import/no-unresolved': 'error',
			'import/no-duplicates': 'error',
			'import/no-unused-modules': 'warn',
			'import/first': 'error',
			'import/newline-after-import': 'error',
			'import/no-named-as-default': 'off',
			'import/no-named-as-default-member': 'off',
		},
	},
];
