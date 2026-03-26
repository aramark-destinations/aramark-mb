# Block Audit Summary
Date: 2026-03-20
Blocks audited: 28
Last validation: 2026-03-20 (full re-audit — all 28 blocks read from source)

> **Changes since prior audit:** accordion and breadcrumbs downgraded to NO-GO (CSS FAIL — new violations found). banner, cards, section, table upgraded to GO (violations fixed or corrected). fragment downgraded to NO-GO (Pattern A FAIL — `bubbles: true` absent, `readVariant` not called). navigation-group and navigation-item downgraded to NO-GO (Pattern A FAIL — `readVariant` not called, prior audit missed this). header, image, search, footer, form promoted to GO. quote CSS corrected to PASS (120% is in `:root`, prior audit incorrectly flagged it).

---

## Overall Results

| Block | Structure | Pattern A | CSS Tokens | Spec | Checklist | Overall |
|---|---|---|---|---|---|---|
| accordion | PASS | PASS | FAIL (5) | WARNING | 17/21 | **NO-GO** |
| banner | WARNING | PASS | PASS (0) | WARNING | 13/19 | **GO** |
| breadcrumbs | PASS | PASS | PASS (0) | WARNING | 15/21 | **GO** |
| button | WARNING | PASS | FAIL (9) | WARNING | 14/21 | **NO-GO** |
| cards | WARNING | WARNING | PASS (0) | WARNING | 17/22 | **GO** |
| carousel | WARNING | PASS | WARNING (2) | WARNING | 17/21 | **GO** |
| columns | PASS | PASS | PASS (0) | PASS | 19/21 | **GO** |
| embed | WARNING | WARNING | WARNING (2) | WARNING | 17/20 | **GO** |
| footer | WARNING | WARNING | PASS (0) | WARNING | 14/18 | **GO** |
| form | WARNING | PASS | WARNING (2) | WARNING | 15/19 | **GO** |
| fragment | WARNING | **FAIL** | PASS (0) | WARNING | 13/18 | **NO-GO** |
| header | WARNING | WARNING | WARNING (3) | WARNING | 14/20 | **GO** |
| hero | WARNING | WARNING | WARNING (1) | WARNING | 16/21 | **GO** |
| image | WARNING | PASS | PASS (0) | WARNING | 17/21 | **GO** |
| modal | WARNING | **FAIL** | PASS (0) | WARNING | 16/22 | **NO-GO** |
| navigation | WARNING | **FAIL** | FAIL (5) | WARNING | 17/23 | **NO-GO** |
| navigation-group | WARNING | **FAIL** | WARNING (1) | WARNING | 18/25 | **NO-GO** |
| navigation-item | WARNING | **FAIL** | PASS (0) | WARNING | 18/24 | **NO-GO** |
| page | WARNING | WARNING | PASS (0) | WARNING | 14/20 | **GO** |
| quote | WARNING | WARNING | PASS (0) | WARNING | 19/23 | **GO** |
| search | WARNING | WARNING | PASS (0) | WARNING | 19/23 | **GO** |
| section | WARNING | PASS | PASS (0) | WARNING | 19/23 | **GO** |
| table | WARNING | PASS | WARNING (2) | WARNING | 20/23 | **GO** |
| tabs | WARNING | PASS | FAIL (4) | WARNING | 17/23 | **NO-GO** |
| text | WARNING | WARNING | PASS (0) | WARNING | 16/19 | **GO** |
| title | WARNING | PASS | PASS (0) | PASS | 19/21 | **GO** |
| ugc-gallery | **FAIL** | WARNING | WARNING (1) | WARNING | 11/21 | **NO-GO** |
| video | PASS | WARNING | WARNING (3) | WARNING | 20/26 | **GO** |

**GO: 19 / 28 — NO-GO: 9 / 28**

---

## Aggregated Category Counts

| Category | PASS | WARNING | FAIL |
|---|---|---|---|
| Structure | 4 (accordion, breadcrumbs, columns, video) | 23 | 1 (ugc-gallery) |
| Pattern A | 12 | 11 | 5 (fragment, modal†, navigation†, navigation-group, navigation-item) |
| CSS Tokens | 15 | 9 | 4 (accordion, button, navigation, tabs) |
| Spec Alignment | 2 (columns, title) | 26 | 0 |

† modal and navigation Pattern A FAILs are intentional architectural deviations (utility block and auto-block patterns). Their NO-GO status reflects the audit rubric; these are not regressions.

---

## GO Blocks — Remediation Items

