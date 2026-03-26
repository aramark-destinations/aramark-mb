# PR #13 Review — ADO-133 - breadcrumbs

**Date:** 2026-03-25
**Author:** dstockbridge-aramark
**Branch:** `ADO-133-breadcrumbs` → `staging`

---

## Audit Sources

This review was conducted against:
- `docs/project-knowledge/technical/technical-standards.md`
- `docs/project-knowledge/technical/platform-constraints.md`
- `docs/project-knowledge/governance/business-rules.md`
- `docs/project-knowledge/design/design-standards.md`
- `docs/project-knowledge/technical/performance-targets.md`
- `docs/BLOCK-EXTENSIBILITY-GUIDE.md`
- `docs/BLOCK-RENDERING-BUILD-CONFIG.md`
- `blocks/breadcrumbs/ticket-details.md`
- `docs/audits/breadcrumbs-audit.md` (prior audit: 2026-03-20)

---

## Summary

This PR maps the breadcrumbs block to the Figma spec (node 177:849) by updating `breadcrumbs.scss` to fix the gap value (4px → 8px), remove `text-transform: uppercase`, replace `--link-color` and `--color-neutral-500` with semantic text tokens, and add a dark-background override for the in-hero usage. It also removes the incorrect `.section.breadcrumbs-container` background and `.breadcrumbs-wrapper::before` bleed styling that conflicted with the Figma design. A new `breadcrumbs-figma-audit.md` documents the token mapping and in-hero layout findings, and `blocks/hero/README.md` gains a Breadcrumb Integration section.

The Figma work is thorough and well-documented. The core intent is correct. However, the PR introduces a **blocking undefined-token bug** (`--font-weight-light`), leaves three prior-audit token violations unfixed, and adds three new ones — meaning the block remains NO-GO.

---

## Automated Checks

| Check | Result | Notes |
|---|---|---|
| Lint (ESLint + Stylelint) | PASS | Zero errors/warnings |
| Tests | PASS | 63 tests, 63 passed (`blocks/breadcrumbs/breadcrumbs.test.js`) |
| CSS Build | PASS | `breadcrumbs.scss` → `breadcrumbs.css` compiled cleanly |
| JSON Build | N/A | No `*.json` schema files changed |

**PSI scores (AEM bot — unbranded preview):**

| Device | Performance | A11Y | Best Practices | SEO | LCP |
|---|---|---|---|---|---|
| Mobile | 98 | 100 | 96 | 69 | 1.1s |
| Desktop | 100 | 100 | 96 | 69 | 0.3s |

SEO 69 is a site-wide issue, not block-specific. All CWV metrics are green.

---

## Developer Notes (from PR description)

> Map breadcrumbs component (node 177:849) to token system. Correct gap (4px → 8px), remove text-transform uppercase, replace link/neutral colors with semantic text tokens, and add hero dark-background override. Document in-hero usage from node 9430:6087 in the audit and hero README.

**No outstanding items flagged by developer in PR description.**

---

## Code Review Findings

### Blocking Issues

- [ ] **Undefined token: `var(--font-weight-light)`** — `blocks/breadcrumbs/breadcrumbs.scss`

  `--font-weight-light` is referenced on `.breadcrumbs-item` for the 300 Light weight from Figma, but this token does not exist anywhere in `styles/root-tokens.scss` or `styles/fixed-tokens.scss`. The font weight token system only defines `normal` (400), `medium` (500), `semibold` (600), and `bold` (700). When a CSS custom property is undefined, `font-weight` falls back to its initial/inherited value — meaning the Figma-specified 300 weight will silently not render.

  **Fix options (choose one):**
  1. Add `--font-weight-light: 300;` to `styles/root-tokens.scss` under the Typography — Font Weights section, then the SCSS reference is correct.
  2. If the token should not be added to root-tokens yet (pending design sign-off), use `font-weight: 300; /* TODO: replace with var(--font-weight-light) once token is added */` as a temporary raw value with explanation.

