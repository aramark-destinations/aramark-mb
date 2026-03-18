# EDS — Generic Brand & Pilot Site Helix 5 Configuration

**Ticket context:** This document covers the work done to configure the generic brand (`unbranded`) and the pilot site (`lake-powell`) within the Aramark MB EDS (Helix 5 / AEM.live) platform. It describes what was built, how each brand is wired up, and the repoless architecture that makes it all work.

---

## Platform Foundation: Repoless Helix 5

The platform runs on **Adobe Edge Delivery Services (Helix 5 / AEM.live)** using a **repoless multi-site configuration**. The key architectural decision:

- **Single shared GitHub repository** (`BlueAcornInc/aramark-mb`) — all block code, styles, scripts, and brand configs live here.
- **Each brand registers as an independent EDS site** via the `admin.hlx.page` API — no `fstab.yaml` mountpoints needed (this is the Helix 5 repoless model).
- **Each brand has its own AEM content tree** (`/content/{brand}/`) and its own preview/live URLs.
- **Path mappings** (`/content/{brand}/` → `/`) keep all brand URLs clean and consistent regardless of the AEM content structure.

This means onboarding a new brand requires no new repositories, no new deployments, and no code forks — just a brand directory in the repo, a `tokens.css` file, and three API calls to register the site.

---

## Brand 1: `unbranded` — Generic / Default Brand

### Purpose

The `unbranded` brand serves two roles:

1. **Default fallback** — loaded when no brand is detected from AEM metadata or the URL.
2. **Reference template** — a working, baseline brand that new properties are modeled from.

### What Was Done

**Repo structure (`brands/unbranded/`):**

```
brands/unbranded/
├── README.md        # Brand documentation and onboarding notes
├── tokens.css       # Intentionally empty — uses root-tokens.css as-is
└── blocks/          # Placeholder for optional block overrides (none currently)
```

**`tokens.css`** — The file exists to maintain structural consistency with all other brands, but contains no overrides. The platform's root design tokens (`styles/root-tokens.css`) are the effective values for this brand:

- `--color-primary: #eb002a` (Aramark red)
- `--color-secondary: #022035` (dark navy)
- Full grey scale, radii, spacing, typography weights — all at root defaults

**EDS Site Registration:**

| | Value |
|---|---|
| Site name | `unbranded` |
| Code repo | `BlueAcornInc/aramark-mb` |
| AEM content root | `/content/unbranded/` |
| Path mapping | `/content/unbranded/` → `/` |
| Preview URL | `https://main--unbranded--blueacorninc.aem.page` |
| Live URL | `https://main--unbranded--blueacorninc.aem.live` |

**AEM Content Tree:**

```
/content/unbranded/
├── index       # Homepage
├── metadata    # Metadata sheet — contains: brand = unbranded
├── nav
└── footer
```

The `brand: unbranded` metadata field is what triggers `scripts/site-resolver.js` to load the brand's `tokens.css` at runtime.

**Local development:**

```bash
pnpm start:brand unbranded
# → Proxies localhost to https://main--unbranded--blueacorninc.aem.page
```

---

## Brand 2: `lake-powell` — Pilot Property Site

### Purpose

Lake Powell is the **first real property brand** on the platform — the pilot site used to validate the full multi-brand workflow end-to-end: EDS registration, token-based theming, brand detection, and local development.

### What Was Done

**Repo structure (`brands/lake-powell/`):**

```
brands/lake-powell/
├── README.md        # Brand documentation, patterns, quick reference
├── tokens.css       # Brand color overrides (primary/secondary)
└── blocks/          # Placeholder for block overrides (none currently)
```

**`tokens.css`** — Overrides only the two base brand colors. All other tokens (grey scale, radii, spacing, typography, components) inherit from root defaults. The full 10-step tint/shade scales for primary and secondary recalculate automatically via `color-mix()` in `styles/fixed-tokens.css`:

```css
:root {
  --color-primary: #0066cc;    /* Lake Powell blue — overrides Aramark red */
  --color-secondary: #1a4d2e;  /* Lake Powell green — overrides dark navy */
}
```

> **Note:** These values are confirmed placeholders pending final brand color approval from the Lake Powell team.

**Auto-derived from those two overrides** (no additional work needed):

- `--color-primary-50` through `--color-primary-950` (tint/shade scale)
- `--color-secondary-50` through `--color-secondary-950`
- All semantic surface tokens and stroke weights that reference primary/secondary

**EDS Site Registration:**

| | Value |
|---|---|
| Site name | `lake-powell` |
| Code repo | `BlueAcornInc/aramark-mb` |
| AEM content root | `/content/lake-powell/` |
| Path mapping | `/content/lake-powell/` → `/` |
| Preview URL | `https://main--lake-powell--blueacorninc.aem.page` |
| Live URL | `https://main--lake-powell--blueacorninc.aem.live` |

