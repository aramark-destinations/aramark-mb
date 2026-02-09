/** @type {import('stylelint').Config} */
module.exports = {
  extends: ['stylelint-config-standard'],
  plugins: ['stylelint-plugin-use-baseline'],
  rules: {
    'plugin/use-baseline': [true, { available: 'widely' }],
  },
  ignoreFiles: [
    'scripts/__dropins__/**',
    'tools/authoring-guide-importer/**',
  ],
};
