# Block Audit Report: hero
Date: 2026-03-20

## Summary
| Category | Result |
|---|---|
| Structure | PASS |
| Pattern A Compliance | PASS |
| CSS Token Usage | WARNING (1 violation) |
| Spec Alignment | WARNING |
| Developer Checklist | 17/22 items passed |

## Overall: NO-GO

## Details

### Structure

All required files are present:
- `hero.js` — present
- `hero.css` — present
- `hero.scss` — present
- `README.md` — present, adequately documented
- `_hero.json` — present

No `ticket-details.md` exists for this block. Spec alignment is assessed against the README and solution design.

### Pattern A Compliance

**2a. Export signature — PASS**
- Named export `export function decorate(block, options = {})` present.
- Default export `export default (block) => decorate(block, window.Hero?.hooks)` — correct PascalCase (`Hero`), correct wiring.

**2b. Lifecycle hooks and events — PASS**
- `ctx` constructed as `{ block, options }`.
- `options.onBefore?.(ctx)` fires before block logic.
- `block.dispatchEvent(new CustomEvent('hero:before', { detail: ctx }))` fires before block logic.
- `options.onAfter?.(ctx)` fires after block logic.
- `block.dispatchEvent(new CustomEvent('hero:after', { detail: ctx }))` fires after block logic.
- `readVariant(block)` called at start of block logic.

**Note:** `hero:before` and `hero:after` events dispatched without `bubbles: true`. Minor deviation from platform convention.

**2c. Imports — PASS**
- `readVariant` imported from `../../scripts/scripts.js` — correct.

**2d. No site-specific code — PASS**
- No brand names or property-specific values. Block logic is minimal — reads structure from authored content.

### CSS Token Audit

Scanned `hero.scss` for hard-coded values.

**Violations found (1):**

```
Line 9: min-height: 300px
  Suggested: min-height: var(--hero-min-height)  (or equivalent sizing/spacing token)
```

`300px` is a hard-coded minimum height for the hero block. This is a brand-sensitive value — different property sites may require different hero heights, and this should be controllable via a token.

**Not flagged (acceptable):**
- `padding: var(--spacing-040) var(--spacing-024)` — uses tokens.
- `max-width: var(--layout-max-width-content)` — uses token.
- `color: var(--background-color)` — uses token.
- `z-index: -1` — structural negative z-index for background positioning; no token convention for negative z-index.
- `width: 100%`, `height: 100%` — percentage values, exempt.
- Media query breakpoint `900px` — exempt.

**Result: WARNING (1 violation)**

### Spec Alignment

No `ticket-details.md` found. Alignment assessed against README and solution design.

**Use cases from solution design — Hero Specifics:**
| Use Case | Implemented? | Notes |
|---|---|---|
| Background image | YES | `picture` element positioned absolute as full-bleed background |
| Background color | PARTIAL | No explicit color background variant; relies on CSS token `var(--background-color)` on h1, but no color-only hero mode |
| Background video | NO | Not implemented in base block |
| H1 heading text (required) | YES | `heading.closest('div')?.classList.add('hero-text')` applied when H1 found |
| Optional: eyebrow text | NO | No eyebrow handling in JS or CSS |
| Optional: description text | NO | No description text handling |
| Optional: CTA buttons | NO | No button/CTA handling |
| Optional: breadcrumb | PARTIAL | UE schema has a breadcrumbs filter component allowance; no JS handling in base block |

The base hero block handles the core image + H1 use case but is missing several documented optional elements: eyebrow text, description text, CTA buttons, and background video support. These are all called out in both the solution design and developer alignment checklist.

**Configurable fields (UE schema vs implementation):**
| Field | In `_hero.json` | Used in JS |
|---|---|---|
| `image` (reference) | YES | Rendered as `<picture>` by AEM; JS detects `picture` and adds `.hero-image` class |
| `imageAlt` (text) | YES | Applied to `<img alt>` by AEM; JS does not explicitly read it |
| `text` (richtext) | YES | Rendered as HTML content; JS detects `h1` and adds `.hero-text` class |

