---
name: qa-handoff
description: "Generate a structured QA handoff document for a block — reads the current branch/ticket number, block source files, UE schema, Figma audit, and ticket-details.md to produce a ready-to-paste Implementation Summary with author fields, Figma references, test URLs, What to Test checklist, and Out of Scope notes. Saves output to blocks/{blockname}/qa-handoff.md. Use when: handing off dev work to QA, writing ticket comments after a PR is ready for review, documenting what was built for a block."
argument-hint: "Block name (optional — auto-detected from branch if omitted)"
---

# QA Handoff

## Overview

This skill reads the block's source files and generates a complete QA handoff document — the structured Implementation Summary that gets posted to the ADO ticket when dev work is handed to QA. It mirrors the format the team uses in ticket comments.

**Output:** `blocks/{blockname}/qa-handoff.md`

The document includes:
- Implementation Summary (what was built, OOB vs custom)
- Author Fields (UE) — derived from the UE JSON schema
- Figma References — extracted from ticket-details.md and figma audit
- Test URLs — constructed from branch, brand, and environment conventions
- What to Test — test cases per concern area
- Out of Scope

---

## Pre-flight

- [ ] Dev work is complete (or at a stable checkpoint ready for QA review)
- [ ] Working tree is committed or the block files reflect the intended state
- [ ] `blocks/{blockname}/ticket-details.md` exists with requirements

---

## Step 1: Determine Block Name and Ticket ID

Detect the current git branch:

```bash
git branch --show-current
```

Expected format: `ADO-{TICKET_ID}-{block-name}` (e.g. `ADO-133-breadcrumbs`, `ADO-112-text`).

- **TICKET_ID** = the number after `ADO-`
- **BLOCK_NAME** = everything after `ADO-{TICKET_ID}-`, with hyphens preserved (e.g. `navigation-group`)

If the branch does not match this format, ask the user:
> "What is the block name and ADO ticket number for this handoff?"

---

## Step 2: Determine Brand

Look at the `brands/` directory to list available brands:

```bash
ls brands/
```

If only one non-`unbranded` brand exists, use it. If multiple exist, ask:
> "Which brand is this block being built for? (e.g. lake-powell)"

The brand slug is used to construct test URLs and Figma file links.

---

## Step 3: Read Block Source Files

Read all of the following (skip gracefully if a file does not exist):

| File | Purpose |
|------|---------|
| `blocks/{blockname}/ticket-details.md` | Requirements, Figma links, placement rules |
| `blocks/{blockname}/{blockname}-figma-audit.md` | Token matches, structural notes, design-to-code gaps |
| `blocks/{blockname}/_{blockname}.json` | UE schema — defines author fields |
| `blocks/{blockname}/{blockname}.js` | Implementation — custom logic vs OOB |
| `blocks/{blockname}/{blockname}.scss` | Styles — custom CSS vs global tokens |
| `blocks/{blockname}/README.md` | Public-facing block documentation |

Also read `models/_*.json` if the block uses a default-content model (button, image, page, section, text, title).

---

## Step 4: Analyze the Implementation

Using the files read in Step 3, determine the following. Record your findings — they feed directly into the handoff document.

### 4a. OOB vs Custom

Answer each question:

- Does the block use a custom `_{blockname}.json` UE schema, or is it OOB (inline RTE / default content)?
- Does `{blockname}.js` contain substantive custom logic, or is it minimal/empty?
- Does `{blockname}.scss` contain block-specific rules beyond max-width, or does it defer entirely to global `typography.scss` / `styles.scss`?
- Does the block integrate with any scripts (analytics, placeholders, editor-support)?

Classify the implementation as one of:
- **Fully OOB** — no custom JS logic, no custom schema; styling via global tokens only
- **Minimal custom** — light JS (e.g. DOM restructuring, variant detection), UE schema present
- **Custom block** — substantive logic, custom schema, multiple states or variants

### 4b. Author Fields

From `_{blockname}.json` (or inline RTE if no schema), list every field an author can configure:

| Field | Type | Description |
|---|---|---|
| ... | ... | ... |

If the block uses the inline rich-text editor (no schema), record: _"Rich text content — edited inline in the Universal Editor (no custom field model; standard RTE toolbar)"_

### 4c. Figma References

Collect all Figma node links from:
1. `ticket-details.md` — Styles section
2. `{blockname}-figma-audit.md` — Component node, in-use nodes
3. README.md — if Figma links appear there

Group by purpose (e.g. Typography, Component overview, Inline links, Section themes).

### 4d. What Needs Testing

From the requirements (`ticket-details.md`) and the implementation analysis, derive test areas. Common areas:

