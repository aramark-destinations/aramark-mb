# Block Audit Report: hero
Date: 2026-03-20

## Summary
| Category | Result |
|---|---|
| Structure | WARNING |
| Pattern A Compliance | WARNING |
| CSS Token Usage | WARNING (1 violation) |
| Spec Alignment | WARNING |
| Developer Checklist | 16/21 items passed |

## Overall: GO

## Details

### Structure

| File | Status | Notes |
|---|---|---|
| `hero.js` | PASS | Present |
| `hero.css` | PASS | Present |
| `hero.scss` | PASS | Present |
| `README.md` | PASS | Present and documented |
| `_hero.json` | PASS | Present in `blocks/hero/_hero.json` |
| `ticket-details.md` | WARNING | File exists but is empty (zero bytes) |

All required files are present. `ticket-details.md` exists but contains no content, so spec alignment cannot be verified against the ADO ticket. Audit uses `README.md` and `_hero.json` as the reference.

---

### Pattern A Compliance

#### 2a. Export signature

| Check | Result |
|---|---|
| `export function decorate(block, options = {})` | PASS — line 10 |
| `export default (block) => decorate(block, window.Hero?.hooks)` | PASS — line 45 |
| `options = {}` default param | PASS |

#### 2b. Lifecycle hooks and events

| Check | Result | Location |
|---|---|---|
| `const ctx = { block, options }` | PASS | Line 11 |
| `options.onBefore?.(ctx)` before block logic | PASS | Line 14 |
| `block.dispatchEvent(new CustomEvent('hero:before', ...))` | PASS | Line 15 |
| `bubbles: true` on `hero:before` event | PASS | Line 15 |
| `readVariant(block)` called | PASS | Line 18 |
| `options.onAfter?.(ctx)` after block logic | PASS | Line 36 |
| `block.dispatchEvent(new CustomEvent('hero:after', ...))` | PASS | Line 37 |
| `bubbles: true` on `hero:after` event | PASS | Line 37 |

All lifecycle requirements are met.

#### 2c. Imports

| Import | Path | Result |
|---|---|---|
| `readVariant` | `../../scripts/scripts.js` | PASS |

No additional imports used. `createOptimizedPicture`, `readBlockConfig`, `loadCSS`, and baici utilities are not needed for this block — N/A.

#### 2d. No site-specific code

PASS — no brand names, hard-coded URLs, or property-specific values present.

---

### CSS Token Audit

Reviewed `hero.scss` (`.css` compiled output is identical).

**Violation found (1):**

| Location | Value | Suggested fix |
|---|---|---|
| `hero.scss` line 2 (`:root` block) | `--hero-min-height: 300px` | This is a token *definition* inside `:root`, which is **exempt** per audit rules. No violation. |

Re-examining outside `:root`:

- Line 12: `padding: var(--spacing-040) var(--spacing-024)` — token, PASS
- Line 13: `min-height: var(--hero-min-height)` — token, PASS
- Line 17–19: `max-width: var(--layout-max-width-content)`, `color: var(--background-color)` — tokens, PASS
- Line 25: `z-index: -1` — structural negative z-index for background positioning. Per audit rules z-index numbers should use `var(--z-index-*)`. Flagged as 1 violation.
- Line 27: `object-fit: cover` — structural property, not brand-sensitive, PASS
- Breakpoint `900px` — exempt per audit rules
- `width: 100%`, `height: 100%`, `0` values — exempt

**Summary: WARNING (1 violation)**

| Line | Hard-coded value | Suggested fix |
|---|---|---|
| 25 (`hero.css`) | `z-index: -1` | `var(--z-index-below, -1)` if a z-index token scale is defined |

---

### Spec Alignment

`ticket-details.md` is empty. Alignment assessed from `README.md` and `_hero.json` UE schema.

#### Use cases from README

