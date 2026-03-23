# Block Audit Report: embed
Date: 2026-03-20

## Summary
| Category | Result |
|---|---|
| Structure | WARNING |
| Pattern A Compliance | WARNING |
| CSS Token Usage | WARNING (2 violations) |
| Spec Alignment | WARNING |
| Developer Checklist | 17/20 items passed |

## Overall: GO

## Details

### Structure

| File | Status | Notes |
|---|---|---|
| `embed.js` | PASS | Present |
| `embed.css` | PASS | Present |
| `embed.scss` | PASS | Present (byte-for-byte identical to `embed.css` — no SCSS-specific syntax used) |
| `README.md` | PASS | Present and well-documented |
| `_embed.json` | PASS | Present in block directory |
| `ticket-details.md` | WARNING | File is committed but empty (0 content bytes) |

**Result: WARNING** — `ticket-details.md` is present but empty and cannot serve as a spec source.

---

### Pattern A Compliance

**2a. Export signature**

| Check | Status | Notes |
|---|---|---|
| Named export `export function decorate(block, options = {})` | PASS | Line 93 |
| Default export `export default (block) => decorate(block, window.Embed?.hooks)` | PASS | Line 150 — PascalCase `Embed` matches convention |
| `options = {}` default param | PASS | Line 93 |

**2b. Lifecycle hooks and events**

| Check | Status | Notes |
|---|---|---|
| `const ctx = { block, options }` | PASS | Line 94 |
| `options.onBefore?.(ctx)` before block logic | PASS | Line 97 |
| `block.dispatchEvent(new CustomEvent('embed:before', { detail: ctx, bubbles: true }))` | PASS | Line 98 — `bubbles: true` present |
| `readVariant(block)` called | PASS | Line 100 |
| `options.onAfter?.(ctx)` after block logic | PASS | Line 141 |
| `block.dispatchEvent(new CustomEvent('embed:after', { detail: ctx, bubbles: true }))` | PASS | Line 142 — `bubbles: true` present |

**2c. Imports**

| Import | Status | Notes |
|---|---|---|
| `readVariant` from `../../scripts/scripts.js` | PASS | Line 11 |

No other imports required. All embed provider logic is self-contained.

**2d. No site-specific code**

| Check | Status | Notes |
|---|---|---|
| No brand names or property-specific values | PASS |
| Hard-coded embed provider URLs | WARNING | `https://www.youtube.com`, `https://player.vimeo.com`, `https://platform.twitter.com/widgets.js` are hard-coded in provider functions. These are standard platform URLs, not brand-specific, but they are not configurable through the design token or options system. The Twitter widget script URL in particular (`loadScript('https://platform.twitter.com/widgets.js')`) is a third-party URL hard-coded at the base block level. |

The provider URLs are industry-standard CDN paths for public embeds. This pattern is common across EDS implementations. However the hard-coded Twitter script URL warrants a note as it could break if Twitter changes their widget endpoint.

**Result: WARNING** — All lifecycle hooks and exports are correctly implemented. `bubbles: true` is present on both events. The only deviation from Pattern A is the hard-coded third-party script URL for the Twitter widget, which is a minor portability concern.

---

### CSS Token Audit

Audit performed on `embed.scss` and `embed.css` (identical content).

**`:root` block (lines 1–4):** Defines `--embed-play-icon-border-v: 5px` and `--embed-play-icon-border-h: 6px`. Values inside `:root` are **excepted** from token requirements — PASS.

**Property violations outside `:root`:**

| Line | Value | Issue | Suggested Fix |
|---|---|---|---|
| Line 69 (`embed.scss`) | `top: 4px;` | Pixel position value for play button icon fine-grain positioning | Use `var(--spacing-004)` if that token exists, or document as intentional icon geometry |
| Line 70 (`embed.scss`) | `left: 7px;` | Pixel position value for play button icon fine-grain positioning | No clean token maps to `7px`; acceptable to leave if documented as icon geometry. Flag as minor violation. |

**Lines 65–68 (`border-top`, `border-bottom`, `border-left`)** reference `var(--embed-play-icon-border-v)` and `var(--embed-play-icon-border-h)` — these are the `:root` custom properties, not hard-coded values. PASS.

All other properties use tokens correctly:
- `max-width: var(--layout-max-width-media)` — PASS
- `margin: var(--spacing-032) auto` — PASS
- `aspect-ratio: var(--aspect-ratio-video)` — PASS
- `width: var(--sizing-024)`, `height: var(--sizing-024)` — PASS
- `height: var(--sizing-010)` — PASS
- `border: var(--weight-m) solid` — PASS
- `border-radius: var(--radius-l)` — PASS

**Inline styles in JS:** `getDefaultEmbed`, `embedYoutube`, and `embedVimeo` inject `style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;"` and `style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;"` as inline HTML strings. The `56.25%` value (16:9 aspect ratio) and `0` values are not CSS token violations per the audit rules (`0`, `100%`, and `50%` are excepted; `56.25%` is a percentage and therefore not flagged). However, `border: 0` and `top: 0 / left: 0` are `0` values, also excepted. This pattern bypasses the design token system for responsive iframe sizing but does not produce a token audit violation per the stated rules.

**Result: WARNING (2 violations — `top: 4px` and `left: 7px` pixel position values for play button icon)**

---

### Spec Alignment

`ticket-details.md` is empty. Spec reconstructed from `README.md` and `_embed.json`.

