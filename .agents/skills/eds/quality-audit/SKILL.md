---
name: eds/quality-audit
description: Lighthouse audit, SEO checks, and WCAG 2.1 accessibility audit against solution design targets.
when_to_use: for periodic quality audits, before major releases, or when investigating performance/accessibility/SEO issues
version: 1.0.0
---

# Quality Audit

## Overview

This skill combines three page-level quality checks into a single audit pass:

1. **Lighthouse** — Performance, Accessibility, Best Practices, SEO scores against 90+ targets
2. **SEO** — Canonical tags, meta tags, heading hierarchy, robots.txt, sitemap, LLM optimization
3. **Accessibility (WCAG 2.1)** — Keyboard navigation, color contrast, semantic HTML, ARIA, media controls

These overlap significantly (Lighthouse already tests accessibility and SEO basics), so running them together avoids duplicate work.

**Targets:**

| Metric | Target |
|---|---|
| Lighthouse Performance | >= 90 |
| Lighthouse Accessibility | >= 90 |
| Lighthouse Best Practices | >= 90 |
| Lighthouse SEO | >= 90 |
| Cache Hit Ratio | > 90% |
| TTFB (cached) | < 100ms |

---

## Pre-flight

- [ ] Identify target URL(s) — local (`http://localhost:3000`) or deployed (`*.aem.page` / `*.aem.live`)
- [ ] If local, ensure dev server is running (`pnpm start` or `pnpm start:brand {brand}`)
- [ ] Know which brand/property is being audited (affects token cascade verification)
- [ ] Have Chrome/Chromium available (for Lighthouse)

---

## Step 1: Lighthouse Audit

### Running Lighthouse

**Option A: CLI (preferred for automation)**
```bash
npx lighthouse {url} --output=json --output=html --output-path=./lighthouse-report --chrome-flags="--headless"
```

**Option B: Chrome DevTools**
1. Open Chrome DevTools (F12)
2. Navigate to Lighthouse tab
3. Select categories: Performance, Accessibility, Best Practices, SEO
4. Run audit for both Mobile and Desktop

### Score Evaluation

| Category | Score | Result |
|---|---|---|
| Performance | >= 90 | PASS |
| Performance | 80-89 | WARNING |
| Performance | < 80 | FAIL |
| Accessibility | >= 90 | PASS |
| Accessibility | < 90 | FAIL |
| Best Practices | >= 90 | PASS |
| Best Practices | < 90 | FAIL |
| SEO | >= 90 | PASS |
| SEO | < 90 | FAIL |

### Core Web Vitals

Report these metrics specifically:

| Metric | Good | Needs Improvement | Poor |
|---|---|---|---|
| LCP (Largest Contentful Paint) | <= 2.5s | 2.5s - 4.0s | > 4.0s |
| INP (Interaction to Next Paint) | <= 200ms | 200ms - 500ms | > 500ms |
| CLS (Cumulative Layout Shift) | <= 0.1 | 0.1 - 0.25 | > 0.25 |

### Common Issues to Flag

- **Large hero images** without optimized renditions (use Dynamic Media URLs)
- **Render-blocking scripts** in `<head>` (third-party scripts must be async)
- **Uncompressed assets** (CSS/JS should be minified for production)
- **Missing image dimensions** causing CLS
- **Unused CSS/JS** bloating page weight
- **Third-party scripts** degrading main thread time

---

## Step 2: SEO Audit

### 2a. Canonical Tags

- [ ] `<link rel="canonical">` present in `<head>`
- [ ] Canonical URL is correct (matches expected page URL)
- [ ] Canonical is server-rendered (not injected by client-side JS)
- [ ] No duplicate canonical tags
- [ ] Self-referencing canonical on each page

### 2b. Meta Tags

Check for presence and quality of:

| Tag | Required | Check |
|---|---|---|
| `<title>` | Yes | Present, unique per page, 50-60 characters |
| `<meta name="description">` | Yes | Present, unique per page, 150-160 characters |
| `<meta property="og:title">` | Yes | Present, matches or enhances `<title>` |
| `<meta property="og:description">` | Yes | Present |
| `<meta property="og:image">` | Yes | Present, valid image URL |
| `<meta property="og:url">` | Yes | Present, matches canonical |
| `<meta property="og:type">` | Yes | Present (e.g., `website`, `article`) |
| `<meta name="robots">` | Conditional | Non-prod: `noindex, nofollow`. Prod: absent or `index, follow` |

**Important:** Meta tags must be injected at build time (in `<head>` of server-rendered HTML), NOT by client-side JavaScript. Check by viewing page source (not DevTools Elements).

### 2c. Heading Hierarchy

- [ ] Exactly one `<h1>` per page
- [ ] Headings follow logical nesting (no jumping from H1 to H4)
- [ ] Heading text is descriptive and keyword-relevant
- [ ] No empty headings

### 2d. Robots.txt

Read the `robots.txt` file in the repo root:

| Environment | Expected |
|---|---|
| Production (`main` branch) | Crawl-friendly rules, references sitemap |
| Non-production (staging, feature branches) | `Disallow: /` for all crawlers |

### 2e. XML Sitemap

- [ ] `helix-sitemap.yaml` is configured
- [ ] Sitemap index is accessible at expected URL
- [ ] Page appears in the sitemap (for published pages)
- [ ] Sitemap regenerates on publish

### 2f. LLM Optimization

Check content structure for AI/LLM interpretability:

- [ ] Clear, descriptive headings that summarize content below them
- [ ] Page has a summary/description (either in meta or in page content)
- [ ] Semantic markup (lists for lists, tables for data, headings for hierarchy)
- [ ] Structured data (JSON-LD or schema markup) where appropriate
- [ ] Content is self-contained and doesn't rely on visual context to be understood

