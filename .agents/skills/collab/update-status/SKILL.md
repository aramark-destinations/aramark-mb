---
name: update-status
description: Append a daily EOD status entry to the team collaboration log. When working on a specific block (or after a PR review session), also write a block-scoped entry to blocks/{blockname}/daily-status.md. Use when: end of day status update, logging block work, logging PR review activity, end of workday handoff notes for teammates in other time zones.
---

# Update Daily Status

## Overview

Appends a daily EOD (End of Day) status entry so teammates in other time zones can see what was done and what needs their attention.

**Target file behavior:**
- **Without a `Block` field** → appends to `docs/collaboration/daily-status.md` (shared team log)
- **With a `Block` field** → appends to `blocks/{blockname}/daily-status.md` (block-scoped log) **and** appends a summary line to `docs/collaboration/daily-status.md`

This is particularly useful after running `collab/pr-review` on a block-level PR, so all activity stays discoverable in the block directory.

---

## Input Format

The user provides:

```
Name: <name>
Block: <blockname or "none">         ← optional; use if work was scoped to a specific block
Today's Work: <comma-separated list of completed tasks>
In Progress: <comma-separated list of in-progress tasks>
Blockers: <blockers or "None">
Handoff: <handoff notes for teammate or "None">
```

---

## Step 1: Read the Current Log(s)

**If `Block` is provided and not "none":**
- Read `blocks/{blockname}/daily-status.md` (create if it does not exist)
- Read `docs/collaboration/daily-status.md`

**Otherwise:**
- Read `docs/collaboration/daily-status.md` only

---

## Step 2: Detect Today's Date

Determine today's date in `YYYY-MM-DD` format.

---

## Step 3: Find or Create the Date Heading

Apply this logic to whichever file(s) you are writing to:

- **Exists** — append the new entry under that heading, before the final `---`
- **Does not exist** — append a new date heading followed by the entry at the end of the file

If a `Block` was provided, the block-scoped file (`blocks/{blockname}/daily-status.md`) may not exist yet — create it with a brief header comment first:

```markdown
# Daily Status — {blockname} block

<!-- Block-scoped status log. Full team log: docs/collaboration/daily-status.md -->
```

---

## Step 4: Format the Entries

### Block-scoped entry (if `Block` provided) — written to `blocks/{blockname}/daily-status.md`

```markdown
## YYYY-MM-DD

### <Name>
- Today's Work: <Today's Work>
- In Progress: <In Progress>
- Blockers: <Blockers>
- **Handoff Notes:** <Handoff>

---
```

### Shared team log entry — written to `docs/collaboration/daily-status.md`

When a `Block` was provided, include the block name in the entry so teammates can find the full log:

```markdown
## YYYY-MM-DD

### <Name> [block: <blockname>]
- Today's Work: <Today's Work>
- In Progress: <In Progress>
- Blockers: <Blockers>
- **Handoff Notes:** <Handoff>
- **Full block log:** `blocks/<blockname>/daily-status.md`

---
```

Without a `Block`, format as normal (no block annotation or link).

---

## Step 5: Write the File(s)

- Always write to `docs/collaboration/daily-status.md`
- If `Block` was provided, also write to `blocks/{blockname}/daily-status.md`

Create any missing intermediate directories.

---

## Step 6: Confirm and Remind

Confirm what was written, then show the commit commands. Include all modified files:

```bash
# Without block
git add docs/collaboration/daily-status.md
git commit -m "chore: EOD status update [<Name>]"
git push

# With block
git add docs/collaboration/daily-status.md blocks/<blockname>/daily-status.md
git commit -m "chore: EOD status update [<Name>] (<blockname>)"
git push
```

---

## Examples

### Example A — Block-scoped update (after PR review)

**Input:**

```
Name: skumawat
Block: carousel
Today's Work: Reviewed PR #42 — found 2 blocking token violations, fixed Pattern A compliance
In Progress: Hero block animation refinement
Blockers: None
Handoff: PR #42 is approved and needs merge — branch feature/carousel-fix
```

**Written to `blocks/carousel/daily-status.md`:**

```markdown
# Daily Status — carousel block

<!-- Block-scoped status log. Full team log: docs/collaboration/daily-status.md -->

## 2026-03-25

### skumawat
- Today's Work: Reviewed PR #42 — found 2 blocking token violations, fixed Pattern A compliance
- In Progress: Hero block animation refinement
- Blockers: None
- **Handoff Notes:** PR #42 is approved and needs merge — branch feature/carousel-fix

---
```

**Also appended to `docs/collaboration/daily-status.md`:**

```markdown
## 2026-03-25

### skumawat [block: carousel]
- Today's Work: Reviewed PR #42 — found 2 blocking token violations, fixed Pattern A compliance
- In Progress: Hero block animation refinement
- Blockers: None
- **Handoff Notes:** PR #42 is approved and needs merge — branch feature/carousel-fix
- **Full block log:** `blocks/carousel/daily-status.md`

---
```

---

### Example B — General update (no block context)

**Input:**

```
Name: skumawat
Block: none
Today's Work: Fixed carousel block layout issue on mobile, reviewed PR #42
In Progress: Hero block animation refinement
Blockers: None
Handoff: PR #42 is approved and needs merge — branch feature/carousel-fix
```

**Appended to `docs/collaboration/daily-status.md`:**

```markdown
## 2026-03-25

### skumawat
- Today's Work: Fixed carousel block layout issue on mobile, reviewed PR #42
- In Progress: Hero block animation refinement
- Blockers: None
- **Handoff Notes:** PR #42 is approved and needs merge — branch feature/carousel-fix

---
```
