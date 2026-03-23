# Block Audit Report: carousel
Date: 2026-03-20

## Summary
| Category | Result |
|---|---|
| Structure | WARNING |
| Pattern A Compliance | PASS |
| CSS Token Usage | WARNING (2 violations) |
| Spec Alignment | WARNING |
| Developer Checklist | 17/21 items passed |

## Overall: GO

## Details

### Structure

| File | Status | Notes |
|---|---|---|
| `carousel.js` | PASS | Present |
| `carousel.css` | PASS | Present |
| `carousel.scss` | PASS | Present (source, with minor CSS differences vs compiled file — see below) |
| `README.md` | PASS | Present and comprehensive |
| `_carousel.json` | PASS | Present in block directory |
| `ticket-details.md` | WARNING | File is committed but empty (0 content bytes) |

**SCSS vs CSS differences noted:** The SCSS file uses `calc(100dvh - var(--header-height))` on line 36 where the CSS has `100dvh - var(--header-height)` without `calc()`. The SCSS also uses single-quoted attribute selectors (`data-align='center'`) while the CSS uses unquoted (`data-align=center`). These are cosmetic compilation artefacts and do not affect functionality.

**Result: WARNING** — `ticket-details.md` is present but empty and cannot serve as a spec source.

---

### Pattern A Compliance

**2a. Export signature**

| Check | Status | Notes |
|---|---|---|
| Named export `export async function decorate(block, options = {})` | PASS | Line 129 — `async` is valid as the function uses `await fetchPlaceholders()` |
| Default export `export default (block) => decorate(block, window.Carousel?.hooks)` | PASS | Line 206 — PascalCase `Carousel` matches convention |
| `options = {}` default param | PASS | Line 129 |

**2b. Lifecycle hooks and events**

| Check | Status | Notes |
|---|---|---|
| `const ctx = { block, options }` | PASS | Line 130 |
| `options.onBefore?.(ctx)` before block logic | PASS | Line 133 |
| `block.dispatchEvent(new CustomEvent('carousel:before', { detail: ctx, bubbles: true }))` | PASS | Line 134 — `bubbles: true` present |
| `readVariant(block)` called | PASS | Line 137 |
| `options.onAfter?.(ctx)` after block logic | PASS | Line 197 |
| `block.dispatchEvent(new CustomEvent('carousel:after', { detail: ctx, bubbles: true }))` | PASS | Line 198 — `bubbles: true` present |

**2c. Imports**

| Import | Status | Notes |
|---|---|---|
| `moveInstrumentation`, `readVariant` from `../../scripts/scripts.js` | PASS | Line 9 |
| `fetchPlaceholders` from `../../scripts/placeholders.js` | PASS | Line 10 — project utility for i18n ARIA labels; not in canonical Pattern A list but is a standard EDS utility |

**2d. No site-specific code**

| Check | Status | Notes |
|---|---|---|
| No brand names, hard-coded URLs, property-specific values | PASS | None found |
| Placeholder keys used for all ARIA labels | PASS | Good i18n practice |

**Result: PASS**

---

### CSS Token Audit

Audit performed on `carousel.scss` (source of truth). The compiled `carousel.css` is nearly identical; violations are the same in both.

**Violations:**

| Location | Value | Suggested Fix |
|---|---|---|
| `:root` line 2 | `--carousel-slide-margin: 68px;` | This is a custom property definition inside `:root` — values inside `:root` are explicitly excepted from token requirements. PASS. |
| Media query block line 151 | `--carousel-slide-margin: 92px;` | Local custom property redefinition inside a media query block — this is an inline CSS variable, not a hard-coded style property. PASS per `:root` exception intent. |
| Media query block line 152 | `--slide-content-width: calc((100% - 2 * var(--carousel-slide-margin)) / 2);` | Uses `var(--carousel-slide-margin)` inside `calc()` — PASS. |

**Re-evaluating per strict audit rules (only flag values outside `:root` that are applied to properties):**

All pixel values in `carousel.scss`/`carousel.css` that appear outside `:root` are either:
- Inside `calc()` expressions — excepted
- Media query breakpoint values (`600px`) — excepted
- Local custom property redefinitions (`--carousel-slide-margin: 92px` inside a rule block) — technically outside `:root` but setting a custom property, not a style property directly

The two pixel values `68px` (`:root`) and `92px` (rule block) for `--carousel-slide-margin` are the closest items to flaggable values. The `92px` reassignment inside the media query rule is the clearest violation of token hygiene — it is a magic number that could be a spacing token.

**Violations (strict interpretation):**

| Line | File | Value | Issue | Suggested Fix |
|---|---|---|---|---|
| Line 151 (SCSS) | `carousel.scss` | `--carousel-slide-margin: 92px` (inside media query rule block, outside `:root`) | Pixel value for spacing assigned to custom property outside `:root` | Move to `:root` with `@media` override, or use `var(--spacing-092)` if that token exists |
| Line 69 (SCSS) | `carousel.scss` | `top: 4px` (play button pseudo-element positioning) — wait, this is in `embed.scss` | — | — |

Reviewing `carousel.scss` more carefully: the only pixel values outside `:root` and outside `calc()` or media query conditions are the `--carousel-slide-margin` CSS variable reassignments. No hard-coded hex, `rgb()`, font sizes, font weights, border radii, box shadows (only `color-mix()` with tokens and `transparent`), or transition durations appear outside `:root`.

**Revised violations:**

1. **Line 151 (SCSS) / Line 150 (CSS):** `--carousel-slide-margin: 92px` inside the `@media (width >= 600px)` rule block. This is a custom property set outside `:root`. If `var(--spacing-092)` or an equivalent token exists it should be used.
2. **Line 2 (both files):** `--carousel-slide-margin: 68px` inside `:root` — this is inside `:root` and is therefore **excepted**.