---

## Step 3: Accessibility Audit (WCAG 2.1)

### 3a. Keyboard Navigation

Test these interactions without a mouse:

| Action | Expected | Keys |
|---|---|---|
| Navigate forward | Focus moves through interactive elements in logical order | Tab |
| Navigate backward | Focus moves in reverse | Shift+Tab |
| Activate buttons/links | Element is activated | Enter or Space |
| Close modals/menus | Modal/menu closes, focus returns to trigger | Escape |
| Navigate dropdowns | Move between options | Arrow keys |
| Skip navigation | Skip-to-content link available and functional | Tab (first element) |

- [ ] Focus indicator is visible on all interactive elements
- [ ] No keyboard traps (can always Tab away from any element)
- [ ] Tab order follows visual layout
- [ ] All functionality available via keyboard (not just mouse/touch)

### 3b. Color Contrast

| Element Type | Minimum Ratio (AA) |
|---|---|
| Normal text (< 18px or < 14px bold) | 4.5:1 |
| Large text (>= 18px or >= 14px bold) | 3:1 |
| UI components and graphical objects | 3:1 |

Check against brand token colors:
- `--text-dark-1` on `--color-base-white` (and vice versa)
- `--color-primary` on white/dark backgrounds
- Button text on button backgrounds
- Link colors against surrounding text

### 3c. Semantic HTML

- [ ] `<nav>` wraps navigation menus
- [ ] `<main>` wraps primary page content
- [ ] `<header>` and `<footer>` wrap page header/footer
- [ ] `<aside>` for supplementary content
- [ ] `<article>` for self-contained content (blog posts, events)
- [ ] `<section>` with `aria-label` or heading for page sections
- [ ] Lists use `<ul>`/`<ol>` + `<li>` (not styled divs)
- [ ] Tables use `<table>`, `<thead>`, `<th>`, `<tbody>` for data

### 3d. ARIA Attributes

Check interactive blocks for proper ARIA:

| Block | Required ARIA |
|---|---|
| Accordion | `role="region"`, `aria-expanded`, `aria-controls`, `aria-labelledby` |
| Tabs | `role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-selected`, `aria-controls` |
| Modal | `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, `aria-describedby` |
| Carousel | `role="region"`, `aria-roledescription="carousel"`, `aria-label`, slide `aria-roledescription="slide"` |
| Search | `role="search"`, `aria-label` |
| Navigation | `aria-expanded` on dropdowns, `aria-current="page"` on active link |

### 3e. Images and Media

- [ ] All `<img>` elements have `alt` attributes
- [ ] Decorative images use `alt=""` (empty, not missing)
- [ ] Informative images have descriptive alt text
- [ ] Video has accessible controls (play/pause, volume, fullscreen)
- [ ] Video Hero specifically: accessible controls required per solution design
- [ ] No auto-playing audio without user control

### 3f. Forms

- [ ] All form inputs have associated `<label>` elements
- [ ] Required fields marked with `aria-required="true"` and visual indicator
- [ ] Error messages associated with fields via `aria-describedby`
- [ ] Form submission errors are announced to screen readers

---

## Step 4: Generate Report

```
# Quality Audit Report
URL: {url}
Brand: {brand}
Date: {date}
Auditor: Claude (eds/quality-audit v1.0.0)

## Lighthouse Scores
| Category | Mobile | Desktop | Target | Result |
|---|---|---|---|---|
| Performance | {score} | {score} | 90+ | PASS/FAIL |
| Accessibility | {score} | {score} | 90+ | PASS/FAIL |
| Best Practices | {score} | {score} | 90+ | PASS/FAIL |
| SEO | {score} | {score} | 90+ | PASS/FAIL |

## Core Web Vitals
| Metric | Value | Rating |
|---|---|---|
| LCP | {value} | Good/Needs Improvement/Poor |
| INP | {value} | Good/Needs Improvement/Poor |
| CLS | {value} | Good/Needs Improvement/Poor |

## SEO Checks
| Check | Result | Notes |
|---|---|---|
| Canonical tag | PASS/FAIL | {details} |
| Meta tags | PASS/FAIL | {missing tags} |
| Heading hierarchy | PASS/FAIL | {issues} |
| Robots.txt | PASS/FAIL | {details} |
| Sitemap inclusion | PASS/FAIL | {details} |
| LLM optimization | PASS/WARNING/FAIL | {details} |

## Accessibility Checks
| Check | Result | Notes |
|---|---|---|
| Keyboard navigation | PASS/FAIL | {issues} |
| Color contrast | PASS/FAIL | {failing pairs} |
| Semantic HTML | PASS/FAIL | {missing landmarks} |
| ARIA attributes | PASS/FAIL | {issues per block} |
| Image alt text | PASS/FAIL | {count missing} |
| Video controls | PASS/FAIL/N-A | {issues} |
| Form accessibility | PASS/FAIL/N-A | {issues} |

## Overall: PASS / NEEDS WORK / FAIL

## Remediation (prioritized)
1. {highest impact issue + fix}
2. {next issue + fix}
...
```

---

## Anti-Patterns

| Do NOT | Do instead |
|--------|-----------|
| Only run Lighthouse and skip manual checks | Lighthouse catches ~60% of issues — manual SEO and a11y checks are required |
| Test only on desktop | Always test both mobile and desktop — mobile is the primary target |
| Accept Lighthouse accessibility score as complete WCAG compliance | Lighthouse tests ~30% of WCAG criteria — manual keyboard and screen reader testing needed |
| Skip non-prod robots.txt check | Non-prod sites MUST block crawlers |
| Ignore LLM optimization | Solution design explicitly requires content structured for AI interpretation |
| Run audit on a page with no content | Audit realistic, content-populated pages for meaningful results |
