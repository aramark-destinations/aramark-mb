---
name: block-testing
description: Jest unit testing patterns for EDS blocks. Covers test infrastructure bootstrapping, keeper vs throwaway tests, mock patterns for aem.js/scripts.js utilities. Use when a block has non-trivial JS logic (event handling, data transformation, state management) that should be unit tested.
---

# EDS Block Testing

## Overview

Testing philosophy: **value over coverage**. Write tests for logic that is genuinely testable and valuable to maintain. Skip tests for trivial DOM wiring or things better verified in the browser.

**Test types:**
- **Keeper tests** — committed, run in CI with `pnpm test`, for durable logic
- **Throwaway tests** — temporary exploration tests, not committed, deleted after use

---

## When to Write Tests

**Write keeper tests for:**
- Pure logic functions (data transformation, string parsing, validation)
- Event handling logic with complex state transitions
- Helper utilities that multiple blocks or scripts use
- Regression tests for bugs that were hard to catch

**Skip tests for:**
- Trivial DOM manipulation (adding a class, wrapping an element)
- Things that require a real browser to validate (animations, scroll behavior, intersection observers)
- One-line wrappers that just call another function
- Blocks with no meaningful logic beyond DOM structure

---

## Step 1: Bootstrap Test Infrastructure

Check if `jest.config.js` exists at the project root:

```bash
ls jest.config.js
```

If it does NOT exist, create it:

**`jest.config.js`:**
```js
module.exports = {
  testEnvironment: 'jsdom',
  coverageProvider: 'v8',
  testMatch: [
    '**/blocks/**/*.test.js',
    '**/scripts/**/*.test.js',
  ],
  collectCoverageFrom: [
    'blocks/**/*.js',
    'scripts/**/*.js',
    '!**/*.test.js',
    '!**/node_modules/**',
    '!scripts/dompurify.min.js',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
};
```

Also check if `babel.config.js` exists:

**`babel.config.js`** (if missing):
```js
module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
  ],
  plugins: ['@babel/plugin-syntax-top-level-await'],
};
```

Both `babel-jest` and `@babel/preset-env` are already in devDependencies.

---

## Step 2: Create Test File

Tests are **co-located with the block** in `blocks/{name}/{name}.test.js`.

**Basic test structure:**

```js
// blocks/my-block/my-block.test.js
import { myHelperFunction } from './my-block.js';

describe('myHelperFunction', () => {
  it('returns expected output for valid input', () => {
    expect(myHelperFunction('valid input')).toBe('expected output');
  });

  it('handles edge case gracefully', () => {
    expect(myHelperFunction(null)).toBe('');
  });
});
```

---

## Step 3: Mock EDS Utilities

Blocks import from EDS scripts that don't work in jsdom. Use Jest mocks.

**Mocking `aem.js`:**

```js
// Option A: Mock at the top of the test file
jest.mock('../../scripts/aem.js', () => ({
  createOptimizedPicture: jest.fn((src, alt) => {
    const picture = document.createElement('picture');
    const img = document.createElement('img');
    img.src = src;
    img.alt = alt || '';
    picture.appendChild(img);
    return picture;
  }),
  readBlockConfig: jest.fn(() => ({})),
  loadCSS: jest.fn(),
  toClassName: jest.fn((str) => str.toLowerCase().replace(/[^a-z0-9]/g, '-')),
}));
```

**Mocking `scripts.js`:**

```js
jest.mock('../../scripts/scripts.js', () => ({
  moveInstrumentation: jest.fn(),
  readVariant: jest.fn(),
  moveAttributes: jest.fn(),
}));
```

**Mocking `baici/utils/config.js`:**

```js
jest.mock('../../scripts/baici/utils/config.js', () => ({
  readConfig: jest.fn(() => ({})),
  readKeyValueConfig: jest.fn(() => ({})),
  readUeConfig: jest.fn(() => ({})),
}));
```

**Mocking analytics:**

```js
jest.mock('../../scripts/analytics.js', () => ({
  pushAnalyticsEvent: jest.fn(),
}));
```

---

## Step 4: Testing Block Logic

**Testing a helper function exported from a block:**

```js
// The helper must be exported from the block for testability:
// export function sanitizeCSSClass(className) { ... }

import { sanitizeCSSClass } from './cards.js';

describe('sanitizeCSSClass', () => {
  it('strips invalid characters', () => {
    expect(sanitizeCSSClass('hello world!')).toBe('hello world');
  });

  it('returns empty string for null input', () => {
    expect(sanitizeCSSClass(null)).toBe('');
  });
});
```

**Testing with a DOM block element:**

```js
import { decorate } from './my-block.js';

// Mock dependencies first (see Step 3)
jest.mock('../../scripts/aem.js', () => ({ createOptimizedPicture: jest.fn() }));
jest.mock('../../scripts/scripts.js', () => ({ readVariant: jest.fn(), moveInstrumentation: jest.fn() }));

describe('decorate', () => {
  let block;

  beforeEach(() => {
    block = document.createElement('div');
    block.classList.add('my-block');
    // Set up block's expected DOM structure
    block.innerHTML = `<div><div><p>Content</p></div></div>`;
  });

  it('adds expected class to first child', () => {
    decorate(block);
    expect(block.querySelector('.my-block-content')).not.toBeNull();
  });

  it('fires before event', () => {
    const listener = jest.fn();
    block.addEventListener('my-block:before', listener);
    decorate(block);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('fires after event', () => {
    const listener = jest.fn();
    block.addEventListener('my-block:after', listener);
    decorate(block);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('calls onBefore hook if provided', () => {
    const onBefore = jest.fn();
    decorate(block, { onBefore });
    expect(onBefore).toHaveBeenCalled();
  });

  it('calls onAfter hook if provided', () => {
    const onAfter = jest.fn();
    decorate(block, { onAfter });
    expect(onAfter).toHaveBeenCalled();
  });
});
```

---

## Step 5: Run Tests

```bash
pnpm test                    # Run all tests
pnpm test:watch              # Watch mode during development
pnpm test:coverage           # Coverage report
```

Run from the project root — Jest will find test files matching `blocks/**/*.test.js`.

---

## What NOT to Test

| Skip testing | Why |
|-------------|-----|
| `block.classList.add('foo')` alone | Zero logic, zero risk |
| `createOptimizedPicture` call results | It's a library call, not your logic |
| CSS class names being present in DOM | Brittle, changes often, browser test instead |
| Intersection Observer callbacks | jsdom doesn't support intersection |
| Scroll behavior | Browser only |
| Animations and transitions | Browser only |
| `window.*.hooks` wiring | That's the framework's concern |

---

## Throwaway Tests

For quick exploration during development — create, run, then delete:

```js
// blocks/my-block/my-block.explore.test.js (or .tmp.test.js)
// NOT committed — used to understand behavior during development
```

Do not commit files ending in `.explore.test.js` or `.tmp.test.js`.
