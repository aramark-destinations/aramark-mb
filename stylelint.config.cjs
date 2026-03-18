/** @type {import('stylelint').Config} */
module.exports = {
  extends: ['stylelint-config-standard'],
  plugins: ['stylelint-plugin-use-baseline'],
  rules: {
    'plugin/use-baseline': [true, { available: 'widely' }],
    'selector-class-pattern': null,
    'media-feature-range-notation': null,
    'no-descending-specificity': null,
    'custom-property-pattern': null,
    // Formatting rules that produce false positives in sass-compiled output
    // (nested rules become top-level without blank lines after compilation)
    'rule-empty-line-before': null,
    'comment-empty-line-before': null,
    'declaration-empty-line-before': null,
    'at-rule-empty-line-before': null,
    'custom-property-empty-line-before': null,
    // sass strips quotes from ident attribute values ([attr=val] is valid CSS)
    'selector-attribute-quotes': null,
    // Dart Sass converts modern rgb(a b c / d%) to legacy rgba(a,b,c,d) for compat
    'color-function-notation': null,
    'color-function-alias-notation': null,
    'alpha-value-notation': null,
  },
  ignoreFiles: [
    'scripts/__dropins__/**',
    'tools/authoring-guide-importer/**',
  ],
};
