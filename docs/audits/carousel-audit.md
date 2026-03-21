# Block Audit Report: carousel
Date: 2026-03-20

## Summary
| Category | Result |
|---|---|
| Structure | WARNING |
| Pattern A Compliance | PASS |
| CSS Token Usage | WARNING (3 violations) |
| Spec Alignment | WARNING |
| Developer Checklist | 16/23 items passed |

## Overall: NO-GO

## Details

### Structure

Files present:
- `carousel.js` — present
- `carousel.css` — present
- `carousel.scss` — present (source)
- `README.md` — present
- `_carousel.json` — present

Files missing:
- `ticket-details.md` — MISSING. No ADO ticket requirements file committed to the block directory.

Result: WARNING (missing ticket-details.md — required per project convention)

### Pattern A Compliance

**2a. Export signature**
- Named export `export async function decorate(block, options = {})` — PASS
- Default export `export default (block) => decorate(block, window.Carousel?.hooks)` — PASS
- `options = {}` default parameter present — PASS

**2b. Lifecycle hooks and events**
- `ctx = { block, options }` — PASS
- `options.onBefore?.(ctx)` before block logic — PASS
- `block.dispatchEvent(new CustomEvent('carousel:before', { detail: ctx }))` — PASS (note: `bubbles: true` omitted — minor inconsistency)
- `readVariant(block)` called — PASS
- `options.onAfter?.(ctx)` after block logic — PASS
- `block.dispatchEvent(new CustomEvent('carousel:after', { detail: ctx }))` — PASS

**2c. Imports**
- `moveInstrumentation`, `readVariant` from `../../scripts/scripts.js` — PASS
- `fetchPlaceholders` from `../../scripts/placeholders.js` — PASS (project utility for i18n strings)

**2d. No site-specific code**
- No brand-specific logic, URLs, or property-specific values — PASS
- Placeholder keys used for ARIA labels — good internationalization practice — PASS

Result: PASS

### CSS Token Audit

Scanned `carousel.scss`.

**Line 58:** `margin: 68px;`
  Suggested: `margin: var(--spacing-068)` or appropriate spacing token — hard-coded pixel margin on slide content

**Line 148:** `margin: 92px;`
  Suggested: `margin: var(--spacing-092)` or appropriate spacing token — hard-coded pixel margin at wider breakpoint

**Line 147:** `--slide-content-width: calc((100% - 184px) / 2);`
  The `184px` value inside `calc()` is derived from `92px * 2` (double the margin). Values inside `calc()` that combine tokens are excepted per the skill, but here the `184px` is a magic number rather than a token. Suggested: use `calc(2 * var(--carousel-slide-margin))` with the margin value defined as a token.

**Line 58:** `color: white;`
  Suggested: `color: var(--color-neutral-0)` or `var(--color-white)` — hard-coded color keyword should use a token

Additional notes:
- `color-mix(in srgb, var(--color-grey-900) 75%, transparent)` at lines 61 and 112 — `color-mix` with a token and `transparent` is an acceptable pattern; `transparent` is explicitly excluded from flagging.
- `var(--color-grey-900)` — token name uses "grey" while some blocks use "neutral"; check project token naming consistency.

Result: WARNING (3 violations — hard-coded pixel margins 68px/92px/184px, hard-coded `color: white`)

### Spec Alignment

No `ticket-details.md` exists. Spec alignment assessed against README, `_carousel.json` schema, and solution design.

| Use Case | Implemented? | Notes |
|---|---|---|
| Manual panel/slide configuration | YES | Authors create slides via UE item model |
| Content Fragment dynamic population | NO | No CF integration code present |
| Multiple style variants with conceptual roles | NO | `readVariant(block)` called but no documented variants in README or implemented CSS variants |
| Slides are either media assets or Card variants | PARTIAL | Media image + text content per slide; Card variant integration not implemented |
| Navigation: previous/next buttons | YES | Implemented with ARIA labels via placeholders |
| Navigation: indicator dots | YES | Implemented with ARIA labels |
| Keyboard navigation | YES | Tab management on hidden slides (tabindex=-1 on non-active slides) |
| Touch/swipe support | YES | Via CSS `scroll-snap-type: x mandatory` and `scroll-behavior: smooth` |
| Responsive | YES | CSS handles layout across breakpoints |
| Preload next slide for performance | YES | `preloadNextSlide` function implemented |

