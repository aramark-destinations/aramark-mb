# Open To-Do Items

Single source of truth for all open work items across the platform.

**Last updated:** 2026-03-20

For per-block audit details, see [`docs/audits/SUMMARY.md`](../audits/SUMMARY.md) and individual block audit files in `docs/audits/`.

---

## 1. Critical / Production Blockers

These items block a production-quality launch and should be prioritized above all other work.

### Token System Gaps

- **`--nav-height` not in design token system** — defined as `64px` directly in `styles/styles.css`. Brands cannot override nav height via `tokens.css`. Move to `root-tokens.css`. _(ARCHITECTURE-TODO #4, BLOCK-TODOS General)_
- **Font family and responsive font sizes not in token system** — `--body-font-family`, `--heading-font-family`, and responsive heading sizes live in `styles/styles.css`, not in the token chain. Brands cannot override fonts via `tokens.css`. _(ARCHITECTURE-TODO #5, BLOCK-TODOS General)_
- **`lazy-styles.css` is empty** — `styles/lazy-styles.css` is loaded in `loadLazy()` but contains only a placeholder comment, adding a wasted network request. Either populate it with below-the-fold styles or remove the `loadCSS()` call from `scripts.js`. _(ARCHITECTURE-TODO #6, BLOCK-TODOS General)_
- **Migrate typography & component tokens out of `styles/styles.scss`** — The `:root` block in `styles/styles.scss` contains typography, component, and legacy alias tokens that should live in the token chain, not in `styles.scss`. Plan: move brand-configurable tokens (font families, font sizes, line heights, letter spacings, nav height, and legacy `--background-color` / `--link-color` etc. aliases) to `root-tokens.scss`; move derived/constant tokens (font-weight aliases, eyebrow / list / link / input / details / testimonial derived tokens, `@font-face` fallbacks, and the `@media (width >= 900px)` `:root` overrides) to `fixed-tokens.scss`. After migration `styles.scss` should contain only page-level layout rules (`body`, `header`, `main`, sections). _(Token System — styles.scss cleanup)_

### Testing (Zero Coverage)

- **No test files exist** — Jest and Playwright are installed and configured in `package.json` but no test files exist anywhere. `pnpm test` has nothing to run. Priority candidates: `scripts/site-resolver.js` (brand detection logic), block `decorate()` functions, E2E smoke tests for critical pages. _(ARCHITECTURE-TODO #15)_

---

## 2. Block Remediation

Current audit state: **7 GO, 21 NO-GO** (see [`docs/audits/SUMMARY.md`](../audits/SUMMARY.md)).

### Cross-Cutting Issues (Affect 10+ Blocks)

These should be applied as a sweep across all blocks during remediation:

| Issue                                       | Scope           | Impact                                              |
| ------------------------------------------- | --------------- | --------------------------------------------------- |
| Missing `ticket-details.md`                 | 20 of 28 blocks | Convention not followed                             |
| Missing `bubbles: true` on lifecycle events | 12+ blocks      | Event delegation broken for parent-level extensions |
| Hard-coded hex fallbacks in `var()`         | 14+ blocks      | Token cascade bypassed (brand overrides ignored)    |
| Content Fragment integration absent         | Cards, Carousel | Core platform requirement unmet                     |

### Priority 1 — Blocking (NO-GO, Major Work Required)

Full details in individual audit files under `docs/audits/`.

- **Banner** — Missing `README.md`; incomplete UE schema (`mediaImage`, `ctaLink`, `ctaLabel` fields absent); no `prefers-reduced-motion`; no pause-on-hover; dismiss logic scoped incorrectly
- **Breadcrumbs** — Full Pattern A rewrite required: no lifecycle hooks, no before/after events, no `readVariant` call; `localStorage` key uses wrong namespace (`kaiBreadcrumbContext`)
- **Button** — Missing UE schema in block dir; modal trigger behavior not implemented; screen reader text field absent
- **Cards** — Content Fragment integration entirely absent; no UE schema in block dir; CSS violations
- **Carousel** — Content Fragment integration entirely absent; no UE schema; CSS violations; no `prefers-reduced-motion`
- **Header** — Scroll states not implemented; mega menu not implemented; search bar not rendered; booking modal trigger depends on scroll state
- **Hero** — Eyebrow text and description text fields absent from both `_hero.json` and JS; breadcrumbs integration not implemented
- **Image** — DAM alt text auto-populate (`imageAltFromDam` checkbox) not implemented; Dynamic Media integration absent; UE schema not in block dir
- **UGC Gallery** — Missing `README.md`, `ticket-details.md`, and entire UE model (`_ugc-gallery.json`)

### Priority 2 — Should Fix

- **Navigation** — 7 CSS token violations; locally re-implements `toClassName()` (should import from `scripts/aem.js`)
- **Tabs** — 5 CSS token violations; schema missing block-level config fields; `onTabClick` hook documented but not implemented
- **Video** — `videoDescription` field in schema never consumed; autoplay not implemented; dead `_loadScript` function; attribute name mismatch (`placeholderImageAlt` vs `placeholder-image-alt-text`)
- **Modal** — `link`/`linkText` fields in `_modal.json` never consumed (schema/implementation mismatch)
- **Table** — Missing caption field in UE schema; multiple/apparent header rows not supported; CSS token violations
- **Footer** — No UE mechanism to configure newsletter subscribe endpoint
- **Form** — Hard-coded `color: firebrick` for errors (should use `var(--color-error)`); magic `0.25em` spacing values
- **Embed** — Hard-coded pixel values for play-button border
- **Section** — CSS token violations (hex fallbacks); `decorateSectionBackgrounds()` not yet implemented
- **Page** — UE schema not in block dir (exists in `/models/` only)
- **Title** — UE schema not in block dir; theme coloring spec not verified

---

## 3. Feature Work

### Section Model Expansion

Required for page composition patterns involving background images/videos. `component-models.json` fields (`backgroundImage`, `backgroundAlt`, `fullOverlay`, `linearGradient`, `sectionType`, etc.) are **done**. Remaining work:

| File                 | Change                                                                                                                                 |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `scripts/scripts.js` | Add `decorateSectionBackgrounds()` function; call from `decorateMain()` after `decorateSections(main)`                                 |
| `styles/styles.scss` | Add `.section-bg`, `.section--overlay-*`, `.section--width-*`, `.section--align-*` rules (all values must reference custom properties) |

### Side-by-Side Block (New)

**Status:** Blocked on design sign-off for variant layouts.

Minimum variants: default (media left / content right) and `reverse` (media right / content left). Row structure: Row 0 — media (image or video), Row 1 — heading + body text, Row 2 — button links.

Files needed: `blocks/side-by-side/side-by-side.js`, `blocks/side-by-side/side-by-side.css`, model updates.

### Icon System

- Implement custom `decorateIcons()` in `scripts/scripts.js` with prefix-based routing: `ph-*` → `/icons/ph-*.svg` (local), `mb-*` → AEM Assets Delivery URL, no prefix → `/icons/{name}.svg` (local)
- Use inline SVG injection (not `<img>`) so icons inherit `currentColor`
- Install `@phosphor-icons/core` and copy required SVGs to `/icons/ph-*.svg`
- Document and configure `icon-base-url` metadata field per site

### Typography Follow-ups (ADO-89)

- Apply `.text-testimonial` utility class to `blocks/quote/quote.scss` _(separate PR)_
- Apply `.eyebrow` utility class to `blocks/banner/banner.scss` _(separate PR)_
- Apply `.eyebrow` utility class to `blocks/hero/hero.scss` _(separate PR)_

### Performance

- Add preconnect hints to `head.html` for font CDN origins — check Network tab for actual hostname(s), then add `<link rel="preconnect" href="..." crossorigin>` entries
- Define `buildAutoBlocks()` expansion scope beyond current YouTube/Vimeo auto-wrapping

### Image Block

- **[RISK]** Validate UE dialog disable/auto-populate behavior for `imageAltFromDam` checkbox — requires UE deployment to test; may need custom UE field extension
- **[SPIKE]** Dynamic Media (Scene7) integration — current `createOptimizedPicture` approach uses EDS query params incompatible with DM URL/param system; spike needed before DM is enabled

---

## 4. Architecture & Design System

### Token Governance _(FED-SOLUTION-DESIGN.md Open Items)_

- Final Brand token whitelist must be documented and approved
- Tonal variant generation algorithm requires final specification (currently used in `fixed-tokens.css` via `color-mix()` but not documented as a spec)
- Permission model governing Root vs Brand authoring requires governance alignment
- Token documentation/discovery mechanism for designers and developers _(ARCHITECTURE-TODO #2)_
- Zombie token prevention process _(ARCHITECTURE-TODO #1)_

### App Builder Integration _(BLOCK-RENDERING-BUILD-CONFIG.md, FED-SOLUTION-DESIGN.md)_

App Builder is referenced throughout the architecture for automated token PR creation but is not yet implemented. Requires spec for:

- Authentication & authorization (service account credentials, AEM Author → App Builder auth flow, token-scoped access control)
- Complete validation rule set beyond hex color format
- Tonal variant generation algorithm implementation
- Error handling and author feedback in Universal Editor
- PR automation (target branch strategy, auto vs manual review, merge automation)
- Infrastructure (hosting on Adobe I/O Runtime, scaling, monitoring, SLA)

### Universal Editor _(ARCHITECTURE-TODO #11-14)_

- Document actual UE preview environment behavior (branch preview vs local vs staging)
- Document how authors discover available variants when authoring blocks
- Clarify metadata validation timing (authoring time vs runtime)
- Document UE form setup for token authoring

### Block Pattern Documentation

- **Document `onBefore`/`onAfter` lifecycle hooks** — Explain what the hooks are, why they exist, and why they should rarely be used in practice. Brands should extend via `/brands/{property}/blocks/` overrides, not hook into base block internals. The hooks are an escape hatch, not a standard authoring pattern.

### CSS Nesting Migration _(ARCHITECTURE-TODO #38)_

Decision: migrate block CSS to nested syntax opportunistically during development work. Accordion (March 2026) is the first block using nested CSS.

**Action needed:** Verify current PostCSS/build tooling passes nested CSS through correctly for the `browserslist` target without flattening or erroring. Document tooling state here once confirmed.

### Build & Infrastructure _(ARCHITECTURE-TODO #8-10)_

- Evaluate if manual chunk splitting is needed beyond EDS automatic bundling _(#8)_
- Determine source map strategy for production debugging _(#9)_
- Document build artifact lifecycle within EDS infrastructure _(#10)_

---

## 5. Testing & Quality _(ARCHITECTURE-TODO #15-20)_

- **Zero tests currently** — see Critical Blockers above. Write tests starting with brand detection and block decorate() functions.
- Define unit test coverage targets and CI enforcement _(#16)_
- Prioritize critical user journeys for E2E testing via Playwright _(#17)_
- Evaluate visual regression testing approach (Percy, Chromatic, Playwright screenshots) _(#18)_
- Document browser/version support matrix from `browserslist: "baseline widely available"` _(#19)_
- Automate accessibility testing beyond linting (axe-core in Playwright, Pa11y) _(#20)_

---

## 6. Monitoring & Operations _(ARCHITECTURE-TODO #21-27)_

- Document RUM data storage and analysis pipeline _(#21)_
- Audit all `sampleRUM()` calls; catalog tracked events and define success metrics _(#22)_
- Select and integrate error tracking service (Sentry, New Relic, Adobe-native) _(#23)_
- Implement Lighthouse CI in GitHub Actions; define performance budget thresholds; decide blocking vs advisory _(#24)_
- Define alert routing: critical → on-call, warning → Slack, info → email digest _(#25)_
- Define deployment notification mechanism (GitHub Actions → Slack webhook, email, etc.) _(#26)_
- Define deployment policy: blackout periods, emergency hotfix exception process _(#27)_

---

## 7. Security & Compliance (Required Before Launch) _(ARCHITECTURE-TODO #28-33)_

- **CSP headers** — Review current CSP `<meta>` tag for XSS protections; test third-party integrations (maps, booking widgets); verify `move-to-http-header` works in EDS _(#28)_
- **AEM authentication** — Document UE access control model (SSO, role-based) _(#29)_
- **PII handling** — Define data classification, storage locations, retention policies, and right-to-deletion workflows for form submissions _(#30)_
- **GDPR compliance** — Cookie consent banner implementation, data retention policies, user rights workflow _(#31)_
- **Security audit logging** — Define what actions are logged (publishes, token changes, permission modifications) and retention period _(#32)_
- **Vendor SLAs** — Review Adobe uptime commitments, document backup procedures _(#33)_

---

## 8. Third-Party Integration Specs _(ARCHITECTURE-TODO #35-37)_

Specs required before implementation:

- **Booking Widget APIs** — document provider, authentication, failover behavior, rate limits, fallback UI _(#35)_
- **Weather Service** — provider selection, API key management, caching duration, graceful degradation _(#36)_
- **Interactive Map** — Google Maps vs Mapbox decision, API key management per brand, static map fallback for performance _(#37)_

---

## 9. Open Questions (Pending External Input)

| Question                                                                | Source                          | Blocking                              |
| ----------------------------------------------------------------------- | ------------------------------- | ------------------------------------- |
| Admin API key header format for org/site-level keys (Adobe docs gap)    | AEM-EDS-REPOLESS-UE-SETUP.md #1 | Team automation using API keys        |
| Exact request body for API key creation endpoint                        | AEM-EDS-REPOLESS-UE-SETUP.md #2 | API key setup                         |
| Final Lake Powell brand colors (placeholder values in tokens.css)       | BRAND-CONFIG-TICKET-RUNDOWN.md  | Production launch of Lake Powell site |
| Brand-specific block variant strategy (filter variants by brand in UE?) | ARCHITECTURE-TODO #3            | Block variant governance              |
