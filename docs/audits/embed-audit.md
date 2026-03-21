# Block Audit Report: embed
Date: 2026-03-20

## Summary
| Category | Result |
|---|---|
| Structure | PASS |
| Pattern A Compliance | PASS |
| CSS Token Usage | WARNING (3 violations) |
| Spec Alignment | WARNING |
| Developer Checklist | 17/22 items passed |

## Overall: NO-GO

## Details

### Structure

All required files are present:
- `embed.js` — present
- `embed.css` — present
- `embed.scss` — present
- `README.md` — present, well-documented
- `_embed.json` — present

No `ticket-details.md` exists for this block. Spec alignment is assessed against the README and solution design.

### Pattern A Compliance

**2a. Export signature — PASS**
- Named export `export function decorate(block, options = {})` present.
- Default export `export default (block) => decorate(block, window.Embed?.hooks)` — correct PascalCase (`Embed`), correct wiring.

**2b. Lifecycle hooks and events — PASS**
- `ctx` object constructed correctly with `{ block, options }`.
- `options.onBefore?.(ctx)` fires before block logic.
- `block.dispatchEvent(new CustomEvent('embed:before', { detail: ctx }))` fires before block logic.
- `options.onAfter?.(ctx)` fires after block logic.
- `block.dispatchEvent(new CustomEvent('embed:after', { detail: ctx }))` fires after block logic.
- `readVariant(block)` called at start of block logic.

**Note:** `embed:before` and `embed:after` events are dispatched without `bubbles: true`. The skill spec example uses `{ detail: ctx, bubbles: true }`. This is a minor deviation — events will not bubble to parent elements.

**2c. Imports — PASS**
- `readVariant` imported from `../../scripts/scripts.js` — correct.
- No other utility imports needed. All embed logic is self-contained.

**2d. No site-specific code — PASS**
- No brand names, hard-coded URLs, or property-specific values. All embed providers are configurable via `options.embedsConfig`.

### CSS Token Audit

Scanned `embed.scss` for hard-coded values.

**Violations found (3):**

```
Line 62: border-top: 5px solid transparent
  Suggested: border-top: var(--spacing-005) solid transparent

Line 63: border-bottom: 5px solid transparent
  Suggested: border-bottom: var(--spacing-005) solid transparent

Line 64: border-left: 6px solid
  Suggested: border-left: var(--spacing-006) solid
```

Additionally, lines 65–66 use `top: 4px` and `left: 7px`. These are fine-grain pixel offsets for a CSS-drawn play button triangle and are likely structural/positional rather than brand values. However they may warrant token coverage if a sizing token exists for them.

All other properties use tokens: `var(--layout-max-width-media)`, `var(--spacing-032)`, `var(--aspect-ratio-video)`, `var(--sizing-024)`, `var(--sizing-010)`, `var(--weight-m)`, `var(--radius-l)`.

**Result: WARNING (3 violations)** — border pixel values for the play-button indicator are hard-coded.

### Spec Alignment

No `ticket-details.md` found. Alignment assessed against README and solution design.

**Use cases from solution design:**
| Use Case | Implemented? | Notes |
|---|---|---|
| Basic Google Map embed | PARTIAL | Generic iframe embed covers this; no Maps-specific handling |
| Live video feed embeds | YES | YouTube and Vimeo supported; generic iframe fallback for others |
| Configurable embed providers via options | YES | `options.embedsConfig` allows custom provider array |
| Placeholder image with click-to-play | YES | `embed-placeholder` pattern implemented |
| Lazy loading via IntersectionObserver | YES | Implemented for non-placeholder case |
| Autoplay on interaction | YES | `autoplay` flag passed on placeholder click |

**Configurable fields (UE schema vs implementation):**
| Field | In `_embed.json` | Used in JS |
|---|---|---|
| `embedPlaceholder` | YES | Indirect — rendered as `picture` element by AEM |
| `embedPlaceholderAlt` | YES | Not explicitly read in JS (AEM populates alt on img) |
| `embedUri` | YES | Read as `block.querySelector('a').href` |

The UE JSON schema defines `embedUri` as a text field, but the JS reads the value via `block.querySelector('a').href`. This assumes AEM renders the URI as an anchor element from the `aem-content` or `text` component — this authoring contract should be verified.

**4d. Design details:**
The solution design notes "responsive iframe embed" as a requirement. The embed uses inline `style` on the iframe container (padding-bottom 56.25% aspect ratio trick) rather than CSS classes with tokens. This is functional but means the aspect ratio cannot be overridden by brand tokens.

### Developer Checklist

**General Block Requirements**
- [PASS] Directory follows `/blocks/embed/` convention
- [PASS] Has `embed.js` with `decorate(block)` export
- [PASS] Has `embed.css`
- [PASS] BEM-style CSS classes (`.embed-placeholder`, `.embed-placeholder-play`)
- [PASS] README documents use cases and configuration
- [PASS] No site-specific code
- [PASS] Brand differentiation via tokens only
- [WARNING] Uses semantic design tokens — 3 CSS violations noted above
- [PASS] Supports Root + Brand token cascade

**Responsive Design**
- [PASS] Renders correctly — fluid width, centered layout
- [PASS] Content expands within margins
- [N/A] Columns (not applicable)
- [PASS] Respects max-width via `var(--layout-max-width-media)`

**Authoring Contract**
- [PASS] Works with Universal Editor (`_embed.json` present)
- [PASS] Author-facing fields clear and documented
- [PASS] Composable, not bound to templates
- [PASS] Structure/content/presentation decoupled
- [N/A] Content Fragment integration (not applicable to embed)

**Performance**
- [PASS] Third-party scripts (Twitter) load asynchronously via `loadScript`
- [WARNING] YouTube/Vimeo iframes use inline styles for responsive sizing instead of CSS token-driven layout
- [PASS] No unnecessary JavaScript
- [PASS] Lazy loading via IntersectionObserver

**Accessibility**
- [PASS] Keyboard navigation — play button is a `<button type="button">`
- [WARNING] Color contrast — play button uses `currentColor` for border/fill, which depends on parent context; no explicit color token applied
- [PASS] Semantic HTML — iframe titles present
- [PASS] Alt text fields available in UE schema

## Remediation

**Priority 1 — Blocking**

1. Add `bubbles: true` to `embed:before` and `embed:after` CustomEvent dispatches to match the platform convention used by other blocks in this repo.

**Priority 2 — Should Fix**

2. Replace hard-coded pixel values on the play button's `::before` pseudo-element (lines 62–64 in `embed.scss`) with spacing tokens: `5px` → `var(--spacing-005)`, `6px` → `var(--spacing-006)`.
3. Replace inline `style` on iframe containers in `getDefaultEmbed`, `embedYoutube`, and `embedVimeo` with CSS classes so aspect ratio and layout can be controlled by tokens. The current `padding-bottom: 56.25%` approach circumvents the design token system.

**Priority 3 — Advisory**

4. Add a `ticket-details.md` if a formal ADO ticket exists for this block; this serves as the authoritative requirements source per project convention.
5. Verify the authoring contract: confirm AEM renders the `embedUri` field as an `<a>` element that `block.querySelector('a').href` can find, or update the JS to read from `block.dataset.embeduri` instead.
6. Consider adding explicit Google Maps iframe handling (beyond the generic iframe fallback) since Google Map embed is a documented use case.
