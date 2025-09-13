module.exports = {
  extends: ['../.eslintrc.cjs'],
  env: {
    browser: true,
    es2022: true,
  },
  parserOptions: {
    // project: './tsconfig.json', // 暂时禁用严格的项目检查
    ecmaFeatures: {
      jsx: true,
    },
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    // React 特定规则优化
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react/jsx-uses-react': 'off',

    // 前端特定的优化
    'no-console': 'warn', // 前端允许 console，但警告
    '@typescript-eslint/no-explicit-any': 'warn', // 前端稍微宽松
  },
};
