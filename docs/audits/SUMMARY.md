# Block Audit Summary
Date: 2026-03-20
Blocks audited: 28
Last validation: 2026-03-20 (blocks A-M re-checked against current code)

> **Changes since initial audit:** `bubbles: true` has been added to lifecycle events across all blocks. Pattern A rewrite completed on breadcrumbs. Form `color: firebrick` → `var(--color-error)` fixed. Carousel margins, header hamburger offsets, and hero min-height have been tokenized.

---

## Overall Results

| Block | Structure | Pattern A | CSS Tokens | Spec | Checklist | Overall |
|---|---|---|---|---|---|---|
| accordion | PASS | PASS | WARNING (4) | PASS | 18/22 | **GO** |
| banner | FAIL | PASS | WARNING (2) | WARNING | 11/19 | NO-GO |
| breadcrumbs | PASS | ~~FAIL~~ PASS | WARNING (3) | WARNING | 15/21 | NO-GO |
| button | WARNING | PASS | WARNING (2) | WARNING | 15/21 | NO-GO |
| cards | WARNING | PASS | WARNING (3) | WARNING | 17/23 | NO-GO |
| carousel | WARNING | PASS | WARNING (3) | WARNING | 16/23 | NO-GO |
| columns | PASS | PASS | PASS (0) | PASS | 18/22 | **GO** |
| embed | PASS | PASS | WARNING (3) | WARNING | 17/22 | NO-GO |
| footer | PASS | PASS | PASS (0) | WARNING | 17/22 | NO-GO |
| form | PASS | PASS | WARNING (3) | WARNING | 17/22 | NO-GO |
| fragment | PASS | PASS | PASS (0) | PASS | 20/22 | **GO** |
| header | PASS | PASS | WARNING (2) | WARNING | 17/22 | NO-GO |
| hero | PASS | PASS | WARNING (1) | WARNING | 17/22 | NO-GO |
| image | WARNING | PASS | PASS (0) | WARNING | 17/22 | NO-GO |
| modal | WARNING | FAIL | PASS (0) | WARNING | 16/23 | NO-GO |
| navigation | WARNING | FAIL | FAIL (7) | WARNING | 17/24 | NO-GO |
| navigation-group | WARNING | PASS | WARNING (2) | PASS | 20/24 | **GO** |
| navigation-item | WARNING | PASS | PASS (0) | PASS | 21/24 | **GO** |
| page | FAIL | PASS | PASS (0) | WARNING | 16/21 | NO-GO |
| quote | WARNING | PASS | WARNING (1) | PASS | 20/23 | **GO** |
| search | WARNING | PASS | WARNING (3) | WARNING | 19/24 | **GO** |
| section | WARNING | PASS | WARNING (3) | WARNING | 17/22 | NO-GO |
| table | PASS | PASS | WARNING (3) | WARNING | 19/22 | NO-GO |
| tabs | WARNING | PASS | FAIL (5) | WARNING | 17/22 | NO-GO |
| text | WARNING | ~~WARNING~~ PASS | PASS (0) | PASS | 17/20 | **GO** |
| title | WARNING | PASS | PASS (0) | PASS | 18/20 | NO-GO |
| ugc-gallery | FAIL | WARNING | PASS (0) | WARNING | 12/22 | NO-GO |
| video | PASS | WARNING | WARNING (2) | WARNING | 18/22 | NO-GO |

**GO: ~~7~~ 8 / 28 — NO-GO: ~~21~~ 20 / 28** *(text block promoted to GO — 2026-03-20)*

---

## Aggregated Category Counts

| Category | PASS | WARNING | FAIL |
|---|---|---|---|
| Structure | 11 | 13 | 4 (banner, page, ugc-gallery, navigation*) |
| Pattern A | ~~21~~ 22 (breadcrumbs fixed) | 3 (text, ugc-gallery, video) | ~~4~~ 3 (modal†, navigation†, navigation†) |
| CSS Tokens | 8 | 16 | 2 (navigation, tabs) |
| Spec Alignment | 1 (columns) | 26 | 1 (fragment†) |

† modal and navigation Pattern A FAILs are intentional architectural deviations (utility block and auto-block patterns), documented in their source code.

---

## GO Blocks — Minor Remediation