**AEM Content Tree:**

```
/content/lake-powell/
├── index       # Homepage
├── metadata    # Metadata sheet — contains: brand = lake-powell
├── nav
└── footer
```

**Local development:**

```bash
pnpm start:brand lake-powell
# → Proxies localhost to https://main--lake-powell--blueacorninc.aem.page
```

---

## How Brand Token Loading Works (Both Brands)

This is the same mechanism for every brand — described once here for clarity.

### Load sequence

```
1. head.html loads styles/styles.css (static link)
     └─ styles.css @imports fixed-tokens.css
          └─ fixed-tokens.css @imports root-tokens.css
               → All root token defaults now available in CSS

2. scripts.js loadEager() runs (before first paint):
     a. import { getCurrentBrand } from './site-resolver.js'
     b. getCurrentBrand() reads AEM page metadata field 'brand'
        → Falls back to URL path /brands/{brand}/ in local dev
     c. loadCSS(`/brands/${brand}/tokens.css`) — injects brand overrides
        → CSS cascade: brand tokens win over root tokens (same property names)

3. body.appear class added → first paint with correct brand colors
```

### Brand detection (`scripts/site-resolver.js`)

```javascript
export function getCurrentBrand() {
  // 1. AEM metadata (production — works on custom domains)
  const metaBrand = getMetadata('brand');
  if (metaBrand) return metaBrand;

  // 2. URL path fallback (local dev only — /brands/{brand}/)
  const brandMatch = window.location.pathname.match(/^\/brands\/([^/]+)/);
  return brandMatch ? brandMatch[1] : null;
}
```

### Block resolution (both brands)

All blocks resolve through a 2-tier lookup:

```
1. /brands/{brand}/blocks/{blockname}/{blockname}.js  ← brand override (if exists)
2. /blocks/{blockname}/{blockname}.js                 ← shared root block (fallback)
```

Neither `unbranded` nor `lake-powell` currently has any block overrides — both use the full shared block library unchanged. Overrides would only be created for behavioral differences (custom analytics, brand-specific interactions), not for styling.

---

## Shared Root Design Token Defaults

Both brands inherit everything defined in `styles/root-tokens.css`. The token categories available for brand overriding:

| Category | Key Tokens | Default Values |
|---|---|---|
| Brand colors | `--color-primary`, `--color-secondary` | `#eb002a`, `#022035` |
| Grey scale | `--color-grey-50` → `--color-grey-900` | 10-step neutral scale |
| Alert colors | `--color-alerts-success/error/caution/general` | Standard semantic colors |
| Border radii | `--radius-xs` → `--radius-full` | `4px` → `999px` |
| Typography weights | `--font-weight-normal` → `--font-weight-bold` | `400`–`700` |
| Line heights | `--line-height-tight` → `--line-height-relaxed` | `1`–`1.75` |
| Layout widths | `--layout-max-width-content/narrow/media` | `1200px`, `900px`, `800px` |
| Transitions | `--transition-duration-fast/normal/slow` | `0.2s`–`0.5s` |
| Buttons | `--button-border-radius`, `--button-padding-*` | Rounded pill style |
| Inputs | `--input-border-radius`, `--input-border-color` | Square, grey border |

---

## Open Items / Known Gaps

| Item | Impact |
|---|---|
| Lake Powell token values are placeholder colors | Final brand colors need sign-off before production launch |
| Font family tokens (`--body-font-family`, `--heading-font-family`) live in `styles.css`, not in the token chain | Brands cannot override fonts via `tokens.css` without a refactor |
| `--nav-height` not in token system | Brands cannot adjust nav height via tokens |
| No test coverage for brand detection or token loading | `scripts/site-resolver.js` and `loadEager()` brand path are untested |
| UE Token Editor (App Builder integration) not yet implemented | Non-developer brand token management requires direct CSS file editing today |

---

## Files Changed / Added

| File | What It Is |
|---|---|
| `brands/unbranded/tokens.css` | Empty token file — uses root defaults |
| `brands/unbranded/README.md` | Brand documentation and template notes |
| `brands/lake-powell/tokens.css` | Lake Powell brand color overrides |
| `brands/lake-powell/README.md` | Brand documentation, lifecycle hook patterns |
| `scripts/site-resolver.js` | Brand detection + 2-tier block resolution |
| `scripts/dev-brand.js` | Brand-aware local dev server launcher |
| `styles/root-tokens.css` | Configurable base tokens (shared by all brands) |
| `styles/fixed-tokens.css` | Derived tokens via `color-mix()` (auto-recalculate) |
| `docs/BRAND-SETUP-GUIDE.md` | Step-by-step brand onboarding guide |
| `docs/MULTI-BRAND-LOCAL-DEV.md` | Local development setup documentation |
