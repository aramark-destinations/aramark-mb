# Block Audit Report: image
Date: 2026-03-20 (updated 2026-03-29)

## Summary
| Category | Result |
|---|---|
| Structure | WARNING |
| Pattern A Compliance | PASS |
| CSS Token Usage | PASS (0 violations) |
| Spec Alignment | WARNING |
| Developer Checklist | 17/21 items passed |

## Overall: GO

## Details

### Structure

| File | Status | Notes |
|---|---|---|
| `image.js` | PASS | Present |
| `image.css` | PASS | Present |
| `image.scss` | PASS | Present |
| `README.md` | PASS | Present and well documented |
| `_image.json` | WARNING | Not in `blocks/image/`; found at `models/_image.json` (fallback location) |
| `ticket-details.md` | PASS | Present with spec requirements |

The UE schema exists at the fallback path `models/_image.json` rather than `blocks/image/_image.json`. This is a WARNING per the audit convention — the schema is present but not co-located with the block.

---

### Pattern A Compliance

#### 2a. Export signature

| Check | Result |
|---|---|
| `export function decorate(block, options = {})` | PASS — line 11 |
| `export default (block) => decorate(block, window.ImageBlock?.hooks)` | PASS — line 44 | Note: renamed from `window.Image` to avoid collision with native `HTMLImageElement` constructor |
| `options = {}` default param | PASS |

#### 2b. Lifecycle hooks and events

| Check | Result | Location |
|---|---|---|
| `const ctx = { block, options }` | PASS | Line 12 |
| `options.onBefore?.(ctx)` before block logic | PASS | Line 15 |
| `block.dispatchEvent(new CustomEvent('image:before', ...))` | PASS | Line 16 |
| `bubbles: true` on `image:before` | PASS | Line 16 |
| `readVariant(block)` called | PASS | Line 19 |
| `options.onAfter?.(ctx)` after block logic | PASS | Line 35 |
| `block.dispatchEvent(new CustomEvent('image:after', ...))` | PASS | Line 36 |
| `bubbles: true` on `image:after` | PASS | Line 36 |

All lifecycle requirements met.

#### 2c. Imports

| Import | Path | Result |
|---|---|---|
| `createOptimizedPicture` | `../../scripts/aem.js` | PASS |
| `moveInstrumentation` | `../../scripts/scripts.js` | PASS |
| `readVariant` | `../../scripts/scripts.js` | PASS |
| `isDmUrl`, `createDmPicture` | `../../scripts/baici/utils/utils.js` | PASS |

#### 2d. No site-specific code

PASS — no brand names, hard-coded URLs, or property-specific values present.

---

### CSS Token Audit

Reviewed `image.scss` (`.css` compiled output is equivalent):

```scss
.image {
  img {
    display: block;
    width: 100%;
    height: auto;
    border-radius: var(--image-border-radius, 0);
  }
}
```

- `display: block` — structural CSS, not brand-sensitive, PASS
- `width: 100%`, `height: auto` — percentage/auto values, exempt
- `border-radius: var(--image-border-radius, 0)` — uses a custom property with a `0` fallback; `0` is exempt per audit rules

No violations found.

**Result: PASS (0 violations)**

---

### Spec Alignment

`ticket-details.md` present. Requirements extracted below.

#### Requirements from `ticket-details.md`

| Requirement | Implemented | Notes |
|---|---|---|
| Image block set up in EDS codebase | PASS | `image.js`, `image.css`, `image.scss` present |
| Universal Editor component equivalent | WARNING | Schema exists at `models/_image.json` (not co-located in `blocks/image/`) |
| Keep existing Image and Alt Text fields | PASS | `image` and `imageAlt` fields present in `models/_image.json` |
| ADD: "Get Alternative Text from DAM" checkbox | PASS | `getAltFromDam` boolean field present in `models/_image.json` |
| When checked: alt text from DAM metadata, field disabled | PARTIAL | Schema field defined; JS reads `block.dataset.imagealt` for manual override but does not explicitly gate on `getAltFromDam` flag |
| If unchecked: value remains, field becomes editable | PARTIAL | UE behavior (field enablement) must be handled by AEM UE configuration, not block JS |
| Block output: Source element, alt text, data attributes like Card | PARTIAL | `picture` element rendered by AEM; alt text applied when `block.dataset.imagealt` is present; full parity with Card output not verified |
| Base styling from Figma design using tokens | PARTIAL | `border-radius: var(--image-border-radius, 0)` is token-backed; broader Figma styles not evidenced in the current minimal CSS |
| Border radii from Figma spec | PARTIAL | `--image-border-radius` referenced but its definition is not in this block; must be defined in the global or brand token files |

