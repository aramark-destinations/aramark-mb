---
name: eds/e2e-testing
description: Playwright E2E testing patterns for EDS blocks with interactive behavior.
when_to_use: when a block has user interactions that require browser-level testing (carousels, accordions, tabs, forms, modals)
version: 1.0.0
---

# EDS E2E Testing (Playwright)

## Overview

E2E tests verify block behavior in a real browser. Use them when jsdom unit tests can't cover the interaction (scroll, intersection, animation, real click behavior).

`@playwright/test` is installed (`devDependencies`). No `playwright.config.js` or test files exist yet — this skill includes bootstrapping steps.

---

## When to Use E2E vs Unit Tests

| Situation | Use |
|-----------|-----|
| Pure JS logic (data transformation, validation) | Unit test (Jest) |
| DOM structure after `decorate()` | Unit test (Jest) |
| Keyboard navigation (carousel, accordion, tabs) | E2E (Playwright) |
| Touch/swipe interactions | E2E (Playwright) |
| Scroll-triggered behavior | E2E (Playwright) |
| Intersection Observer (lazy load, impressions) | E2E (Playwright) |
| Form submission flow | E2E (Playwright) |
| Modal open/close | E2E (Playwright) |
| Animation/transition completion | E2E (Playwright) |

---

## Step 1: Bootstrap (first-time setup)

Check if `playwright.config.js` exists:

```bash
ls playwright.config.js
```

If not, create it:

**`playwright.config.js`:**
```js
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: '**/*.e2e.test.js',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'pnpm start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

Create the test directory:
```bash
mkdir -p tests/e2e
```

Add test script to `package.json` (coordinate with the team before changing package.json):
```json
"test:e2e": "playwright test"
```

Install browser binaries (once per machine):
```bash
pnpm exec playwright install chromium
```

---

## Step 2: Test File Structure

E2E tests live in `tests/e2e/` and follow the `.e2e.test.js` naming convention.

```
tests/
└── e2e/
    ├── carousel.e2e.test.js
    ├── accordion.e2e.test.js
    └── tabs.e2e.test.js
```

---

## Step 3: Test Patterns

**Basic test structure:**

```js
// tests/e2e/accordion.e2e.test.js
import { test, expect } from '@playwright/test';

test.describe('Accordion block', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a page with the accordion block
    await page.goto('/path/to/page-with-accordion');
    await page.waitForLoadState('networkidle');
  });

  test('first item is expanded by default', async ({ page }) => {
    const firstPanel = page.locator('.accordion-item:first-child .accordion-content');
    await expect(firstPanel).toBeVisible();
  });

  test('clicking a collapsed item expands it', async ({ page }) => {
    const secondButton = page.locator('.accordion-item:nth-child(2) .accordion-button');
    const secondPanel = page.locator('.accordion-item:nth-child(2) .accordion-content');

    await expect(secondPanel).toBeHidden();
    await secondButton.click();
    await expect(secondPanel).toBeVisible();
  });

  test('keyboard navigation works with Enter key', async ({ page }) => {
    const firstButton = page.locator('.accordion-button').first();
    await firstButton.focus();
    await page.keyboard.press('Enter');
    // Verify state change
  });
});
```

**Carousel navigation test:**

```js
test('next button advances to second slide', async ({ page }) => {
  await page.goto('/path/to-carousel-page');

  const nextButton = page.locator('.carousel .slide-next');
  const secondSlide = page.locator('.carousel-slide:nth-child(2)');

  await nextButton.click();
  await expect(secondSlide).toHaveAttribute('data-active', 'true');
});

test('swipe gesture navigates slides', async ({ page }) => {
  const carousel = page.locator('.carousel-slides');
  const box = await carousel.boundingBox();

  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + 50, box.y + box.height / 2);
  await page.mouse.up();

  // Assert slide changed
});
```

---

## Step 4: Running E2E Tests

```bash
# Start local dev server first (in another terminal)
pnpm start

# Run all E2E tests
pnpm exec playwright test

# Run specific test file
pnpm exec playwright test tests/e2e/accordion.e2e.test.js

# Run with browser visible (headed mode)
pnpm exec playwright test --headed

# Show test report
pnpm exec playwright show-report
```

---

## Tips

- E2E tests require a running dev server (`pnpm start`) — they test against real rendered pages
- Keep E2E tests focused on user behavior, not implementation details
- Use `page.waitForLoadState('networkidle')` after navigation to let EDS blocks finish loading
- Avoid testing CSS classes that are likely to change — test behavior instead
- If a test requires specific content in AEM, note the dependency clearly in the test file
