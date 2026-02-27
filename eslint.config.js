import js from '@eslint/js';
import * as regexpPlugin from 'eslint-plugin-regexp';
import globals from 'globals';

export default [
    {
        ignores: ['**/dist/**'],
    },
    js.configs.recommended,
    regexpPlugin.configs[('flat/recommended', '**/test/**/*.test.js')],
    {
        files: ['**/src/**/*.js'],
        languageOptions: {
            globals: {
                ...globals.browser,
                __DEV__: 'readonly',
            },
        },
        rules: {
            'class-methods-use-this': 'warn',
            'no-console': 'off',
            'no-else-return': 'warn',
            'no-empty-function': 'warn',
            'no-eq-null': 'warn',
            'no-extra-semi': 'error',
            'no-invalid-this': 'warn',
            'no-multi-spaces': 'warn',
            'no-new': 'warn',
            'no-param-reassign': 'warn',
            'no-self-compare': 'warn',
            'no-unmodified-loop-condition': 'warn',
            'no-unused-expressions': 'warn',
            'no-use-before-define': 'warn',
            'no-useless-return': 'warn',
            'quote-props': ['warn', 'consistent'],
            'radix': 'warn',
            'require-await': 'warn',
            'yoda': 'warn',
        },
    },
    {
        files: ['**/*.config.js', '**/test/**/*.test.js'],
        languageOptions: {
            globals: {
                ...globals.node,
            },
        },
    },
];
