# Image — Authoring Guide

## What This Block Does

The Image block displays a standalone, responsive image on the page. Use it when you want to feature a single photograph or graphic outside of a card layout or hero. The image automatically optimizes itself for different screen sizes (phones, tablets, and desktops) to keep the page loading fast.

Images on this project are delivered through **Adobe Dynamic Media with OpenAPI**, which handles format conversion, quality optimization, and responsive sizing automatically in the background — no special steps required when authoring.

Use this block instead of:
- **Hero** — when you don't need an overlaid headline or call-to-action button
- **Cards** — when you have a single image rather than a grid of items

---

## Adding This Block

1. Open the page in **Universal Editor**
2. Click **+** to add a component
3. Select **Image** from the component list
4. Click **Edit** (pencil icon) to open the dialog

---

## Fields

### Image
- **What it does:** The photograph or graphic to display. Uploaded from the DAM (Digital Asset Management library).
- **When to fill it in:** Required — the block won't display anything without an image.
- **Tips:**
  - Use a landscape image at least **1200px wide** for best quality on desktop screens
  - Portrait and square images are supported but will display at full block width
  - Supported formats: JPEG, PNG, WebP — Dynamic Media handles format conversion and quality optimization automatically; upload the highest-quality source file available

### Alt Text
- **What it does:** A text description of the image read aloud by screen readers for users who can't see the image. It also appears if the image fails to load.
- **When to fill it in:** Always fill this in if the image conveys meaningful information (e.g., a photo of a venue, a dish, or a person). Leave it empty only for purely decorative images with no informational value.
- **Tips:**
  - Keep alt text concise — typically under 125 characters
  - Describe what the image shows, not "image of" or "photo of"
  - Bad: `"Image of a beautiful lake at sunset"`
  - Good: `"Lake Powell at sunset with red canyon walls reflected in the water"`

### Get Alternative Text from DAM
- **What it does:** When checked, the block automatically fetches the alt text from the image's `dc:description` metadata field in the DAM and applies it to the image after the page renders.
- **When to use it:** Leave this checked (the default) if the image's DAM record has an accurate `dc:description`. Uncheck it if you want to write custom alt text manually in the Alt Text field below.
- **How it works:** The manual Alt Text is applied immediately when the page loads. The DAM description is then fetched in the background and updates the alt text once it arrives — there is no visible layout shift.
- **Fallback:** If the DAM fetch fails or the asset has no `dc:description`, the manual Alt Text field value is preserved.

---

## Examples

### Example: Standalone Feature Photo

A full-width photograph used as a visual break between two text sections.

Fields used:
- **Image:** Hero-style landscape photo of the resort or amenity (minimum 1200px wide)
- **Alt Text:** `"Guests kayaking on Lake Powell with canyon walls in the background"`
- **Get Alternative Text from DAM:** left checked (default) — the DAM description will be applied automatically

---

## Common Mistakes

- **Leaving Alt Text blank for meaningful images** — Screen reader users and search engines won't understand what the image shows. Always describe images that aren't purely decorative.
- **Using a very small image** — Images smaller than 768px wide will appear blurry on desktop. Source images should be at least 1200px wide.
- **Using this block for card grids** — If you need multiple images with captions or links, use the **Cards** block instead.
- **Leaving Alt Text blank and unchecking DAM alt** — If you uncheck "Get Alternative Text from DAM", you must fill in the Alt Text field manually. Screen reader users won't understand the image without it.

---

## Accessibility Notes

- Alt text is required for any image that conveys meaning (WCAG 1.1.1). Do not skip it.
- The image renders at full block width and scales responsively — it does not require any special layout configuration by the author.
- If the image is purely decorative (adds no information), an empty alt text field is acceptable; the system will render `alt=""` which signals to screen readers to skip it.
