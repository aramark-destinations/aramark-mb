# Technical Standards

## Block Pattern A (Mandatory)

All blocks in this project must follow Pattern A. Deviating from this pattern will cause blocks to fail integration with the site framework.

```javascript
// Required export signature
export default function decorate(block, options = {}) {
  // Invoke onBefore lifecycle hook (if registered)
  window.BlockName?.hooks?.onBefore?.(block, options);

  // ... block implementation ...

  // Dispatch lifecycle event (bubbles: true is required)
  block.dispatchEvent(new CustomEvent('BlockName:decorated', {
    bubbles: true,
    detail: { block },
  }));

  // Invoke onAfter lifecycle hook (if registered)
  window.BlockName?.hooks?.onAfter?.(block, options);
}
```

Key rules:
- Export must be `export default function decorate(block, options)`
- `window.BlockName?.hooks?.onBefore` called before implementation
- `window.BlockName?.hooks?.onAfter` called after implementation
- Lifecycle events must use `bubbles: true`
- `BlockName` matches the PascalCase block name (e.g., `Accordion`, `Carousel`, `Modal`)

## SCSS Build Pipeline

- Global styles and the token system use `.scss` files
- Block styles use `.css` files
- After modifying any `.scss` file, run: `pnpm build:css`
- After modifying any UE JSON schema (`_{name}.json`), run: `pnpm build:json`
- CI only runs `pnpm lint` — it does not run `pnpm build:css`, `pnpm build:json`, or tests

**Planned:** Root token authoring will eventually go through AEM UE forms → App Builder → auto PR pipeline (see `docs/in-progress/FED-SOLUTION-DESIGN.md`). Until implemented, edit `styles/root-tokens.scss` directly.

## Code Style (Airbnb ESLint Config)

See `CODE_GENERATION_CHECKLIST.md` for the full per-generation checklist. Summary:
- Single quotes, not double quotes
- Arrow function params always have parens: `(x) =>`
- Max line length: 100 characters
- Import paths include `.js` extension
- Unused params prefixed with `_`
- Use `console.error`/`warn`/`info`/`debug` — never `console.log`

## ticket-details.md Convention

Every block directory includes a committed `ticket-details.md` with ADO ticket requirements. **Always read `ticket-details.md` before reading any other file when working on a block.** It is the authoritative spec source for block work.

## WCAG 2.1 AA Requirements

All blocks must meet WCAG 2.1 AA. Minimum requirements:
- All interactive elements reachable via keyboard (`Tab`, `Enter`, `Space`, arrow keys as appropriate)
- Focus indicators visible (do not suppress `:focus-visible`)
- Color contrast ratio ≥ 4.5:1 for normal text, ≥ 3:1 for large text
- All images have meaningful `alt` text (or `alt=""` for decorative images)
- Form inputs have associated `<label>` elements
- Dynamic content changes announced via `aria-live` or focus management

## ARIA Patterns for Known Blocks

| Block | Role | Notes |
|---|---|---|
| Accordion | `role="region"`, `aria-expanded`, `aria-controls` | Headers are `<button>` elements |
| Carousel | `role="region"`, `aria-label`, `aria-roledescription="carousel"` | Slides use `aria-hidden` when not active |
| Tabs | `role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-selected`, `aria-controls` | Arrow key navigation between tabs |
| Modal | `role="dialog"`, `aria-modal="true"`, `aria-labelledby` | Focus trap required; close on `Escape` |
| Breadcrumbs | `<nav aria-label="Breadcrumb">`, `aria-current="page"` on last item | Use `<ol>` |

## Testing

**Current state (as of 2026-03-25):** Zero test files exist in the project. Jest and Playwright are installed but `pnpm test` has nothing to run. Coverage thresholds in `jest.config.js` are enforced locally only — CI does not run tests.

**Highest-priority testing targets:**
1. `scripts/site-resolver.js` — brand detection logic, critical path
2. 7 blocks currently at GO status (see `docs/audits/SUMMARY.md`)

**Test types:**
- Unit tests (Jest): For blocks with meaningful JS logic — state management, data transformation, event handling
- E2E tests (Playwright): For interactive browser behavior — carousels, accordions, forms, modals
- Do NOT write tests for pure DOM structure or CSS class presence — these are fragile and low value

Use the `eds/block-testing` and `eds/e2e-testing` skills for test infrastructure setup and patterns.

---

*Last Updated: 2026-03-25*
