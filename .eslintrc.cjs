/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution');

module.exports = {
    root: true,
    extends: [
        'plugin:vue/vue3-essential',
        'eslint:recommended',
        '@vue/eslint-config-typescript',
        '@vue/eslint-config-prettier/skip-formatting',
        '@vue/prettier',
    ],
    parserOptions: {
        ecmaVersion: 'latest',
    },
    rules: {
        'import/no-named-as-default': 'off',
        // 'import/namespace': [2, { allowComputed: true }],
        'import/no-named-as-default-member': 'off',
        // 'import/no-unresolved': [2, { ignore: ['^@'] }],
        // enUS: all rules docs https://eslint.org/docs/rules/
        // zhCN: 所有规则文档 https://eslint.bootcss.com/docs/rules/
        // 基础规则 全部 ES 项目通用
        'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
        'quote-props': 'off',
        // 结尾必须有逗号(主要缓解增加一行对象属性，导致 git 变更记录是两行的情况)
        'comma-dangle': ['error', 'always-multiline'],
        // 逗号必须在一行的结尾
        'comma-style': ['error', 'last'],
        // 强制在代码块中开括号前和闭括号后有空格
        'block-spacing': ['error', 'always'],
        'object-curly-spacing': ['error', 'always'],
        // 要求使用分号代替 ASI (semi)
        semi: ['error', 'always'],
        quotes: [
            2,
            'single',
            {
                avoidEscape: true,
                allowTemplateLiterals: true,
            },
        ],

        /* vue 项目专用 */
        'vue/multi-word-component-names': 'off',
        'vue/require-default-prop': 'off',
        'vue/singleline-html-element-content-newline': ['off'],
        // 模板中组件名称使用 kebab-case 模式
        'vue/component-name-in-template-casing': [
            'error',
            'kebab-case',
            {
                registeredComponentsOnly: true,
                ignores: [],
            },
        ],
        'vue/custom-event-name-casing': 'off',
        // bug fix
        'template-curly-spacing': 'off',
        'vue/experimental-script-setup-vars': 'off',
    },
};
