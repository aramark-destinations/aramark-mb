# Page Metadata Block

Holds page-level metadata consumed by AEM at the document level. This block has no visual output on the page.

## Features

- **Page metadata** — title, description, and keywords for SEO and CMS
- Not rendered as a visible block; fields are consumed by AEM document properties

## Authoring Fields

| Field | Type | Description |
|-------|------|-------------|
| Title | text | Page title (`jcr:title`) |
| Description | text | Page description (`jcr:description`) |
| Keywords | text (multi) | SEO keywords |

## Notes

- This model provides fields for the Universal Editor's page properties panel
- No JS decoration logic is applied — the block exists solely as a model/schema holder

## See Also

- [Section Block](../section/README.md) - Page layout container
