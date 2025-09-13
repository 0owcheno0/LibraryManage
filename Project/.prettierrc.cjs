module.exports = {
  // 基础配置
  printWidth: 100, // 每行最大字符数
  tabWidth: 2, // 缩进空格数
  useTabs: false, // 使用空格而非tab
  semi: true, // 语句末尾添加分号
  singleQuote: true, // 使用单引号
  quoteProps: 'as-needed', // 对象属性仅在需要时使用引号
  trailingComma: 'es5', // 尾随逗号 (ES5有效的地方)
  bracketSpacing: true, // 对象花括号内空格 { foo: bar }
  bracketSameLine: false, // JSX标签的>换行
  arrowParens: 'avoid', // 箭头函数参数括号 (x) => x vs x => x
  endOfLine: 'lf', // 换行符 (LF for Unix/macOS)

  // 文件格式特定配置
  overrides: [
    {
      files: '*.json',
      options: {
        printWidth: 80,
        tabWidth: 2,
      },
    },
    {
      files: '*.md',
      options: {
        printWidth: 80,
        proseWrap: 'always',
        tabWidth: 2,
      },
    },
    {
      files: '*.{ts,tsx}',
      options: {
        printWidth: 100,
        singleQuote: true,
        trailingComma: 'es5',
        semi: true,
      },
    },
    {
      files: '*.{js,jsx}',
      options: {
        printWidth: 100,
        singleQuote: true,
        trailingComma: 'es5',
        semi: true,
      },
    },
    {
      files: '*.css',
      options: {
        printWidth: 100,
        singleQuote: false,
      },
    },
    {
      files: '*.scss',
      options: {
        printWidth: 100,
        singleQuote: true,
      },
    },
    {
      files: '*.yml',
      options: {
        printWidth: 80,
        tabWidth: 2,
        singleQuote: true,
      },
    },
    {
      files: '*.yaml',
      options: {
        printWidth: 80,
        tabWidth: 2,
        singleQuote: true,
      },
    },
  ],
};
