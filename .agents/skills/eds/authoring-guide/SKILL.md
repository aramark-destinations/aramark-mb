---
name: eds/authoring-guide
description: Create author-facing documentation for EDS blocks. Strictly separated from developer documentation.
when_to_use: when a block needs author-facing documentation (separate from the developer README.md)
version: 1.0.0
---

# EDS Authoring Guide Creation

## Overview

Author-facing documentation is for **content authors using Universal Editor** — not for developers. These are separate documents with completely different audiences.

**Author docs answer:** "How do I use this block in the CMS?"
**Developer docs (README.md) answer:** "How does this block work technically?"

Never mix these. An author should never need to read CSS class names, DOM structure, or JS implementation details.

---

## Audience Boundaries

| Belongs in author docs | Does NOT belong in author docs |
|------------------------|-------------------------------|
| Field names as shown in Universal Editor | CSS class names |
| What each field does for the reader | DOM structure |
| Image size recommendations | JS hook patterns |
| Character/word limits | SCSS variables |
| Example content | Build commands |
| When to use this block vs another | Component architecture |
| Accessibility requirements for content | Brand override mechanism |

---

## Step 1: Read the Block's UE JSON Schema

Read `blocks/{block-name}/_{block-name}.json` (or `models/` for default content blocks). This is the source of truth for what fields exist in Universal Editor.

For each field, note:
- `name` — the field key
- `label` — what it's called in Universal Editor
- `component` — type (text, richtext, reference/image, select, boolean)
- `value` — default value if any

---

## Step 2: Map Fields to Author Language

Translate technical field names into plain English with context:

| Field name (schema) | UE label | Author explanation |
|---------------------|----------|--------------------|
| `image` | Image | The background or feature image. Minimum 1200px wide recommended. |
| `imageAlt` | Alt text | Describes the image for screen readers. Required if image conveys meaning. |
| `text` | Text | Rich text area. Supports headings, lists, and links. |

---

## Step 3: Write the Author Guide

**Document structure:**

```markdown
# {Block Name} — Authoring Guide

## What This Block Does

[1-3 sentences. What the reader sees. When to use it vs other options.]

## Adding This Block

[Step-by-step: where to find it in Universal Editor, how to add it to a page]

## Fields

### {Field Label}
- **What it does:** [Plain English description]
- **When to fill it in:** [Required / Optional — and when optional is helpful]
- **Tips:** [Character limits, image size, content guidance]

[Repeat for each field]

## Examples

### Example 1: [Scenario name]
[Screenshot or description of what the block looks like with specific content]

Fields used:
- Image: [description]
- Alt text: [description]
- Text: [description]

## Common Mistakes

- [Mistake 1 and how to avoid it]
- [Mistake 2 and how to avoid it]

## Accessibility Notes

- [Any content requirements for accessibility — alt text, heading levels, etc.]
```

---

## Anti-Patterns

**Bad author doc (developer thinking leaked in):**
> The hero block renders a `.hero-image` container with an absolute-positioned `<picture>` element. Set `onBefore` hook to add parallax.

**Good author doc:**
> The hero displays a large image with your headline overlaid. Use a wide landscape photo (minimum 1200px) for best results. The headline appears automatically from the page's H1.

---

## Step 4: Where to Save

Author guides typically live in `docs/authoring/` or alongside the block's README as a separate file. Check if a `docs/authoring/` directory exists. If not, create it.

Filename: `docs/authoring/{block-name}.md`

---

## Step 5: Pressure Resistance

If you are uncertain about a field's purpose from the schema alone:
1. Check the block's README.md for developer context
2. Check existing blocks in Universal Editor (if accessible)
3. State your assumption clearly: "Based on the `richtext` component type, this field appears to allow formatted body copy."

Do NOT invent content guidelines that aren't grounded in the block's actual behavior.