- **Author Experience** — can the block be added/edited in UE?
- **Core rendering** — does the block render correctly with default content?
- **Variants / states** — test each variant defined in JS or schema
- **Typography / Styling** — match font size, weight, line-height, spacing to Figma
- **Responsive** — 375px / 768px / 1280px+
- **Section themes** — light/dark, if applicable
- **Accessibility** — keyboard nav, focus states, ARIA roles
- **Analytics** — if analytics integration is present
- **Edge cases** — empty content, missing metadata, long text

Only include areas actually implemented. Do not include test cases for features not built.

### 4e. Out of Scope

Identify what is explicitly not being tested in this ticket. Common examples:
- Features deferred to a separate ticket (list the ticket number if known)
- Styles that are shared/covered elsewhere (e.g. button styles)
- Brand overrides not yet implemented

---

## Step 5: Construct Test URLs

Use these URL patterns for the target brand:

| URL Type | Pattern |
|---|---|
| Preview | `https://staging--{brand}--aramark-destinations.aem.page/testing/blocks/{blockname}/qa-test` |
| Publish | `https://staging--{brand}--aramark-destinations.aem.live/testing/blocks/{blockname}/qa-test` |
| Author (UE) | See note below |

**Author URL note:** The Author URL requires the AEM environment ID (e.g. `author-p179307-e1885056.adobeaemcloud.com`). Check `ticket-details.md` for an existing Author URL or ask the user:
> "What is the AEM Author URL for this environment? (format: author-p{XXXXX}-e{XXXXXXX}.adobeaemcloud.com)"

If the Author URL is not available, output a placeholder:
```
https://{author-host}/ui#/@aramarksports/aem/universal-editor/canvas/{author-host}/content/{brand}/testing/blocks/{blockname}/qa-test.html?ref=staging
```

---

## Step 6: Write the Handoff Document

Save the generated document to `blocks/{blockname}/qa-handoff.md`.

Use this exact structure:

---

```markdown
# {BlockName} Block — QA Handoff

**ADO Ticket:** ADO-{TICKET_ID}
**Branch:** {BRANCH_NAME}
**Brand:** {BRAND}
**Date:** {TODAY_DATE}

---

## Implementation Summary

{1-3 sentence summary of what was built. State whether new block-specific logic was created or if OOB components were used. Name any key scripts/systems the block integrates with. Name the styling approach (block-scoped CSS vs global typography vs CSS tokens).}

---

## Author Fields (UE)

{List of author fields as a bullet list or table. If OOB inline RTE, state that explicitly.}

---

## Figma References

{Grouped list of Figma links by purpose, e.g.:}
- **Component overview:** {url}
- **Typography:** {url}
- **Inline links / interactions:** {url}
- **Section themes:** {url}

---

## Test URLs

- **Author (UE):** {author_url}
- **Preview:** {preview_url}
- **Publish:** {publish_url}

---

## What to Test

### 1. Author Experience
{Describe what to verify in Universal Editor — can the block be added, edited, saved? What fields/interactions should be confirmed?}

### 2. {Test Area 2}
{Description. Reference the relevant Figma node in parentheses where applicable.}

### 3. {Test Area N}
...

### Responsive
Test at 375px (mobile), 768px (tablet), and 1280px+ (desktop). Confirm {key layout/behavior expectations}.

---

## Out of Scope

{Bulleted list of what is not being verified in this ticket, with rationale or ticket reference where applicable.}
```

---

## Step 7: Verify and Report

After writing the file, confirm:

- [ ] `blocks/{blockname}/qa-handoff.md` exists and is readable
- [ ] All Figma links extracted from source files appear in the doc
- [ ] Author fields accurately reflect the UE schema (or inline RTE note)
- [ ] Test URLs use the correct brand slug
- [ ] "What to Test" sections only cover features that are actually implemented
- [ ] "Out of Scope" calls out anything explicitly deferred

Report to the user:

```
QA Handoff written to blocks/{blockname}/qa-handoff.md

Summary:
- Block: {blockname}
- Ticket: ADO-{TICKET_ID}
- Implementation: {OOB / Minimal custom / Custom block}
- Author fields: {count or "Inline RTE"}
- Figma links found: {count}
- Test areas: {list of section titles}
- Out of scope items: {count}

Copy the contents of blocks/{blockname}/qa-handoff.md into the ADO ticket comment when posting the handoff.
```

---

## Notes

- **If `ticket-details.md` is missing or empty:** Proceed with what can be inferred from the JS/SCSS/schema files, but flag this clearly at the top of the generated document as: `> ⚠️ ticket-details.md was not found or is empty — test cases are inferred from source files only.`
- **If no figma audit exists:** Skip the Figma References section for audit-specific nodes; only include links from ticket-details.md.
- **If the block has no UE schema:** Confirm this is intentional (e.g. default-content/inline RTE pattern) before writing "no custom field model" in the doc.
- **Do not fabricate test URLs.** If brand or author host is unknown, use placeholders and flag them.
- **Do not include test cases for unimplemented features.** Only test what was built in this branch.
