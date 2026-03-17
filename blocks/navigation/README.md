# Navigation Block

## Overview

The Navigation block renders a multi-level flyout navigation menu from an authored AEM fragment. It works primarily as an **auto-block**: the `autoBlockNavigationFragment()` function wraps a section's content into a navigation block automatically during page decoration.

The block reads section metadata to configure display options, then constructs interactive section-level flyout panels with animated submenus. In the Universal Editor (UE) context, a separate `navigation-ue.css` stylesheet is loaded to support in-editor authoring styles.

---

## Integration

### Block Configuration

Configuration is read from **section metadata** using `readBlockConfig(sectionMeta)`, not from the block element itself.

| Key | Type | Default | Description | Required | Side Effects |
|---|---|---|---|---|---|
| `custom-classes` | text | — | Space-separated list of CSS classes appended to the nav element | No | Classes applied to the `<nav>` element at decoration time |
| `title` | text | — | Accessible label for the `<nav>` element (`aria-label`) | No | Sets `aria-label` on the rendered `<nav>` |
| `link` | text | — | URL for the navigation's home / logo link | No | Sets `href` on the brand/home anchor if present |
| `type` | text | — | Logical type identifier for the navigation instance | No | Can be used to distinguish multiple nav instances on a page |

### URL Parameters

| Parameter | Description |
|---|---|
| `ref` | When running inside the Universal Editor, the value of `ref` from `URLSearchParams` is appended as `?ref=<value>` to the `navigation-ue.css` stylesheet URL to bust the CDN cache. |

### Local Storage

<!--
The Navigation block does not read from or write to localStorage.
-->

### Events

#### Event Listeners

| Source | Event | Handler |
|---|---|---|
| `window` | `close:navigation:section` | Calls `closeSection(button)` to close the flyout panel associated with the event's target button |
| `document` | `keydown` (Escape) | Added dynamically when a section opens; closes the open section and restores focus to its trigger |

#### Event Emitters

| Target | Event | When |
|---|---|---|
| `window` | `update:live:region` (CustomEvent) | Dispatched with an `{ detail: { message } }` payload when a section panel opens or closes, to announce the state change to screen readers |
| `window.adobeDataLayer` | `nav_link_click` | Pushed when a user clicks a top-level navigation section link; payload includes `nav.level: 'section'` and the link label |

---

## Behavior Patterns

### Page Context Detection

- **Universal Editor detection**: The block checks for the presence of a `data-aue-resource` attribute on the block or its container. When detected, `navigation-ue.css` is appended to `<head>` to provide authoring-specific layout overrides.
- **Auto-block wrapping**: `autoBlockNavigationFragment()` inspects a section element and, if it contains navigation content (identified by link structure), wraps it in a `navigation` block div before the standard block decoration pipeline runs.

### User Interaction Flows

**Opening a section**
1. User clicks a top-level section trigger button.
2. The section panel expands (`aria-expanded="true"`).
3. `--row-template` and `--row-span` CSS custom properties are set dynamically on the panel to control the CSS grid submenu layout.
4. A `keydown` Escape listener is attached to the document.
5. `update:live:region` is dispatched to announce the open state.
6. `window.adobeDataLayer` receives a `nav_link_click` event.

**Closing a section**
1. User clicks the trigger again, clicks outside, presses Escape, or another section opens.
2. `aria-expanded` returns to `"false"`, CSS custom properties are cleared.
3. The Escape `keydown` listener is removed.
4. `update:live:region` is dispatched with the closed state message.

**Closing via event**
- Any code (e.g., a child navigation-item block) may dispatch `close:navigation:section` on `window` to programmatically close the open flyout.

### CSS Custom Properties

The JS sets the following CSS custom properties on submenu panels to drive grid-based layout:

| Property | Description |
|---|---|
| `--row-template` | CSS `grid-template-rows` value calculated from the number of items in the panel |
| `--row-span` | `grid-row` span value applied to featured/tall items within the panel |

### Error Handling

- If `readBlockConfig()` returns no values for a key, the block renders without that attribute (e.g., no `aria-label` if `title` is absent).
- `closeSection()` and `closeAllSections()` guard against null panel/button elements before manipulating DOM state.
- `updateSubMenuHeight()` no-ops if the submenu element is not found.

---

## Exported Utilities

| Export | Signature | Purpose |
|---|---|---|
| `resetMenuState` | `(nav) => void` | Resets all section panels to closed state on a given nav element |
| `closeAllSections` | `(nav) => void` | Closes all open flyout sections within `nav` |
| `updateSubMenuHeight` | `(panel) => void` | Recalculates and applies `--row-template` / `--row-span` for a submenu panel |
| `autoBlockNavigationFragment` | `(container) => void` | Wraps navigation fragment content in a `navigation` block during auto-block phase |

---

## Unit Testing

> **Future state.** A test file (`navigation.test.js`) ships with this block but is not currently integrated into the project's test pipeline. When unit testing is introduced, coverage should include:
>
> - `resetMenuState()` closes all panels on a given nav element
> - `closeAllSections()` sets correct `aria-expanded` state on all section buttons
> - `updateSubMenuHeight()` sets `--row-template` and `--row-span` correctly; no-ops when panel is absent
> - `autoBlockNavigationFragment()` wraps navigation content in a `navigation` block; handles UE context
> - Section open/close interaction flows (click, Escape, outside-click)
> - `nav_link_click` analytics payload shape at the section level
> - `update:live:region` dispatched with correct message on open/close
