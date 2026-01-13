# Cards Block - Changelog

All notable changes to the base cards block will be documented in this file.

## [1.0.0] - 2026-01-12

### Added
- Initial base cards block implementation
- Lifecycle hooks: `onBefore`, `onAfter`
- Events: `cards:before`, `cards:after`
- Automatic conversion of block rows to semantic ul/li structure
- Image optimization with responsive sizing (750px width)
- Classification of card components (image vs body)
- Grid layout with auto-fill for responsive columns
- Universal Editor instrumentation preservation

### Extension Points
- `onBefore`: Modify block before core logic runs (e.g., add variant classes, filter cards)
- `onAfter`: Enhance block after core logic (e.g., add hover effects, lazy loading, analytics)
- CSS variables can be overridden for custom styling
- Grid template columns can be adjusted for different layouts
- Event listeners can be attached to `cards:before` and `cards:after` events

### Features
- Responsive grid layout (min 257px per card)
- Optimized images with proper aspect ratio (4:3)
- Semantic HTML structure (ul/li)
- Border and background styling