The UE schema does not include fields for eyebrow, description, or CTA buttons — these are missing from both the schema and the JS implementation.

The `filters` array in `_hero.json` correctly allows `breadcrumbs` component as a child — this is consistent with the spec requirement for optional breadcrumb in the hero.

**4d. Design details:**
- `min-height: 300px` is hard-coded and should be a token (see CSS audit above).
- Background video support is documented as a variant use case (Video Hero) — the base hero block correctly defers this to a brand-level extension, but the README does not explicitly state this boundary.

### Developer Checklist

**General Block Requirements**
- [PASS] Directory follows `/blocks/hero/` convention
- [PASS] Has `hero.js` with `decorate(block)` export
- [PASS] Has `hero.css`
- [PASS] BEM-style CSS classes (`.hero-image`, `.hero-text`)
- [WARNING] README does not document optional fields (eyebrow, description, CTA, video)
- [PASS] No site-specific code
- [PASS] Brand differentiation via tokens only
- [WARNING] 1 CSS token violation (`min-height: 300px`)
- [PASS] Supports Root + Brand token cascade

**Responsive Design**
- [PASS] Renders correctly — padding adjusts at 900px breakpoint
- [PASS] Content expands within margins
- [N/A] Columns — not applicable
- [PASS] Respects max-width via `var(--layout-max-width-content)` on h1

**Authoring Contract**
- [PASS] Works with Universal Editor (`_hero.json` present)
- [WARNING] UE schema missing fields for eyebrow, description, and CTA buttons — documented spec requirements
- [PASS] Composable
- [PASS] Structure/content/presentation decoupled
- [N/A] Content Fragment integration — not applicable to hero

**Performance**
- [N/A] Third-party scripts — none
- [PASS] Images use `<picture>` element (AEM-optimized)
- [PASS] No unnecessary JavaScript
- [N/A] Video — not in base block

**Accessibility**
- [PASS] Semantic HTML — h1 used for heading
- [PASS] Image alt text managed via `imageAlt` UE field (AEM populates on `<img>`)
- [WARNING] No explicit ARIA or landmark handling for hero region
- [WARNING] Text over background image has no contrast enforcement in base CSS — `color: var(--background-color)` on H1 assumes light-on-dark background; no fallback

**Hero Specifics (from developer alignment checklist)**
- [PARTIAL] Background options: image YES, color PARTIAL, video NO
- [PASS] H1 heading text
- [FAIL] Optional eyebrow text — not implemented
- [FAIL] Optional description text — not implemented
- [FAIL] Optional CTA buttons — not implemented
- [PARTIAL] Optional breadcrumb — UE filter allows it, no JS handling

## Remediation

**Priority 1 — Blocking**

1. Add eyebrow text field to `_hero.json` UE schema and handle it in `hero.js` — this is a documented required optional field in the spec.
2. Add description text field to `_hero.json` and handle in `hero.js`.
3. Add CTA button fields to `_hero.json` (at minimum `button1Link`, `button1Text`, `button1Style`) and render them in `hero.js`.

**Priority 2 — Should Fix**

4. Replace `min-height: 300px` with a CSS custom property token (e.g., `var(--hero-min-height)`) to allow brand-level override.
5. Add `bubbles: true` to `hero:before` and `hero:after` CustomEvent dispatches.
6. Add background color variant handling — the spec lists "background color" as an explicit hero background option alongside image and video.

**Priority 3 — Advisory**

7. Document the video hero boundary in the README: clarify that video backgrounds are handled by a brand-level `video-hero` block variant, not the base hero.
8. Add explicit text-contrast handling or documentation for hero content legibility over background images.
9. Add a `ticket-details.md` if a formal ADO ticket exists for this block.
