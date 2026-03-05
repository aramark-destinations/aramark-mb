# Tools

Project tooling and configuration for AEM development utilities.

## Contents

### `sidekick/`

Configuration for the [AEM Sidekick](https://www.aem.live/docs/sidekick) browser extension. The Sidekick provides authors and developers with quick access to preview, publish, and edit actions directly from the browser.

#### `sidekick/config.json`

```json
{
  "project": "AEM XWalk Boilerplate",
  "editUrlLabel": "AEM Editor",
  "editUrlPattern": "{{contentSourceUrl}}{{pathname}}?cmd=open"
}
```

| Field | Description |
|-------|-------------|
| `project` | Display name shown in the Sidekick UI |
| `editUrlLabel` | Label for the "Edit" button in the Sidekick toolbar |
| `editUrlPattern` | URL pattern used to open pages in AEM Universal Editor. `{{contentSourceUrl}}` resolves to the AEM author environment URL and `{{pathname}}` to the current page path |

## Adding New Tools

Place any additional development tooling (scripts, configuration files, CLI utilities) in a subdirectory here. Do not add tools to the project root unless required by a specific convention (e.g., config files that must be at root for their respective tool to locate them).
