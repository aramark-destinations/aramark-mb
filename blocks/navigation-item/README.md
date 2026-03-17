# Navigation Item Block

## Overview

The Navigation Item block renders a single navigable menu item (`<li role="menuitem">`) within a navigation group or section. It creates an anchor element with the configured title, link, optional description (as a `title` attribute for hover text), and optional new-tab behavior.

The block wires up keyboard accessibility (Escape to close the parent section) and dispatches analytics events when the item is clicked.

---

## Integration

### Block Configuration

Configuration is read by `readBlockConfig(block)`.

| Key | Type | Default | Description | Required | Side Effects |
|---|---|---|---|---|---|
| `title` | text | `'Menu Item'` | Display text for the anchor link | No | Sets the visible link text |
| `link` | text | `'#'` | `href` for the anchor element | No | Sets the `href` attribute on the rendered `<a>` |
| `description` | text | `''` | Short description of the item | No | Sets the `title` attribute on the anchor (shown as browser tooltip on hover) |
| `open-in-new-tab` | boolean string | `'false'` | Whether to open the link in a new browser tab | No | `'true'` → adds `target="_blank"` and `rel="noopener noreferrer"` to the anchor |

### URL Parameters

<!--
The Navigation Item block does not read URL parameters.
-->

### Local Storage

<!--
The Navigation Item block does not read from or write to localStorage.
-->

### Events

#### Event Listeners

This listener is attached once at the **module level** on the `main` element, guarded by the `data-navigationItemListenerAttached` attribute to prevent duplicate registration.

| Source | Event | Handler |
|---|---|---|
| `main` | `decorate:navigation:item` | Re-decorates the target item element via `decorateMenuItem()`, then calls `updateSubMenuHeight()` to recalculate the parent submenu grid layout. The event's `detail.element` references the item to re-render. |
| anchor | `keyup` (Escape, debounced 100 ms) | Dispatches `close:navigation:section` on `window`, targeting the closest ancestor section trigger button, to close the enclosing flyout. |

#### Event Emitters

| Target | Event | When |
|---|---|---|
| `window` | `close:navigation:section` (CustomEvent) | Dispatched when the user presses Escape while focused on the item's anchor; signals the parent Navigation block to close its open flyout section |
| `window.adobeDataLayer` | `nav_link_click` | Pushed when a user clicks the item anchor; payload includes `nav.level: 'item'` and the item's link text |

---

## Behavior Patterns

### Page Context Detection

<!--
The Navigation Item block does not perform page context detection.
-->

### User Interaction Flows

**Clicking a navigation item**
1. User clicks the anchor link.
2. `window.adobeDataLayer.push` is called with `{ event: 'nav_link_click', nav: { level: 'item', label: '<title>' } }`.
3. Browser navigates to `link` (same tab or new tab depending on `open-in-new-tab`).

**Keyboard — Escape to close**
1. User focuses the item anchor via Tab or arrow keys.
2. User presses Escape.
3. After a 100 ms debounce, `close:navigation:section` is dispatched on `window`.
4. The parent Navigation block's `close:navigation:section` listener closes the enclosing flyout and returns focus to the section trigger.

**Universal Editor re-decoration**
- When an item is updated in the UE editor, a `decorate:navigation:item` event is dispatched by the editor integration layer, causing `decorateMenuItem()` to re-render the item and `updateSubMenuHeight()` to recompute the parent submenu's CSS grid layout.

### Error Handling

- If `readBlockConfig()` cannot find a value for a key, the configured default is used (`'Menu Item'`, `'#'`, `''`, `'false'`).
- The Escape handler is debounced (100 ms) to prevent duplicate `close:navigation:section` dispatches from rapid key repeat.
- The module-level event guard (`data-navigationItemListenerAttached`) ensures the `decorate:navigation:item` listener is registered exactly once regardless of how many item blocks are on the page.
- `updateSubMenuHeight()` is a no-op if the target submenu panel element is not found in the DOM.

---

## Unit Testing

> **Future state.** A test file (`navigation-item.test.js`) ships with this block but is not currently integrated into the project's test pipeline. When unit testing is introduced, coverage should include:
>
> - Anchor renders with correct `href`, text, `title`, and `target`/`rel` attributes per config
> - `open-in-new-tab: true` adds `target="_blank"` and `rel="noopener noreferrer"`
> - Click dispatches `nav_link_click` to `window.adobeDataLayer` with correct `nav.level: 'item'` payload
> - Escape keyup (debounced 100 ms) dispatches `close:navigation:section` on `window`
> - `decorate:navigation:item` event triggers `decorateMenuItem()` and calls `updateSubMenuHeight()`
> - Module-level `data-navigationItemListenerAttached` guard prevents duplicate listener registration