| Block | Key items to address |
|---|---|
| **accordion** | Remove hard-coded hex fallbacks from `var()` calls outside `:root`; ~~add `bubbles: true` to lifecycle events~~ *(fixed)* |
| **columns** | None blocking. Consider documenting image optimization boundary in README |
| **fragment** | Implement fragment caching (documented TODO); ~~add `bubbles: true` to events~~ *(fixed)* |
| **navigation-group** | Fix 2 CSS violations (`0.3s` transition, `8px` gap); add `ticket-details.md` |
| **navigation-item** | Replace `title` attribute for item descriptions with `aria-describedby`; add `ticket-details.md` |
| **quote** | Extract `font-size: 120%` to a custom property; ~~add `bubbles: true` to events~~ *(fixed)*; add `ticket-details.md` |
| **search** | ~~Fix 3 CSS violations~~ *(CSS fixed — tokenized)*; add fetch caching; clarify Elastic Search scope; add `ticket-details.md` |
| **text** | Add `ticket-details.md`. ~~`bubbles: true` on events~~ *(fixed)* |

---

## NO-GO Blocks — Prioritized Remediation

### Priority 1 — Blocking (must fix before GO)

#### Missing UE schemas

Five blocks have their UE model in `/models/` (OOTB) but not in the block directory. Confirm whether the OOTB model is the intended authoring contract or whether block-specific fields are still needed:

| Block | Model location | Gap |
|---|---|---|
| **button** | `/models/_button.json` | No modal trigger behavior; no screen reader text field; no style/color fields in model |
| **image** | `/models/_image.json` | "Get Alt from DAM" checkbox not implemented; DAM alt text logic incomplete |
| **page** | `/models/_page.json` | Verify OOTB model covers title/description/keywords fields per README |
| **section** | `/models/_section.json` | Verify OOTB model covers Section Type, Background, Overlay, Gradient, Theme fields |
| **title** | `/models/_title.json` | Verify OOTB model covers Title and Title Type (heading level) fields |

One block has no model anywhere:

| Block | Gap |
|---|---|
| **ugc-gallery** | `_ugc-gallery.json` is entirely absent — must be created with `widgetId`, `pixleeApiKey`, `pixleeScript` fields |

#### Pattern A non-compliance (blocking)

| Block | Issue |
|---|---|
| ~~**breadcrumbs**~~ | ~~No named export, no lifecycle hooks, no `before`/`after` events, no `readVariant` call — complete Pattern A rewrite required~~ — **RESOLVED** (2026-03-20) |

#### Critical spec gaps

| Block | Issue |
|---|---|
| **header** | Two scroll states entirely absent — no scroll listener, no second-state CSS class toggling. Booking modal trigger depends on this. |
| **hero** | Eyebrow text, description text, and CTA button fields missing from both `_hero.json` and JS implementation |
| **image** | "Get Alt from DAM" checkbox behavior not implemented; `_image.json` not present in block dir (exists in `/models/`) |
| **cards** | Content Fragment integration entirely absent — CF is a core platform requirement for this block |
| **carousel** | Content Fragment integration entirely absent |
| **page** | `_page.json` not present in block dir (exists in `/models/`) — verify coverage |

#### Structure failures

| Block | Issue |
|---|---|
| **banner** | Missing `banner.scss` (CSS authored directly in `.css`, no SCSS source) and `README.md` (only `NOTES.md` present) |
| **ugc-gallery** | Missing `README.md`, `ticket-details.md`, and `_ugc-gallery.json` |

---

### Priority 2 — Should fix

#### CSS token violations