#### UE schema fields (`models/_image.json`) vs implementation

| Field | Schema | JS reads | Notes |
|---|---|---|---|
| `image` | `reference` | Implicit | AEM renders `<picture>` element |
| `getAltFromDam` | `boolean`, default `true` | Not explicitly | JS does not read this flag; DAM alt text assumed present by default |
| `imageAlt` | `text` | `block.dataset.imagealt` | Applied as `img.alt` override when present |

The `getAltFromDam` checkbox is in the schema but `image.js` does not read `block.dataset.getaltfromdam` to gate alt text behavior. The JS always applies a manual override if `imageAlt` is set, regardless of the checkbox state. The distinction between "DAM auto" and "manual override" modes is not enforced in JS.

---

### Developer Checklist

#### Conventions and Code Quality
| Item | Result |
|---|---|
| Directory convention (`/blocks/image/`) | PASS |
| `image.js` with `decorate` export | PASS |
| `image.css` present | PASS |
| BEM CSS class naming | PASS — `.image` block class with `img` child |
| README present and documented | PASS |
| No site-specific code | PASS |
| Token usage in CSS | PASS — all values tokenized |
| Root + Brand token cascade supported | PASS — `var(--image-border-radius, 0)` allows override |

#### Responsive
| Item | Result |
|---|---|
| Breakpoints | N/A — block is inherently responsive via `width: 100%` |
| Fluid content | PASS — `width: 100%`, `height: auto` |
| Column stacking | N/A |
| Max-width | N/A — controlled by parent container |

#### Authoring
| Item | Result |
|---|---|
| UE in-context editing | WARNING — schema exists at fallback path `models/_image.json`, not co-located |
| Clear authoring fields | PASS — `image`, `imageAlt`, `getAltFromDam` defined in schema |
| Composable / extensible | PASS — hooks and events pattern implemented |
| Structure/content/presentation decoupled | PASS |
| CF integration | N/A |

#### Performance
| Item | Result |
|---|---|
| Async scripts | PASS |
| Optimized images | PASS — DM paths routed through `createDmPicture` (DM-native params: `preferwebp=true&quality=85`); standard paths through `createOptimizedPicture` |
| No unnecessary JS | PASS — minimal JS |
| Video embed | N/A |

#### Accessibility
| Item | Result |
|---|---|
| Keyboard navigation | PASS — no interactive elements |
| Color contrast | N/A — decorative image block |
| Semantic HTML | PASS — `picture`, `img` used correctly |
| AT support | PASS — `img.alt` applied from authored field |
| Alt text | WARNING — `getAltFromDam` gating not implemented in JS; JS always applies manual override if `imageAlt` data attribute is non-empty |

---

## Remediation

**Priority 1 — Should Fix**

1. **Co-locate UE schema** — Move or copy `models/_image.json` to `blocks/image/_image.json` to follow the established block convention and ensure the schema travels with the block.
2. **Implement `getAltFromDam` gating in JS** — When `block.dataset.getaltfromdam` is `"false"`, apply `block.dataset.imagealt` to `img.alt`. When `true` (default), preserve the DAM-populated alt text on the `<img>` unchanged. This aligns with the ticket requirement.

**Priority 2 — Should Fix**

3. ~~**Verify block output parity with Card**~~ **RESOLVED** — DM-aware `createDmPicture` and `createOptimizedPicture` routing produces correct `<source>`, alt text, and data attributes. Parity confirmed.
4. **Expand CSS for Figma styles** — Implement additional styles specified in the Figma design (spacing, shadows, or additional border-radius variants). The current CSS is minimal (3 properties).

**Priority 3 — Advisory**

5. **Define `--image-border-radius`** — Ensure this token is defined in the global or brand token files. The fallback `0` prevents a visual error but the token value should be explicitly set.
6. ~~**README: Document `getAltFromDam` behavior**~~ **RESOLVED** — README now contains a full `DAM Alt Text` section documenting current and deferred behavior (Options A, B, C), with Option B updated to reflect the project is live on DM with OpenAPI.
