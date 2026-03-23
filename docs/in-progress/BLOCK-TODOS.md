# Block To-Dos

Open items, risks, and follow-up work organized by block. Items without a block home go under General.

---

## General

- **Document `onBefore`/`onAfter` lifecycle hooks:** Write documentation explaining what these hooks are, why they exist in the base blocks, and why they will rarely (if ever) be used in practice. Brands should conform to the global design system by extending or overriding blocks via the `/brands/{property}/blocks/` pattern — not by hooking into base block internals. The hooks exist as an escape hatch, not a standard authoring pattern.

---

## Image Block

- **[RISK] Validate UE dialog disable/auto-populate behavior for `imageAltFromDam` checkbox:** The ticket requires that when "Get Alternative Text from DAM" is checked, the Alt Text field is (1) auto-populated from the DAM asset's `dc:description` metadata and (2) disabled so the author cannot edit it. The model has both fields in place, but the disable and auto-populate behavior depends on xwalk plugin support. If not natively supported, a custom UE field extension will be required. Validate once UE deployments are restored.

- **[SPIKE] Dynamic Media integration:** The image block currently uses the standard Helix/EDS `createOptimizedPicture` approach, which appends query parameters (`?width=X&format=webply&optimize=medium`) to the image pathname. (`webply` is a Helix CDN-specific format token that requests WebP with lossless fallback — it is not a standard web format name.) If the project adopts Adobe Dynamic Media (Scene7) for image delivery, these parameters will not work — DM uses its own URL and parameter system (`wid`, `fmt`, `qlt`, image presets, etc.). A spike is needed to define the correct approach for DM-aware optimized picture generation before DM is enabled on the AEM instance.
