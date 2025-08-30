module.exports = {
  env: {
    node: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:import/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: [
    'import',
  ],
  rules: {
    // Import rules
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
        ],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
    'import/no-unresolved': 'off', // ES modules
    'import/extensions': 'off',
    
    // General rules
    'no-console': 'off', // Allow console for server logging
    'no-debugger': 'error',
    'no-unused-vars': 'warn',
    'prefer-const': 'error',
    'no-var': 'error',
    'object-shorthand': 'error',
    'prefer-template': 'error',
    'template-curly-spacing': 'error',
    'arrow-spacing': 'error',
    'no-duplicate-imports': 'error',
    'sort-imports': 'off', // Handled by import/order
    
    // Node.js specific rules
    'no-process-exit': 'error',
    'no-path-concat': 'error',
    'no-buffer-constructor': 'error',
    'no-new-require': 'error',
    'no-mixed-requires': 'error',
    'no-process-env': 'off', // Allow process.env usage
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js'],
      },
    },
  },
};