| Block | Key items to address |
|---|---|
| **banner** | UE schema missing `mediaImage`, `mediaImageAlt`, `ctaLink`, `ctaLabel` fields on `banner-item`; populate `ticket-details.md` |
| **cards** | Analytics fires unconditionally — add consent gate; `ticket-details.md` empty |
| **carousel** | `--carousel-slide-margin` reassigned outside `:root` (1 violation); no CTA fields in `carousel-item` UE schema; `createOptimizedPicture` not called on slide images (LCP risk) |
| **columns** | None blocking. Consider documenting the image optimization boundary in README |
| **embed** | `top: 4px` / `left: 7px` pixel offsets on play button pseudo-element (2 violations); inline iframe `style` attributes bypass token system |
| **footer** | `readVariant` not imported or called; no `_footer.json` UE schema; `ticket-details.md` empty |
| **form** | Toggle switch uses `52px` width, `28px` height, `28px` border-radius (raw pixel values); `ticket-details.md` empty |
| **header** | 3 CSS violations (`22px` hamburger height, `3px` icon offsets, `200px` dropdown width); two scroll states absent; mega menu is standard dropdowns only |
| **hero** | `z-index: -1` on `.hero picture` (1 violation); `imageAlt` field in UE schema but application in JS unverified; `ticket-details.md` empty |
| **image** | `getAltFromDam` boolean in schema but not gated in JS; `_image.json` not co-located (lives in `/models/`) |
| **page** | `bubbles: true` missing on both `page:before` and `page:after` events; `_page.json` not co-located |
| **quote** | `bubbles: true` missing on both `quote:before` and `quote:after` events; no `ticket-details.md` |
| **search** | `fetchPlaceholders` imported from non-canonical `../../scripts/placeholders.js`; no `ticket-details.md`; empty alt text on result images |
| **section** | `backgroundAlt` UE schema field defined but never consumed in JS; README documents only 2 of 10 authoring fields |
| **table** | `font-weight: 600` (line 123) and `margin-top: 0.25em` (line 141) not tokenized; caption field absent from UE schema; `ticket-details.md` missing |
| **text** | `readVariant` not imported or called; no `ticket-details.md` |
| **title** | `_title.json` lives in `/models/` rather than block directory |
| **video** | `rgb()` fallbacks in `var()` declarations, `0.3s`/`0.2s` transition durations, `min-height: 400px` raw (3–4 violations); `videoDescription` field in schema but never consumed in JS; autoplay not implemented |

---

## NO-GO Blocks — Prioritized Remediation

### Priority 1 — CSS FAIL (must tokenize before GO)

| Block | Violations | Top issues |
|---|---|---|
| **button** | 9 | `font-weight: 600`, `0.2s` transition, 7 hex fallbacks (`#000`, `#333`, `#fff`, `#e5e5e5`) in `color-black`/`color-white` variant rules; `_button.json` entirely absent |
| **accordion** | 5 | `margin: 8px` on subtitle, `transition: 0.2s` ×2, `font-weight: 300`, `top: 25px` on icon pseudo-element |
| **navigation** | 5 | `z-index: 1` ×2, `z-index: 0`, redundant `1px`/`22px` fallbacks outside `:root`; also Pattern A FAIL (auto-block) |
| **tabs** | 4 | `#dadada` hex fallback, `padding: 1rem` on mobile buttons, `0.3s` ×2 and `0.2s` transition durations; 6 block-level config fields missing from `_tabs.json` |

### Priority 2 — Pattern A FAIL (blocking for non-intentional blocks)

| Block | Issue |
|---|---|
| **fragment** | `bubbles: true` absent on both `fragment:before` and `fragment:after` events; `readVariant` not imported or called |
| **navigation-group** | `readVariant` not imported or called; `_navigation-group.json` and `ticket-details.md` absent |
| **navigation-item** | `readVariant` not imported or called; `_navigation-item.json` and `ticket-details.md` absent; `title` attribute used instead of `aria-describedby` |

### Priority 3 — Structural / schema gaps

| Block | Issue |
|---|---|
| **ugc-gallery** | `README.md`, `ticket-details.md`, and `_ugc-gallery.json` all absent; `readVariant` not called; `min-height: 400px` not tokenized; no accessible fallback or `role="region"` |
| **modal** | No `decorate()` function (intentional utility block — document deviation in README); `link`/`linkText` fields in `_modal.json` never consumed; `ticket-details.md` missing |
| **navigation** | Auto-block pattern (intentional) — document deviation in README; fix 5 CSS violations; add `ticket-details.md`; document scroll-state dependency |

---

## Cross-cutting Issues (affect multiple blocks)

1. **Missing or empty `ticket-details.md`** — 20+ of 28 blocks lack a committed or populated ADO requirements file. Most committed files are zero bytes.

2. **`readVariant` not called** — affects footer, fragment, navigation-group, navigation-item, text. Required by Pattern A even when no variants are currently defined.

3. **`bubbles: true` missing on lifecycle events** — affects fragment, page, quote. All other blocks confirmed correct.

4. **Hard-coded hex fallbacks in `var()` calls** — affects accordion, breadcrumbs, button, navigation, video. Pattern: `var(--token, #hexvalue)` outside `:root`. The fallback hex bypasses the token cascade and should be removed.

5. **UE schema not co-located** — button (`_button.json` absent entirely), image, page, section, title all rely on `/models/` fallback. Confirm whether OOTB models are the intended authoring contract or block-specific schemas are still needed.
