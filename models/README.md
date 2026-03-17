# Models

Component model definitions for AEM Universal Editor (XWalk). These JSON files define the field schemas, data types, and component metadata that power the Universal Editor authoring interface {updated}.

## How It Works

The model files follow a JSON reference pattern: the root `component-models.json`, `component-definition.json`, and `component-filters.json` files at the project root use `"..."` spread references to pull in the individual `_*.json` files from this directory and from each block's directory (`blocks/*/_*.json`). This keeps each component's definition self-contained and co-located with its implementation.

**Block schemas live with their block** — each block in `/blocks/{block}/` owns its `_blockname.json` schema file. This directory contains only the shared, non-block component schemas.

## Files

| File | Purpose |
|------|---------|
| `_page.json` | Base page model — fields shared across all page types |
| `_section.json` | Section wrapper model — background, style, and layout options |
| `_image.json` | Standalone image component with alt text and reference fields |
| `_title.json` | Title/heading component |
| `_text.json` | Rich text body component |
| `_button.json` | Button/CTA component with label and link fields |

## Model File Structure

Each `_*.json` file follows this schema:

```json
{
  "definitions": [
    {
      "title": "Component Name",
      "id": "component-id",
      "plugins": {
        "xwalk": {
          "page": {
            "resourceType": "core/franklin/components/block/v1/block",
            "template": { "name": "Component Name", "model": "component-id" }
          }
        }
      }
    }
  ],
  "models": [
    {
      "id": "component-id",
      "fields": [
        { "component": "text", "name": "fieldName", "label": "Field Label", "valueType": "string" }
      ]
    }
  ],
  "filters": []
}
```

## Field Component Types

| Type | Usage |
|------|-------|
| `text` | Single-line text input |
| `richtext` | Multi-line rich text editor |
| `reference` | Asset reference picker (images, documents) |
| `checkbox` | Boolean toggle |
| `select` | Dropdown with enumerated options |

## Adding a New Component

1. Create the block directory at `/blocks/componentname/`.
2. Add `_componentname.json` inside that directory following the schema above.
3. The root `component-models.json` glob pattern (`"../blocks/*/_*.json#/models"`) automatically discovers it — no manual registration required.

For non-block components (shared primitives like `_image.json`), add the schema directly to this directory.
