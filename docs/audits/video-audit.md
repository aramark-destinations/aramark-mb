# Block Audit Report: video
Date: 2026-03-20

## Summary
| Category | Result |
|---|---|
| Structure | PASS |
| Pattern A Compliance | WARNING |
| CSS Token Usage | WARNING (3 violations) |
| Spec Alignment | WARNING |
| Developer Checklist | 20/26 items passed |

## Overall: GO

## Details

### Structure

| File | Expected | Present |
|---|---|---|
| `video.js` | required | YES |
| `video.css` | required | YES |
| `video.scss` | expected | YES |
| `README.md` | expected | YES |
| `ticket-details.md` | expected | YES |
| `_video.json` | expected | YES — co-located in block directory |

All required and expected files are present and co-located. The `_video.json` schema is well-defined with all authoring fields present.

**Result: PASS**

---

### Pattern A Compliance

**2a. Export signature**

```js
export async function decorate(block, options = {}) { ... }
export default (block) => decorate(block, window.Video?.hooks);
```

Named export with `options = {}` default: PASS. The `async` modifier is acceptable — the function may await analytics setup. Default export wired to `window.Video?.hooks`: PASS. PascalCase `Video` matches block name: PASS.

**2b. Lifecycle hooks and events**

```js
const ctx = { block, options };
options.onBefore?.(ctx);
block.dispatchEvent(new CustomEvent('video:before', { detail: ctx, bubbles: true }));
readVariant(block);
// ... block logic ...
options.onAfter?.(ctx);
block.dispatchEvent(new CustomEvent('video:after', { detail: ctx, bubbles: true }));
```

`ctx` object: PASS. `onBefore`/`onAfter` hooks: PASS — present in both the early-return path (no link element) and the normal completion path. Events with `bubbles: true`: PASS. `readVariant(block)` called: PASS. All six lifecycle requirements are met.

**2c. Imports**

```js
import { moveInstrumentation, readVariant } from '../../scripts/scripts.js';
```

Correct relative path. PASS. `moveInstrumentation` is used to preserve UE instrumentation attributes when the placeholder is restructured. `readVariant` is called for variant class support. Both imports are correct and used.

YouTube IFrame API and Vimeo Player SDK are loaded dynamically by creating `<script>` tags — this is the correct pattern for on-demand third-party script loading without using `loadScript` from `aem.js`.

**2d. No site-specific code**

WARNING — Two concerns:
- YouTube (`https://www.youtube.com/iframe_api`) and Vimeo (`https://player.vimeo.com/api/player.js`) CDN URLs are hard-coded strings. These are stable public endpoints and cannot reasonably be abstracted further, but they are not configurable at the brand level.
- `window.adobeDataLayer` (ACDL) is referenced directly for analytics. The block includes a guard (`if (!window.adobeDataLayer)`) with a `console.warn`, so it degrades gracefully when ACDL is absent. This is an acceptable platform-level dependency but is stack-specific.

**Result: WARNING** — Hard-coded CDN URLs for YouTube/Vimeo APIs; direct `window.adobeDataLayer` dependency in base block. Both are acceptable for this block's function but represent coupling that cannot be overridden at the brand level.

---

### CSS Token Audit

Scanning `video.scss` (and `video.css` — both contain the same rules; violations counted once):

**Violations:**

| Line (scss) | Value | Issue | Suggested Fix |
|---|---|---|---|
| 68 | `background: var(--video-play-bg, rgb(0 0 0 / 70%))` | Raw `rgb()` value as `var()` fallback — if `--video-play-bg` is not defined, a hard-coded color is applied | Remove fallback or use `transparent`; require `--video-play-bg` to be defined in brand tokens |
| 71 | `transition: background 0.3s ease, transform 0.2s ease` | `0.3s` and `0.2s` are hard-coded transition durations | `transition: background var(--transition-duration-base, 0.3s) ease, transform var(--transition-duration-fast, 0.2s) ease` |
| 75 | `background: var(--video-play-bg-hover, rgb(0 0 0 / 90%))` | Raw `rgb()` value as `var()` fallback — same pattern as line 68 | Remove fallback or use `transparent`; require `--video-play-bg-hover` in brand tokens |

Additional note: `min-height: 400px` on the loading reservation rule (`.video[data-embed-loaded='false']:not(.placeholder)`) — hard-coded pixel value that should use a token.

