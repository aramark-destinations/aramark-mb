# Block To-Dos

Open items, risks, and follow-up work organized by block. Items without a block home go under General.

---

## General

- **Document `onBefore`/`onAfter` lifecycle hooks:** Write documentation explaining what these hooks are, why they exist in the base blocks, and why they will rarely (if ever) be used in practice. Brands should conform to the global design system by extending or overriding blocks via the `/brands/{property}/blocks/` pattern — not by hooking into base block internals. The hooks exist as an escape hatch, not a standard authoring pattern.

- **Migrate font tokens out of `styles/styles.css`:** Font family tokens (`--body-font-family`, `--heading-font-family`) and responsive font sizes live in `styles/styles.css` instead of the token chain. Brands cannot override fonts without editing the base file. Needs migration to `root-tokens.css` (or equivalent) so brand `tokens.css` overrides work correctly.

- **Add `--nav-height` to the token system:** Currently hardcoded in `styles/styles.css`. Brands cannot adjust nav height via token override. Needs to be added to the root design token system.

- **Resolve `lazy-styles.css` placeholder:** File exists but is empty. Either populate it with styles that should load post-LCP, or delete it. An empty file adds a network request for nothing.

- **Define `buildAutoBlocks()` expansion scope:** Currently only wraps bare YouTube/Vimeo URLs as `embed` blocks. The function is a known stub. Needs a decision on what additional auto-block patterns are required before implementation.

- **Add preconnect hints to `head.html`:** Font CDN origins are not pre-connected, meaning the first font request pays full TCP+TLS handshake cost. Check the Network tab for actual font CDN hostname(s) and add `<link rel="preconnect" href="..." crossorigin>` entries to `head.html`.

---

## Image Block

- **[RISK] Validate UE dialog disable/auto-populate behavior for `imageAltFromDam` checkbox:** The ticket requires that when "Get Alternative Text from DAM" is checked, the Alt Text field is (1) auto-populated from the DAM asset's `dc:description` metadata and (2) disabled so the author cannot edit it. The model has both fields in place, but the disable and auto-populate behavior depends on xwalk plugin support. If not natively supported, a custom UE field extension will be required. Validate once UE deployments are restored.

- **[SPIKE] Dynamic Media integration:** The image block currently uses the standard Helix/EDS `createOptimizedPicture` approach, which appends query parameters (`?width=X&format=webp&optimize=medium`) to the image pathname. If the project adopts Adobe Dynamic Media (Scene7) for image delivery, these parameters will not work — DM uses its own URL and parameter system (`wid`, `fmt`, `qlt`, image presets, etc.). A spike is needed to define the correct approach for DM-aware optimized picture generation before DM is enabled on the AEM instance.

---

## Section Block

- **Expand section model:** Add background fields to `models/component-models.json`: `backgroundImage`, `backgroundImageAlt`, `backgroundVideo`, `backgroundVideoFallback`, `backgroundOverlay`, `contentWidth`, `contentAlign`. This is a prerequisite for the side-by-side block composition pattern where backgrounds are configured at the section level.

- **Add `decorateSectionBackgrounds()`:** New function in `scripts/scripts.js`, called from `decorateMain()`, that reads section data attributes and applies background treatment to the section element.

- **Add section background CSS:** New rules in `styles/styles.css` for `.section-bg`, `.section--overlay-*`, `.section--width-*`, `.section--align-*`. All values must reference custom properties so brand overrides work via `brands/{brand}/styles/`.

---

## Side-by-Side Block

- **[BLOCKED] Implement side-by-side block:** Blocked on design sign-off for variant layouts. Once approved, implement `blocks/side-by-side/side-by-side.js`, `blocks/side-by-side/side-by-side.css`, and add the block model to `models/component-models.json`, `models/component-definition.json`, and `models/component-filters.json`.
  - Minimum variants: default (media left / content right) and `reverse` (media right / content left).
  - Row structure: Row 0 — media (image or video), Row 1 — heading + body text, Row 2 — button links.

---

## Icon System

- **Implement custom icon resolver:** Replace or extend the default `decorateIcons()` with prefix-based routing: `ph-*` icons → `/icons/ph-*.svg` (local), `mb-*` icons → AEM Assets Delivery URL. Custom global icons go to `/icons/` directly.

- **Inline SVG injection:** The icon resolver should fetch and inline SVGs (not use `<img>`) so icons inherit `currentColor` and are styleable via CSS.

- **Add Phosphor icon subset:** Install `@phosphor-icons/core` (or copy manually) and populate `/icons/ph-*.svg` with the subset of Phosphor icons actually used across blocks.

- **Configure `icon-base-url` metadata:** Define and document the `icon-base-url` metadata field that the resolver reads to construct AEM Assets Delivery URLs per site.