| Use Case | Implemented | Notes |
|---|---|---|
| Full-width banner with background image | PASS | `picture` positioned absolute with `inset: 0; object-fit: cover` |
| H1 heading text overlay | PASS | `.hero-text` class applied; max-width and centering via tokens |
| Semantic classification of image and text divs | PASS | `.hero-image` and `.hero-text` classes added to wrapping divs |
| Lifecycle hooks (onBefore/onAfter) | PASS | Fully implemented |
| Responsive padding at 900px | PASS | Breakpoint present in both `.css` and `.scss` |

#### UE schema fields vs implementation

| Schema field | Type | Used in JS | Notes |
|---|---|---|---|
| `image` | reference | Implicit | AEM renders `<picture>`; JS detects it and adds `.hero-image` class |
| `imageAlt` | text | Not explicitly | AEM populates `img.alt` natively; JS does not read `block.dataset.imagealt` |
| `text` | richtext | Implicit | AEM renders HTML including `h1`; JS adds `.hero-text` class |

WARNING: The `imageAlt` field is defined in the UE schema but `hero.js` does not programmatically apply it via `block.dataset.imagealt → img.alt`. The `image` block implements this pattern correctly. Confirm whether AEM handles alt text natively for this block.

The README does not include an authoring fields table documenting `image`, `imageAlt`, and `text` to guide authors.

---

### Developer Checklist

#### Conventions and Code Quality
| Item | Result |
|---|---|
| Directory convention (`/blocks/hero/`) | PASS |
| `hero.js` with `decorate` export | PASS |
| `hero.css` present | PASS |
| BEM CSS class naming | PASS — `.hero`, `.hero-image`, `.hero-text`, `.hero-wrapper` |
| README present | PASS |
| No site-specific code | PASS |
| Token usage in CSS | WARNING — 1 violation (`z-index: -1`) |
| Root + Brand token cascade supported | PASS — `--hero-min-height` in `:root` |

#### Responsive
| Item | Result |
|---|---|
| Breakpoints present | PASS — 900px breakpoint |
| Fluid content | PASS — `width: 100%`, `height: 100%` on img |
| Column stacking | N/A — single column layout |
| Max-width | PASS — `var(--layout-max-width-content)` on heading |

#### Authoring
| Item | Result |
|---|---|
| UE in-context editing | PASS — `_hero.json` schema present |
| Clear authoring fields | WARNING — README lacks a fields table; `imageAlt` field not applied in JS |
| Composable / extensible | PASS — hooks and events pattern implemented |
| Structure/content/presentation decoupled | PASS |
| CF integration | N/A |

#### Performance
| Item | Result |
|---|---|
| Async scripts | PASS — no blocking synchronous scripts |
| Optimized images | PASS — uses AEM `<picture>` element |
| No unnecessary JS | PASS — minimal JS |
| Video embed | N/A |

#### Accessibility
| Item | Result |
|---|---|
| Keyboard navigation | PASS — no interactive elements |
| Color contrast | WARNING — `var(--background-color)` on h1 over an arbitrary background image; no guaranteed contrast at base level |
| Semantic HTML | PASS — `h1`, `picture`, `img` used correctly |
| AT support | PASS — no ARIA needed for static content |
| Alt text | WARNING — `imageAlt` not applied in JS; relies on AEM native handling |

---

## Remediation

**Priority 1 — Should Fix**

1. **`imageAlt` not applied in JS** — The UE schema defines an `imageAlt` field. Verify whether AEM applies it to `img.alt` natively. If not, add `if (img && block.dataset.imagealt) img.alt = block.dataset.imagealt;` matching the pattern in `image.js`.
2. **`ticket-details.md` is empty** — Populate with the actual ADO ticket requirements to enable complete spec alignment verification.
3. **README missing authoring fields table** — Add a table documenting `image`, `imageAlt`, and `text` fields so authors know what is configurable.

**Priority 2 — Advisory**

4. **`z-index: -1`** — If a z-index token scale exists, replace with `var(--z-index-below, -1)` for consistency.
5. **Color contrast** — Heading uses `var(--background-color)` over a full-bleed background image. Brand overrides should ensure WCAG AA contrast ratio (4.5:1 for normal text); document this expectation.