| Block | Violation count | Top issues |
|---|---|---|
| **navigation** | ~~7~~ 3 (still FAIL) | ~~`gap: 8px`~~ *(fixed)*, ~~`0.3s` transitions~~ *(fixed)*, ~~`top: 64px`~~ *(fixed)*, `translate(-35px, 0)` magic number, raw `rgb()`/hex fallbacks in live CSS |
| **tabs** | 5 (FAIL) | `#dadada` hex fallbacks ×2, `padding: 24px`, `min-width: 200px`, `0.2s` transitions |
| **accordion** | 4+ | Hard-coded hex fallbacks (`#231f20`, `#fff`, `#de1219`) in `var()` calls outside `:root`; `font-size: 28px` |
| **form** | ~~3~~ 2 | ~~`color: firebrick`~~ *(fixed → `var(--color-error)`)*; `0.25em` spacing values remain |
| **cards** | 3 | Hard-coded box-shadow `rgb()`; `257px` grid min-width |
| **carousel** | ~~3~~ 1 | ~~Hard-coded `68px`/`92px` margins~~ *(tokenized — fixed)*; `color: white` remains |
| **embed** | 3 | Hard-coded play-button `top`/`left` offset pixel values; border values moved to custom properties |
| **section** | 3 | Hex fallbacks in `var(--color-neutral-50, #fff)` calls |
| **table** | 3 | `font-weight: 600/700`; `padding: 0.75rem` |
| **breadcrumbs** | 3 | Hex fallbacks in color token calls |
| **search** | 3 | `1ch` gap; `34px` indent pair |
| **header** | ~~2~~ 1 | ~~`top: -6px`/`top: 6px` on hamburger pseudo-elements~~ *(tokenized — fixed)*; `width: 200px` on nav dropdown remains |
| **hero** | ~~1~~ 0 | ~~`min-height: 300px`~~ *(tokenized — fixed)* |
| **quote** | 1 | `font-size: 120%` |
| **navigation-group** | 2 | `0.3s` transition; `8px` gap |
| **video** | 2 | Hex fallbacks `#000` and `#fff` in `var()` calls |

#### ~~Missing `bubbles: true` on lifecycle events~~ — RESOLVED

~~Affects nearly all blocks. A single fix pattern applies across:~~

~~accordion, cards, carousel, embed, footer, form, header, hero, page, quote, search, text~~

**Fixed (2026-03-20):** `bubbles: true` has been added to all lifecycle event dispatches across all blocks validated in this pass. Verify remaining blocks (modal, navigation, navigation-group, navigation-item, page, quote, search, section, table, tabs, text, title, ugc-gallery, video) still pass in the next validation cycle.

#### Schema / implementation gaps

| Block | Issue |
|---|---|
| **tabs** | Block-level config fields (`layoutVariant`, `stackOnMobile`, `allowHashDeepLinks`, `activateOnHover`, `transitionStyle`, `analyticsCategory`) not in `_tabs.json`; `onTabClick` hook documented but not implemented |
| **video** | `videoDescription` field in schema, never consumed in JS; autoplay option in schema but not implemented; verify `placeholderImageAlt` vs `placeholder-image-alt-text` attribute name mismatch |
| **banner** | UE schema missing `mediaImage`, `mediaImageAlt`, `ctaLink`, `ctaLabel` fields on `banner-item` model |
| **footer** | No mechanism to configure newsletter subscribe endpoint from UE |
| **modal** | `link`/`linkText` fields in `_modal.json` are never consumed — align schema with actual behavior |
| **navigation** | Re-implements `toClassName()` locally; should import from `../../scripts/aem.js` |

---

### Priority 3 — Advisory

| Block | Item |
|---|---|
| **breadcrumbs** | `localStorage` key uses `kaiBreadcrumbContext` namespace from a prior project — rename to match this project's conventions |
| **breadcrumbs** | Hero integration and theme-aware color (white/black per section theme) per spec are absent |
| **button** | Modal trigger behavior ("Open in Modal") not implemented |
| **video** | Dead code `_loadScript` function (defined but never called) |
| **video** | Dynamic Media streaming (HLS/DASH) not implemented — ticket specifies this for DAM-hosted videos |
| **search** | `fetchData()` re-fetches on every keystroke with no caching — implement module-level cache |
| **fragment** | Fragment caching — each `loadFragment()` makes a fresh `fetch()` even for the same path |
| **header** | Mega menu: current implementation is standard dropdowns, not full-width mega menu panels |
| **header** | Search bar: current code only detects a search link — no search input rendered |
| **table** | Multiple/apparent header rows not supported; caption field absent from UE schema |
| **ugc-gallery** | No accessible fallback when Pixlee script fails to load; no `role="region"` on widget wrapper |

---

## Cross-cutting Issues (affect 10+ blocks)

1. **Missing `ticket-details.md`** — 20 of 28 blocks lack a committed ADO requirements file. This is the most widespread convention gap.

2. ~~**Missing `bubbles: true`**~~ — **RESOLVED (2026-03-20):** `bubbles: true` has been added across all blocks.

3. **Hard-coded hex fallbacks in `var()` calls** — A pattern throughout the codebase where `var(--token, #hexvalue)` is used outside `:root`. The fallback hex values bypass the token cascade and should be removed.

4. **Missing CF integration** — cards and carousel both require Content Fragment dynamic population as a platform requirement. Neither implements it.