| Line (scss) | Value | Issue | Suggested Fix |
|---|---|---|---|
| 19 | `min-height: 400px` | Hard-coded pixel spacing for loading reservation | `min-height: var(--video-loading-min-height, 400px)` |

Exemptions applied:
- `border-radius: 50%` — percentage value, exempt.
- `outline: 2px solid` and `outline-offset: 2px` — `1px`-class border values used for focus indicator, exempt.
- `border-top-width`, `border-bottom-width`, `border-left-width` pixel values on `::before` play-button triangle — structural CSS triangle geometry intrinsic to the rendering technique, not brand spacing tokens. Not flagged.
- `left: calc(50% + 2px)` — `calc()` expression, exempt.
- `0` and `0px` values — exempt.

**Result: WARNING (3 distinct violations — rgb fallbacks ×2, transition durations ×1; plus 1 additional min-height violation = 4 total)** — at the FAIL boundary; remediation recommended before next release.

---

### Spec Alignment

Source of truth: `ticket-details.md` and README.

**Use cases**

| Use Case | Implemented | Notes |
|---|---|---|
| DAM-hosted MP4 via HTML5 player | PASS | `getVideoElement()` creates `<video controls preload="metadata">` |
| YouTube embed | PASS | `embedYoutube()` with IFrame API and analytics |
| Vimeo embed | PASS | `embedVimeo()` with Player SDK and analytics |
| Auto-detect video type from URL | PASS | `isYoutube` / `isVimeo` URL checks in `loadVideoEmbed()` |
| Poster image override | PASS | `picture` element extracted; `img.src` used as poster |
| Placeholder image alt text | PASS | Read from `data-aue-prop="placeholder-image-alt-text"` and applied to `img.alt` |
| Full-width video | PASS | `fullWidth` boolean field; `full-width` class applied via `block.classList.add` |
| Captions track (WebVTT, MP4 only) | PASS | `block.dataset.captions` read; `<track kind="captions">` appended |
| Responsive scaling (maintains aspect ratio) | PASS | `aspect-ratio: var(--aspect-ratio-video)` and percentage-based iframe layout |
| Max width ~920px standalone | PASS | `max-width: var(--layout-max-width-narrow)` |
| Lazy loading | PASS | IntersectionObserver when no placeholder; click-to-load when placeholder present |
| Analytics — play/pause/complete | PASS | `pushVideoEvent` to `window.adobeDataLayer` for all three events |
| Analytics — progress milestones 25/50/75% | PASS | Tracked for MP4, YouTube (via interval), and Vimeo (via timeupdate) |
| Analytics — fullscreen events | PASS | `fullscreenchange` and `webkitfullscreenchange` tracked for MP4 |

**UE schema vs. ticket field alignment**

| Ticket Field | `_video.json` field | Consumed in JS |
|---|---|---|
| Video Source (DAM/YouTube URL) | `uri` — aem-content, required | PASS — `block.querySelector('a')` reads rendered link |
| Video Type (auto-select, disabled) | Not in schema | PASS — auto-detected from URL; no schema field needed |
| Poster Image Override | `placeholderImage` — reference | PASS — `block.querySelector('picture')` reads rendered picture element |
| Placeholder Image Alt Text | `placeholderImageAlt` — text | PASS — read from DOM element with `data-aue-prop="placeholder-image-alt-text"` |
| Video Description (NEW per ticket) | `videoDescription` — text | WARNING — field exists in schema and was added to ticket, but is never read or rendered in `decorate()` |
| Full-width Video | `fullWidth` — boolean | PASS — read from `data-aue-prop="full-width"` DOM element |
| Captions Track | `captionsTrack` — reference | PASS — `block.dataset.captions` |
| Options / AutoPlay variant | `classes` — multiselect with "autoplay" value | WARNING — UE schema presents "AutoPlay" as an author option, but `video.js` does not implement autoplay behavior. The README explicitly states "NO AUTOPLAY". Authors selecting this option will have no effect. |

**Result: WARNING** — `videoDescription` defined in schema but never consumed or rendered; "AutoPlay" option offered in UE schema but not implemented in block logic.

---

### Developer Checklist

#### General Block Requirements
- [PASS] Directory follows `/blocks/video/` convention
- [PASS] `video.js` and `video.css` present
- [PASS] BEM CSS classes (`.video`, `.video-placeholder`, `.video-placeholder-play`, `.video-error`)
- [PASS] README documents features, authoring fields, tokens, accessibility, and customization
- [WARNING] Hard-coded CDN URLs (YouTube/Vimeo) — acceptable for functionality but not brand-overridable
- [PASS] Brand differentiation via custom properties (`--video-play-bg`, `--video-play-bg-hover`, `--video-play-icon-color`)
- [PASS] Root+Brand cascade supported