Key gaps:
- **No Content Fragment integration** — the solution design explicitly requires carousel slides to be populatable from CF data. This is entirely absent.
- **No style variants** — `readVariant` is called but no variant-specific CSS classes or behavior are implemented. The solution design calls for multiple conceptual roles (featuring products, promotions, experiences, blog content).
- **Card slide variant** — the spec calls for slides to be either media assets or Card variants. The Card block integration is not implemented.
- **UE schema gap** — the `carousel-item` model has `mediaImage`, `mediaImageAlt`, and `contentText` fields but no CTA fields and no Card variant option.

Result: WARNING (CF integration absent; style variants not implemented; Card slide variant missing; ticket-details.md absent)

### Developer Checklist

**General Block Requirements**
- [PASS] Directory follows `/blocks/carousel/` convention
- [PASS] Has `carousel.js` with `decorate(block)` export
- [PASS] Has `carousel.css`
- [PASS] BEM-style CSS classes (`.carousel-slides`, `.carousel-slide`, `.carousel-slide-image`, `.carousel-slide-content`, `.carousel-slide-indicator`, `.carousel-navigation-buttons`)
- [PASS] README documents use cases and customization points
- [PASS] Part of shared global library
- [PASS] Brand differentiation via tokens only
- [WARNING] CSS token violations present (hard-coded margins, `color: white`)
- [PASS] Supports Root + Brand token cascade

**Responsive Design**
- [PASS] Renders correctly across breakpoints
- [PASS] Content fluidly expands within margins
- [N/A] Column stacking (carousel is inherently single-column slides)
- [PASS] Respects 1440px max-width (inherits from container)

**Authoring Contract**
- [PASS] Works with Universal Editor (slide items, moveInstrumentation)
- [WARNING] Author-facing fields present but limited — no CTA fields in schema
- [PASS] Composable — not bound to specific templates
- [PASS] Structure/content/presentation decoupled
- [FAIL] Content Fragment integration not implemented

**Performance**
- [N/A] Third-party scripts
- [PASS] Next-slide preloading implemented (low-priority `<link rel="preload">`)
- [PASS] No unnecessary JavaScript
- [N/A] Video

**Accessibility (WCAG 2.1)**
- [PASS] Keyboard navigation (tabindex management, prev/next buttons)
- [PASS] Color contrast relies on token cascade
- [PASS] Semantic HTML (`role="region"`, `aria-roledescription`, `aria-label`, `aria-hidden` on inactive slides)
- [PASS] Works with assistive technologies
- [PASS] Placeholder-driven ARIA labels (internationalizable)

Score: 16/23 applicable items passed.

## Remediation

**Priority 1 — Blocking (must fix before GO)**
1. Create `ticket-details.md` with the ADO ticket requirements for this block.
2. Implement Content Fragment integration — allow carousel slides to be populated from CF data using the standard card field names (`title`, `eyebrow`, `shortDescription`, `images`, `button1Link`, `button1Text`, etc.).

**Priority 2 — Should fix**
3. Implement style variants — define and document at least the roles specified in the solution design (product-feature, promotional, experience, blog). Add variant CSS classes and corresponding visual styling.
4. Implement Card slide variant — allow a carousel slide to render a full Card block instance, enabling the "Slides are either media assets or Card variants" pattern.
5. Expand `_carousel.json` to add CTA fields (`ctaLink`, `ctaLabel`, `cta2Link`, `cta2Label`) to the `carousel-item` model.

**Priority 3 — CSS cleanup**
6. Replace hard-coded `68px` and `92px` margins with tokens or CSS custom properties (`--carousel-slide-margin`) that can be overridden per brand.
7. Replace `color: white` with `var(--color-neutral-0)` or equivalent token.
8. Add `bubbles: true` to `carousel:before` and `carousel:after` event dispatches for consistency.
