# Banner Block — Development Notes

**Status:** Imported from external project. Functional baseline only — further development planned in a future sprint.

## Outstanding Work

The following items are known gaps to be addressed when the banner block is developed further:

### UE Authoring Model
The current `banner-item` model exposes a single `richtext` field (`text`). This needs to be expanded to match the block's actual capabilities:
- `mediaImage` reference field (for slide background image)
- `mediaImageAlt` text field
- `contentText` richtext field (headline + body)
- `ctaLink` / `ctaLabel` fields for the slide CTA button

Until the model is updated, authors using Universal Editor cannot configure individual slides with images or CTA buttons — they are limited to richtext content only.

### Dismiss Persistence Key
The session-storage dismiss key is currently scoped to `window.location.pathname`. If the same banner appears across multiple pages (e.g., via a fragment), it will need to be dismissed separately on each page. A shared key strategy (e.g., keyed to the banner's content hash or an authored ID field) should be evaluated.

### Auto-Rotation Accessibility
The rotating slides use `setInterval` with no pause-on-hover or reduced-motion check. Before production use:
- Add `prefers-reduced-motion` media query to disable auto-rotation
- Add pause on hover/focus per WCAG 2.1 SC 2.2.2

### Close Button Icon
The close button currently renders a plain `×` character. This should be replaced with the project's icon system (`:ph-x:` or equivalent) once the icon resolver is implemented.

### Multi-Brand Overrides
No brand-specific CSS override file exists yet. When banner is deployed to a brand, create:
```
brands/{brand}/blocks/banner/banner.css
```

## Deferral Reason
These items were scoped out to keep the initial import minimal. They will be addressed in the sprint that formally develops the banner block for production use.
