# Navigation Group Block

## Overview

The Navigation Group block renders a labeled group of navigation items within the flyout menu. Each group displays a title (either as an interactive link or a non-interactive button) and expands to show its child `navigation-item` blocks.

On **desktop**, groups are always fully expanded and the title button has `pointer-events: none` applied via CSS (preventing click interaction). On **mobile**, the title triggers a toggle to expand or collapse the group's item list.

The block supports both standard AEM document authoring and Universal Editor (UE) authoring via dedicated config readers (`readGroupUeConfig()`, `readKeyValueConfig()`, `extractAueConfig()`).

---

## Integration

### Block Configuration

Configuration is read by `readConfig(block, configOptions)`.

| Key | Type | Default | Description | Required | Side Effects |
|---|---|---|---|---|---|
| `title` | text | `'Menu Group'` | Display label for the group header | No | Rendered as button text (`is-header-only: true`) or anchor text (`is-header-only: false`) |
| `link` | text | `'/'` | URL for the group header anchor | No | Only applied when `is-header-only` is `false`; ignored otherwise |
| `is-header-only` | boolean string | `'true'` | Controls whether the group title is a non-interactive heading (`true`) or a navigable link (`false`) | No | `true` → renders `button.navigation-group-button`; `false` → renders `a.navigation-group-link` |

### URL Parameters

<!--
The Navigation Group block does not read URL parameters.
-->

### Local Storage

<!--
The Navigation Group block does not read from or write to localStorage.
-->

### Events

#### Event Listeners

These listeners are attached once at the **module level** on the `main` element, guarded by the `data-navigationGroupListenerAttached` attribute to prevent duplicate registration.

| Source | Event | Handler |
|---|---|---|
| `main` | `decorate:navigation:group` | Re-decorates the target group element. The event's `detail.element` is passed to the group decoration function. |
| `main` | `decorate:navigation:group:items` | Re-decorates the child items of the target group. The event's `detail.element` references the group whose items should be refreshed. |

#### Event Emitters

| Target | Event | When |
|---|---|---|
| `window` | `update:live:region` (CustomEvent) | Dispatched with `{ detail: { message } }` when a group menu opens or closes on mobile, to announce the state change to screen readers |
| `window.adobeDataLayer` | `nav_link_click` | Pushed when a user clicks a group-level navigation item; payload includes `nav.level: 'group-item'` and the item label |

---

## Behavior Patterns

### Page Context Detection

- **Universal Editor detection**: The block uses `readGroupUeConfig()` and `extractAueConfig()` to read configuration from UE `data-aue-prop` attributes when running inside the Universal Editor, falling back to document-authored key-value rows.

### User Interaction Flows

**Desktop**
1. Groups are rendered in their expanded state.
2. The group title button has `pointer-events: none` via CSS — it cannot be clicked.
3. All child items are visible without user interaction.

**Mobile — opening a group**
1. User taps the group title button.
2. `toggleGroupMenu()` fires (mobile only).
3. The item list expands, `aria-expanded="true"` is set on the button.
4. `update:live:region` is dispatched announcing the open state.

**Mobile — closing a group**
1. User taps the title button again, or presses Escape (debounced 100 ms).
2. The item list collapses, `aria-expanded="false"` is set.
3. `update:live:region` is dispatched announcing the closed state.

**Universal Editor re-decoration**
- When a group is updated in the UE editor, a `decorate:navigation:group` or `decorate:navigation:group:items` event is dispatched by the editor integration layer, causing the affected group to re-render in place without a full page reload.

### Error Handling

- If `readConfig()` cannot find a value for a key, the configured default is used (`'Menu Group'`, `'/'`, `'true'`).
- `toggleGroupMenu()` is a no-op on viewport widths above the mobile breakpoint, preventing accidental collapse on desktop.
- The module-level event guard (`data-navigationGroupListenerAttached`) ensures `decorate:navigation:group` listeners are registered exactly once, even if multiple group blocks are on the page.
- Escape key handler is debounced (100 ms) to prevent duplicate close calls from rapid key repeat.

---

## Unit Testing

> **Future state.** A test file (`navigation-group.test.js`) ships with this block but is not currently integrated into the project's test pipeline. When unit testing is introduced, coverage should include:
>
> - Desktop: group renders fully expanded; title button has `pointer-events: none`
> - Mobile: `toggleGroupMenu()` expands/collapses the item list and updates `aria-expanded`
> - `is-header-only: true` renders a `button.navigation-group-button`; `false` renders `a.navigation-group-link`
> - `decorate:navigation:group` event triggers re-decoration of the correct element
> - `decorate:navigation:group:items` event triggers re-decoration of child items
> - Module-level `data-navigationGroupListenerAttached` guard prevents duplicate listener registration
> - `update:live:region` dispatched with correct message on mobile open/close
> - Escape handler debounce (100 ms) prevents duplicate close events
