# Hero Block - Changelog

All notable changes to the base hero block will be documented in this file.

## [1.0.0] - 2026-01-12

### Added
- Initial base hero block implementation
- Lifecycle hooks: `onBefore`, `onAfter`
- Events: `hero:before`, `hero:after`
- Automatic classification of image and text containers
- Responsive padding and layout
- Fixed positioning for background images

### Extension Points
- `onBefore`: Modify block before core logic runs (e.g., add variant classes)
- `onAfter`: Enhance block after core logic (e.g., add animations, analytics)
- CSS variables can be overridden for custom styling
- Event listeners can be attached to `hero:before` and `hero:after` events