- [ ] **`border-radius: 2px` hardcoded** — `blocks/breadcrumbs/breadcrumbs.scss` (`.breadcrumbs-link:focus`)

  Not fixed from prior audit finding #2. The token system has `--radius-xs: 4px` as the smallest available radius token. `2px` is not tokenized.

  **Fix:** `border-radius: var(--radius-xs);` — or remove entirely (focus rings typically don't need border-radius when using `outline`).

- [ ] **`color: #000` in `@media print`** — `blocks/breadcrumbs/breadcrumbs.scss` (`.breadcrumbs-link` and `.breadcrumbs-item:not(:last-child)::after`)

  Not fixed from prior audit findings #4 and #5. Two `color: #000` hardcoded hex values remain in the print block.

  **Fix:** Replace both with `var(--color-base-black)` — which is `#000` in root-tokens.scss and can be overridden per brand.

---

### Warnings

- [ ] **`font-size: 12px` hardcoded** — `blocks/breadcrumbs/breadcrumbs.scss` (`.breadcrumbs-item`)

  The comment `/* --font-size-xs candidate */` acknowledges this isn't tokenized yet, but a raw pixel value is still a token violation per project standards. Since `--font-size-xs` doesn't exist in `root-tokens.scss`, the options are: (a) add the token to root-tokens before or as part of this PR, or (b) use a raw value with a TODO comment explaining the pending token.

  This is consistent with the PR's intent but should be `TODO`-commented if not unblocked.

- [ ] **`line-height: 1.5em` hardcoded** — `blocks/breadcrumbs/breadcrumbs.scss` (`.breadcrumbs-item`)

  No existing token matches `1.5`. Nearest: `--line-height-snug: 1.25` (too low) and `--line-height-normal: 1.6` (slightly high). The audit doc notes `--line-height-normal: 1.6` as a "near-match, no gap needed" — but `1.5em ≠ 1.6`. Either accept `var(--line-height-normal)` as the closest token, add a new token, or comment as a TODO.

- [ ] **`letter-spacing: -0.02em` hardcoded** — `blocks/breadcrumbs/breadcrumbs.scss` (`.breadcrumbs-item`)

  Similar to font-size — no `--letter-spacing-*` token exists. Acknowledged in the audit doc as a candidate. Add a TODO comment or add the token.

- [ ] **`transition: opacity` has no visible effect** — `blocks/breadcrumbs/breadcrumbs.scss` (`.breadcrumbs-link`)

  The transition was fixed from prior audit (good — `var(--transition-duration-fast)` now used). However, the hover state only sets `text-decoration: underline` — there is no opacity change being animated. The transition declaration does no work as written. Consider either: removing the transition entirely, adding `opacity` to the hover rule (e.g., `opacity: 0.8`), or switching to `transition: text-decoration` (which isn't animatable in all browsers). Minor but creates dead CSS.

---

### Informational

- **Three of five prior-audit violations fixed:** Transition duration hardcoded `0.2s` (now uses `var(--transition-duration-fast)`) ✅, `.breadcrumbs` `text-transform: uppercase` removed ✅, `margin: 0.5rem 0` in print media (`.breadcrumbs` rule removed from print block) ✅.

- **Branch is 4 commits behind staging** (`staged changes`, `ADO-24 (#17)`, `Cleanup (#16)`, `feat(columns)` all landed after the branch point). No overlapping files — rebase should be clean and conflict-free.

- **PSI A11Y score is 100.** The accessibility implementation (ARIA breadcrumb nav, `aria-current="page"`, keyboard-accessible links) is solid and the Lighthouse audit confirms it.

- **`breadcrumbs-figma-audit.md` is thorough.** The token mapping, token gaps table, in-hero usage analysis, and structural notes are well-documented and will be useful for future iteration.

- **`.hero .breadcrumbs-link` selector** — the dark-mode override works correctly assuming breadcrumbs are rendered inside the `.hero` element at runtime. The selector is appropriate and future-proof.

---

## Prior Audit Status

*From `docs/audits/breadcrumbs-audit.md` (2026-03-20)*

| Prior Finding | Resolved by this PR? |
|---|---|
| Transition duration hardcoded (`0.2s`) on `.breadcrumbs-link` | YES — replaced with `var(--transition-duration-fast)` |
| `border-radius: 2px` on `.breadcrumbs-link:focus` | NO — still present |
| `margin: 0.5rem 0` in `@media print` on `.breadcrumbs` | YES — `.breadcrumbs` rule removed from print block |
| `color: #000` in `@media print` on `.breadcrumbs-link` | NO — still present |
| `color: #000` in `@media print` on `.breadcrumbs-item::after` | NO — still present |
| Hero integration not implemented | NO — out of scope for this PR (dark override added as stepping stone) |
| Section theme styling | PARTIAL — `[data-theme='dark']` override added; Hero render integration pending |

**Block status after this PR:** Still **NO-GO**. 2 of 5 prior violations fixed; 3 remain; 3 new violations introduced (font-size, line-height, letter-spacing) and 1 new blocking bug (undefined `--font-weight-light` token).

---

## Spec Alignment

*Source: `blocks/breadcrumbs/ticket-details.md`*

| Requirement | Status | Notes |
|---|---|---|
| Block set up in EDS codebase | MET | Block exists and is functional |
| Dynamically constructed from site structure | MET | Reads `breadcrumb` metadata JSON for hierarchy |
| "Home" is always the first element | MET | Implemented in `buildBreadcrumbTrail` |
| Text from "Breadcrumb Title" metadata, fallback to "Title" | PARTIAL | `og:title` fallback used; specific "Breadcrumb Title" named field not directly read |
| Not available to add to pages on its own | NOT MET | UE schema still allows standalone placement |
| Author includes Breadcrumb via the Hero Block | NOT MET | Hero block does not render breadcrumbs; out of scope this PR |
| No dialog configurations | NOT MET | UE schema has `breadcrumb-label-override` and `breadcrumb-parent-override` fields (pre-existing) |
| Displays in bottom corner of Hero | NOT MET | Hero integration pending |
| Section theme styling (white or black based on theme) | PARTIAL | `[data-theme='dark']` and `.hero` context handled; standalone section theming pending |
| Token system alignment (Figma spec) | PARTIAL | Gap, colors, separators fixed; font-size/weight/letter-spacing not tokenized; `--font-weight-light` undefined |

**Spec note — placement discrepancy:** `ticket-details.md` says breadcrumbs display in the **bottom-left** corner of the Hero. The hero README addition (this PR) documents **bottom-right** (`justify-content: flex-end`). The Figma audit confirms `justifyContent: flex-end` (right). This suggests the ticket text is stale or the design was revised. Should be clarified and `ticket-details.md` updated accordingly.

---

## Action Items for Review Session

- [ ] **Must fix before merge:** Add `--font-weight-light: 300;` to `styles/root-tokens.scss` (or use raw value with TODO comment)
- [ ] **Must fix before merge:** Replace `border-radius: 2px` with `var(--radius-xs)` on `.breadcrumbs-link:focus`
- [ ] **Must fix before merge:** Replace `color: #000` (×2) in `@media print` with `var(--color-base-black)`
- [ ] **Discuss:** Add `--font-size-xs`, `--letter-spacing-tight` tokens to `root-tokens.scss` as part of this PR, or defer and add TODO comments?
- [ ] **Discuss:** Accept `var(--line-height-normal)` as nearest token for `1.5`-ish line height, or add a new `--line-height-medium` token?
- [ ] **Decide:** Confirm breadcrumb placement is bottom-right (Figma) not bottom-left (ticket) — update `ticket-details.md` to match Figma
- [ ] **Rebase:** Branch is 4 commits behind staging. Rebase before merge (no conflicts expected)
- [ ] **Follow-up ticket:** Hero block integration (author toggle for breadcrumbs in hero) still open

---

## Files Changed

| File | Change |
|---|---|
| `blocks/breadcrumbs/breadcrumbs.scss` | Token alignment: gap, text-transform, link/separator colors, dark-background override, typography from Figma spec |
| `blocks/breadcrumbs/breadcrumbs.css` | Compiled output from SCSS changes |
| `blocks/breadcrumbs/breadcrumbs-figma-audit.md` | New file — Figma token audit with token matches, gaps, and in-hero layout spec |
| `blocks/hero/README.md` | Added Breadcrumb Integration section documenting in-hero behavior and linking to breadcrumbs block |
