# Authoring Configuration Guide

## How It Works

Universal Editor authoring configs live in two places:

| Location | Purpose |
|---|---|
| `models/` | Orchestrator files that stitch all fragments together |
| `blocks/<name>/_<name>.json` | Per-block fragment — the source of truth for that block |

A single build command merges everything into the three root-level files the Universal Editor reads:

```
models/_component-definition.json  ──┐
models/_component-models.json       ──┤  pnpm build:json  ──▶  component-definition.json
models/_component-filters.json      ──┘                         component-models.json
                                                                 component-filters.json
blocks/*/_*.json (auto-included)
```

> **Never hand-edit** the root-level `component-*.json` files — they are build artefacts.

---

## The `/models` Folder

The three orchestrator files in `/models` use a JSON spread syntax (`"..."`) to pull in fragments:

### `models/_component-definition.json`
```json
{
  "groups": [
    {
      "title": "Default Content",
      "id": "default",
      "components": [
        { "...": "./_text.json#/definitions" },
        { "...": "./_title.json#/definitions" },
        { "...": "./_image.json#/definitions" },
        { "...": "./_button.json#/definitions" }
      ]
    },
    {
      "title": "Sections",
      "id": "sections",
      "components": [
        { "...": "./_section.json#/definitions" }
      ]
    },
    {
      "title": "Blocks",
      "id": "blocks",
      "components": [
        { "...": "../blocks/*/_*.json#/definitions" }
      ]
    }
  ]
}
```

### `models/_component-models.json`
```json
[
  { "...": "./_page.json#/models" },
  { "...": "./_image.json#/models" },
  { "...": "./_title.json#/models" },
  { "...": "./_text.json#/models" },
  { "...": "./_button.json#/models" },
  { "...": "./_section.json#/models" },
  { "...": "../blocks/*/_*.json#/models" }
]
```

### `models/_component-filters.json`
```json
[
  { "id": "main", "components": ["section"] },
  { "...": "./_section.json#/filters" },
  { "...": "../blocks/*/_*.json#/filters" }
]
```

The `../blocks/*/_*.json` glob means **any `_<name>.json` in any block folder is automatically included** — no manual registration needed when adding a new block.

---

## Per-Block Fragment Schema

Each block that needs UE authoring support gets `blocks/<name>/_<name>.json` with three optional arrays:

```json
{
  "definitions": [ ... ],   // registers the component in the UE component picker
  "models":      [ ... ],   // defines the property panel fields
  "filters":     [ ... ]    // declares allowed child components (container blocks only)
}
```

### `definitions` entry
```json
{
  "title": "Hero",
  "id": "hero",
  "plugins": {
    "xwalk": {
      "page": {
        "resourceType": "core/franklin/components/block/v1/block",
        "template": {
          "name": "Hero",
          "model": "hero"
        }
      }
    }
  }
}
```

Key `resourceType` values:

| Resource Type | Used For |
|---|---|
| `core/franklin/components/block/v1/block` | Block container |
| `core/franklin/components/block/v1/block/item` | Child item inside a container |
| `core/franklin/components/section/v1/section` | Page section |

Key `template` fields: `name` (display name / block class), `model` (→ model ID), `filter` (→ filter ID for containers), `key-value: true` (for key-value blocks).

### `models` entry
```json
{
  "id": "hero",
  "fields": [
    { "component": "reference", "valueType": "string", "name": "image", "label": "Image", "multi": false },
    { "component": "text",      "valueType": "string", "name": "imageAlt", "label": "Alt", "value": "" },
    { "component": "richtext",  "valueType": "string", "name": "text", "label": "Text" }
  ]
}
```

Field `component` types: `text`, `richtext`, `reference`, `aem-content`, `select`, `multiselect`, `boolean`.

### `filters` entry (container blocks only)
```json
{
  "id": "accordion",
  "components": ["accordion-item"]
}
```

---

## Example: Simple Block (Hero)

