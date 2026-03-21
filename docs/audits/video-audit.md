# Block Audit Report: video
Date: 2026-03-20

## Summary
| Category | Result |
|---|---|
| Structure | PASS |
| Pattern A Compliance | WARNING |
| CSS Token Usage | WARNING (2 violations) |
| Spec Alignment | WARNING |
| Developer Checklist | 18/22 items passed |
| Accessibility Basics | PASS |

## Overall: NO-GO

## Details

### Structure

| File | Expected | Present |
|---|---|---|
| `video.js` | yes | yes |
| `video.css` | yes | yes |
| `video.scss` | yes | yes |
| `README.md` | yes | yes |
| `ticket-details.md` | yes | yes |
| `_video.json` | yes (author-configurable fields) | yes |

All required files present. The UE schema, README, and ticket-details are all in place. Structure is complete.

**Result: PASS**

---

### Pattern A Compliance

**2a. Export signature**

```js
export async function decorate(block, options = {}) { ... }
export default (block) => decorate(block, window.Video?.hooks);
```

Named export with `options = {}` default: PASS. Default export wired to `window.Video?.hooks`: PASS. PascalCase `Video` matches block name: PASS.

**2b. Lifecycle hooks and events**

```js
const ctx = { block, options };
options.onBefore?.(ctx);
block.dispatchEvent(new CustomEvent('video:before', { detail: ctx, bubbles: true }));
// ... block logic ...
options.onAfter?.(ctx);
block.dispatchEvent(new CustomEvent('video:after', { detail: ctx, bubbles: true }));
```

`ctx` object: PASS. `onBefore`/`onAfter` hooks: PASS. Events with `bubbles: true`: PASS. `readVariant(block)` called near the top of the block logic: PASS.

**WARNING — private `_loadScript` function defined but never used.** Line 11 defines a `const _loadScript = (url) => { ... }` function that appends a script element to `<head>`. This function is never called anywhere in the file — `loadScript` from `../../scripts/aem.js` is used instead. The orphaned `_loadScript` is dead code.

**2c. Imports**

```js
import { moveInstrumentation, readVariant } from '../../scripts/scripts.js';
```

Note: `loadScript` is imported from `../../scripts/aem.js` at line 1 and is used correctly (in `loadUgc`-equivalent path via `loadScript(scriptSrc)`). Wait — this is the video block: `loadScript` is not imported here. The video block imports only from `../../scripts/scripts.js`. The YouTube and Vimeo API scripts are loaded by creating `<script>` tags directly (not via `loadScript`). This is correct and consistent.

Correct paths. PASS.

**2d. No site-specific code**

No brand-specific logic. Analytics push to `window.adobeDataLayer` — platform-wide integration, not site-specific. PASS.

**Result: WARNING** — Dead code: `_loadScript` defined but never used.

---

### CSS Token Audit

Scanning `video.scss`:

**Violations:**

Line 19: `background: var(--color-neutral-900, #000)`
  Suggested: `background: var(--color-neutral-900)` — `#000` is a hard-coded color fallback. Remove the fallback.

Line 94: `border-left: 18px solid var(--video-play-icon-color, #fff)`
  Suggested: `border-left: 18px solid var(--video-play-icon-color)` — `#fff` is a hard-coded color fallback inside a border shorthand. Remove the fallback.

Additional note: Several `rgb()` values appear in the CSS:
- Line 68: `background: var(--video-play-bg, rgb(0 0 0 / 70%))` — the fallback is `rgb()`. While this is technically an `rgba` equivalent and the preferred value is the token `--video-play-bg`, the fallback being `rgb()` means if the token is not defined, a raw color is used. Flagged for awareness but these `rgb()` fallbacks are the token defaults, which is a pattern used throughout this codebase.
- Line 75: `background: var(--video-play-bg-hover, rgb(0 0 0 / 90%))` — same pattern.

Only the two `#` hex fallbacks are counted as violations per the token audit rules.

Also: the `border-top-width`, `border-bottom-width`, `border-left-width` pixel values on the play button triangle (lines 93–95, 127–130, 151–153) are structural CSS triangle technique values — not brand-related spacing tokens. These are exempt as structural values.