Only 1 flaggable violation found outside `:root`. However the `92px` value is a pure magic number with no token equivalent documented, making it a WARNING-level CSS hygiene issue.

**Additional observation:** `color-mix(in srgb, var(--color-grey-900) 75%, transparent)` appears at lines 65 and 116. `transparent` is explicitly excepted. This pattern is acceptable.

**Result: WARNING (1 violation — `92px` pixel value assigned to `--carousel-slide-margin` outside `:root` in media query block; no token equivalent documented)**

---

### Spec Alignment

`ticket-details.md` is empty. Spec reconstructed from `README.md` and `_carousel.json`.

| Use Case / Requirement | Status | Notes |
|---|---|---|
| Core carousel / slideshow functionality | PASS | Fully implemented |
| Previous / next navigation buttons | PASS | Lines 83–88, with ARIA labels from placeholders |
| Slide indicator dots | PASS | Lines 156–162 |
| Keyboard navigation | PASS | `tabindex="-1"` management on inactive slide links |
| IntersectionObserver-based active slide detection | PASS | `slideObserver` in `bindEvents` |
| Touch / swipe via CSS scroll snap | PASS | `scroll-snap-type: x mandatory` in CSS |
| Next-slide preloading | PASS | `preloadNextSlide` with low-priority `<link rel="preload">` |
| ARIA roles and labels | PASS | `role="region"`, `aria-roledescription`, `aria-hidden`, `aria-labelledby` |
| i18n ARIA labels via placeholders | PASS | All button labels use `fetchPlaceholders()` |
| Lifecycle hooks `onBefore`/`onAfter` | PASS | Fully implemented |
| Custom events with `bubbles: true` | PASS | `carousel:before`, `carousel:after` |
| UE schema — background image, alt, text content fields | PASS | `_carousel.json` has `mediaImage`, `mediaImageAlt`, `contentText` |
| Single-slide mode (no nav if only one slide) | PASS | `isSingleSlide` guard skips indicators and nav buttons |

**Gaps (relative to README-documented capabilities):**
- No CTA fields in `_carousel.json` — the `carousel-item` model has no `ctaLink`/`ctaLabel` fields. The README mentions customization via hooks for auto-play and tracking but does not explicitly require CTA fields. This is a minor UE authoring gap.
- `readVariant(block)` is called but no variant-specific CSS or behavior is implemented in the base block. This is expected for a base block; variants are intended to be handled by property overrides.

**Result: WARNING** — All documented use cases are implemented. Result is WARNING because `ticket-details.md` is empty and no authoritative spec can be cross-checked. No CF integration is documented as required.

---

### Developer Checklist

**Directory and Files**
| Item | Result |
|---|---|
| Directory convention `blocks/carousel/` | PASS |
| `carousel.js` and `carousel.css` present | PASS |
| BEM CSS classes (`.carousel-slides`, `.carousel-slide`, `.carousel-slide-image`, `.carousel-slide-content`, `.carousel-slide-indicator`, `.carousel-navigation-buttons`) | PASS |
| README present and comprehensive | PASS |
| No site-specific hard-coded values | PASS |
| Token usage in CSS | WARNING — `92px` magic number for `--carousel-slide-margin` at wide breakpoint |
| Root + Brand cascade support | PASS |

**Responsive**
| Item | Result |
|---|---|
| Breakpoints defined | PASS — `@media (width >= 600px)` |
| Fluid content (CSS scroll snap, 100% width) | PASS |
| Column stacking | N/A — carousel is inherently single-column |
| 1440px max-width | PASS — inherits from container |

**Authoring**
| Item | Result |
|---|---|
| UE in-context editing (`_carousel.json`, `moveInstrumentation` called) | PASS |
| Clear, labeled author fields | WARNING — no CTA fields in `carousel-item` model |
| Composable / extensible via hooks | PASS |
| Structure/content/presentation decoupled | PASS |
| CF integration | N/A (not documented as required) |

**Performance**
| Item | Result |
|---|---|
| Async scripts | N/A |
| Optimized images | WARNING — `createOptimizedPicture` is not called on carousel slide images; no image optimization applied in the base block |
| No unnecessary JS | PASS |
| Video embed | N/A |

**Accessibility**
| Item | Result |
|---|---|
| Keyboard nav | PASS — tab management, focusable prev/next buttons |
| Color contrast | N/A (token cascade) |
| Semantic HTML | PASS — `role="region"`, `aria-roledescription`, `aria-hidden`, `aria-labelledby` |
| AT support | PASS — internationalizable labels via placeholders |
| Alt text | PASS — `mediaImageAlt` field in schema; alt preserved in HTML |

**Score: 17/21** (N/A items excluded)

---

## Remediation

**Priority 1 — Blocking**
- None. Block is functionally complete and passes all hard requirements.

**Priority 2 — High**
1. **Populate `ticket-details.md`** — The file is committed but empty. Add the ADO ticket requirements.
2. **Image optimization** — `createOptimizedPicture` is not called for carousel slide images. Slide images should be optimized with responsive widths (as cards does) to avoid LCP regressions on hero-style carousels.
3. **CTA fields in UE schema** — Add `ctaLink` and `ctaLabel` (and optionally `cta2Link`/`cta2Label`) to the `carousel-item` model in `_carousel.json` to allow authors to configure slide CTAs without inline richtext links.

**Priority 3 — Low**
4. **CSS magic number** — Replace `--carousel-slide-margin: 92px` (inside media query block) with a spacing token if `var(--spacing-092)` or equivalent exists in the project's token set, to enable brand-level override without SCSS edits.
