module.exports = {
  root: true,
  extends: [
    'airbnb-base',
    'plugin:json/recommended',
    'plugin:xwalk/recommended',
  ],
  env: {
    browser: true,
  },
  plugins: ['compat'],
  parser: '@babel/eslint-parser',
  parserOptions: {
    allowImportExportEverywhere: true,
    sourceType: 'module',
    requireConfigFile: false,
  },
  rules: {
    'import/extensions': ['error', { js: 'always' }], // require js file extensions in imports
    'import/prefer-default-export': 'off', // allow named exports for single exports
    'import/no-cycle': 'off', // allow circular dependencies for browser code
    'import/no-relative-packages': 'off', // allow relative imports for browser code
    'linebreak-style': ['error', 'unix'], // enforce unix linebreaks
    'no-param-reassign': [2, { props: false }], // allow modifying properties of param
    'no-use-before-define': [2, { functions: false }],
    'no-console': [
      'error',
      {
        allow: ['warn', 'error', 'info', 'debug'],
      },
    ],
    'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    'no-underscore-dangle': 'off', // allow all underscore properties
    'compat/compat': 'error',
  },
  overrides: [
    {
      files: ['build.mjs'],
      rules: {
        'import/no-extraneous-dependencies': 'off',
      },
    },
    {
      files: ['component-models.json'],
      rules: {
        'xwalk/max-cells': 'off',
        'xwalk/no-orphan-collapsible-fields': 'off',
        'xwalk/no-duplicate-fields': 'off',
      },
    },
    {
      files: ['**/*.test.js', 'jest.setup.js', 'jest.config.js', 'babel.config.js'],
      env: {
        jest: true,
        node: true,
      },
      rules: {
        'import/no-extraneous-dependencies': 'off',
        'import/no-unresolved': 'off',
        'max-classes-per-file': 'off',
        'class-methods-use-this': 'off',
        'no-useless-constructor': 'off',
        'no-empty-function': 'off',
      },
    },
    {
      files: ['tools/**/*.js'],
      rules: {
        'no-console': 'off',
        'no-plusplus': 'off',
        'no-restricted-syntax': 'off',
        'no-await-in-loop': 'off',
      },
    },
    {
      files: ['scripts/aem.js', 'scripts/site-resolver.js'],
      rules: {
        'no-restricted-syntax': 'off',
        'no-await-in-loop': 'off',
      },
    },
  ],
};