**Result: WARNING (2 violations)** — Hex color fallbacks `#000` and `#fff` in token calls.

---

### Spec Alignment

Source of truth: `ticket-details.md` and README.

**4a. Use cases**

| Use Case | Implemented? | Notes |
|---|---|---|
| DAM-hosted MP4 (HTML5 player) | YES | `getVideoElement` creates `<video controls>` |
| YouTube embed (YouTube player) | YES | `embedYoutube` creates responsive iframe with `enablejsapi=1` |
| Vimeo embed | YES | `embedVimeo` creates responsive iframe |
| Auto-detect video type from URL | YES | `isYoutube` and `isVimeo` checks in `loadVideoEmbed` |
| Poster image override | YES | `picture` element extracted and applied as poster |
| Placeholder image alt text | YES | Read from DOM element `data-aue-prop="placeholder-image-alt-text"` and applied |
| Full-width video option | YES | `isFullWidth` flag adds `full-width` class |
| Captions track (MP4 only) | YES | `block.dataset.captions` read and WebVTT track appended |
| Responsive scaling (maintains aspect ratio) | YES | `aspect-ratio: var(--aspect-ratio-video)` on placeholder; iframe uses `padding-bottom: 56.25%` |
| Lazy loading | YES | IntersectionObserver when no placeholder; click-to-load when placeholder present |
| Analytics tracking | YES | `pushVideoEvent` to `window.adobeDataLayer` for play/pause/complete/progress/fullscreen |

**4b. Configurable fields (UE schema vs. ticket)**

| Ticket Field | In `_video.json` | Consumed in JS |
|---|---|---|
| Video Source (DAM or YouTube URL) | YES — `uri` field | YES — `block.querySelector('a')` reads the rendered link |
| Video Type (auto-select) | NOT in schema | YES — auto-detected from URL |
| Poster Image Override | YES — `placeholderImage` (reference) | YES — via `block.querySelector('picture')` |
| Placeholder Image Alt Text | YES — `placeholderImageAlt` | PARTIAL — JS reads `data-aue-prop="placeholder-image-alt-text"` but the schema field is named `placeholderImageAlt`, not `placeholder-image-alt-text`. There may be a name mismatch between the UE property name and the DOM attribute being queried. |
| Video Description (NEW) | YES — `videoDescription` | NOT CONSUMED — `videoDescription` is defined in the UE schema but is never read or used in `decorate()`. |
| Full-width Video | YES — `fullWidth` (boolean) | YES — `block.querySelector('[data-aue-prop="full-width"]')` |
| Captions Track | YES — `captionsTrack` (reference) | PARTIAL — `block.dataset.captions` is read, but the UE schema field is `captionsTrack`; the mismatch in attribute names between UE property and dataset key needs verification. |

**4c. Design details**

The ticket specifies the video has a max width of ~920px when standalone in a full content-width section. The CSS uses `max-width: var(--layout-max-width-narrow)` which should map to this value if the token is set correctly. The `full-width` variant removes this constraint for hero/background use cases.

Autoplay: The ticket does not explicitly require autoplay suppression, but the README and code comments explicitly note "NO AUTOPLAY — autoplay is disabled." The UE schema offers an "AutoPlay" multiselect option (`value: "autoplay"`) but the block does not implement autoplay behavior. This creates a discrepancy between the UE schema and the actual block behavior.

Dynamic Media streaming: The ticket mentions "Dynamic Media players + streaming" for hosted videos, but the block uses standard HTML5 `<video>` with a `<source>` element. Dynamic Media streaming (HLS/DASH) is not implemented.

**Result: WARNING** — `videoDescription` field defined in schema but never consumed; potential field name mismatches between UE property names and DOM query targets; autoplay option in schema but not implemented; Dynamic Media streaming not implemented.

---

### Developer Checklist