#### Responsive Design
- [PASS] Mobile-first breakpoints at 768px and 1200px
- [PASS] Fluid content — aspect ratio maintained via CSS `aspect-ratio` and percentage layout
- [N/A] No column stacking
- [PASS] Max-width via `--layout-max-width-narrow` token; `full-width` variant removes constraint

#### Authoring Contract
- [PASS] UE in-context editing — `_video.json` present with all authoring fields
- [FAIL] `videoDescription` field in schema is never consumed in JS
- [FAIL] "AutoPlay" option in UE schema has no corresponding implementation in block logic
- [PASS] Composable — standalone or embedded in hero/columns
- [PASS] Structure/content/presentation decoupled
- [N/A] CF integration not required for this block

#### Performance
- [PASS] YouTube/Vimeo APIs loaded asynchronously on demand (after user interaction or intersection)
- [PASS] Lazy loading via IntersectionObserver when no placeholder present
- [PASS] Click-to-load placeholder prevents eager third-party script execution
- [PASS] `loading="lazy"` on iframes
- [PASS] Autoplay disabled — no eager media loading

#### Accessibility
- [PASS] Play button meets WCAG 2.5.5 — 48px touch target on mobile, scaling to 64px tablet, 80px desktop
- [PASS] Focus indicator — `3px solid var(--focus-ring-color)` with offset (WCAG 2.4.7)
- [PASS] MP4 videos support WebVTT captions track (`<track kind="captions">`)
- [PASS] `aria-label` applied from video title text when available
- [PASS] Autoplay disabled by default (WCAG 1.4.2 audio control)
- [PASS] Semantic HTML — `<button type="button">`, `<video controls>`, `<iframe>` with `title`

**Checklist: 20/26 applicable items** (2 FAIL on unimplemented schema fields; 4 WARNING-level items)

---

## Remediation

### Priority 1 — Spec Alignment (WARNING)

1. **Implement or remove `videoDescription` field.** The `videoDescription` field is in `_video.json` and the ticket, but `decorate()` never reads or renders it. Options:
   - Implement it as a visually-hidden `<p>` element providing accessible description (apply as `aria-describedby` to the video or iframe), OR
   - Remove the field from `_video.json` and update the README to document the decision.

2. **Resolve "AutoPlay" schema option vs. implementation gap.** The UE schema offers "AutoPlay" as a multiselect option, but the block code has no autoplay logic and the README explicitly states autoplay is disabled. Options:
   - Implement conditional autoplay when the `autoplay` class is present (checking for `block.classList.contains('autoplay')`), OR
   - Remove the "AutoPlay" option from the `_video.json` schema to prevent authors from selecting a non-functional option.

### Priority 2 — CSS Tokens (WARNING)

3. **Replace raw `rgb()` fallbacks in token declarations** (`.scss` / `.css` lines 68 and 75):
   - `var(--video-play-bg, rgb(0 0 0 / 70%))` → `var(--video-play-bg)` (require token to be defined in brand file)
   - `var(--video-play-bg-hover, rgb(0 0 0 / 90%))` → `var(--video-play-bg-hover)`

4. **Replace hard-coded transition durations** (`.scss` / `.css` line 71):
   - `transition: background 0.3s ease, transform 0.2s ease` → `transition: background var(--transition-duration-base, 0.3s) ease, transform var(--transition-duration-fast, 0.2s) ease`

5. **Replace `min-height: 400px`** (`.scss` line 19 / `.css` line 18):
   - `min-height: 400px` → `min-height: var(--video-loading-min-height, 400px)`

### Priority 3 — Pattern A (WARNING, low severity)

6. **Document CDN URL constants.** The YouTube and Vimeo API URLs are currently inline string literals. Moving them to named constants at the top of the file (e.g., `const YOUTUBE_API_URL = 'https://www.youtube.com/iframe_api'`) would improve readability and is consistent with the `PROGRESS_CHECK_INTERVAL` constant pattern already used.

7. **Document `window.adobeDataLayer` dependency** in the README. The `pushVideoEvent` function already gracefully handles the absent case with a `console.warn`. Add a note to the README's "Dependencies" or "See Also" section listing ACDL as a required platform integration for analytics to function.