| Use Case / Requirement | Status | Notes |
|---|---|---|
| YouTube embed (youtube.com, youtu.be) | PASS | `embedYoutube` handles both URL patterns |
| Vimeo embed | PASS | `embedVimeo` implemented |
| Twitter/X embed | PASS | `embedTwitter` handles both `twitter.com` and `x.com` URLs |
| Generic iframe fallback | PASS | `getDefaultEmbed` handles any unmatched URL |
| Lazy loading via IntersectionObserver | PASS | Implemented for non-placeholder case |
| Placeholder image with click-to-play | PASS | `embed-placeholder` pattern with play button overlay |
| Autoplay on user interaction (click) | PASS | `autoplay=true` passed to provider functions on click |
| Lifecycle hooks `onBefore`/`onAfter` | PASS | Fully implemented |
| Custom events `embed:before`, `embed:after` | PASS | Both dispatched with `bubbles: true` |
| Configurable embed providers via `options.embedsConfig` | PASS | Default config overridable via options |
| Placeholder image field in UE | PASS | `embedPlaceholder` (reference) in `_embed.json` |
| Placeholder alt text field in UE | PASS | `embedPlaceholderAlt` (text) in `_embed.json` |
| URI field in UE | PASS | `embedUri` (text) in `_embed.json` |

**UE schema vs JS implementation alignment:**

The `_embed.json` schema defines `embedUri` as a plain text field, but `embed.js` reads the embed URL via `block.querySelector('a').href` (line 118). This assumes AEM renders the `embedUri` text field value as an anchor element. This authoring contract should be verified — if AEM renders the text field as a plain text node, the `querySelector('a')` call will return `null` and the block will throw a `TypeError`.

**Result: WARNING** — All README-described use cases are implemented. Result is WARNING because `ticket-details.md` is empty, and the `embedUri` field's rendering contract between the UE schema and JS DOM query is unverified.

---

### Developer Checklist

**Directory and Files**
| Item | Result |
|---|---|
| Directory convention `blocks/embed/` | PASS |
| `embed.js` and `embed.css` present | PASS |
| BEM CSS classes (`.embed-placeholder`, `.embed-placeholder-play`) | PASS |
| README present and documents all use cases | PASS |
| No site-specific hard-coded values | PASS |
| Token usage in CSS | WARNING — `top: 4px` and `left: 7px` pixel values for icon positioning |
| Root + Brand cascade support | PASS |

**Responsive**
| Item | Result |
|---|---|
| Breakpoints | N/A — embed is a fluid single element |
| Fluid content (`width: 100%`, `aspect-ratio` token) | PASS |
| Column stacking | N/A |
| Max-width via `var(--layout-max-width-media)` | PASS |

**Authoring**
| Item | Result |
|---|---|
| UE in-context editing (`_embed.json` present) | PASS |
| Clear, labeled author fields | PASS |
| Composable / extensible via `options.embedsConfig` | PASS |
| Structure/content/presentation decoupled | WARNING — iframe aspect ratio is hard-coded via inline `style` attributes in JS strings, bypassing token system |
| CF integration | N/A |

**Performance**
| Item | Result |
|---|---|
| Third-party scripts (Twitter) load on-demand | PASS |
| Optimized images | N/A (placeholder image is native `<picture>`) |
| No unnecessary JS | PASS |
| Lazy loading via IntersectionObserver | PASS |

**Accessibility**
| Item | Result |
|---|---|
| Keyboard nav | PASS — play button is `<button type="button">` |
| Color contrast | N/A (button uses `currentColor`; no hard-coded colors) |
| Semantic HTML | PASS — `<button>` for play, `title` attributes on iframes |
| AT support | PASS — iframe titles: "Content from Youtube", "Content from Vimeo", `url.hostname` for generic |
| Alt text | PASS — `embedPlaceholderAlt` field in schema |

**Score: 17/20** (N/A items excluded)

---

## Remediation

**Priority 1 — Blocking**
- None.

**Priority 2 — High**
1. **Populate `ticket-details.md`** — File is committed but empty. Add ADO ticket requirements.
2. **Verify `embedUri` authoring contract** — Confirm whether AEM renders the `embedUri` text field as an `<a>` anchor element. If AEM renders it as a plain text node, `block.querySelector('a').href` will return `null` and throw a `TypeError`. Either update the JS to handle both cases or document the rendering contract explicitly.
3. **Inline iframe styles** — The 16:9 aspect ratio (`padding-bottom: 56.25%`) is injected as inline HTML strings in `getDefaultEmbed`, `embedYoutube`, and `embedVimeo`. This bypasses the design token system and cannot be overridden by brand CSS. Consider extracting to a CSS class (`.embed-iframe-wrapper`) with `aspect-ratio: var(--aspect-ratio-video)` to match the `embed-placeholder` approach already used in the CSS.

**Priority 3 — Low**
4. **CSS pixel values** — Replace `top: 4px` and `left: 7px` on the play button `::before` pseudo-element with spacing tokens (`var(--spacing-004)`) if available, or document them as intentional icon geometry values exempt from token requirements.
5. **Twitter widget script URL** — The `https://platform.twitter.com/widgets.js` URL is hard-coded. Consider making the Twitter widget script URL configurable via `options` so it can be updated if Twitter changes their CDN path.
6. **SCSS/CSS sync** — `embed.scss` and `embed.css` are byte-for-byte identical; no SCSS-specific syntax is used. Consolidate to one file or begin using SCSS features to justify the dual-file setup.
