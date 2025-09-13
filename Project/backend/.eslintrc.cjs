module.exports = {
  extends: ['../.eslintrc.cjs'],
  env: {
    node: true,
    es2022: true,
  },
  parserOptions: {
    // project: './tsconfig.json', // 暂时禁用严格的项目检查
  },
  rules: {
    // Node.js 特定规则
    'no-console': 'off', // 后端允许 console
    '@typescript-eslint/no-var-requires': 'off', // 允许 require
    '@typescript-eslint/no-explicit-any': 'error', // 后端严格

    // Express 相关
    'no-process-exit': 'error',
    'no-path-concat': 'error',
  },
};