#### General Block Requirements
- [PASS] Directory follows `/blocks/video/` convention
- [PASS] Has `video.js` with `decorate(block)` export
- [PASS] Has `video.css`
- [PASS] BEM-style CSS classes (`.video-placeholder`, `.video-placeholder-play`, `.video-error`)
- [PASS] README documents use cases, authoring fields, tokens, and accessibility
- [PASS] No site-specific code
- [PASS] Brand differentiation via tokens (`--video-play-bg`, `--video-play-bg-hover`, `--video-play-icon-color`)
- [WARNING] 2 hex color fallbacks in token calls
- [PASS] Supports Root + Brand token cascade

#### Responsive Design
- [PASS] Mobile-first responsive breakpoints at 768px and 1200px
- [PASS] Content fluidly scales — aspect ratio maintained via CSS
- [N/A] No columns to stack
- [PASS] Inherits container max-width; `--layout-max-width-narrow` used for standalone

#### Authoring Contract
- [PASS] Works with Universal Editor — `_video.json` present with full field model
- [WARNING] `videoDescription` field in schema not consumed in JS; autoplay option in schema not implemented
- [PASS] Composable — standalone or embedded in hero/columns
- [PASS] Structure/content/presentation decoupled
- [N/A] No Content Fragment integration for this block

#### Performance
- [PASS] YouTube/Vimeo scripts load asynchronously (scripts appended dynamically after user interaction or intersection)
- [WARNING] `_loadScript` dead code in JS file (unused function)
- [PASS] Lazy loading via IntersectionObserver when no placeholder
- [PASS] Click-to-load via placeholder prevents eager script load

#### Accessibility (WCAG 2.1)
- [PASS] Play button meets WCAG 2.5.5 minimum touch target (48px+)
- [PASS] Focus indicator: 3px solid outline with offset (WCAG 2.4.7)
- [PASS] MP4 videos support WebVTT captions track
- [PASS] `aria-label` applied to video element from title text
- [PASS] Autoplay disabled by default

**Checklist: 18/22 items passed (0 FAIL, 4 WARNING)**

---

## Remediation

**Priority 1 — High**

1. **Implement or remove `videoDescription` field.** The `videoDescription` field is defined in `_video.json` and documented in the README but is never read or used in `decorate()`. If it should serve as an accessible description for the video (e.g., applied as an `aria-describedby` or visually-hidden element), implement that. If it is not yet designed, remove the field from the schema to avoid author confusion.

2. **Resolve UE property name vs. DOM attribute mismatches.** The JS reads `[data-aue-prop="placeholder-image-alt-text"]` but the UE schema field is named `placeholderImageAlt`. Verify that AEM's Universal Editor renders the `data-aue-prop` attribute using the kebab-case of the camelCase field name (i.e., `placeholderImageAlt` → `data-aue-prop="placeholder-image-alt"`). If there is a mismatch, align the schema field names with the DOM attribute names used in JS.

**Priority 2 — Medium**

3. **Remove dead code `_loadScript`.** The function defined at line 11 is never called. Remove it to keep the file clean and avoid confusion with the `loadScript` import from `aem.js`.

4. **Resolve autoplay discrepancy.** The `_video.json` UE schema includes an "AutoPlay" option in the multiselect `classes` field, but the block explicitly disables autoplay and the code has no autoplay logic. Either:
   - Implement autoplay behavior when the `autoplay` class is present, or
   - Remove the "AutoPlay" option from the UE schema to prevent authors from selecting a non-functional option.

5. **Remove hex color fallbacks from token calls:**
   - Line 19: `var(--color-neutral-900, #000)` → `var(--color-neutral-900)`
   - Line 94: `var(--video-play-icon-color, #fff)` → `var(--video-play-icon-color)`

**Priority 3 — Low**

6. **Dynamic Media streaming.** The ticket specifies Dynamic Media streaming for hosted/DAM videos. The current implementation uses a standard HTML5 `<video>` element with a direct `<source>`. If Dynamic Media streaming (HLS via `.m3u8`) is required, the `getVideoElement` function will need to detect the URL type and use an HLS player or the `<source>` MIME type `application/x-mpegURL`. Track this as a future enhancement.
