# Models

Component model definitions for AEM Universal Editor (XWalk). These JSON files define the field schemas, data types, and component metadata that power the Universal Editor authoring interface.

## How It Works

The model files follow a JSON reference pattern: the root `component-models.json` and `component-definition.json` files at the project root use `"..."` spread references to include the individual `_*.json` files from this directory. This keeps each component's definition self-contained and composable.

## Files

| File | Purpose |
|------|---------|
| `_page.json` | Base page model — fields shared across all page types |
| `_section.json` | Section wrapper model — background, style, and layout options |
| `_image.json` | Standalone image component with alt text and reference fields |
| `_title.json` | Title/heading component |
| `_text.json` | Rich text body component |
| `_button.json` | Button/CTA component with label and link fields |
| `_accordion.json` | Accordion block model |
| `_cards.json` | Cards block model |
| `_carousel.json` | Carousel block model |
| `_columns.json` | Multi-column layout block model |
| `_embed.json` | Embed block model (iframes, third-party widgets) |
| `_footer.json` | Footer block model |
| `_form.json` | Form block model |
| `_fragment.json` | Fragment/reusable content block model |
| `_header.json` | Header/navigation block model |
| `_hero.json` | Hero block model (image, alt text, rich text) |
| `_modal.json` | Modal dialog block model |
| `_quote.json` | Pull quote block model |
| `_search.json` | Search block model |
| `_table.json` | Table block model |
| `_tabs.json` | Tabs block model |
| `_video.json` | Video block model |
| `_component-definition.json` | Aggregated component definitions (spread references to all block `_*.json` files) |
| `_component-filters.json` | Aggregated component filter rules |
| `_component-models.json` | Aggregated component models (spread references to all block `_*.json` files) |
| `404.html` | Custom 404 error page |

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

1. Create `_componentname.json` in this directory following the schema above.
2. The root `component-models.json` glob pattern (`"../blocks/*/_*.json#/models"`) automatically picks up any `_*.json` file added here or inside a block directory — no manual registration required.
3. Add the corresponding block implementation in `/blocks/componentname/`.
