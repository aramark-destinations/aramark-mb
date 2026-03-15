# Aramark EDS Adoption Plan

**Project:** Aramark Multi-Brand EDS
**Reference:** `docs/SECTION-AND-CTA-IMPLEMENTATION.md`
**Last updated:** 2026-03-15

Outstanding work from the EDS analysis. Items already shipped have been removed.

---

## Outstanding Items

### 1. Section Model Expansion

**Files:** `component-models.json`, `scripts/scripts.js`, `styles/styles.css`
**Multi-brand concern:** Root level. All CSS values reference custom properties. Brand overrides go in `brands/{brand}/styles/sections.css`.
**Complexity:** Medium (1–2 days)
**Detail:** See `docs/SECTION-AND-CTA-IMPLEMENTATION.md` — Workstream A

The section component needs to support configurable background treatment and content layout. This is a prerequisite for the bgimage composition pattern and for any page where a background image or overlay is needed independent of block content.

**Changes required:**

| File | Change |
|---|---|
| `component-models.json` | Expand `"id": "section"` with `backgroundImage`, `backgroundImageAlt`, `backgroundVideo`, `backgroundVideoFallback`, `backgroundOverlay`, `contentWidth`, `contentAlign` fields |
| `scripts/scripts.js` | Add `decorateSectionBackgrounds()` function; call from `decorateMain()` after `decorateSections(main)` |
| `styles/styles.css` | Add `.section-bg`, `.section--overlay-*`, `.section--width-*`, `.section--align-*` rules |

---

### 2. CTA Block

**Files:** `blocks/cta/cta.js` (new), `blocks/cta/cta.css` (new), `component-definition.json`, `component-filters.json`, `component-models.json`
**Multi-brand concern:** Root level. All colors, spacing, and typography reference CSS custom properties only. Brands can extend via `brands/{brand}/blocks/cta/cta.css`.
**Complexity:** Large (2–3 days — each variant needs design review and CSS)
**Dependencies:** `readVariant` (done), Section model expansion (item 1 above — needed for bgimage composition pattern)
**Blocking:** Needs design sign-off on variant layouts before implementation
**Detail:** See `docs/SECTION-AND-CTA-IMPLEMENTATION.md` — Workstream B

The CTA block covers promotional layout patterns that currently have no block representation: image-left/right with text, icon + text, and button groups.

**Variants:**

| Variant class | Layout |
|---|---|
| `cta--medialeft` | Image left (~50%), text + buttons right. Responsive: stacks on mobile. |
| `cta--mediaright` | Image right (~50%), text + buttons left. |
| `cta--buttons` | Centered text block with a row of CTA buttons, no image. |
| `cta--iconleft` | Fixed-width icon (SVG/img) left of text content. Useful for feature callouts. |

> **Note:** The `bgimage` variant from earlier analysis is **not implemented as a CTA variant**. Instead, authors compose a Section (with `backgroundImage` + `backgroundOverlay` set) containing a `CTA (buttons)` block. Same visual result; background is configurable independently of content.

**Files checklist:**

| File | Change |
|---|---|
| `blocks/cta/cta.js` | New file |
| `blocks/cta/cta.css` | New file |
| `component-models.json` | Add `"id": "cta"` model entry |
| `component-definition.json` | Add CTA to `"Blocks"` group |
| `component-filters.json` | Add `"cta"` to `"id": "section"` components array |

---

### 3. Preconnect Hints

**Files:** `head.html`
**Complexity:** Small — confirm hostname, add one line

Font and CDN origins are not pre-connected. First font request pays full TCP + TLS handshake cost.

Check the actual font CDN hostname via the Network tab, then add to `head.html` after the existing `<link rel="stylesheet">`:

```html
<link rel="preconnect" href="https://use.typekit.net" crossorigin>
```

Replace `use.typekit.net` with the actual font origin observed in the Network tab.

---

### 4. Biome (Deferred)

**Decision:** Defer until a test suite exists.

Biome replaces ESLint + Prettier with a single faster tool. The risk is migration without tests — any linting rule change that silently reformats files is difficult to validate. `ARCHITECTURE-TODO.md #15` tracks that zero test files exist. Revisit after Playwright E2E tests and Jest unit tests cover critical paths (`site-resolver.js`, `decorate()` functions, form submission).

---

## Patterns to Maintain

These conventions are established and should be followed by all new blocks.

- **`readVariant(block)`** — call at the top of every `decorate()` function. Promotes the variant CSS class to `block.dataset.variant`.
- **External link decoration** — do not set `target="_blank"` or `rel` in blocks; `decorateExternalLinks()` in `decorateMain()` handles it.
- **Scroll-snap + IntersectionObserver** — the standard pattern for mobile swipe containers. Carousel and columns mobileslider are the reference implementations. Do not introduce touch libraries.
- **IntersectionObserver for lazy loading** — all blocks that load external resources defer until the block enters viewport. Do not use `scroll` event listeners.
- **Fragment-first for repeated regions** — header, footer, and any region appearing on multiple pages loads via `loadFragment()`.
- **Lifecycle hooks** — every block dispatches `{block}:before` / `{block}:after` custom events and calls `options.onBefore?.(ctx)` / `options.onAfter?.(ctx)`.

## Patterns to Avoid

- **CSS Modules** — requires a build step; breaks the runtime brand cascade override pattern.
- **Preact or any component framework** — no justification; vanilla JS handles all current blocks.
- **Commerce utilities** (`schemaOrg.js`, purchase event dataLayer) — no equivalent in Aramark's food service model.
- **Alt-text label syntax (`decorateLabels`)** — encodes non-accessible metadata in `alt` text; conflicts with WCAG intent.
- **Git branch naming hooks enforcement** — external JIRA workflow conventions are not enforced here.
