// ESLint 9 的「扁平配置」(flat config)：一个数组，从上到下依次应用规则。
// 和你前端可能见过的 .eslintrc.json 是不同世代，flat config 是现在的标准。
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  // 1) 忽略的目录（等价于 .eslintignore）
  {
    ignores: ['dist/**', 'node_modules/**'],
  },

  // 2) JS 官方推荐规则
  js.configs.recommended,

  // 3) TypeScript 推荐规则
  ...tseslint.configs.recommended,

  // 4) 我们项目自己的微调
  {
    rules: {
      // 允许以 _ 开头的未使用参数（比如中间件里用不到的 next）
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },

  // 5) 放最后：关闭所有和 Prettier 冲突的「格式类」规则。
  //    分工明确：ESLint 管代码质量，Prettier 管代码格式。
  prettier
);