`blocks/hero/_hero.json`
```json
{
  "definitions": [
    {
      "title": "Hero",
      "id": "hero",
      "plugins": {
        "xwalk": {
          "page": {
            "resourceType": "core/franklin/components/block/v1/block",
            "template": { "name": "Hero", "model": "hero" }
          }
        }
      }
    }
  ],
  "models": [
    {
      "id": "hero",
      "fields": [
        { "component": "reference", "valueType": "string", "name": "image", "label": "Image", "multi": false },
        { "component": "text",      "valueType": "string", "name": "imageAlt", "label": "Alt", "value": "" },
        { "component": "richtext",  "valueType": "string", "name": "text",     "label": "Text" }
      ]
    }
  ]
}
```

## Example: Container + Item Block (Accordion)

`blocks/accordion/_accordion.json`
```json
{
  "definitions": [
    {
      "title": "Accordion",
      "id": "accordion",
      "plugins": {
        "xwalk": {
          "page": {
            "resourceType": "core/franklin/components/block/v1/block",
            "template": { "name": "Accordion", "filter": "accordion", "model": "accordion" }
          }
        }
      }
    },
    {
      "title": "Accordion Item",
      "id": "accordion-item",
      "plugins": {
        "xwalk": {
          "page": {
            "resourceType": "core/franklin/components/block/v1/block/item",
            "template": { "model": "accordion-item" }
          }
        }
      }
    }
  ],
  "models": [
    {
      "id": "accordion",
      "fields": [
        { "component": "text", "valueType": "string", "name": "name", "label": "Accordion Name", "value": "Accordion" }
      ]
    },
    {
      "id": "accordion-item",
      "fields": [
        { "component": "text",      "valueType": "string",  "name": "summary",              "label": "Summary",            "required": true },
        { "component": "richtext",  "valueType": "string",  "name": "content",              "label": "Content" },
        { "component": "boolean",   "valueType": "boolean", "name": "collapsed-by-default", "label": "Collapsed by Default", "value": true }
      ]
    }
  ],
  "filters": [
    { "id": "accordion", "components": ["accordion-item"] }
  ]
}
```

---

## Build Setup

### `package.json` scripts required

```json
"build:json": "npm-run-all -p build:json:models build:json:definitions build:json:filters",
"build:json:models":      "merge-json-cli -i \"models/_component-models.json\"      -o \"component-models.json\"",
"build:json:definitions": "merge-json-cli -i \"models/_component-definition.json\"  -o \"component-definition.json\"",
"build:json:filters":     "merge-json-cli -i \"models/_component-filters.json\"     -o \"component-filters.json\""
```

### Required dev dependency

```bash
pnpm add -D merge-json-cli npm-run-all
```

### Run the build

```bash
pnpm build:json
```

Run after creating or modifying any `_<name>.json` fragment. Commit the updated root `component-*.json` files alongside the fragment. CI blocks PRs where the root files are out of sync.

---

## Adding Authoring Config for a New Block

1. Create `blocks/<name>/_<name>.json` with `definitions`, `models`, and `filters` (if container)
2. Run `pnpm build:json`
3. Commit `blocks/<name>/_<name>.json` **plus** all three updated root `component-*.json` files

No changes to `/models` are needed — the `../blocks/*/_*.json` glob picks up new files automatically.

---

## Naming Rules

- Fragment filename: `_<blockname>.json` (underscore prefix, matches block directory)
- `id` in `definitions`, `id` in `models`, `model` in template, `filter` in template, `id` in `filters` — **must all be consistent**. A mismatch silently breaks the UE property panel.

---

## Troubleshooting

| Symptom | Likely Cause |
|---|---|
| Property panel missing in UE | `model` in template doesn't match a `models[].id` |
| Can't insert child component | `filter` ID mismatch or child not listed in `filters[].components` |
| Root JSON stale | Forgot to run `pnpm build:json` |
| CI JSON lint failure | Run `pnpm lint:js` — `eslint-plugin-xwalk` validates schema rules |
